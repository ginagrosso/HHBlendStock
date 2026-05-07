import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Producto } from '../../stores/useTiendaStore'

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor)

interface Props {
  productos: Producto[]
  totalResultados: number
  paginaActual: number
  totalPaginas: number
  cargando: boolean
  onEditar: (id: string) => void
  onEliminar: (id: string, nombre: string) => void
  onCambiarPagina: (pagina: number) => void
}

export function TablaInventario({
  productos,
  totalResultados,
  paginaActual,
  totalPaginas,
  cargando,
  onEditar,
  onEliminar,
  onCambiarPagina,
}: Props) {
  return (
    <div className="bg-neutral-950 border border-amber-500/10 rounded overflow-hidden">
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/80">
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Producto</th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Marca</th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Talle</th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">P. Efectivo</th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">P. Tarjeta</th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Stock</th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {productos.map((producto) => {
                const sinStock = producto.stock === 0
                return (
                  <tr
                    key={producto.id}
                    className="border-b border-neutral-900 hover:bg-neutral-900/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {producto.imagenUrl ? (
                          <img
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            className="w-10 h-10 rounded object-cover border border-amber-500/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-500/20" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-neutral-100 font-medium">{producto.nombre}</span>
                          <span className="text-xs text-neutral-500">{producto.articulo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-neutral-300">{producto.marca}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
                        {producto.talle}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-green-400 font-semibold">
                      {formatearMoneda(producto.precioEfectivo)}
                    </td>
                    <td className="py-4 px-6 text-blue-400 font-semibold">
                      {formatearMoneda(producto.precioTarjeta)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          sinStock
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {producto.stock} un.
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-xs border border-neutral-800 rounded text-neutral-400 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
                          onClick={() => onEditar(producto.id)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-xs border border-neutral-800 rounded text-neutral-400 hover:text-red-500 hover:border-red-500/50 transition-colors"
                          onClick={() => onEliminar(producto.id, producto.nombre)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {totalResultados === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-500">
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && totalResultados > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-900">
          <span className="text-xs text-neutral-500">
            {totalResultados} resultados · página {paginaActual} de {totalPaginas}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className="p-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
