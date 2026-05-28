import type {MetodoPago} from "./caja.model";

export type {MetodoPago};

// ─── Agregado histórico de más vendidos ───────────────────────────────────────
// Almacenado en analytics/masVendidos. Se actualiza en cada venta (transacción
// atómica). Clave: `${articulo}|${talle}`.

export interface EntradaAgregadoMasVendidos {
  productoId: string;
  nombre: string;
  articulo: string;
  talle: string;
  marca: string;
  categoria: string;
  totalUnidades: number;
  totalIngresos: number;
}

export type AgregadoMasVendidos = Record<string, EntradaAgregadoMasVendidos>;

export interface ItemVentaReportes {
  productoId: string;
  nombre: string;
  articulo: string;
  talle: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  marca?: string;
  categoria?: string;
}

export interface VentaReportes {
  id: string;
  numero: number;
  fecha: string;
  metodoPago: MetodoPago;
  items: ItemVentaReportes[];
  total: number;
  cliente?: {nombre: string; telefono?: string};
}

export interface ProductoMasVendido {
  productoId: string;
  nombre: string;
  talle: string;
  marca: string;
  categoria: string;
  totalUnidades: number;
  totalIngresos: number;
  porcentaje: number;
}

export interface ResumenDiario {
  fecha: string;
  totalVentas: number;
  cantidadTransacciones: number;
}

export interface DesgloseMedioPago {
  efectivo: number;
  tarjeta: number;
  transferencia: number;
}

export interface ResumenReportes {
  ventasHoy: number;
  cantidadVentasHoy: number;
  prendasHoy: number;
  ventasMes: number;
  cantidadVentasMes: number;
  prendasMes: number;
  desgloseMes: DesgloseMedioPago;
}
