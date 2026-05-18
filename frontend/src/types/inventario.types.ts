export interface Variante {
  talle: string
  stock: number
  precioEfectivo: number
  precioTarjeta: number
}

export interface Ficha {
  id: string
  nombre: string
  marca: string
  articulo: string
  categoria: string
  imagenUrl: string | null
  variantes: Variante[]
}

export type DatosFicha = Omit<Ficha, 'id'>
