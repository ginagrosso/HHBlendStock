import type { ProductoMasVendido, PeriodoMasVendidos } from '../../../types/reportes.types'

interface Props {
  productos: ProductoMasVendido[]
  periodo: PeriodoMasVendidos
  onCambioPeriodo: (p: PeriodoMasVendidos) => void
  cargando: boolean
}

export function MasVendidosReportes({ productos, periodo, onCambioPeriodo, cargando }: Props) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-neutral-200">Más Vendidos</h2>
        <div className="flex items-center bg-neutral-800 rounded-full p-1">
          {(['historico', 'mes'] as PeriodoMasVendidos[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onCambioPeriodo(p)}
              className={[
                'text-xs px-3 py-1 rounded-full transition-colors',
                periodo === p
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200',
              ].join(' ')}
            >
              {p === 'historico' ? 'Histórico' : 'Este Mes'}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-3 bg-neutral-800 rounded animate-pulse" />
              <div className="flex-1 h-8 bg-neutral-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-8">
          Sin ventas en este período.
        </p>
      ) : (
        <ol className="space-y-4">
          {productos.map((p, idx) => (
            <li key={`${p.productoId}-${p.talle}`} className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-600 w-4 text-right shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span className="text-sm text-neutral-200 truncate font-medium">
                    {p.nombre}
                  </span>
                  <span className="text-xs text-neutral-500 shrink-0">
                    {p.talle !== 'Único' ? p.talle : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${p.porcentaje}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 shrink-0 w-12 text-right">
                    {p.totalUnidades} un.
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
