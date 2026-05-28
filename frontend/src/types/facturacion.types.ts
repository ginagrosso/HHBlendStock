// ─── Configuración ARCA ────────────────────────────────────────────────────────
export interface ArcaConfig {
  montoMaximoAnonimo: number;
}

// ─── Estado del comprobante ────────────────────────────────────────────────────
export type EstadoFactura = "emitida" | "error";

// ─── Comprobante emitido ───────────────────────────────────────────────────────
export interface Factura {
  id: string;
  ventaId: string;
  nroComprobante: number;
  ptoVta: number;
  cbteTipo: number;
  fecha: string; // ISO 8601
  total: number;
  cae: string;
  caeFchVto: string; // YYYYMMDD
  estado: EstadoFactura;
}

// ─── Contrato del API ──────────────────────────────────────────────────────────
export interface IListarFacturasResponse {
  facturas: Factura[];
}
