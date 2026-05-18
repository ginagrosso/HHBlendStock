import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import type { Ficha, Variante } from '../../stores/useTiendaStore'

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor)

interface Props {
  fichas: Ficha[]
  totalResultados: number
  paginaActual: number
  totalPaginas: number
  cargando: boolean
  onEditar: (id: string) => void
  onEliminar: (id: string, nombre: string) => void
  onCambiarPagina: (pagina: number) => void
  onActualizarStock: (id: string, variantes: Variante[]) => Promise<void>
}

export function TablaInventario({
  fichas,
  totalResultados,
  paginaActual,
  totalPaginas,
  cargando,
  onEditar,
  onEliminar,
  onCambiarPagina,
  onActualizarStock,
}: Props) {
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [draftVariantes, setDraftVariantes] = useState<Variante[]>([])
  const [guardando, setGuardando] = useState(false)

  const iniciarEdicionStock = (ficha: Ficha) => {
    setEditandoId(ficha.id)
    setDraftVariantes(ficha.variantes.map((v) => ({ ...v })))
  }

  const actualizarDraftStock = (talle: string, valor: number) =>
    setDraftVariantes((prev) => prev.map((v) => (v.talle === talle ? { ...v, stock: valor } : v)))

  const cancelarEdicion = () => {
    setEditandoId(null)
    setDraftVariantes([])
  }

  const guardarStock = async () => {
    if (!editandoId) return
    setGuardando(true)
    try {
      await onActualizarStock(editandoId, draftVariantes)
      setEditandoId(null)
      setDraftVariantes([])
    } catch {
      // error notification shown by parent; stay in edit mode so user can retry
    } finally {
      setGuardando(false)
    }
  }

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
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Talles</th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {fichas.map((ficha) => {
                const totalStock = ficha.variantes.reduce((s, v) => s + v.stock, 0)
                const sinStock = totalStock === 0
                const estaEditando = editandoId === ficha.id

                return (
                  <tr
                    key={ficha.id}
                    className="border-b border-neutral-900 hover:bg-neutral-900/40 transition-colors"
                  >
                    {/* Producto */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {ficha.imagenUrl ? (
                          <img
                            src={ficha.imagenUrl}
                            alt={ficha.nombre}
                            className="w-10 h-10 rounded object-cover border border-amber-500/20 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-500/20 shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-neutral-100 font-medium truncate">{ficha.nombre}</span>
                          <span className="text-xs text-neutral-500">{ficha.articulo}</span>
                        </div>
                      </div>
                    </td>

                    {/* Marca */}
                    <td className="py-4 px-6 text-neutral-300 whitespace-nowrap">{ficha.marca}</td>

                    {/* Talles */}
                    <td className="py-4 px-6">
                      {estaEditando ? (
                        <div className="flex flex-wrap gap-2">
                          {draftVariantes.map((v) => (
                            <div key={v.talle} className="flex items-center gap-1">
                              <span className="text-xs font-semibold text-amber-500 w-6 text-center">{v.talle}</span>
                              <input
                                type="number"
                                min={0}
                                value={v.stock === 0 ? '' : v.stock}
                                onChange={(e) => actualizarDraftStock(v.talle, Number(e.target.value) || 0)}
                                placeholder="0"
                                disabled={guardando}
                                className="w-14 bg-neutral-900 border border-amber-500/40 focus:border-amber-500 rounded px-2 py-0.5 text-sm text-neutral-100 outline-none disabled:opacity-50"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {ficha.variantes.map((v) => {
                            const agotado = v.stock === 0
                            return (
                              <span
                                key={v.talle}
                                title={`Ef: ${formatearMoneda(v.precioEfectivo)} · Tj: ${formatearMoneda(v.precioTarjeta)}`}
                                className={[
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
                                  agotado
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                                ].join(' ')}
                              >
                                {v.talle}
                                <span className={agotado ? 'text-red-500/60' : 'text-amber-500/60'}>
                                  · {v.stock}
                                </span>
                              </span>
                            )
                          })}
                          {sinStock && (
                            <span className="text-xs text-red-400/70 italic">Sin stock</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {estaEditando ? (
                          <>
                            <button
                              type="button"
                              onClick={guardarStock}
                              disabled={guardando}
                              className="inline-flex items-center justify-center px-3 py-1 text-xs rounded bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[52px]"
                            >
                              {guardando ? <Loader className="h-3 w-3 animate-spin" /> : 'Guardar'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelarEdicion}
                              disabled={guardando}
                              className="px-3 py-1 text-xs border border-neutral-700 rounded text-neutral-400 hover:text-neutral-200 disabled:opacity-50 transition-colors"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="px-3 py-1 text-xs border border-neutral-800 rounded text-neutral-400 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
                              onClick={() => iniciarEdicionStock(ficha)}
                            >
                              Stock
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 text-xs border border-neutral-800 rounded text-neutral-400 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
                              onClick={() => onEditar(ficha.id)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 text-xs border border-neutral-800 rounded text-neutral-400 hover:text-red-500 hover:border-red-500/50 transition-colors"
                              onClick={() => onEliminar(ficha.id, ficha.nombre)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {totalResultados === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-neutral-500">
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
