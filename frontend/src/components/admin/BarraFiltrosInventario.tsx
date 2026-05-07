import { Search } from 'lucide-react'

interface Props {
  busquedaQuery: string
  categoriaSeleccionada: string
  talleSeleccionado: string
  soloBajoStock: boolean
  categoriasDisponibles: string[]
  tallesDisponibles: string[]
  onCambiarBusqueda: (q: string) => void
  onCambiarCategoria: (cat: string) => void
  onCambiarTalle: (talle: string) => void
  onToggleBajoStock: () => void
}

export function BarraFiltrosInventario({
  busquedaQuery,
  categoriaSeleccionada,
  talleSeleccionado,
  soloBajoStock,
  categoriasDisponibles,
  tallesDisponibles,
  onCambiarBusqueda,
  onCambiarCategoria,
  onCambiarTalle,
  onToggleBajoStock,
}: Props) {
  return (
    <div className="bg-black/60 border border-amber-500/10 rounded p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
        <input
          className="w-full bg-transparent border border-neutral-800 focus:border-amber-500 rounded pl-10 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
          placeholder="Buscar por nombre, artículo o marca..."
          value={busquedaQuery}
          onChange={(e) => onCambiarBusqueda(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
          value={categoriaSeleccionada}
          onChange={(e) => onCambiarCategoria(e.target.value)}
        >
          {categoriasDisponibles.map((cat) => (
            <option key={cat} value={cat} className="bg-neutral-950 text-neutral-100">
              {cat}
            </option>
          ))}
        </select>
        <select
          className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
          value={talleSeleccionado}
          onChange={(e) => onCambiarTalle(e.target.value)}
        >
          {tallesDisponibles.map((talle) => (
            <option key={talle} value={talle} className="bg-neutral-950 text-neutral-100">
              {talle === 'Todos' ? 'Todos los talles' : talle}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onToggleBajoStock}
          className={[
            'px-4 py-2 rounded text-sm border transition-colors',
            soloBajoStock
              ? 'border-amber-500 text-amber-500 bg-amber-500/10'
              : 'border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600',
          ].join(' ')}
        >
          Solo sin Stock
        </button>
      </div>
    </div>
  )
}
