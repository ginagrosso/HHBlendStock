import {arcaConfig} from "./config";
import {wsaaService} from "./wsaa.service";
import {buildSoapEnvelope} from "./xml.helper";
import {soapPost} from "./soap.helper";
import {AppError} from "../middleware/error.middleware";
import type {SolicitarCAEParams, CAEResult} from "../models/facturacion.model";

const {namespace, soapActionBase, url} = arcaConfig.wsfe;

// ─── Helpers internos ──────────────────────────────────────────────────────────

function buildAuth(token: string, sign: string): string {
  return `
      <ns:Auth>
        <ns:Token>${token}</ns:Token>
        <ns:Sign>${sign}</ns:Sign>
        <ns:Cuit>${arcaConfig.cuit}</ns:Cuit>
      </ns:Auth>`;
}

/**
 * Extrae el primer error de un campo Errors que puede ser objeto o array.
 * ARCA devuelve un objeto cuando hay un error y un array cuando hay varios.
 */
function extractFirstError(
  errors: unknown
): {Code: number; Msg: string} | null {
  if (!errors) return null;
  const err = errors as {Err?: unknown};
  if (!err.Err) return null;
  const item = Array.isArray(err.Err) ? err.Err[0] : err.Err;
  return item as {Code: number; Msg: string};
}

// ─── Montos según tipo de comprobante ─────────────────────────────────────────

interface Montos {
  total: number;
  impTotConc: number;
  impNeto: number;
  impIVA: number;
  ivaXml: string;
}

/**
 * Calcula el desglose de importes según el tipo de comprobante.
 *
 * Factura C (tipo 11, monotributista):
 *   No discrimina IVA. ImpNeto = total, ImpTotConc = 0, ImpIVA = 0.
 *   ARCA exige ImpTotConc = 0 y valida ImpTotal = ImpNeto + ImpTrib.
 *
 * Factura B/A (tipos 6 o 1, resp. inscripto):
 *   ImpNeto = total / 1.21, ImpIVA = total - ImpNeto, ImpTotConc = 0.
 *   ImpIVA se calcula como resto para garantizar ImpNeto + ImpIVA = ImpTotal exacto.
 */
function calcularMontos(cbteTipo: number, total: number): Montos {
  let montos: Montos;

  if (cbteTipo === 11) {
    montos = {total, impTotConc: 0, impNeto: total, impIVA: 0, ivaXml: ""};
  } else {
    // IVA 21% (AlicIva Id=5 en nomenclador ARCA). ImpIVA como resto garantiza
    // que impNeto + impIVA = total sin errores de redondeo.
    const impNeto = parseFloat((total / 1.21).toFixed(2));
    const impIVA = parseFloat((total - impNeto).toFixed(2));
    const ivaXml = `
          <ns:Iva>
            <ns:AlicIva>
              <ns:Id>5</ns:Id>
              <ns:BaseImp>${impNeto.toFixed(2)}</ns:BaseImp>
              <ns:Importe>${impIVA.toFixed(2)}</ns:Importe>
            </ns:AlicIva>
          </ns:Iva>`;
    montos = {total, impTotConc: 0, impNeto, impIVA, ivaXml};
  }

  // ARCA valida ImpTotal = ImpNeto + ImpTotConc + ImpIVA + ImpTrib(0) + ImpOpEx(0).
  // Fallar aquí (antes de la llamada SOAP) produce un mensaje claro en lugar de un
  // rechazo opaco de ARCA.
  const suma = parseFloat((montos.impNeto + montos.impTotConc + montos.impIVA).toFixed(2));
  if (suma !== montos.total) {
    throw new AppError(
      500,
      `[calcularMontos] Desequilibrio cbteTipo ${cbteTipo}: ` +
        `Neto=${montos.impNeto} TotConc=${montos.impTotConc} IVA=${montos.impIVA} ` +
        `suma=${suma} ≠ total=${montos.total}`
    );
  }

  return montos;
}

// ─── Service ──────────────────────────────────────────────────────────────────

type UltimoAuthBody = {
  FECompUltimoAutorizadoResponse?: {
    FECompUltimoAutorizadoResult?: {
      CbteNro?: number;
      Errors?: unknown;
    };
  };
};

type CAESolicitarBody = {
  FECAESolicitarResponse?: {
    FECAESolicitarResult?: {
      FeCabResp?: {Resultado?: string};
      FeDetResp?: {
        FECAEDetResponse?: {
          Resultado?: string;
          CAE?: string;
          CAEFchVto?: string;
          Observaciones?: unknown;
        };
      };
      Errors?: unknown;
    };
  };
};

