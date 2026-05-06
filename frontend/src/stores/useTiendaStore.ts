import { create } from 'zustand';

import { productosMock } from '../data/productos';

export interface Variante {
  id: string;
  talla: string;
  colorNombre: string;
  colorHex: string;
  stock: number;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  stockMinimo: number;
  imagenUrl?: string | null;
  variantes: Variante[];
}

export interface NotificacionToast {
  id: string;
  mensaje: string;
  tipo: 'exito' | 'info' | 'advertencia' | 'error';
}

interface TiendaState {
  productos: Producto[];
  categorias: string[];
  busquedaQuery: string;
  notificaciones: NotificacionToast[];
  setBusquedaQuery: (valor: string) => void;
  agregarNotificacion: (mensaje: string, tipo?: NotificacionToast['tipo']) => void;
  quitarNotificacion: (id: string) => void;
  agregarProducto: (producto: Omit<Producto, 'id'>) => void;
  editarProducto: (id: string, cambios: Partial<Omit<Producto, 'id'>>) => void;
  eliminarProducto: (id: string) => void;
  actualizarStock: (id: string, nuevoStock: number) => void;
  actualizarPrecio: (id: string, nuevoPrecio: number) => void;
  ajustarPreciosMasivo: (categoria: string, porcentaje: number) => void;
  agregarCategoria: (categoria: string) => void;
}

const crearIdProducto = () => `prod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const crearIdNotificacion = () => `toast_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const obtenerCategoriasIniciales = () => {
  const categoriasSet = new Set(productosMock.map(p => p.categoria));
  return Array.from(categoriasSet);
};

export const useTiendaStore = create<TiendaState>((set) => ({
  productos: productosMock,
  categorias: obtenerCategoriasIniciales(),
  busquedaQuery: '',
  notificaciones: [],

  setBusquedaQuery: (valor) => set(() => ({
    busquedaQuery: valor,
  })),

  agregarNotificacion: (mensaje, tipo = 'info') => set((state) => ({
    notificaciones: [
      { id: crearIdNotificacion(), mensaje, tipo },
      ...state.notificaciones,
    ],
  })),

  quitarNotificacion: (id) => set((state) => ({
    notificaciones: state.notificaciones.filter((toast) => toast.id !== id),
  })),

  agregarProducto: (producto) => set((state) => {
    // Asegurar que la categoría exista
    const nuevasCategorias = state.categorias.includes(producto.categoria) 
      ? state.categorias 
      : [...state.categorias, producto.categoria];
      
    return {
      productos: [
        { ...producto, id: crearIdProducto() },
        ...state.productos,
      ],
      categorias: nuevasCategorias,
    };
  }),

  editarProducto: (id, cambios) => set((state) => {
    let nuevasCategorias = state.categorias;
    if (cambios.categoria && !state.categorias.includes(cambios.categoria)) {
      nuevasCategorias = [...state.categorias, cambios.categoria];
    }
    
    return {
      productos: state.productos.map((producto) => (
        producto.id === id ? { ...producto, ...cambios } : producto
      )),
      categorias: nuevasCategorias,
    };
  }),

  eliminarProducto: (id) => set((state) => ({
    productos: state.productos.filter((producto) => producto.id !== id),
  })),

  actualizarStock: (id, nuevoStock) => set((state) => ({
    productos: state.productos.map((producto) => (
      producto.id === id ? { ...producto, stock: nuevoStock } : producto
    )),
  })),

  actualizarPrecio: (id, nuevoPrecio) => set((state) => ({
    productos: state.productos.map((producto) => (
      producto.id === id ? { ...producto, precio: nuevoPrecio } : producto
    )),
  })),

  ajustarPreciosMasivo: (categoria, porcentaje) => set((state) => {
    const factor = 1 + (porcentaje / 100);
    return {
      productos: state.productos.map((producto) => {
        if (categoria === 'Todas' || producto.categoria === categoria) {
          return { ...producto, precio: Math.round(producto.precio * factor) };
        }
        return producto;
      })
    };
  }),

  agregarCategoria: (categoria) => set((state) => ({
    categorias: state.categorias.includes(categoria) 
      ? state.categorias 
      : [...state.categorias, categoria]
  }))
}));