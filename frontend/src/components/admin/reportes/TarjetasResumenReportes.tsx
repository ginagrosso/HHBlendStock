import { DollarSign, Package, TrendingUp } from 'lucide-react'
import type { ResumenReportes } from '../../../types/reportes.types'

interface Props {
  resumen: ResumenReportes | null
  cargando: boolean
}

function fmt(n: number): string {
  return n.toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 2,
  })
}

function Esqueleto() {
  return <div className="h-8 w-36 bg-neutral-800 rounded animate-pulse" />
}

interface TarjetaProps {
  titulo: string
  valor: React.ReactNode
  subtitulo: string
  Icono: React.FC<{ className?: string }>
  cargando: boolean
  resaltado?: boolean
}

function Tarjeta({ titulo, valor, subtitulo, Icono, cargando, resaltado }: TarjetaProps) {
  return (
    <div className={[
      'bg-neutral-900 rounded-xl p-6 border transition-colors',
      resaltado ? 'border-amber-500/30' : 'border-neutral-800',
    ].join(' ')}>
      <div className="flex items-center gap-2 mb-3">
        <Icono className="h-4 w-4 text-neutral-500" />
        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          {titulo}
        </span>
      </div>
      <div className="mb-1">
        {cargando ? <Esqueleto /> : (
          <p className="text-2xl font-bold text-amber-500">{valor}</p>
        )}
      </div>
      <p className="text-xs text-neutral-500">{subtitulo}</p>
    </div>
  )
}

export function TarjetasResumenReportes({ resumen, cargando }: Props) {
  const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Tarjeta
        titulo="Ventas Hoy"
        valor={fmt(resumen?.ventasHoy ?? 0)}
        subtitulo={plural(resumen?.cantidadVentasHoy ?? 0, 'venta', 'ventas')}
        Icono={DollarSign}
        cargando={cargando}
      />
      <Tarjeta
        titulo="Prendas Vendidas Hoy"
        valor={String(resumen?.prendasHoy ?? 0)}
        subtitulo={plural(resumen?.cantidadVentasHoy ?? 0, 'transacción', 'transacciones')}
        Icono={Package}
        cargando={cargando}
      />
      <Tarjeta
        titulo="Ventas del Mes"
        valor={fmt(resumen?.ventasMes ?? 0)}
        subtitulo={plural(resumen?.cantidadVentasMes ?? 0, 'venta', 'ventas')}
        Icono={TrendingUp}
        cargando={cargando}
        resaltado
      />
    </div>
  )
}
