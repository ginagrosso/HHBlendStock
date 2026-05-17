import { Search, X, PackageSearch, PlusCircle } from 'lucide-react'
import type { ProductoCaja } from '../../../types/caja.types'

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)

interface BuscadorProductosCajaProps {
  query: string
  resultados: ProductoCaja[]
  buscando: boolean
  onCambiarQuery: (q: string) => void
  onLimpiar: () => void
  onAgregarProducto: (producto: ProductoCaja) => void
}

export function BuscadorProductosCaja({
  query,
  resultados,
  buscando,
  onCambiarQuery,
  onLimpiar,
  onAgregarProducto,
}: BuscadorProductosCajaProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onCambiarQuery(e.target.value)}
          placeholder="Buscar por nombre, artículo, marca, talle..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-12 pr-10 py-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={onLimpiar}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {buscando && (
          <div className="flex items-center gap-3 py-8 justify-center text-neutral-400">
            <div className="h-5 w-5 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin" />
            <span className="text-sm">Buscando...</span>
          </div>
        )}

        {!buscando && query && resultados.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-neutral-500">
            <PackageSearch className="h-10 w-10" />
            <p className="text-sm">Sin resultados para "{query}"</p>
          </div>
        )}

        {!buscando && !query && (
          <div className="flex flex-col items-center gap-3 py-12 text-neutral-600">
            <Search className="h-10 w-10" />
            <p className="text-sm text-center">
              Ingresá un nombre, artículo, marca o talle para buscar productos
            </p>
          </div>
        )}

        {!buscando && resultados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {resultados.map((producto) => (
              <TarjetaProducto
                key={producto.id}
                producto={producto}
                onAgregar={onAgregarProducto}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tarjeta de resultado ──────────────────────────────────────────────────────
interface TarjetaProductoProps {
  producto: ProductoCaja
  onAgregar: (p: ProductoCaja) => void
}

function TarjetaProducto({ producto, onAgregar }: TarjetaProductoProps) {
  const sinStock = producto.stock === 0

  return (
    <div
      className={[
        'group flex flex-col gap-3 p-4 rounded-xl border transition-all',
        sinStock
          ? 'border-neutral-800 bg-neutral-900/40 opacity-60 cursor-not-allowed'
          : 'border-neutral-800 bg-neutral-900 hover:border-amber-500/50 hover:bg-neutral-900/80 cursor-pointer',
      ].join(' ')}
      onClick={() => !sinStock && onAgregar(producto)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-100 truncate">{producto.nombre}</p>
          <p className="text-xs text-neutral-400 truncate">{producto.marca}</p>
        </div>
        <span className="text-xs font-mono text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded shrink-0">
          {producto.articulo}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            T: {producto.talle}
          </span>
          <span
            className={[
              'text-xs px-2 py-0.5 rounded border',
              sinStock
                ? 'bg-red-900/20 text-red-400 border-red-800/40'
                : 'bg-emerald-900/20 text-emerald-400 border-emerald-800/40',
            ].join(' ')}
          >
            {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-emerald-400 font-medium">
            Efectivo: {formatearMoneda(producto.precioEfectivo)}
          </span>
          <span className="text-xs text-blue-400">
            Tarjeta: {formatearMoneda(producto.precioTarjeta)}
          </span>
        </div>
        {!sinStock && (
          <PlusCircle className="h-5 w-5 text-neutral-500 group-hover:text-amber-500 transition-colors shrink-0" />
        )}
      </div>
    </div>
  )
}
