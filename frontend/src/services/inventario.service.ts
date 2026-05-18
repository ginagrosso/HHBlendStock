import { apiFetch } from '../lib/api'
import type { Producto } from '../stores/useTiendaStore'

interface ProductoApi extends Omit<Producto, 'id'> {
  id: string
  articuloId: string
  creadoEn: string
  actualizadoEn: string
}

function mapProducto(p: ProductoApi): Producto {
  return {
    id: p.id,
    nombre: p.nombre,
    marca: p.marca,
    articulo: p.articulo,
    categoria: p.categoria,
    talle: p.talle,
    stock: p.stock,
    precioEfectivo: p.precioEfectivo,
    precioTarjeta: p.precioTarjeta,
    imagenUrl: p.imagenUrl,
  }
}

export interface ResultadoImportacionApi {
  upsertados: number
  errores: { fila: number; error: string }[]
}

export const inventarioService = {
  async listar(): Promise<Producto[]> {
    const data = await apiFetch<ProductoApi[]>('/inventario/productos')
    return data.map(mapProducto)
  },

  async crear(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const data = await apiFetch<ProductoApi>('/inventario/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
    })
    return mapProducto(data)
  },

  async actualizar(id: string, cambios: Partial<Omit<Producto, 'id'>>): Promise<Producto> {
    const data = await apiFetch<ProductoApi>(`/inventario/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cambios),
    })
    return mapProducto(data)
  },

  async eliminar(id: string): Promise<void> {
    await apiFetch<void>(`/inventario/productos/${id}`, { method: 'DELETE' })
  },

  async ajustarPrecios(
    categoria: string,
    porcentajeEfectivo: number,
    porcentajeTarjeta: number
  ): Promise<{ actualizados: number }> {
    return apiFetch('/inventario/ajustar-precios', {
      method: 'PUT',
      body: JSON.stringify({ categoria, porcentajeEfectivo, porcentajeTarjeta }),
    })
  },

  async importar(productos: Omit<Producto, 'id'>[]): Promise<ResultadoImportacionApi> {
    return apiFetch('/inventario/importar', {
      method: 'POST',
      body: JSON.stringify({ productos }),
    })
  },
}
