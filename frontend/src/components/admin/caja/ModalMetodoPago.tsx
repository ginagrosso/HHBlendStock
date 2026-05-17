import { useState } from 'react'
import { ArrowLeft, Banknote, CreditCard, ArrowRightLeft, Check, AlertCircle, Loader2 } from 'lucide-react'
import type { MetodoPago, DatosCliente } from '../../../types/caja.types'
import { LABELS_METODO_PAGO } from '../../../types/caja.types'

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)

const OPCIONES_PAGO: Array<{
  metodo: MetodoPago
  Icono: React.FC<React.SVGProps<SVGSVGElement>>
  descripcion: string
  colorClase: string
}> = [
  {
    metodo: 'efectivo',
    Icono: Banknote,
    descripcion: 'Precio preferencial en efectivo',
    colorClase: 'emerald',
  },
  {
    metodo: 'transferencia',
    Icono: ArrowRightLeft,
    descripcion: 'Mismo precio que efectivo',
    colorClase: 'emerald',
  },
  {
    metodo: 'tarjeta',
    Icono: CreditCard,
    descripcion: 'Precio con recargo de tarjeta',
    colorClase: 'blue',
  },
]

interface ModalMetodoPagoProps {
  metodoPago: MetodoPago | null
  procesando: boolean
  erroPago: string | null
  calcularTotal: (metodo: MetodoPago) => number
  onSeleccionarMetodo: (metodo: MetodoPago) => void
  onVolver: () => void
  onConfirmar: (cliente?: DatosCliente) => Promise<void>
}

export function ModalMetodoPago({
  metodoPago,
  procesando,
  erroPago,
  calcularTotal,
  onSeleccionarMetodo,
  onVolver,
  onConfirmar,
}: ModalMetodoPagoProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')

  const handleConfirmar = () => {
    const cliente: DatosCliente | undefined =
      nombre.trim() || telefono.trim()
        ? { nombre: nombre.trim(), telefono: telefono.trim() }
        : undefined
    onConfirmar(cliente)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md flex flex-col gap-6 p-6 shadow-2xl">
        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVolver}
            disabled={procesando}
            className="text-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-40"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-neutral-100">
              Método de pago
            </h2>
            <p className="text-xs text-neutral-500">
              El precio final depende del método elegido
            </p>
          </div>
        </div>

        {/* Opciones de pago */}
        <div className="flex flex-col gap-3">
          {OPCIONES_PAGO.map(({ metodo, Icono, descripcion, colorClase }) => {
            const total = calcularTotal(metodo)
            const seleccionado = metodoPago === metodo
            return (
              <button
                key={metodo}
                type="button"
                onClick={() => onSeleccionarMetodo(metodo)}
                disabled={procesando}
                className={[
                  'flex items-center gap-4 p-4 rounded-xl border text-left transition-all disabled:opacity-60',
                  seleccionado
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700',
                ].join(' ')}
              >
                <div
                  className={[
                    'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                    colorClase === 'emerald'
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-blue-900/30 text-blue-400',
                  ].join(' ')}
                >
                  <Icono className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-100">
                    {LABELS_METODO_PAGO[metodo]}
                  </p>
                  <p className="text-xs text-neutral-500">{descripcion}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={[
                      'text-sm font-bold',
                      colorClase === 'emerald' ? 'text-emerald-400' : 'text-blue-400',
                    ].join(' ')}
                  >
                    {formatearMoneda(total)}
                  </span>
                  {seleccionado && (
                    <Check className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Datos del cliente (opcional) */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Datos del cliente <span className="text-neutral-600 font-normal normal-case">(opcional — para el ticket)</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              disabled={procesando}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50"
            />
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono (WhatsApp)"
              disabled={procesando}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Error */}
        {erroPago && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erroPago}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onVolver}
            disabled={procesando}
            className="flex-1 py-3 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!metodoPago || procesando}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {procesando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar Venta'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
