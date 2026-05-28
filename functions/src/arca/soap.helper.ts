import axios from "axios";
import {XMLParser} from "fast-xml-parser";
import {AppError} from "../middleware/error.middleware";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: true,
  trimValues: true,
  isArray: (name: string) => name === "Err" || name === "Obs",
});

/**
 * Realiza un POST SOAP 1.1 y devuelve el objeto Body de la respuesta parseado.
 * Lanza AppError en caso de Fault SOAP, timeout o error de red.
 */
export async function soapPost<T>(
  url: string,
  soapAction: string,
  envelope: string
): Promise<T> {
  let responseXml: string;

  try {
    const response = await axios.post<string>(url, envelope, {
      headers: {
        "Content-Type": "text/xml;charset=utf-8",
        SOAPAction: soapAction,
      },
      responseType: "text",
      timeout: 30_000,
    });
    responseXml = response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
        throw new AppError(504, "Timeout al conectar con ARCA. Reintentá en unos segundos.");
      }
      // ARCA puede devolver un HTTP 500 con un SOAP Fault útil en el body
      responseXml = (err.response?.data as string | undefined) ?? "";
      if (!responseXml) {
        throw new AppError(502, `Error de red con ARCA: ${err.message}`);
      }
    } else {
      throw err;
    }
  }

  const parsed = parser.parse(responseXml) as Record<string, unknown>;
  const envelope_ = (parsed["Envelope"] ?? parsed["envelope"]) as Record<string, unknown> | undefined;
  const body = (envelope_?.["Body"] ?? envelope_?.["body"]) as Record<string, unknown> | undefined;

  if (!body) {
    throw new AppError(502, "Respuesta SOAP malformada de ARCA");
  }

  // SOAP Fault
  const fault = body["Fault"] ?? body["fault"];
  if (fault) {
    const f = fault as Record<string, unknown>;
    const msg = (f["faultstring"] ?? f["detail"] ?? "Error SOAP de ARCA") as string;
    throw new AppError(502, `ARCA Fault: ${msg}`);
  }

  return body as T;
}
