import type { Producto } from '../stores/useTiendaStore';

export const productosMock: Producto[] = [
  {
    id: '1',
    nombre: 'Vestido Silk Noir',
    precio: 120000,
    stock: 12,
    categoria: 'Vestidos',
    stockMinimo: 5,
    imagenUrl: null,
    variantes: [
      { id: 'v1a', talla: 'S', colorNombre: 'Negro', colorHex: '#0a0a0a', stock: 4 },
      { id: 'v1b', talla: 'M', colorNombre: 'Negro', colorHex: '#0a0a0a', stock: 8 },
    ],
  },
  {
    id: '2',
    nombre: 'Blazer Velvet Oro',
    precio: 245000,
    stock: 2,
    categoria: 'Chaquetas',
    stockMinimo: 3,
    imagenUrl: null,
    variantes: [
      { id: 'v2', talla: 'L', colorNombre: 'Dorado', colorHex: '#d97706', stock: 2 },
    ],
  },
  {
    id: '3',
    nombre: 'Pantalon Sastre Crepe',
    precio: 85000,
    stock: 8,
    categoria: 'Pantalones',
    stockMinimo: 4,
    imagenUrl: null,
    variantes: [
      { id: 'v3', talla: 'S', colorNombre: 'Hueso', colorHex: '#e5e5e5', stock: 8 },
    ],
  },
  {
    id: '4',
    nombre: 'Top Asimetrico Malla',
    precio: 42000,
    stock: 24,
    categoria: 'Tops',
    stockMinimo: 6,
    imagenUrl: null,
    variantes: [
      { id: 'v4', talla: 'M', colorNombre: 'Carbon', colorHex: '#111111', stock: 24 },
    ],
  },
];
