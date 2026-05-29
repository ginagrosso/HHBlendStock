import { useState, useEffect, useCallback } from 'react'
import type {
  ResumenReportes,
  VentaHistorial,
  ProductoMasVendido,
  ResumenDiario,
  PeriodoMasVendidos,
} from '../types/reportes.types'
import { reportesService } from '../services/reportes.service'

const POR_PAGINA = 8

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export interface UseReportesReturn {
  // Navegación temporal
  mes: number
  anio: number
  nombreMesAnio: string
  irMesAnterior: () => void
  irMesSiguiente: () => void

  // KPIs y desglose
  resumen: ResumenReportes | null
  cargandoResumen: boolean

  // Historial paginado (cliente)
  ventas: VentaHistorial[]
  cargandoHistorial: boolean
  pagina: number
  totalPaginas: number
  irPagina: (p: number) => void

  // Modal de detalle
  ventaSeleccionada: VentaHistorial | null
  abrirDetalle: (v: VentaHistorial) => void
  cerrarDetalle: () => void

  // Más vendidos
  masVendidos: ProductoMasVendido[]
  periodoMasVendidos: PeriodoMasVendidos
  cambiarPeriodoMasVendidos: (p: PeriodoMasVendidos) => void
  cargandoMasVendidos: boolean

  // Gráfico de ventas diarias
  resumenDiario: ResumenDiario[]
  cargandoGrafico: boolean
}

export function useReportes(): UseReportesReturn {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [anio, setAnio] = useState(hoy.getFullYear())

  // Datos del mes (1 query Firestore por cambio de mes/año)
  const [cargandoMes, setCargandoMes] = useState(false)
  const [resumen, setResumen] = useState<ResumenReportes | null>(null)
  const [todasLasVentas, setTodasLasVentas] = useState<VentaHistorial[]>([])
  const [masVendidosMes, setMasVendidosMes] = useState<ProductoMasVendido[]>([])
  const [resumenDiario, setResumenDiario] = useState<ResumenDiario[]>([])

  // Paginación cliente
  const [pagina, setPagina] = useState(1)

  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaHistorial | null>(null)

  // Más vendidos
  const [masVendidos, setMasVendidos] = useState<ProductoMasVendido[]>([])
  const [periodoMasVendidos, setPeriodoMasVendidos] = useState<PeriodoMasVendidos>('historico')
  const [cargandoMasVendidos, setCargandoMasVendidos] = useState(false)

  // Una sola llamada al backend por cambio de mes/año
  useEffect(() => {
    let cancelado = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargandoMes(true)
    setPagina(1)

    reportesService.obtenerMes(mes, anio).then((resp) => {
      if (cancelado) return
      setResumen(resp.resumen)
      setTodasLasVentas(resp.historial)
      setMasVendidosMes(resp.masVendidosMes)
      setResumenDiario(resp.resumenDiario)
      setCargandoMes(false)
    })

    return () => { cancelado = true }
  }, [mes, anio])

  // Cuando el período cambia a 'historico', leer el agregado (1 doc Firestore)
  useEffect(() => {
    if (periodoMasVendidos !== 'historico') return

    let cancelado = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargandoMasVendidos(true)

    reportesService.obtenerHistorico(10).then((resp) => {
      if (cancelado) return
      setMasVendidos(resp.productos)
      setCargandoMasVendidos(false)
    })

    return () => { cancelado = true }
  }, [periodoMasVendidos])

  // Paginación cliente
  const totalPaginas = Math.max(1, Math.ceil(todasLasVentas.length / POR_PAGINA))
  const inicio = (pagina - 1) * POR_PAGINA
  const ventas = todasLasVentas.slice(inicio, inicio + POR_PAGINA)

  const irMesAnterior = () => {
    setMes((m) => {
      if (m === 1) { setAnio((a) => a - 1); return 12 }
      return m - 1
    })
  }

  const irMesSiguiente = () => {
    setMes((m) => {
      if (m === 12) { setAnio((a) => a + 1); return 1 }
      return m + 1
    })
  }

  const irPagina = useCallback((p: number) => setPagina(p), [])
  const abrirDetalle = useCallback((v: VentaHistorial) => setVentaSeleccionada(v), [])
  const cerrarDetalle = useCallback(() => setVentaSeleccionada(null), [])
  const cambiarPeriodoMasVendidos = useCallback((p: PeriodoMasVendidos) => setPeriodoMasVendidos(p), [])

  return {
    mes, anio,
    nombreMesAnio: `${MESES[mes - 1]} de ${anio}`,
    irMesAnterior, irMesSiguiente,
    resumen, cargandoResumen: cargandoMes,
    ventas, cargandoHistorial: cargandoMes, pagina, totalPaginas, irPagina,
    ventaSeleccionada, abrirDetalle, cerrarDetalle,
    masVendidos: periodoMasVendidos === 'mes' ? masVendidosMes : masVendidos,
    periodoMasVendidos, cambiarPeriodoMasVendidos, cargandoMasVendidos,
    resumenDiario, cargandoGrafico: cargandoMes,
  }
}
