import { useState } from 'react'
import type { ResumenDiario, DesgloseMedioPago } from '../../../types/reportes.types'

interface Props {
  dias: ResumenDiario[]
  mes: number
  anio: number
  desglose: DesgloseMedioPago | null
  cargando: boolean
}

function fmtMonto(n: number): string {
  return n.toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  })
}

export function GraficoVentasDiarias({ dias, mes, anio, desglose, cargando }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null)

  const diasEnMes = new Date(anio, mes, 0).getDate()
  const maxVentas = Math.max(...dias.map((d) => d.totalVentas), 1)

  const porDia = new Map<number, ResumenDiario>()
  dias.forEach((d) => {
    porDia.set(parseInt(d.fecha.split('-')[2], 10), d)
  })

  const hovered = hoverId ? porDia.get(parseInt(hoverId, 10)) ?? null : null

  const totalDesglose = desglose
    ? desglose.efectivo + desglose.tarjeta + desglose.transferencia
    : 0

  const pct = (n: number) =>
    totalDesglose > 0 ? Math.round((n / totalDesglose) * 100) : 0

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">

        {/* Gráfico de barras */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-200">Ventas Diarias</h2>
            {hovered && (
              <span className="text-xs text-neutral-400">
                {new Date(hovered.fecha + 'T12:00').toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short',
                })}
                {' — '}
                <span className="text-amber-500 font-semibold">
                  {fmtMonto(hovered.totalVentas)}
                </span>
                {' · '}
                {hovered.cantidadTransacciones} venta{hovered.cantidadTransacciones !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {cargando ? (
            <div className="h-24 bg-neutral-800 rounded animate-pulse" />
          ) : (
            <div className="flex items-end gap-px h-24">
              {Array.from({ length: diasEnMes }).map((_, i) => {
                const dia = i + 1
                const dato = porDia.get(dia)
                const alturaRel = dato ? Math.max(6, (dato.totalVentas / maxVentas) * 100) : 0
                const esHover = hoverId === String(dia)

                return (
                  <div
                    key={dia}
                    className="flex-1 flex flex-col items-center gap-1 cursor-default"
                    onMouseEnter={() => dato && setHoverId(String(dia))}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <div
                      className="w-full rounded-t transition-colors duration-100"
                      style={{
                        height: `${alturaRel}%`,
                        backgroundColor: dato
                          ? esHover ? '#f59e0b' : '#78350f'
                          : 'transparent',
                        minHeight: dato ? '4px' : undefined,
                      }}
                    />
                    {(dia === 1 || dia % 5 === 0) ? (
                      <span className="text-[9px] text-neutral-600 select-none">{dia}</span>
                    ) : (
                      <span className="text-[9px] text-transparent select-none">·</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Desglose por método de pago */}
        <div className="sm:w-44 shrink-0">
          <h3 className="text-sm font-semibold text-neutral-200 mb-4">
            Desglose del Mes
          </h3>
          {cargando || !desglose ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(
                [
                  { key: 'efectivo', label: 'Efectivo', color: 'bg-emerald-500' },
                  { key: 'transferencia', label: 'Transferencia', color: 'bg-blue-500' },
                  { key: 'tarjeta', label: 'Tarjeta', color: 'bg-amber-500' },
                ] as const
              ).map(({ key, label, color }) => {
                const valor = desglose[key]
                const porcentaje = pct(valor)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-xs text-neutral-400">{label}</span>
                      </div>
                      <span className="text-xs text-neutral-500">{porcentaje}%</span>
                    </div>
                    <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{fmtMonto(valor)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
