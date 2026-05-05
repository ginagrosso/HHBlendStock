import { create } from 'zustand';

// Definimos cómo es un Producto (cumpliendo con TypeScript)
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

interface TiendaState {
  productos: Producto[];
  // Acciones para modificar el estado
  actualizarStock: (id: string, cantidad: number) => void;
  actualizarPrecio: (id: string, nuevoPrecio: number) => void;
}

export const useTiendaStore = create<TiendaState>((set) => ({
  // Datos de prueba (Mocks) iniciales
  productos: [
    { id: '1', nombre: 'Remera Premium Black', precio: 25000, stock: 10, categoria: 'Urbano' },
    { id: '2', nombre: 'Jean Gold Edition', precio: 45000, stock: 5, categoria: 'Gala' },
  ],

  actualizarStock: (id, cantidad) => set((state) => ({
    productos: state.productos.map((p) => 
      p.id === id ? { ...p, stock: p.stock - cantidad } : p
    )
  })),

  actualizarPrecio: (id, nuevoPrecio) => set((state) => ({
    productos: state.productos.map((p) => 
      p.id === id ? { ...p, precio: nuevoPrecio } : p
    )
  })),
}));