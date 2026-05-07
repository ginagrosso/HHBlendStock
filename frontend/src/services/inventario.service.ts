import { auth } from '../lib/firebase'
import type { Producto } from '../stores/useTiendaStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

async function getToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('No autenticado')
  return user.getIdToken()
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Error ${res.status}` })) as { error?: string }
    throw new Error(body.error ?? `Error ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

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
