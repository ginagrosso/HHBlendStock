import type {Timestamp} from "firebase-admin/firestore";

export type EstadoFactura = "emitida" | "error";

/** Documento almacenado en la colección "facturas" de Firestore */
export interface Factura {
  id: string;
  ventaId: string;
  nroComprobante: number;
  ptoVta: number;
  cbteTipo: number;
  cuit: string;
  docTipo: number;
  docNro: number;
  fecha: Timestamp;
  total: number;
  cae: string;
  caeFchVto: string; // YYYYMMDD
  estado: EstadoFactura;
}

/** Shape serializado que devuelve la API (fechas como ISO string) */
export interface FacturaRespuesta {
  id: string;
  ventaId: string;
  nroComprobante: number;
  ptoVta: number;
  cbteTipo: number;
  fecha: string;
  total: number;
  cae: string;
  caeFchVto: string;
  estado: EstadoFactura;
}

/** Parámetros que recibe wsfeService.solicitarCAE */
export interface SolicitarCAEParams {
  ptoVta: number;
  cbteTipo: number;
  nroComprobante: number;
  /** 1 = Productos, 2 = Servicios, 3 = Productos y Servicios */
  concepto: number;
  /** 99 = Consumidor Final, 96 = DNI, 80 = CUIT */
  docTipo: number;
  /** 0 para Consumidor Final */
  docNro: number;
  /** YYYY-MM-DD */
  fecha: string;
  importeTotal: number;
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export interface CAEResult {
  cae: string;
  caeFchVto: string;
  nroComprobante: number;
  resultado: string;
  /** URL de verificación ARCA para renderizar como QR en el ticket */
  qrUrl: string;
}

/** Documento Firestore: config/arca */
export interface ArcaConfig {
  /** Límite por encima del cual ARCA exige identificar al comprador.
   *  Fuente: Anexo II RG 1415/03 (FAQ AFIP 24152817). Actualizar si ARCA publica nuevo valor. */
  montoMaximoAnonimo: number;
}
