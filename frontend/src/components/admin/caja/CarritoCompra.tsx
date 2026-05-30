import { useState } from 'react'
import { ShoppingCart, Trash2, Minus, Plus, X, ShoppingBag, AlertTriangle } from 'lucide-react'
import type { ItemCarrito } from '../../../types/caja.types'

const fmt = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)

interface CarritoCompraProps {
  items: ItemCarrito[]
  totalItems: number
  hayPreciosSinDefinir: boolean
  onCambiarCantidad: (productoId: string, talle: string, delta: number) => void
  onQuitarItem: (productoId: string, talle: string) => void
  onVaciar: () => void
  onFinalizarCompra: () => void
  onActualizarPrecio: (productoId: string, talle: string, precioEfectivo: number, precioTarjeta: number) => void
}

export function CarritoCompra({
  items,
  totalItems,
  hayPreciosSinDefinir,
  onCambiarCantidad,
  onQuitarItem,
  onVaciar,
  onFinalizarCompra,
  onActualizarPrecio,
}: CarritoCompraProps) {
  const totalEfectivo = items.reduce((acc, i) => acc + i.precioEfectivo * i.cantidad, 0)
  const totalTarjeta = items.reduce((acc, i) => acc + i.precioTarjeta * i.cantidad, 0)

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">
            Carrito
          </h3>
          {totalItems > 0 && (
            <span className="text-xs font-bold bg-amber-500 text-black rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
              {totalItems}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onVaciar}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Vaciar
          </button>
        )}
      </div>

      {/* Líneas del carrito */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 px-4 text-neutral-600">
            <ShoppingBag className="h-10 w-10" />
            <p className="text-sm text-center">
              El carrito está vacío.
              <br />
              Buscá un producto para agregar.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800/60">
            {items.map((item) => (
              <FilaCarrito
                key={`${item.productoId}-${item.talle}`}
                item={item}
                onCambiarCantidad={onCambiarCantidad}
                onQuitar={onQuitarItem}
                onActualizarPrecio={onActualizarPrecio}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Totales y acción */}
      {items.length > 0 && (
        <div className="border-t border-neutral-800 p-5 flex flex-col gap-4">
          {hayPreciosSinDefinir ? (
            <div className="flex items-start gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs">Completá los precios marcados antes de finalizar la compra.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Total efectivo</span>
                <span className="font-semibold text-emerald-400">{fmt(totalEfectivo)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Total tarjeta</span>
                <span className="font-semibold text-blue-400">{fmt(totalTarjeta)}</span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                El precio final se determina al elegir el método de pago.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onFinalizarCompra}
            disabled={hayPreciosSinDefinir}
            className={`w-full py-3 font-bold text-sm uppercase tracking-wider rounded-xl transition-colors ${
              hayPreciosSinDefinir
                ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-black'
            }`}
          >
            Finalizar Compra
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Fila individual del carrito ───────────────────────────────────────────────
interface FilaCarritoProps {
  item: ItemCarrito
  onCambiarCantidad: (productoId: string, talle: string, delta: number) => void
  onQuitar: (productoId: string, talle: string) => void
  onActualizarPrecio: (productoId: string, talle: string, precioEfectivo: number, precioTarjeta: number) => void
}

function FilaCarrito({ item, onCambiarCantidad, onQuitar, onActualizarPrecio }: FilaCarritoProps) {
  const enMaximo = item.cantidad >= item.stockDisponible
  const sinPrecio = item.precioEfectivo === 0 || item.precioTarjeta === 0

  const [inputEfectivo, setInputEfectivo] = useState(
    item.precioEfectivo > 0 ? String(item.precioEfectivo) : '',
  )
  const [inputTarjeta, setInputTarjeta] = useState(
    item.precioTarjeta > 0 ? String(item.precioTarjeta) : '',
  )

  const guardarPrecios = () => {
    const ef = Number(inputEfectivo.replace(/\./g, '').replace(',', '.'))
    const tj = Number(inputTarjeta.replace(/\./g, '').replace(',', '.'))
    if (ef > 0 && tj > 0) {
      onActualizarPrecio(item.productoId, item.talle, ef, tj)
    }
  }

  return (
    <li className="flex flex-col gap-2 px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-neutral-100 truncate">{item.nombre}</p>
            {sinPrecio && (
              <span className="shrink-0 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5">
                Sin precio
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            {item.marca} · T: {item.talle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onQuitar(item.productoId, item.talle)}
          className="text-neutral-600 hover:text-red-400 transition-colors p-0.5 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Control de cantidad */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCambiarCantidad(item.productoId, item.talle, -1)}
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-semibold text-neutral-100 w-6 text-center">
              {item.cantidad}
            </span>
            <button
              type="button"
              onClick={() => onCambiarCantidad(item.productoId, item.talle, 1)}
              disabled={enMaximo}
              className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors ${
                enMaximo
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {enMaximo && (
            <span className="text-xs text-amber-600">
              Máximo disponible ({item.stockDisponible})
            </span>
          )}
        </div>

        {/* Precios: editables si son 0, de solo lectura si ya tienen valor */}
        {sinPrecio ? (
          <div className="flex flex-col gap-1.5 items-end">
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-500 w-12 text-right">Efect.:</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={inputEfectivo}
                onChange={(e) => setInputEfectivo(e.target.value)}
                onBlur={guardarPrecios}
                className="w-24 bg-neutral-800 border border-amber-500/40 rounded px-2 py-1 text-xs text-neutral-100 text-right focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-500 w-12 text-right">Tarjeta:</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={inputTarjeta}
                onChange={(e) => setInputTarjeta(e.target.value)}
                onBlur={guardarPrecios}
                className="w-24 bg-neutral-800 border border-amber-500/40 rounded px-2 py-1 text-xs text-neutral-100 text-right focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-emerald-400">
              Ef: {fmt(item.precioEfectivo * item.cantidad)}
            </span>
            <span className="text-xs text-blue-400">
              Tj: {fmt(item.precioTarjeta * item.cantidad)}
            </span>
          </div>
        )}
      </div>
    </li>
  )
}