export const wsfeService = {
  /**
   * Consulta el último número de comprobante autorizado para el PV y tipo dados.
   * Siempre llamar antes de FECAESolicitar para garantizar correlatividad.
   */
  async getUltimoNroComprobante(
    ptoVta: number,
    cbteTipo: number
  ): Promise<number> {
    const {token, sign} = await wsaaService.getTicket();

    const envelope = buildSoapEnvelope({
      namespace,
      method: "FECompUltimoAutorizado",
      innerXml: `${buildAuth(token, sign)}
      <ns:PtoVta>${ptoVta}</ns:PtoVta>
      <ns:CbteTipo>${cbteTipo}</ns:CbteTipo>`,
    });

    const body = await soapPost<UltimoAuthBody>(
      url,
      `${soapActionBase}FECompUltimoAutorizado`,
      envelope
    );

    const result = body?.FECompUltimoAutorizadoResponse?.FECompUltimoAutorizadoResult;
    if (!result) {
      throw new AppError(502, "ARCA WSFE: respuesta vacía en FECompUltimoAutorizado");
    }

    const err = extractFirstError(result.Errors);
    if (err) {
      throw new AppError(502, `ARCA Error ${err.Code}: ${err.Msg}`);
    }

    return result.CbteNro ?? 0;
  },

  /**
   * Solicita el CAE para un comprobante.
   * Requiere haber consultado previamente getUltimoNroComprobante para usar el
   * número correlativo correcto (nroComprobante = último + 1).
   */
  async solicitarCAE(params: SolicitarCAEParams): Promise<CAEResult> {
    const {token, sign} = await wsaaService.getTicket();
    const {ptoVta, cbteTipo, docTipo, docNro, importeTotal, concepto, fecha, nroComprobante} =
      params;

    const montos = calcularMontos(cbteTipo, importeTotal);
    const fechaStr = fecha.replace(/-/g, ""); // YYYYMMDD

    const envelope = buildSoapEnvelope({
      namespace,
      method: "FECAESolicitar",
      innerXml: `${buildAuth(token, sign)}
      <ns:FeCAEReq>
        <ns:FeCabReq>
          <ns:CantReg>1</ns:CantReg>
          <ns:PtoVta>${ptoVta}</ns:PtoVta>
          <ns:CbteTipo>${cbteTipo}</ns:CbteTipo>
        </ns:FeCabReq>
        <ns:FeDetReq>
          <ns:FECAEDetRequest>
            <ns:Concepto>${concepto}</ns:Concepto>
            <ns:DocTipo>${docTipo}</ns:DocTipo>
            <ns:DocNro>${docNro}</ns:DocNro>
            <ns:CbteDesde>${nroComprobante}</ns:CbteDesde>
            <ns:CbteHasta>${nroComprobante}</ns:CbteHasta>
            <ns:CbteFch>${fechaStr}</ns:CbteFch>
            <ns:ImpTotal>${montos.total.toFixed(2)}</ns:ImpTotal>
            <ns:ImpTotConc>${montos.impTotConc.toFixed(2)}</ns:ImpTotConc>
            <ns:ImpNeto>${montos.impNeto.toFixed(2)}</ns:ImpNeto>
            <ns:ImpOpEx>0.00</ns:ImpOpEx>
            <ns:ImpIVA>${montos.impIVA.toFixed(2)}</ns:ImpIVA>
            <ns:ImpTrib>0.00</ns:ImpTrib>
            <ns:MonId>PES</ns:MonId>
            <ns:MonCotiz>1</ns:MonCotiz>${montos.ivaXml}${params.cbteAsoc ?
  "<ns:CbtesAsoc><ns:CbteAsoc>" +
  `<ns:Tipo>${params.cbteAsoc.tipo}</ns:Tipo>` +
  `<ns:PtoVta>${params.cbteAsoc.ptoVta}</ns:PtoVta>` +
  `<ns:Nro>${params.cbteAsoc.nro}</ns:Nro>` +
  `<ns:Cuit>${params.cbteAsoc.cuit}</ns:Cuit>` +
  `<ns:CbteFch>${params.cbteAsoc.fecha}</ns:CbteFch>` +
  "</ns:CbteAsoc></ns:CbtesAsoc>" : ""}
            <ns:CondicionIVAReceptorId>5</ns:CondicionIVAReceptorId>
          </ns:FECAEDetRequest>
        </ns:FeDetReq>
      </ns:FeCAEReq>`,
    });

    const body = await soapPost<CAESolicitarBody>(
      url,
      `${soapActionBase}FECAESolicitar`,
      envelope
    );

    const result = body?.FECAESolicitarResponse?.FECAESolicitarResult;
    if (!result) {
      throw new AppError(502, "ARCA WSFE: respuesta vacía en FECAESolicitar");
    }

    const err = extractFirstError(result.Errors);
    if (err) {
      throw new AppError(502, `ARCA Error ${err.Code}: ${err.Msg}`);
    }

    const det = result.FeDetResp?.FECAEDetResponse;
    if (!det || det.Resultado !== "A") {
      const obs = det?.Observaciones as {Obs?: unknown} | undefined;
      const obsItem = obs?.Obs;
      const obsMsg = obsItem ?
        Array.isArray(obsItem) ?
          (obsItem as {Msg: string}[]).map((o) => o.Msg).join(", ") :
          (obsItem as {Msg: string}).Msg :
        "Resultado rechazado sin observaciones";
      throw new AppError(422, `ARCA rechazó el comprobante: ${obsMsg}`);
    }

    if (!det.CAE || !det.CAEFchVto) {
      throw new AppError(502, "ARCA aprobó el comprobante pero no devolvió CAE");
    }

    // URL de verificación ARCA — formato RG 4291/2018.
    // p = base64(JSON con datos del comprobante). El receptor escanea el QR
    // con cualquier lector y accede a la validación en el sitio de AFIP.
    const qrPayload = {
      ver: 1,
      fecha: params.fecha,
      cuit: parseInt(arcaConfig.cuit, 10),
      ptoVta: params.ptoVta,
      tipoCbte: params.cbteTipo,
      nroCbte: params.nroComprobante,
      importe: params.importeTotal,
      moneda: "PES",
      ctz: 1,
      tipoDocRec: params.docTipo,
      nroDocRec: params.docNro,
      tipoCodAuth: "E",
      codAuth: String(det.CAE),
    };
    const qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${Buffer.from(JSON.stringify(qrPayload)).toString("base64url")}`;

    return {
      cae: String(det.CAE),
      caeFchVto: String(det.CAEFchVto),
      nroComprobante,
      resultado: det.Resultado,
      qrUrl,
    };
  },
};
