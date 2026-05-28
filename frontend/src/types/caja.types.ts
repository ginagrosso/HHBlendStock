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
  stockDisponible: number
  precioEfectivo: number
  precioTarjeta: number
}

// ─── Datos opcionales del cliente para el ticket / WhatsApp ───────────────────
export interface DatosCliente {
  nombre: string
  telefono: string
}

// ─── Documento del receptor para ARCA (requerido cuando supera límite anónimo) ─
export interface DocReceptor {
  tipo: 96 | 80  // 96 = DNI, 80 = CUIT
  nro: number
}

// ─── Datos de una venta a procesar ────────────────────────────────────────────
export interface DatosVenta {
  items: ItemCarrito[]
  metodoPago: MetodoPago
  cliente?: DatosCliente
  docReceptor?: DocReceptor
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
  metodoPago: MetodoPago
  lineas: LineaTicket[]
  total: number
  cliente?: DatosCliente
  arcaFactura?: ArcaFacturaTicket  // presente si ARCA emitió el CAE
  arcaError?: string               // presente si ARCA estaba habilitada pero falló
}

// ─── Contratos del API (request / response) ────────────────────────────────────
// Documentan lo que el backend debe aceptar y retornar.
// Al conectar el backend real, reemplazar la implementación mock en caja.service.ts
// sin modificar estas interfaces.

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
  docReceptor?: DocReceptor
}

export interface IFinalizarVentaResponse {
  ticket: Ticket
}

export interface ResultadoVenta {
  ticket: Ticket
}
