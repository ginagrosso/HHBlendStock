import { create } from 'zustand'
import { inventarioService } from '../services/inventario.service'

export interface Producto {
  id: string
  nombre: string
  marca: string
  articulo: string
  categoria: string
  talle: string
  stock: number
  precioEfectivo: number
  precioTarjeta: number
  imagenUrl: string | null
}

export interface NotificacionToast {
  id: string
  mensaje: string
  tipo: 'exito' | 'info' | 'advertencia' | 'error'
}

interface TiendaState {
  productos: Producto[]
  categorias: string[]
  busquedaQuery: string
  notificaciones: NotificacionToast[]
  cargando: boolean
  error: string | null

  setBusquedaQuery: (valor: string) => void
  agregarNotificacion: (mensaje: string, tipo?: NotificacionToast['tipo']) => void
  quitarNotificacion: (id: string) => void

  cargarProductos: () => Promise<void>
  agregarProducto: (producto: Omit<Producto, 'id'>) => Promise<void>
  editarProducto: (id: string, cambios: Partial<Omit<Producto, 'id'>>) => Promise<void>
  eliminarProducto: (id: string) => Promise<void>
  ajustarPreciosMasivo: (categoria: string, porcentajeEfectivo: number, porcentajeTarjeta: number) => Promise<void>
}

const crearIdNotificacion = () =>
  `toast_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

export const useTiendaStore = create<TiendaState>((set, get) => ({
  productos: [],
  categorias: [],
  busquedaQuery: '',
  notificaciones: [],
  cargando: false,
  error: null,

  setBusquedaQuery: (valor) => set({ busquedaQuery: valor }),

  agregarNotificacion: (mensaje, tipo = 'info') =>
    set((state) => ({
      notificaciones: [{ id: crearIdNotificacion(), mensaje, tipo }, ...state.notificaciones],
    })),

  quitarNotificacion: (id) =>
    set((state) => ({ notificaciones: state.notificaciones.filter((t) => t.id !== id) })),

  cargarProductos: async () => {
    set({ cargando: true, error: null })
    try {
      const productos = await inventarioService.listar()
      const categorias = [...new Set(productos.map((p) => p.categoria))].sort()
      set({ productos, categorias, cargando: false })
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar productos'
      set({ error: mensaje, cargando: false })
    }
  },

  agregarProducto: async (producto) => {
    await inventarioService.crear(producto)
    await get().cargarProductos()
  },

  editarProducto: async (id, cambios) => {
    await inventarioService.actualizar(id, cambios)
    await get().cargarProductos()
  },

  eliminarProducto: async (id) => {
    await inventarioService.eliminar(id)
    await get().cargarProductos()
  },

  ajustarPreciosMasivo: async (categoria, porcentajeEfectivo, porcentajeTarjeta) => {
    await inventarioService.ajustarPrecios(categoria, porcentajeEfectivo, porcentajeTarjeta)
    await get().cargarProductos()
  },
}))
