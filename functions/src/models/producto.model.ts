import type {Timestamp} from "firebase-admin/firestore";

export interface Variante {
  talle: string;
  stock: number;
  precioEfectivo: number;
  precioTarjeta: number;
}

export interface Ficha {
  id: string;
  nombre: string;
  marca: string;
  articulo: string;
  categoria: string;
  imagenUrl: string | null;
  variantes: Variante[];
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}

export interface FichaRespuesta {
  id: string;
  nombre: string;
  marca: string;
  articulo: string;
  categoria: string;
  imagenUrl: string | null;
  variantes: Variante[];
  creadoEn: string;
  actualizadoEn: string;
}
