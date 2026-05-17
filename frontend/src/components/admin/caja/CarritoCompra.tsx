import { ShoppingCart, Trash2, Minus, Plus, X, ShoppingBag } from 'lucide-react'
import type { ItemCarrito } from '../../../types/caja.types'

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)

interface CarritoCompraProps {
  items: ItemCarrito[]
  totalItems: number
  onCambiarCantidad: (productoId: string, talle: string, delta: number) => void
  onQuitarItem: (productoId: string, talle: string) => void
  onVaciar: () => void
  onFinalizarCompra: () => void
}

export function CarritoCompra({
  items,
  totalItems,
  onCambiarCantidad,
  onQuitarItem,
  onVaciar,
  onFinalizarCompra,
}: CarritoCompraProps) {
  const totalEfectivo = items.reduce(
    (acc, i) => acc + i.precioEfectivo * i.cantidad,
    0,
  )
  const totalTarjeta = items.reduce(
    (acc, i) => acc + i.precioTarjeta * i.cantidad,
    0,
  )

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
              />
            ))}
          </ul>
        )}
      </div>

      {/* Totales y acción */}
      {items.length > 0 && (
        <div className="border-t border-neutral-800 p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Total efectivo</span>
              <span className="font-semibold text-emerald-400">
                {formatearMoneda(totalEfectivo)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Total tarjeta</span>
              <span className="font-semibold text-blue-400">
                {formatearMoneda(totalTarjeta)}
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1">
              El precio final se determina al elegir el método de pago.
            </p>
          </div>

          <button
            type="button"
            onClick={onFinalizarCompra}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-colors"
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
}

function FilaCarrito({ item, onCambiarCantidad, onQuitar }: FilaCarritoProps) {
  return (
    <li className="flex flex-col gap-2 px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-100 truncate">
            {item.nombre}
          </p>
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
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Precios */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-emerald-400">
            Ef:{' '}
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0,
            }).format(item.precioEfectivo * item.cantidad)}
          </span>
          <span className="text-xs text-blue-400">
            Tj:{' '}
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0,
            }).format(item.precioTarjeta * item.cantidad)}
          </span>
        </div>
      </div>
    </li>
  )
}
