// ─── Métodos de pago ───────────────────────────────────────────────────────────
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export const LABELS_METODO_PAGO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

export interface PagoSplit {
  metodo: MetodoPago
  monto: number
}

// ─── Producto en caja (contrato con el backend) ────────────────────────────────
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
  stockDisponible: number
  precioEfectivo: number
  precioTarjeta: number
}

// ─── Datos opcionales del cliente para el ticket / WhatsApp ───────────────────
export interface DatosCliente {
  nombre: string
  telefono?: string
}

// ─── Documento del receptor para ARCA ─────────────────────────────────────────
export interface DocReceptor {
  tipo: 96 | 80  // 96 = DNI, 80 = CUIT
  nro: number
}

// ─── Datos de una venta a procesar ────────────────────────────────────────────
export interface DatosVenta {
  items: ItemCarrito[]
  pagos: PagoSplit[]
  cliente?: DatosCliente
  docReceptor?: DocReceptor
  /** false bloquea la emisión en ARCA aunque esté habilitada. Omitir = comportamiento por defecto. */
  facturarEnArca?: boolean
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

export interface ArcaFacturaTicket {
  cae: string
  caeFchVto: string      // YYYYMMDD
  nroComprobante: number
  ptoVta: number
  cbteTipo: number
  qrUrl: string
}

export interface Ticket {
  numero: string
  fecha: string          // ISO 8601
  pagos: PagoSplit[]
  lineas: LineaTicket[]
  total: number
  cliente?: DatosCliente
  arcaFactura?: ArcaFacturaTicket  // presente si ARCA emitió el CAE
  arcaError?: string               // presente si ARCA estaba habilitada pero falló
}

// ─── Contratos del API (request / response) ────────────────────────────────────
export interface IBuscarProductosResponse {
  productos: ProductoCaja[]
}

export interface IFinalizarVentaRequest {
  items: Array<{
    productoId: string
    articulo: string
    talle: string
    cantidad: number
    precioUnitario: number  // precio según si hay tarjeta en pagos
  }>
  pagos: PagoSplit[]
  cliente?: DatosCliente
  docReceptor?: DocReceptor
  facturarEnArca?: boolean
}

export interface IFinalizarVentaResponse {
  ticket: Ticket
}

export interface ResultadoVenta {
  ticket: Ticket
}
