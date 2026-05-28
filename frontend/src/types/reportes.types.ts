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

export interface IReportesMesResponse {
  resumen: ResumenReportes
  historial: VentaHistorial[]
  masVendidosMes: ProductoMasVendido[]
  resumenDiario: ResumenDiario[]
}

export interface IHistoricoResponse {
  productos: ProductoMasVendido[]
}
