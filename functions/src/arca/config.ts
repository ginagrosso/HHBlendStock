import * as path from "path";

type ArcaEnv = "testing" | "production";

const ENV = (process.env.ARCA_ENVIRONMENT ?? "testing") as ArcaEnv;

export const arcaConfig = {
  environment: ENV,

  /** CUIT del emisor (tu CUIT en testing, CUIT del cliente en producción) */
  cuit: process.env.ARCA_CUIT ?? "",

  /** Punto de Venta habilitado bajo modalidad "RECE para Aplicativo y Web Services" */
  puntoVenta: parseInt(process.env.ARCA_PUNTO_VENTA ?? "2", 10),

  /**
   * Tipo de comprobante:
   *  11 = Factura C  (monotributista)         ← default
   *   6 = Factura B  (resp. inscripto → consumidor final)
   *   1 = Factura A  (resp. inscripto → otro inscripto)
   */
  cbteTipo: parseInt(process.env.ARCA_CBTE_TIPO ?? "11", 10),

  wsaa: {
    url: ENV === "production" ?
      "https://wsaa.afip.gov.ar/ws/services/LoginCms" :
      "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
    service: "wsfe",
    /** Margen de renovación: renueva el ticket si le quedan menos de 5 minutos */
    margenRenovacionMs: 5 * 60 * 1000,
  },

  wsfe: {
    url: ENV === "production" ?
      "https://servicios1.afip.gov.ar/wsfev1/service.asmx" :
      "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
    namespace: "http://ar.gov.afip.dif.FEV1/",
    soapActionBase: "http://ar.gov.afip.dif.FEV1/",
  },

  /**
   * Activar para que cada venta emita automáticamente una factura en ARCA.
   * En testing poner ARCA_HABILITADA=true solo cuando los certificados estén listos.
   */
  habilitada: process.env.ARCA_HABILITADA === "true",

  cert: {
    /**
     * Ruta al archivo privada.key.
     * En producción/deploy usar ARCA_PRIVATE_KEY_B64 (contenido en base64) en lugar de ruta.
     * __dirname en lib compilado = functions/lib/arca → ../../../ = raíz del proyecto
     */
    keyPath:
      process.env.ARCA_PRIVATE_KEY_PATH ??
      path.resolve(__dirname, "../../../certificados-arca/privada.key"),

    certPath:
      process.env.ARCA_CERTIFICATE_PATH ??
      path.resolve(
        __dirname,
        "../../../certificados-arca/certificado-test.pem"
      ),
  },
};
