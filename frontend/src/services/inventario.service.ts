import { apiFetch } from '../lib/api'
import type { Ficha, Variante } from '../stores/useTiendaStore'
import type { ProductoPlano } from '../lib/utilsImportador'

interface FichaApi {
  id: string
  nombre: string
  marca: string
  articulo: string
  categoria: string
  imagenUrl: string | null
  variantes: Variante[]
  creadoEn: string
  actualizadoEn: string
}

function mapFicha(f: FichaApi): Ficha {
  return {
    id: f.id,
    nombre: f.nombre,
    marca: f.marca,
    articulo: f.articulo,
    categoria: f.categoria,
    imagenUrl: f.imagenUrl,
    variantes: f.variantes,
  }
}

export interface ResultadoImportacionApi {
  upsertados: number
  errores: { fila: number; error: string }[]
}

export const inventarioService = {
  async listar(): Promise<Ficha[]> {
    const data = await apiFetch<FichaApi[]>('/inventario/productos')
    return data.map(mapFicha)
  },

  async crear(datos: Omit<Ficha, 'id'>): Promise<Ficha> {
    const data = await apiFetch<FichaApi>('/inventario/productos', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
    return mapFicha(data)
  },

  async actualizar(id: string, cambios: Partial<Omit<Ficha, 'id'>>): Promise<Ficha> {
    const data = await apiFetch<FichaApi>(`/inventario/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cambios),
    })
    return mapFicha(data)
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

  async importar(productos: ProductoPlano[]): Promise<ResultadoImportacionApi> {
    return apiFetch('/inventario/importar', {
      method: 'POST',
      body: JSON.stringify({ productos }),
    })
  },
}
