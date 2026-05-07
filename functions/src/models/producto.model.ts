import type {Timestamp} from "firebase-admin/firestore";

export interface Producto {
  id: string;
  articuloId: string;
  nombre: string;
  marca: string;
  articulo: string;
  categoria: string;
  talle: string;
  stock: number;
  precioEfectivo: number;
  precioTarjeta: number;
  imagenUrl: string | null;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}

export interface ProductoRespuesta {
  id: string;
  articuloId: string;
  nombre: string;
  marca: string;
  articulo: string;
  categoria: string;
  talle: string;
  stock: number;
  precioEfectivo: number;
  precioTarjeta: number;
  imagenUrl: string | null;
  creadoEn: string;
  actualizadoEn: string;
}
