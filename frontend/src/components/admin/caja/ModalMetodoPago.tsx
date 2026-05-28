import { useState } from 'react'
import { ArrowLeft, Banknote, CreditCard, ArrowRightLeft, Check, AlertCircle, Loader2 } from 'lucide-react'
import type { MetodoPago, DatosCliente, DocReceptor } from '../../../types/caja.types'
import type { ArcaConfig } from '../../../types/facturacion.types'
import { LABELS_METODO_PAGO } from '../../../types/caja.types'

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)

const LABELS_DOC: Record<number, string> = { 96: 'DNI', 80: 'CUIT' }

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
  arcaConfig: ArcaConfig | null
  calcularTotal: (metodo: MetodoPago) => number
  onSeleccionarMetodo: (metodo: MetodoPago) => void
  onVolver: () => void
  onConfirmar: (cliente?: DatosCliente, docReceptor?: DocReceptor) => Promise<void>
}

export function ModalMetodoPago({
  metodoPago,
  procesando,
  erroPago,
  arcaConfig,
  calcularTotal,
  onSeleccionarMetodo,
  onVolver,
  onConfirmar,
}: ModalMetodoPagoProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [docTipo, setDocTipo] = useState<96 | 80>(96)
  const [docNroStr, setDocNroStr] = useState('')

  const totalActual = metodoPago ? calcularTotal(metodoPago) : null
  const limiteActual = arcaConfig?.montoMaximoAnonimo ?? null
  const superaLimite = limiteActual !== null && totalActual !== null && totalActual > limiteActual
  const docNroParsed = parseInt(docNroStr.replace(/\D/g, ''), 10)
  const docValido = !isNaN(docNroParsed) && docNroParsed > 0
  const puedeConfirmar = metodoPago !== null && !procesando && (!superaLimite || docValido)

  const handleConfirmar = () => {
    const cliente: DatosCliente | undefined =
      nombre.trim() || telefono.trim()
        ? { nombre: nombre.trim(), telefono: telefono.trim() }
        : undefined
    const docReceptor: DocReceptor | undefined =
      superaLimite && docValido ? { tipo: docTipo, nro: docNroParsed } : undefined
    onConfirmar(cliente, docReceptor)
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

        {/* Documento del receptor — requerido cuando supera el límite anónimo de ARCA */}
        {superaLimite && (
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-700/60 bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">
                Esta venta supera el límite para factura anónima ({formatearMoneda(limiteActual!)}).
                <br />Ingresá el documento del cliente para emitir el comprobante legal.
              </p>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <select
                value={docTipo}
                onChange={(e) => setDocTipo(Number(e.target.value) as 96 | 80)}
                disabled={procesando}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50"
              >
                <option value={96}>{LABELS_DOC[96]}</option>
                <option value={80}>{LABELS_DOC[80]}</option>
              </select>
              <input
                type="text"
                inputMode="numeric"
                value={docNroStr}
                onChange={(e) => setDocNroStr(e.target.value.replace(/\D/g, ''))}
                placeholder={docTipo === 96 ? 'Ej: 32456789' : 'Ej: 20324567890'}
                disabled={procesando}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
        )}

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
            disabled={!puedeConfirmar}
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
