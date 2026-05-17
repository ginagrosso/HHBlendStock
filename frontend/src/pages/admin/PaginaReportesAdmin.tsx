import { ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react'
import { useReportes } from '../../hooks/useReportes'
import { TarjetasResumenReportes } from '../../components/admin/reportes/TarjetasResumenReportes'
import { GraficoVentasDiarias } from '../../components/admin/reportes/GraficoVentasDiarias'
import { MasVendidosReportes } from '../../components/admin/reportes/MasVendidosReportes'
import { TablaHistorialVentas } from '../../components/admin/reportes/TablaHistorialVentas'
import { ModalDetalleVenta } from '../../components/admin/reportes/ModalDetalleVenta'

export function PaginaReportesAdmin() {
  const r = useReportes()

  return (
    <>
      <section className="flex flex-col gap-6">

        {/* Encabezado */}
        <header className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center gap-3">
            <BarChart2 className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-neutral-100">Reportes</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            Historial de ventas, productos más vendidos y análisis del período.
          </p>
        </header>

        {/* Navegación de mes */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={r.irMesAnterior}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-neutral-100 w-52 text-center">
            {r.nombreMesAnio}
          </h3>
          <button
            type="button"
            onClick={r.irMesSiguiente}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* KPIs */}
        <TarjetasResumenReportes
          resumen={r.resumen}
          cargando={r.cargandoResumen}
        />

        {/* Gráfico diario + desglose método de pago */}
        <GraficoVentasDiarias
          dias={r.resumenDiario}
          mes={r.mes}
          anio={r.anio}
          desglose={r.resumen?.desgloseMes ?? null}
          cargando={r.cargandoGrafico}
        />

        {/* Más vendidos + historial */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <MasVendidosReportes
              productos={r.masVendidos}
              periodo={r.periodoMasVendidos}
              onCambioPeriodo={r.cambiarPeriodoMasVendidos}
              cargando={r.cargandoMasVendidos}
            />
          </div>
          <div className="lg:col-span-2">
            <TablaHistorialVentas
              ventas={r.ventas}
              cargando={r.cargandoHistorial}
              pagina={r.pagina}
              totalPaginas={r.totalPaginas}
              onVerDetalle={r.abrirDetalle}
              onIrPagina={r.irPagina}
            />
          </div>
        </div>

      </section>

      {/* Modal detalle (fuera del flujo para z-index correcto) */}
      <ModalDetalleVenta
        venta={r.ventaSeleccionada}
        onCerrar={r.cerrarDetalle}
      />
    </>
  )
}
