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
    const hasTarjeta = datos.pagos.some((p) => p.metodo === 'tarjeta')
    const body: IFinalizarVentaRequest = {
      items: datos.items.map((item) => ({
        productoId: item.productoId,
        articulo: item.articulo,
        talle: item.talle,
        cantidad: item.cantidad,
        precioUnitario: hasTarjeta ? item.precioTarjeta : item.precioEfectivo,
      })),
      pagos: datos.pagos,
      cliente: datos.cliente,
      docReceptor: datos.docReceptor,
      facturarEnArca: datos.facturarEnArca,
    }
    return apiFetch<IFinalizarVentaResponse>('/caja/ventas', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}

export const cajaService: ICajaService = cajaServiceReal
