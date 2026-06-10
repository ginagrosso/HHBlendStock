import { X, User, CreditCard } from 'lucide-react'
import type { VentaHistorial } from '../../../types/reportes.types'
import type { PagoSplit } from '../../../types/caja.types'
import { LABELS_METODO_PAGO } from '../../../types/caja.types'

const fmtMini = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function labelPagos(pagos: PagoSplit[]): string {
  if (pagos.length === 1) return LABELS_METODO_PAGO[pagos[0].metodo]
  return pagos.map((p) => `${LABELS_METODO_PAGO[p.metodo]}: ${fmtMini(p.monto)}`).join(' + ')
}

interface Props {
  venta: VentaHistorial | null
  onCerrar: () => void
}

function fmtMonto(n: number): string {
  return n.toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 2,
  })
}

function fmtFechaLarga(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ModalDetalleVenta({ venta, onCerrar }: Props) {
  if (!venta) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-100">
              Venta #{venta.numero}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 capitalize">
              {fmtFechaLarga(venta.fecha)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-neutral-500 hover:text-neutral-300 transition-colors ml-4 mt-0.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Método de pago + cliente */}
        <div className="px-6 py-4 flex flex-wrap gap-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-neutral-500" />
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Método</p>
              <p className="text-sm text-neutral-200 font-medium">
                {labelPagos(venta.pagos)}
              </p>
            </div>
          </div>
          {venta.cliente && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-500" />
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Cliente</p>
                <p className="text-sm text-neutral-200 font-medium">{venta.cliente.nombre}</p>
                {venta.cliente.telefono && (
                  <p className="text-xs text-neutral-500">{venta.cliente.telefono}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ítems */}
        <div className="px-6 py-2 max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">Producto</th>
                <th className="py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase w-14">Cant.</th>
                <th className="py-3 text-right text-xs font-semibold tracking-wider text-neutral-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {venta.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <p className="text-neutral-200">{item.nombre}</p>
                    <p className="text-xs text-neutral-500">
                      {item.articulo} · Talle {item.talle} · {fmtMonto(item.precioUnitario)} c/u
                    </p>
                  </td>
                  <td className="py-3 text-center text-neutral-400">{item.cantidad}</td>
                  <td className="py-3 text-right text-neutral-200 font-medium whitespace-nowrap">
                    {fmtMonto(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-neutral-800">
          <span className="text-sm text-neutral-400">Total</span>
          <span className="text-xl font-bold text-amber-500">{fmtMonto(venta.total)}</span>
        </div>
      </div>
    </div>
  )
}
