import type { ProductoCaja, DatosVenta, ResultadoVenta } from '../types/caja.types'
import { PRODUCTOS_MOCK, generarTicketMock } from '../mocks/caja.mocks'

// ─── Contrato del servicio ─────────────────────────────────────────────────────
// Al implementar el backend, crear una clase `CajaServiceReal` que implemente
// esta interfaz y exportarla como `cajaService` en lugar del mock.
export interface ICajaService {
  buscarProductos(query: string): Promise<ProductoCaja[]>
  finalizarVenta(datos: DatosVenta): Promise<ResultadoVenta>
  // futuro: registrarEnArca(datos: DatosVenta): Promise<ArcaFactura>
}

// ─── Implementación mock ───────────────────────────────────────────────────────
// Simula latencia de red para detectar problemas de UX antes de conectar el backend.
const cajaServiceMock: ICajaService = {
  async buscarProductos(query) {
    await new Promise((r) => setTimeout(r, 180))

    const q = query.trim().toLowerCase()
    if (!q) return []

    return PRODUCTOS_MOCK.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.articulo.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.talle.toLowerCase() === q,
    )
  },

  async finalizarVenta(datos) {
    await new Promise((r) => setTimeout(r, 600))
    // TODO: conectar a POST /caja/finalizar-venta + llamada a ARCA para facturación
    const ticket = generarTicketMock(datos.items, datos.metodoPago, datos.cliente)
    return { ticket }
  },
}

export const cajaService: ICajaService = cajaServiceMock
