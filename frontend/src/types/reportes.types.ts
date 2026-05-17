import type { MetodoPago } from './caja.types'
export type { MetodoPago }

// ─── Entidades del dominio ─────────────────────────────────────────────────────

export interface ItemVenta {
  productoId: string
  nombre: string
  articulo: string      // SKU
  talle: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface VentaHistorial {
  id: string
  numero: number
  fecha: string         // ISO 8601
  items: ItemVenta[]
  total: number
  metodoPago: MetodoPago
  cliente?: {
    nombre: string
    telefono?: string
  }
}

export interface ProductoMasVendido {
  productoId: string
  nombre: string
  talle: string
  marca: string
  categoria: string
  totalUnidades: number
  totalIngresos: number
  porcentaje: number    // 0–100, relativo al producto más vendido
}

export interface ResumenDiario {
  fecha: string         // YYYY-MM-DD
  totalVentas: number
  cantidadTransacciones: number
}

export interface DesgloseMedioPago {
  efectivo: number
  tarjeta: number
  transferencia: number
}

export interface ResumenReportes {
  ventasHoy: number
  cantidadVentasHoy: number
  prendasHoy: number
  ventasMes: number
  cantidadVentasMes: number
  prendasMes: number
  desgloseMes: DesgloseMedioPago
}

export type PeriodoMasVendidos = 'historico' | 'mes'

// ─── Contratos del API (request / response) ────────────────────────────────────
// Al conectar el backend real, reemplazar la implementación mock en reportes.service.ts
// sin modificar estas interfaces.

export interface IResumenReportesRequest {
  mes: number   // 1–12
  anio: number
}
export interface IResumenReportesResponse {
  resumen: ResumenReportes
}

export interface IHistorialVentasRequest {
  mes: number
  anio: number
  pagina: number        // base 1
  porPagina: number
}
export interface IHistorialVentasResponse {
  ventas: VentaHistorial[]
  totalPaginas: number
  totalRegistros: number
}

export interface IMasVendidosRequest {
  periodo: PeriodoMasVendidos
  mes?: number          // requerido si periodo === 'mes'
  anio?: number         // requerido si periodo === 'mes'
  limite?: number       // default 5
}
export interface IMasVendidosResponse {
  productos: ProductoMasVendido[]
}

export interface IResumenDiarioRequest {
  mes: number
  anio: number
}
export interface IResumenDiarioResponse {
  dias: ResumenDiario[] // solo días con al menos 1 venta
}
