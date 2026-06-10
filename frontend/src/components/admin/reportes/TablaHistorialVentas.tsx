import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { VentaHistorial } from '../../../types/reportes.types'
import type { PagoSplit } from '../../../types/caja.types'
import { LABELS_METODO_PAGO } from '../../../types/caja.types'

const fmt = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function labelPagos(pagos: PagoSplit[]): string {
  if (pagos.length === 1) return LABELS_METODO_PAGO[pagos[0].metodo]
  return pagos.map((p) => `${LABELS_METODO_PAGO[p.metodo]}: ${fmt(p.monto)}`).join(' + ')
}

interface Props {
  ventas: VentaHistorial[]
  cargando: boolean
  pagina: number
  totalPaginas: number
  onVerDetalle: (v: VentaHistorial) => void
  onIrPagina: (p: number) => void
}

function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtMonto(n: number): string {
  return n.toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 2,
  })
}

function totalItems(v: VentaHistorial): number {
  return v.items.reduce((s, i) => s + i.cantidad, 0)
}

export function TablaHistorialVentas({
  ventas, cargando, pagina, totalPaginas, onVerDetalle, onIrPagina,
}: Props) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-200">
          Historial de Ventas
          {totalPaginas > 1 && (
            <span className="text-neutral-500 font-normal ml-2">
              (pág. {pagina} de {totalPaginas})
            </span>
          )}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">Fecha y Hora</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase hidden md:table-cell">Método</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">Ítems</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">Total</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {cargando
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-neutral-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : ventas.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    No hay ventas registradas para este período.
                  </td>
                </tr>
              )
              : ventas.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-neutral-500">#{v.numero}</td>
                    <td className="px-6 py-4 text-sm text-neutral-300 whitespace-nowrap">{fmtFecha(v.fecha)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-400 hidden md:table-cell">
                      {labelPagos(v.pagos)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {totalItems(v)} ítem{totalItems(v) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-100 whitespace-nowrap">
                      {fmtMonto(v.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onVerDetalle(v)}
                        className="text-xs font-medium border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 px-3 py-1.5 rounded transition-colors"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onIrPagina(pagina - 1)}
            disabled={pagina <= 1}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIrPagina(i + 1)}
              className={[
                'w-8 h-8 text-xs rounded transition-colors',
                i + 1 === pagina
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800',
              ].join(' ')}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onIrPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
