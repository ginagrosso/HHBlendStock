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

  // Historial paginado
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

  const [resumen, setResumen] = useState<ResumenReportes | null>(null)
  const [cargandoResumen, setCargandoResumen] = useState(false)

  const [ventas, setVentas] = useState<VentaHistorial[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaHistorial | null>(null)

  const [masVendidos, setMasVendidos] = useState<ProductoMasVendido[]>([])
  const [periodoMasVendidos, setPeriodoMasVendidos] = useState<PeriodoMasVendidos>('historico')
  const [cargandoMasVendidos, setCargandoMasVendidos] = useState(false)

  const [resumenDiario, setResumenDiario] = useState<ResumenDiario[]>([])
  const [cargandoGrafico, setCargandoGrafico] = useState(false)

  // KPIs + gráfico al cambiar mes/año
  useEffect(() => {
    let cancelado = false
    setCargandoResumen(true)
    setCargandoGrafico(true)
    setPagina(1)

    Promise.all([
      reportesService.obtenerResumen({ mes, anio }),
      reportesService.obtenerResumenDiario({ mes, anio }),
    ]).then(([resumenResp, diarioResp]) => {
      if (cancelado) return
      setResumen(resumenResp.resumen)
      setCargandoResumen(false)
      setResumenDiario(diarioResp.dias)
      setCargandoGrafico(false)
    })

    return () => { cancelado = true }
  }, [mes, anio])

  // Historial al cambiar mes/año o página
  useEffect(() => {
    let cancelado = false
    setCargandoHistorial(true)

    reportesService
      .obtenerHistorial({ mes, anio, pagina, porPagina: POR_PAGINA })
      .then((resp) => {
        if (cancelado) return
        setVentas(resp.ventas)
        setTotalPaginas(resp.totalPaginas)
        setCargandoHistorial(false)
      })

    return () => { cancelado = true }
  }, [mes, anio, pagina])

  // Más vendidos al cambiar período o mes/año
  useEffect(() => {
    let cancelado = false
    setCargandoMasVendidos(true)

    reportesService
      .obtenerMasVendidos({
        periodo: periodoMasVendidos,
        mes: periodoMasVendidos === 'mes' ? mes : undefined,
        anio: periodoMasVendidos === 'mes' ? anio : undefined,
      })
      .then((resp) => {
        if (cancelado) return
        setMasVendidos(resp.productos)
        setCargandoMasVendidos(false)
      })

    return () => { cancelado = true }
  }, [periodoMasVendidos, mes, anio])

  const irMesAnterior = useCallback(() => {
    if (mes === 1) { setMes(12); setAnio((a) => a - 1) }
    else setMes((m) => m - 1)
  }, [mes])

  const irMesSiguiente = useCallback(() => {
    if (mes === 12) { setMes(1); setAnio((a) => a + 1) }
    else setMes((m) => m + 1)
  }, [mes])

  const irPagina = useCallback((p: number) => setPagina(p), [])
  const abrirDetalle = useCallback((v: VentaHistorial) => setVentaSeleccionada(v), [])
  const cerrarDetalle = useCallback(() => setVentaSeleccionada(null), [])
  const cambiarPeriodoMasVendidos = useCallback((p: PeriodoMasVendidos) => setPeriodoMasVendidos(p), [])

  return {
    mes, anio,
    nombreMesAnio: `${MESES[mes - 1]} de ${anio}`,
    irMesAnterior, irMesSiguiente,
    resumen, cargandoResumen,
    ventas, cargandoHistorial, pagina, totalPaginas, irPagina,
    ventaSeleccionada, abrirDetalle, cerrarDetalle,
    masVendidos, periodoMasVendidos, cambiarPeriodoMasVendidos, cargandoMasVendidos,
    resumenDiario, cargandoGrafico,
  }
}
