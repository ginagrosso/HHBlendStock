import {XMLParser} from "fast-xml-parser";
import {Timestamp} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import {AppError} from "../middleware/error.middleware";
import {arcaConfig} from "./config";
import {buildTRA, buildSoapEnvelope} from "./xml.helper";
import {firmarTRA} from "./firma.helper";
import {getPrivateKey, getCertificate} from "./cert.helper";
import {soapPost} from "./soap.helper";

interface TicketCacheado {
  token: string;
  sign: string;
  expiresAt: Timestamp;
}

/** Path en Firestore donde se cachea el ticket de acceso para wsfe */
const TICKET_DOC = "arca_tickets/wsfe";

const innerParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true,
});

type WSAAResponseBody = {
  loginCmsResponse?: {loginCmsReturn?: string};
};

export const wsaaService = {
  /**
   * Devuelve el token y sign vigentes.
   * Lee del caché de Firestore y solo llama a WSAA cuando el ticket caduca o está
   * por caducar (margen configurable en arcaConfig.wsaa.margenRenovacionMs).
   */
  async getTicket(): Promise<{token: string; sign: string}> {
    const snap = await db.doc(TICKET_DOC).get();

    if (snap.exists) {
      const cached = snap.data() as TicketCacheado;
      const msRestantes = cached.expiresAt.toMillis() - Date.now();
      if (msRestantes > arcaConfig.wsaa.margenRenovacionMs) {
        return {token: cached.token, sign: cached.sign};
      }
    }

    return wsaaService._solicitarNuevoTicket();
  },

  async _solicitarNuevoTicket(): Promise<{token: string; sign: string}> {
    const traXml = buildTRA(arcaConfig.wsaa.service);
    const privateKey = getPrivateKey();
    const certificate = getCertificate();
    const cmsSigned = firmarTRA(traXml, privateKey, certificate);

    const envelope = buildSoapEnvelope({
      namespace: "http://wsaa.view.sua.dvadac.desein.afip.gov",
      method: "loginCms",
      innerXml: `<ns:in0>${cmsSigned}</ns:in0>`,
    });

    const body = await soapPost<WSAAResponseBody>(arcaConfig.wsaa.url, "", envelope);

    const returnXml = body?.loginCmsResponse?.loginCmsReturn;
    if (!returnXml || typeof returnXml !== "string") {
      throw new AppError(502, "ARCA WSAA: respuesta de autenticación vacía o inválida");
    }

    // loginCmsReturn contiene un XML interno (puede venir HTML-encoded o como string)
    const inner = innerParser.parse(returnXml) as Record<string, unknown>;
    const response = inner["loginTicketResponse"] as Record<string, unknown> | undefined;
    const credentials = response?.["credentials"] as Record<string, unknown> | undefined;
    const header = response?.["header"] as Record<string, unknown> | undefined;

    const token = credentials?.["token"] as string | undefined;
    const sign = credentials?.["sign"] as string | undefined;

    if (!token || !sign) {
      throw new AppError(502, "ARCA WSAA: token o sign no recibidos en la respuesta");
    }

    const expStr = header?.["expirationTime"] as string | undefined;
    const expiresAt = expStr
      ? Timestamp.fromDate(new Date(expStr))
      : Timestamp.fromMillis(Date.now() + 11 * 60 * 60 * 1000); // fallback 11 horas

    const ticket: TicketCacheado = {token, sign, expiresAt};
    await db.doc(TICKET_DOC).set(ticket);

    return {token, sign};
  },
};
