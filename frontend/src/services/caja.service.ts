import { apiFetch } from '../lib/api'
import type {
  ProductoCaja,
  DatosVenta,
  ResultadoVenta,
  IBuscarProductosResponse,
  IFinalizarVentaRequest,
  IFinalizarVentaResponse,
} from '../types/caja.types'

export interface ICajaService {
  buscarProductos(query: string): Promise<ProductoCaja[]>
  finalizarVenta(datos: DatosVenta): Promise<ResultadoVenta>
  // futuro: registrarEnArca(datos: DatosVenta): Promise<ArcaFactura>
}

const cajaServiceReal: ICajaService = {
  async buscarProductos(query) {
    if (!query.trim()) return []
    const data = await apiFetch<IBuscarProductosResponse>(
      `/caja/productos?q=${encodeURIComponent(query)}`
    )
    return data.productos
  },

  async finalizarVenta(datos) {
    const body: IFinalizarVentaRequest = {
      items: datos.items.map((item) => ({
        productoId: item.productoId,
        articulo: item.articulo,
        talle: item.talle,
        cantidad: item.cantidad,
        precioUnitario:
          datos.metodoPago === 'tarjeta' ? item.precioTarjeta : item.precioEfectivo,
      })),
      metodoPago: datos.metodoPago,
      cliente: datos.cliente,
    }
    return apiFetch<IFinalizarVentaResponse>('/caja/ventas', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}

export const cajaService: ICajaService = cajaServiceReal
