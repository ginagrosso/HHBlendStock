import type {
  IResumenReportesRequest,
  IResumenReportesResponse,
  IHistorialVentasRequest,
  IHistorialVentasResponse,
  IMasVendidosRequest,
  IMasVendidosResponse,
  IResumenDiarioRequest,
  IResumenDiarioResponse,
  DesgloseMedioPago,
} from '../types/reportes.types'
import {
  VENTAS_MOCK,
  computarMasVendidos,
  computarResumenDiario,
} from '../mocks/reportes.mocks'

// ─── Contrato del servicio ─────────────────────────────────────────────────────
// Al implementar el backend, crear una clase `ReportesServiceReal` que implemente
// esta interfaz y exportarla como `reportesService` en lugar del mock.
export interface IReportesService {
  obtenerResumen(req: IResumenReportesRequest): Promise<IResumenReportesResponse>
  obtenerHistorial(req: IHistorialVentasRequest): Promise<IHistorialVentasResponse>
  obtenerMasVendidos(req: IMasVendidosRequest): Promise<IMasVendidosResponse>
  obtenerResumenDiario(req: IResumenDiarioRequest): Promise<IResumenDiarioResponse>
}

// ─── Helpers internos ──────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function esMismoDia(fecha: string, ref: Date): boolean {
  const d = new Date(fecha)
  return (
    d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear()
  )
}

function filtrarPorMes(mes: number, anio: number) {
  return VENTAS_MOCK.filter((v) => {
    const d = new Date(v.fecha)
    return d.getMonth() + 1 === mes && d.getFullYear() === anio
  })
}

// ─── Implementación mock ───────────────────────────────────────────────────────
// Simula latencia de red para detectar problemas de UX antes de conectar el backend.
// TODO: conectar a GET /reportes/resumen, /reportes/historial, /reportes/mas-vendidos,
//       /reportes/resumen-diario cuando esté disponible el backend.
const reportesServiceMock: IReportesService = {

  async obtenerResumen({ mes, anio }) {
    await delay(150)

    const hoy = new Date()
    const ventasMes = filtrarPorMes(mes, anio)
    const ventasHoyArr = ventasMes.filter((v) => esMismoDia(v.fecha, hoy))

    const desglose: DesgloseMedioPago = { efectivo: 0, tarjeta: 0, transferencia: 0 }
    ventasMes.forEach((v) => { desglose[v.metodoPago] += v.total })

    return {
      resumen: {
        ventasHoy: ventasHoyArr.reduce((s, v) => s + v.total, 0),
        cantidadVentasHoy: ventasHoyArr.length,
        prendasHoy: ventasHoyArr.reduce(
          (s, v) => s + v.items.reduce((si, i) => si + i.cantidad, 0),
          0,
        ),
        ventasMes: ventasMes.reduce((s, v) => s + v.total, 0),
        cantidadVentasMes: ventasMes.length,
        prendasMes: ventasMes.reduce(
          (s, v) => s + v.items.reduce((si, i) => si + i.cantidad, 0),
          0,
        ),
        desgloseMes: desglose,
      },
    }
  },

  async obtenerHistorial({ mes, anio, pagina, porPagina }) {
    await delay(200)

    const ventasMes = filtrarPorMes(mes, anio).sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    )

    const totalRegistros = ventasMes.length
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / porPagina))
    const inicio = (pagina - 1) * porPagina

    return {
      ventas: ventasMes.slice(inicio, inicio + porPagina),
      totalPaginas,
      totalRegistros,
    }
  },

  async obtenerMasVendidos({ periodo, mes, anio, limite = 5 }) {
    await delay(180)

    const base =
      periodo === 'mes'
        ? filtrarPorMes(mes!, anio!)
        : VENTAS_MOCK

    return { productos: computarMasVendidos(base, limite) }
  },

  async obtenerResumenDiario({ mes, anio }) {
    await delay(150)
    return { dias: computarResumenDiario(VENTAS_MOCK, mes, anio) }
  },
}

export const reportesService: IReportesService = reportesServiceMock
