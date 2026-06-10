import type {Timestamp} from "firebase-admin/firestore";

export type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

export interface PagoSplit {
  metodo: MetodoPago;
  monto: number;
}

export interface LineaVenta {
  productoId: string;
  descripcion: string;
  articulo: string;
  talle: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  marca?: string;
  categoria?: string;
}

export interface ClienteVenta {
  nombre: string;
  telefono?: string;
}

export interface Venta {
  id: string;
  numero: string;
  fecha: Timestamp;
  pagos: PagoSplit[];
  items: LineaVenta[];
  total: number;
  cliente?: ClienteVenta;
  vendedorId: string;
}

export interface VentaRespuesta {
  id: string;
  numero: string;
  fecha: string;
  pagos: PagoSplit[];
  items: LineaVenta[];
  total: number;
  cliente?: ClienteVenta;
  vendedorId: string;
}
