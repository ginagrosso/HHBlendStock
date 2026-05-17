import type { VentaHistorial, ProductoMasVendido, ResumenDiario } from '../types/reportes.types'

// ─── Helper de fecha ───────────────────────────────────────────────────────────
// Genera ISO 8601 con offset Argentina (UTC-3) para que toLocaleString('es-AR')
// renderice la hora local correctamente.
function f(dt: string): string {
  return `${dt}:00-03:00`
}

// ─── Dataset histórico de ventas ───────────────────────────────────────────────
// Estructura idéntica a la que devolverá el endpoint GET /reportes/historial.
// IDs de producto coinciden con los de caja.mocks.ts.
export const VENTAS_MOCK: VentaHistorial[] = [

  // ── Marzo 2026 ────────────────────────────────────────────────────────────────
  {
    id: 'vta-2026-03-001', numero: 1, fecha: f('2026-03-03T10:15'),
    metodoPago: 'efectivo',
    cliente: { nombre: 'Ana García', telefono: '+5491123456789' },
    items: [
      { productoId: 'mock-rem-001-m', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'M', cantidad: 2, precioUnitario: 22000, subtotal: 44000 },
      { productoId: 'mock-pan-001-38', nombre: 'Pantalón Recto Clásico', articulo: 'PAN-001', talle: '38', cantidad: 1, precioUnitario: 62000, subtotal: 62000 },
    ],
    total: 106000,
  },
  {
    id: 'vta-2026-03-002', numero: 2, fecha: f('2026-03-05T15:42'),
    metodoPago: 'tarjeta',
    items: [
      { productoId: 'mock-ves-001-38', nombre: 'Vestido Midi Floral', articulo: 'VES-001', talle: '38', cantidad: 1, precioUnitario: 106800, subtotal: 106800 },
    ],
    total: 106800,
  },
  {
    id: 'vta-2026-03-003', numero: 3, fecha: f('2026-03-07T11:20'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-cam-001-40', nombre: 'Camisa Lino Premium', articulo: 'CAM-001', talle: '40', cantidad: 1, precioUnitario: 45000, subtotal: 45000 },
      { productoId: 'mock-acc-001-u', nombre: 'Cinturón Cuero Premium', articulo: 'ACC-001', talle: 'Único', cantidad: 1, precioUnitario: 28000, subtotal: 28000 },
    ],
    total: 73000,
  },
  {
    id: 'vta-2026-03-004', numero: 4, fecha: f('2026-03-08T17:05'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Laura Sánchez' },
    items: [
      { productoId: 'mock-rem-002-m', nombre: 'Remera Estampada Artística', articulo: 'REM-002', talle: 'M', cantidad: 3, precioUnitario: 38400, subtotal: 115200 },
    ],
    total: 115200,
  },
  {
    id: 'vta-2026-03-005', numero: 5, fecha: f('2026-03-10T12:30'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-pan-002-40', nombre: 'Jean Premium Slim', articulo: 'PAN-002', talle: '40', cantidad: 1, precioUnitario: 78000, subtotal: 78000 },
    ],
    total: 78000,
  },
  {
    id: 'vta-2026-03-006', numero: 6, fecha: f('2026-03-12T14:15'),
    metodoPago: 'transferencia',
    cliente: { nombre: 'Valentina López', telefono: '+5491198765432' },
    items: [
      { productoId: 'mock-cam-002-38', nombre: 'Camisa Estampada Verano', articulo: 'CAM-002', talle: '38', cantidad: 2, precioUnitario: 38000, subtotal: 76000 },
    ],
    total: 76000,
  },
  {
    id: 'vta-2026-03-007', numero: 7, fecha: f('2026-03-13T16:48'),
    metodoPago: 'tarjeta',
    items: [
      { productoId: 'mock-ves-002-36', nombre: 'Vestido Lencero Premium', articulo: 'VES-002', talle: '36', cantidad: 1, precioUnitario: 132000, subtotal: 132000 },
    ],
    total: 132000,
  },
  {
    id: 'vta-2026-03-008', numero: 8, fecha: f('2026-03-15T10:05'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-s', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'S', cantidad: 3, precioUnitario: 22000, subtotal: 66000 },
    ],
    total: 66000,
  },
  {
    id: 'vta-2026-03-009', numero: 9, fecha: f('2026-03-17T18:20'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-acc-002-u', nombre: 'Pañuelo Seda', articulo: 'ACC-002', talle: 'Único', cantidad: 2, precioUnitario: 18000, subtotal: 36000 },
      { productoId: 'mock-rem-001-l', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'L', cantidad: 1, precioUnitario: 22000, subtotal: 22000 },
    ],
    total: 58000,
  },
  {
    id: 'vta-2026-03-010', numero: 10, fecha: f('2026-03-19T11:40'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Sofía Martínez', telefono: '+5491145678901' },
    items: [
      { productoId: 'mock-pan-001-40', nombre: 'Pantalón Recto Clásico', articulo: 'PAN-001', talle: '40', cantidad: 1, precioUnitario: 74400, subtotal: 74400 },
      { productoId: 'mock-cam-001-36', nombre: 'Camisa Lino Premium', articulo: 'CAM-001', talle: '36', cantidad: 1, precioUnitario: 54000, subtotal: 54000 },
    ],
    total: 128400,
  },
  {
    id: 'vta-2026-03-011', numero: 11, fecha: f('2026-03-21T15:55'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-ves-001-36', nombre: 'Vestido Midi Floral', articulo: 'VES-001', talle: '36', cantidad: 1, precioUnitario: 89000, subtotal: 89000 },
    ],
    total: 89000,
  },
  {
    id: 'vta-2026-03-012', numero: 12, fecha: f('2026-03-22T17:10'),
    metodoPago: 'transferencia',
    items: [
      { productoId: 'mock-rem-002-m', nombre: 'Remera Estampada Artística', articulo: 'REM-002', talle: 'M', cantidad: 2, precioUnitario: 32000, subtotal: 64000 },
      { productoId: 'mock-acc-001-u', nombre: 'Cinturón Cuero Premium', articulo: 'ACC-001', talle: 'Único', cantidad: 1, precioUnitario: 28000, subtotal: 28000 },
    ],
    total: 92000,
  },
  {
    id: 'vta-2026-03-013', numero: 13, fecha: f('2026-03-25T12:25'),
    metodoPago: 'tarjeta',
    items: [
      { productoId: 'mock-cam-002-38', nombre: 'Camisa Estampada Verano', articulo: 'CAM-002', talle: '38', cantidad: 1, precioUnitario: 45600, subtotal: 45600 },
      { productoId: 'mock-pan-002-38', nombre: 'Jean Premium Slim', articulo: 'PAN-002', talle: '38', cantidad: 1, precioUnitario: 93600, subtotal: 93600 },
    ],
    total: 139200,
  },
  {
    id: 'vta-2026-03-014', numero: 14, fecha: f('2026-03-27T16:00'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-m', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'M', cantidad: 1, precioUnitario: 22000, subtotal: 22000 },
      { productoId: 'mock-rem-001-l', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'L', cantidad: 1, precioUnitario: 22000, subtotal: 22000 },
    ],
    total: 44000,
  },
  {
    id: 'vta-2026-03-015', numero: 15, fecha: f('2026-03-29T10:50'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-acc-001-u', nombre: 'Cinturón Cuero Premium', articulo: 'ACC-001', talle: 'Único', cantidad: 2, precioUnitario: 28000, subtotal: 56000 },
      { productoId: 'mock-acc-002-u', nombre: 'Pañuelo Seda', articulo: 'ACC-002', talle: 'Único', cantidad: 1, precioUnitario: 18000, subtotal: 18000 },
    ],
    total: 74000,
  },

  // ── Abril 2026 ────────────────────────────────────────────────────────────────
  {
    id: 'vta-2026-04-001', numero: 16, fecha: f('2026-04-01T11:30'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-s', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'S', cantidad: 2, precioUnitario: 22000, subtotal: 44000 },
    ],
    total: 44000,
  },
  {
    id: 'vta-2026-04-002', numero: 17, fecha: f('2026-04-03T14:20'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Camila Torres', telefono: '+5491167891234' },
    items: [
      { productoId: 'mock-ves-001-38', nombre: 'Vestido Midi Floral', articulo: 'VES-001', talle: '38', cantidad: 1, precioUnitario: 106800, subtotal: 106800 },
      { productoId: 'mock-acc-002-u', nombre: 'Pañuelo Seda', articulo: 'ACC-002', talle: 'Único', cantidad: 1, precioUnitario: 21600, subtotal: 21600 },
    ],
    total: 128400,
  },
  {
    id: 'vta-2026-04-003', numero: 18, fecha: f('2026-04-05T10:10'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-pan-001-38', nombre: 'Pantalón Recto Clásico', articulo: 'PAN-001', talle: '38', cantidad: 1, precioUnitario: 62000, subtotal: 62000 },
    ],
    total: 62000,
  },
  {
    id: 'vta-2026-04-004', numero: 19, fecha: f('2026-04-07T16:45'),
    metodoPago: 'transferencia',
    items: [
      { productoId: 'mock-cam-001-38', nombre: 'Camisa Lino Premium', articulo: 'CAM-001', talle: '38', cantidad: 2, precioUnitario: 45000, subtotal: 90000 },
    ],
    total: 90000,
  },
  {
    id: 'vta-2026-04-005', numero: 20, fecha: f('2026-04-09T12:15'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Lucía Pérez' },
    items: [
      { productoId: 'mock-ves-002-36', nombre: 'Vestido Lencero Premium', articulo: 'VES-002', talle: '36', cantidad: 1, precioUnitario: 132000, subtotal: 132000 },
    ],
    total: 132000,
  },
  {
    id: 'vta-2026-04-006', numero: 21, fecha: f('2026-04-10T18:00'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-002-m', nombre: 'Remera Estampada Artística', articulo: 'REM-002', talle: 'M', cantidad: 1, precioUnitario: 32000, subtotal: 32000 },
      { productoId: 'mock-acc-001-u', nombre: 'Cinturón Cuero Premium', articulo: 'ACC-001', talle: 'Único', cantidad: 1, precioUnitario: 28000, subtotal: 28000 },
    ],
    total: 60000,
  },
  {
    id: 'vta-2026-04-007', numero: 22, fecha: f('2026-04-12T11:25'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-m', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'M', cantidad: 3, precioUnitario: 22000, subtotal: 66000 },
    ],
    total: 66000,
  },
  {
    id: 'vta-2026-04-008', numero: 23, fecha: f('2026-04-14T15:30'),
    metodoPago: 'tarjeta',
    items: [
      { productoId: 'mock-pan-002-38', nombre: 'Jean Premium Slim', articulo: 'PAN-002', talle: '38', cantidad: 1, precioUnitario: 93600, subtotal: 93600 },
      { productoId: 'mock-rem-001-s', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'S', cantidad: 2, precioUnitario: 26400, subtotal: 52800 },
    ],
    total: 146400,
  },
  {
    id: 'vta-2026-04-009', numero: 24, fecha: f('2026-04-16T10:40'),
    metodoPago: 'transferencia',
    cliente: { nombre: 'Martina Rodríguez', telefono: '+5491112345678' },
    items: [
      { productoId: 'mock-ves-001-36', nombre: 'Vestido Midi Floral', articulo: 'VES-001', talle: '36', cantidad: 1, precioUnitario: 89000, subtotal: 89000 },
      { productoId: 'mock-acc-002-u', nombre: 'Pañuelo Seda', articulo: 'ACC-002', talle: 'Único', cantidad: 2, precioUnitario: 18000, subtotal: 36000 },
    ],
    total: 125000,
  },
  {
    id: 'vta-2026-04-010', numero: 25, fecha: f('2026-04-18T14:55'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-cam-002-36', nombre: 'Camisa Estampada Verano', articulo: 'CAM-002', talle: '36', cantidad: 1, precioUnitario: 38000, subtotal: 38000 },
      { productoId: 'mock-pan-001-40', nombre: 'Pantalón Recto Clásico', articulo: 'PAN-001', talle: '40', cantidad: 1, precioUnitario: 62000, subtotal: 62000 },
    ],
    total: 100000,
  },
  {
    id: 'vta-2026-04-011', numero: 26, fecha: f('2026-04-21T11:05'),
    metodoPago: 'tarjeta',
    items: [
      { productoId: 'mock-rem-002-m', nombre: 'Remera Estampada Artística', articulo: 'REM-002', talle: 'M', cantidad: 2, precioUnitario: 38400, subtotal: 76800 },
    ],
    total: 76800,
  },
  {
    id: 'vta-2026-04-012', numero: 27, fecha: f('2026-04-23T17:20'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-acc-001-u', nombre: 'Cinturón Cuero Premium', articulo: 'ACC-001', talle: 'Único', cantidad: 1, precioUnitario: 28000, subtotal: 28000 },
      { productoId: 'mock-acc-002-u', nombre: 'Pañuelo Seda', articulo: 'ACC-002', talle: 'Único', cantidad: 3, precioUnitario: 18000, subtotal: 54000 },
    ],
    total: 82000,
  },
  {
    id: 'vta-2026-04-013', numero: 28, fecha: f('2026-04-25T13:10'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Florencia Castro', telefono: '+5491156789012' },
    items: [
      { productoId: 'mock-cam-001-38', nombre: 'Camisa Lino Premium', articulo: 'CAM-001', talle: '38', cantidad: 1, precioUnitario: 54000, subtotal: 54000 },
      { productoId: 'mock-ves-001-38', nombre: 'Vestido Midi Floral', articulo: 'VES-001', talle: '38', cantidad: 1, precioUnitario: 106800, subtotal: 106800 },
    ],
    total: 160800,
  },
  {
    id: 'vta-2026-04-014', numero: 29, fecha: f('2026-04-27T16:30'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-pan-001-42', nombre: 'Pantalón Recto Clásico', articulo: 'PAN-001', talle: '42', cantidad: 1, precioUnitario: 62000, subtotal: 62000 },
    ],
    total: 62000,
  },
  {
    id: 'vta-2026-04-015', numero: 30, fecha: f('2026-04-29T11:45'),
    metodoPago: 'transferencia',
    items: [
      { productoId: 'mock-rem-001-l', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'L', cantidad: 4, precioUnitario: 22000, subtotal: 88000 },
    ],
    total: 88000,
  },

  // ── Mayo 2026 ─────────────────────────────────────────────────────────────────
  {
    id: 'vta-2026-05-001', numero: 31, fecha: f('2026-05-02T10:30'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-m', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'M', cantidad: 2, precioUnitario: 22000, subtotal: 44000 },
    ],
    total: 44000,
  },
  {
    id: 'vta-2026-05-002', numero: 32, fecha: f('2026-05-04T15:20'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Daniela Morales' },
    items: [
      { productoId: 'mock-ves-001-36', nombre: 'Vestido Midi Floral', articulo: 'VES-001', talle: '36', cantidad: 1, precioUnitario: 106800, subtotal: 106800 },
    ],
    total: 106800,
  },
  {
    id: 'vta-2026-05-003', numero: 33, fecha: f('2026-05-06T12:00'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-pan-002-40', nombre: 'Jean Premium Slim', articulo: 'PAN-002', talle: '40', cantidad: 1, precioUnitario: 78000, subtotal: 78000 },
      { productoId: 'mock-acc-001-u', nombre: 'Cinturón Cuero Premium', articulo: 'ACC-001', talle: 'Único', cantidad: 1, precioUnitario: 28000, subtotal: 28000 },
    ],
    total: 106000,
  },
  {
    id: 'vta-2026-05-004', numero: 34, fecha: f('2026-05-08T17:45'),
    metodoPago: 'transferencia',
    items: [
      { productoId: 'mock-cam-001-40', nombre: 'Camisa Lino Premium', articulo: 'CAM-001', talle: '40', cantidad: 1, precioUnitario: 45000, subtotal: 45000 },
      { productoId: 'mock-acc-002-u', nombre: 'Pañuelo Seda', articulo: 'ACC-002', talle: 'Único', cantidad: 1, precioUnitario: 18000, subtotal: 18000 },
    ],
    total: 63000,
  },
  {
    id: 'vta-2026-05-005', numero: 35, fecha: f('2026-05-09T11:10'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Jimena Vargas', telefono: '+5491178901234' },
    items: [
      { productoId: 'mock-rem-002-m', nombre: 'Remera Estampada Artística', articulo: 'REM-002', talle: 'M', cantidad: 2, precioUnitario: 38400, subtotal: 76800 },
    ],
    total: 76800,
  },
  {
    id: 'vta-2026-05-006', numero: 36, fecha: f('2026-05-11T14:30'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-ves-002-36', nombre: 'Vestido Lencero Premium', articulo: 'VES-002', talle: '36', cantidad: 1, precioUnitario: 110000, subtotal: 110000 },
    ],
    total: 110000,
  },
  {
    id: 'vta-2026-05-007', numero: 37, fecha: f('2026-05-12T10:55'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-s', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'S', cantidad: 1, precioUnitario: 22000, subtotal: 22000 },
      { productoId: 'mock-rem-001-l', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'L', cantidad: 1, precioUnitario: 22000, subtotal: 22000 },
    ],
    total: 44000,
  },
  {
    id: 'vta-2026-05-008', numero: 38, fecha: f('2026-05-13T16:20'),
    metodoPago: 'tarjeta',
    items: [
      { productoId: 'mock-pan-001-38', nombre: 'Pantalón Recto Clásico', articulo: 'PAN-001', talle: '38', cantidad: 1, precioUnitario: 74400, subtotal: 74400 },
    ],
    total: 74400,
  },
  {
    id: 'vta-2026-05-009', numero: 39, fecha: f('2026-05-15T21:28'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-l', nombre: 'Remera Básica Premium', articulo: 'REM-001', talle: 'L', cantidad: 1, precioUnitario: 30000, subtotal: 30000 },
    ],
    total: 30000,
  },
  {
    id: 'vta-2026-05-010', numero: 40, fecha: f('2026-05-15T21:35'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-rem-001-l', nombre: 'Remera levis Prueba', articulo: 'REM-001', talle: 'L', cantidad: 1, precioUnitario: 30000, subtotal: 30000 },
    ],
    total: 30000,
  },
  // Hoy: 2026-05-16
  {
    id: 'vta-2026-05-011', numero: 41, fecha: f('2026-05-16T10:15'),
    metodoPago: 'efectivo',
    items: [
      { productoId: 'mock-cam-001-36', nombre: 'Camisa Lino Premium', articulo: 'CAM-001', talle: '36', cantidad: 1, precioUnitario: 45000, subtotal: 45000 },
    ],
    total: 45000,
  },
  {
    id: 'vta-2026-05-012', numero: 42, fecha: f('2026-05-16T14:40'),
    metodoPago: 'tarjeta',
    cliente: { nombre: 'Agustina Ruiz', telefono: '+5491190123456' },
    items: [
      { productoId: 'mock-pan-001-40', nombre: 'Pantalón Recto Clásico', articulo: 'PAN-001', talle: '40', cantidad: 1, precioUnitario: 74400, subtotal: 74400 },
      { productoId: 'mock-acc-002-u', nombre: 'Pañuelo Seda', articulo: 'ACC-002', talle: 'Único', cantidad: 1, precioUnitario: 21600, subtotal: 21600 },
    ],
    total: 96000,
  },
]

// ─── Computar más vendidos ────────────────────────────────────────────────────
// Usado por el servicio mock; reproduce la lógica que implementará el backend.
export function computarMasVendidos(
  ventas: VentaHistorial[],
  limite = 5,
): ProductoMasVendido[] {
  const mapa = new Map<string, ProductoMasVendido>()

  ventas.forEach((v) => {
    v.items.forEach((item) => {
      const clave = `${item.articulo}|${item.talle}`
      const actual = mapa.get(clave)
      if (actual) {
        actual.totalUnidades += item.cantidad
        actual.totalIngresos += item.subtotal
      } else {
        mapa.set(clave, {
          productoId: item.productoId,
          nombre: item.nombre,
          talle: item.talle,
          marca: 'H&H BLEND',
          categoria: '',
          totalUnidades: item.cantidad,
          totalIngresos: item.subtotal,
          porcentaje: 0,
        })
      }
    })
  })

  const lista = Array.from(mapa.values())
    .sort((a, b) => b.totalUnidades - a.totalUnidades)
    .slice(0, limite)

  const maxUnidades = lista[0]?.totalUnidades ?? 1
  lista.forEach((p) => { p.porcentaje = Math.round((p.totalUnidades / maxUnidades) * 100) })

  return lista
}

// ─── Computar resumen diario ──────────────────────────────────────────────────
export function computarResumenDiario(
  ventas: VentaHistorial[],
  mes: number,
  anio: number,
): ResumenDiario[] {
  const ventasMes = ventas.filter((v) => {
    const d = new Date(v.fecha)
    return d.getMonth() + 1 === mes && d.getFullYear() === anio
  })

  const porDia = new Map<string, ResumenDiario>()

  ventasMes.forEach((v) => {
    const d = new Date(v.fecha)
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const actual = porDia.get(clave)
    if (actual) {
      actual.totalVentas += v.total
      actual.cantidadTransacciones += 1
    } else {
      porDia.set(clave, { fecha: clave, totalVentas: v.total, cantidadTransacciones: 1 })
    }
  })

  return Array.from(porDia.values()).sort((a, b) => a.fecha.localeCompare(b.fecha))
}
