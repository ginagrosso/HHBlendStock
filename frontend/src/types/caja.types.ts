// ─── Métodos de pago ───────────────────────────────────────────────────────────
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export const LABELS_METODO_PAGO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

// ─── Producto en caja (contrato con el backend) ────────────────────────────────
// Refleja exactamente los campos que el API debe devolver al buscar productos en caja.
export interface ProductoCaja {
  id: string
  nombre: string
  marca: string
  articulo: string   // código de producto / SKU
  categoria: string
  talle: string
  stock: number
  precioEfectivo: number
  precioTarjeta: number
  imagenUrl: string | null
}

// ─── Carrito ───────────────────────────────────────────────────────────────────
export interface ItemCarrito {
  productoId: string
  nombre: string
  marca: string
  articulo: string
  talle: string
  cantidad: number
  precioEfectivo: number
  precioTarjeta: number
}

// ─── Datos opcionales del cliente para el ticket / WhatsApp ───────────────────
export interface DatosCliente {
  nombre: string
  telefono: string
}

// ─── Datos de una venta a procesar ────────────────────────────────────────────
export interface DatosVenta {
  items: ItemCarrito[]
  metodoPago: MetodoPago
  cliente?: DatosCliente
}

// ─── Ticket de venta ───────────────────────────────────────────────────────────
export interface LineaTicket {
  descripcion: string
  articulo: string
  talle: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Ticket {
  numero: string
  fecha: string          // ISO 8601
  metodoPago: MetodoPago
  lineas: LineaTicket[]
  total: number
  cliente?: DatosCliente
}

// ─── Contratos del API (request / response) ────────────────────────────────────
// Documentan lo que el backend debe aceptar y retornar.
// Al conectar el backend real, reemplazar la implementación mock en caja.service.ts
// sin modificar estas interfaces.

export interface IBuscarProductosRequest {
  query: string
  // futuro: soloConStock?: boolean; pagina?: number; limite?: number
}

export interface IBuscarProductosResponse {
  productos: ProductoCaja[]
}

export interface IFinalizarVentaRequest {
  items: Array<{
    productoId: string
    articulo: string
    talle: string
    cantidad: number
    precioUnitario: number  // precio según método de pago
  }>
  metodoPago: MetodoPago
  cliente?: DatosCliente
  // futuro: arcaHabilitada?: boolean
}

export interface IFinalizarVentaResponse {
  ticket: Ticket
  // futuro: arcaFactura?: ArcaFactura
}

export interface ResultadoVenta {
  ticket: Ticket
  // futuro: arcaFactura?: ArcaFactura
}
