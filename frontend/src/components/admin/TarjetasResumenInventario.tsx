interface Props {
  totalProductos: number
  totalBajoStock: number
  valorInventario: string
}

export function TarjetasResumenInventario({ totalProductos, totalBajoStock, valorInventario }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
        <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">Total de Productos</span>
        <span className="text-3xl font-semibold text-amber-500">{totalProductos}</span>
      </div>
      <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
        <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">Sin Stock</span>
        <span className="text-3xl font-semibold text-amber-500">{totalBajoStock}</span>
      </div>
      <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
        <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">Valor Total del Inventario</span>
        <span className="text-2xl font-semibold text-neutral-100">{valorInventario}</span>
      </div>
    </div>
  )
}
