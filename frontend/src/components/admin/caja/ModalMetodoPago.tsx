import { useState, useEffect } from 'react'
import { ArrowLeft, Banknote, CreditCard, ArrowRightLeft, Check, AlertCircle, Loader2, Receipt, Plus, X } from 'lucide-react'
import type { MetodoPago, PagoSplit, DatosCliente, DocReceptor } from '../../../types/caja.types'
import type { ArcaConfig } from '../../../types/facturacion.types'
import { LABELS_METODO_PAGO } from '../../../types/caja.types'

const fmt = (valor: number) =>
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
  { metodo: 'efectivo',      Icono: Banknote,        descripcion: 'Precio preferencial en efectivo', colorClase: 'emerald' },
  { metodo: 'transferencia', Icono: ArrowRightLeft,   descripcion: 'Mismo precio que efectivo',       colorClase: 'emerald' },
  { metodo: 'tarjeta',       Icono: CreditCard,       descripcion: 'Precio con recargo de tarjeta',   colorClase: 'blue'    },
]

// El método que recibe el input de monto en una combinación mixta.
// Tarjeta tiene prioridad; si no hay tarjeta, el método no-efectivo es el pivot.
function metodoPivote(metodos: MetodoPago[]): MetodoPago | null {
  if (metodos.length !== 2) return null
  if (metodos.includes('tarjeta')) return 'tarjeta'
  return metodos.find((m) => m !== 'efectivo') ?? null
}

// Construye el array PagoSplit a partir del estado local del modal.
function buildPagos(
  seleccionados: MetodoPago[],
  totalBase: number,
  pivot: MetodoPago | null,
  montoPivote: number,
): PagoSplit[] {
  if (seleccionados.length === 0) return []
  if (seleccionados.length === 1) return [{ metodo: seleccionados[0], monto: totalBase }]
  if (!pivot) return []
  const resto = seleccionados.find((m) => m !== pivot)!
  return [
    { metodo: pivot, monto: montoPivote },
    { metodo: resto,  monto: totalBase - montoPivote },
  ]
}

interface ModalMetodoPagoProps {
  procesando: boolean
  erroPago: string | null
  arcaConfig: ArcaConfig | null
  calcularTotal: (metodo: MetodoPago) => number
  onVolver: () => void
  onConfirmar: (pagos: PagoSplit[], cliente?: DatosCliente, docReceptor?: DocReceptor, facturarEnArca?: boolean) => Promise<void>
}

export function ModalMetodoPago({
  procesando,
  erroPago,
  arcaConfig,
  calcularTotal,
  onVolver,
  onConfirmar,
}: ModalMetodoPagoProps) {
  const [seleccionados, setSeleccionados] = useState<MetodoPago[]>([])
  const [montoPivoteStr, setMontoPivoteStr] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [docTipo, setDocTipo] = useState<96 | 80>(96)
  const [docNroStr, setDocNroStr] = useState('')

  const arcaActiva = arcaConfig?.habilitada === true
  const hayNoEfectivo = seleccionados.includes('tarjeta') || seleccionados.includes('transferencia')
  const [facturarEnArca, setFacturarEnArca] = useState(false)

  // Sincronizar checkbox con la selección de métodos
  useEffect(() => {
    setFacturarEnArca(hayNoEfectivo)
  }, [hayNoEfectivo])

  // ── Derivados ────────────────────────────────────────────────────────────────
  const esSplit = seleccionados.length === 2
  const hasTarjeta = seleccionados.includes('tarjeta')
  const totalBase = seleccionados.length > 0
    ? calcularTotal(hasTarjeta ? 'tarjeta' : 'efectivo')
    : 0

  const pivot = metodoPivote(seleccionados)
  const metodoresto = esSplit ? seleccionados.find((m) => m !== pivot) : null

  const montoPivote = parseFloat(montoPivoteStr) || 0
  const montoResto = esSplit ? totalBase - montoPivote : 0

  const pagos = buildPagos(seleccionados, totalBase, pivot, montoPivote)

  const montoFacturable = pagos.filter((p) => p.metodo !== 'efectivo').reduce((acc, p) => acc + p.monto, 0)
  const limiteActual = arcaConfig?.montoMaximoAnonimo ?? null
  const superaLimite = arcaActiva && facturarEnArca && limiteActual !== null && montoFacturable > limiteActual

  const docNroParsed = parseInt(docNroStr.replace(/\D/g, ''), 10)
  const docValido = !isNaN(docNroParsed) && docNroParsed > 0

  const splitValido = !esSplit || (montoPivote > 0 && montoPivote < totalBase)

  const puedeConfirmar =
    seleccionados.length > 0 &&
    !procesando &&
    splitValido &&
    (!superaLimite || docValido)

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function toggleMetodo(metodo: MetodoPago) {
    setSeleccionados((prev) => {
      if (prev.includes(metodo)) {
        // Deseleccionar — si quedaba solo uno, limpiar split
        const next = prev.filter((m) => m !== metodo)
        setMontoPivoteStr('')
        return next
      }
      if (prev.length >= 2) return prev
      const next = [...prev, metodo]
      setMontoPivoteStr('')
      return next
    })
  }

  const handleConfirmar = () => {
    if (pagos.length === 0) return
    const nombreTrim = nombre.trim()
    const telefonoTrim = telefono.trim()
    const cliente: DatosCliente | undefined = nombreTrim
      ? { nombre: nombreTrim, ...(telefonoTrim ? { telefono: telefonoTrim } : {}) }
      : undefined
    const docReceptor: DocReceptor | undefined =
      arcaActiva && facturarEnArca && docValido ? { tipo: docTipo, nro: docNroParsed } : undefined
    onConfirmar(pagos, cliente, docReceptor, arcaActiva ? facturarEnArca : false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md flex flex-col gap-5 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

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
            <h2 className="text-base font-semibold text-neutral-100">Método de pago</h2>
            <p className="text-xs text-neutral-500">
              {esSplit ? 'Pago dividido en 2 métodos' : 'Seleccioná hasta 2 métodos'}
            </p>
          </div>
        </div>

        {/* Opciones de pago */}
        <div className="flex flex-col gap-2">
          {OPCIONES_PAGO.map(({ metodo, Icono, descripcion, colorClase }) => {
            const seleccionado = seleccionados.includes(metodo)
            const deshabilitado = !seleccionado && seleccionados.length >= 2
            const total = calcularTotal(metodo === 'tarjeta' ? 'tarjeta' : 'efectivo')
            return (
              <button
                key={metodo}
                type="button"
                onClick={() => toggleMetodo(metodo)}
                disabled={procesando || deshabilitado}
                className={[
                  'flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                  seleccionado
                    ? 'border-amber-500 bg-amber-500/10'
                    : deshabilitado
                    ? 'border-neutral-800 bg-neutral-800/20 opacity-40 cursor-not-allowed'
                    : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700',
                ].join(' ')}
              >
                <div className={[
                  'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                  colorClase === 'emerald'
                    ? 'bg-emerald-900/30 text-emerald-400'
                    : 'bg-blue-900/30 text-blue-400',
                ].join(' ')}>
                  <Icono className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-100">{LABELS_METODO_PAGO[metodo]}</p>
                  <p className="text-xs text-neutral-500">{descripcion}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={[
                    'text-sm font-bold',
                    colorClase === 'emerald' ? 'text-emerald-400' : 'text-blue-400',
                  ].join(' ')}>
                    {fmt(total)}
                  </span>
                  {seleccionado
                    ? <Check className="h-4 w-4 text-amber-500" />
                    : <Plus className="h-4 w-4 text-neutral-600" />
                  }
                </div>
              </button>
            )
          })}
        </div>

        {/* Distribución de montos (solo en pago mixto) */}
        {esSplit && pivot && metodoresto && (
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-700/60 bg-neutral-800/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Distribución · Total {fmt(totalBase)}
              </p>
              <button
                type="button"
                onClick={() => { setSeleccionados([]); setMontoPivoteStr('') }}
                className="text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Input del pivot */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div>
                <p className="text-[11px] text-neutral-500 mb-1">{LABELS_METODO_PAGO[pivot]}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={montoPivoteStr}
                  onChange={(e) => setMontoPivoteStr(e.target.value.replace(/\D/g, ''))}
                  placeholder={`Ej: ${Math.round(totalBase / 2)}`}
                  disabled={procesando}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50"
                />
              </div>
              <div className="text-neutral-600 font-bold text-lg mt-4">+</div>
            </div>

            {/* Restante (calculado) */}
            <div>
              <p className="text-[11px] text-neutral-500 mb-1">{LABELS_METODO_PAGO[metodoresto]}</p>
              <div className={[
                'px-3 py-2 rounded-lg border text-sm font-medium',
                montoResto > 0
                  ? 'border-neutral-700 bg-neutral-800/50 text-neutral-200'
                  : 'border-red-800/60 bg-red-950/20 text-red-400',
              ].join(' ')}>
                {montoPivote > 0
                  ? montoResto > 0
                    ? fmt(montoResto)
                    : 'El monto excede el total'
                  : <span className="text-neutral-600">Calculado automáticamente</span>
                }
              </div>
            </div>
          </div>
        )}

        {/* Checkbox ARCA — visible cuando hay tarjeta o transferencia en la selección */}
        {arcaActiva && seleccionados.length > 0 && hayNoEfectivo && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              role="checkbox"
              aria-checked={facturarEnArca}
              onClick={() => setFacturarEnArca((v) => !v)}
              className={[
                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                facturarEnArca
                  ? 'bg-amber-500 border-amber-500'
                  : 'bg-transparent border-neutral-600 hover:border-neutral-400',
              ].join(' ')}
            >
              {facturarEnArca && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Receipt className="h-4 w-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-neutral-200">Facturar en ARCA</p>
                <p className="text-xs text-neutral-500">
                  {esSplit && !hasTarjeta
                    ? `Emite comprobante por ${pivot ? LABELS_METODO_PAGO[pivot] : ''}: ${montoPivote > 0 ? fmt(montoFacturable) : '—'}`
                    : 'Emite comprobante electrónico automáticamente'
                  }
                </p>
              </div>
            </div>
          </label>
        )}

        {/* Documento del receptor (opcional para Factura A, obligatorio si supera límite) */}
        {arcaActiva && facturarEnArca && seleccionados.length > 0 && hayNoEfectivo && (
          <div className={[
            'flex flex-col gap-3 p-4 rounded-xl border',
            superaLimite
              ? 'border-amber-700/60 bg-amber-950/30'
              : 'border-neutral-700/60 bg-neutral-800/30',
          ].join(' ')}>
            {superaLimite ? (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  Esta venta supera el límite para factura anónima ({fmt(limiteActual!)}).
                  <br />Ingresá el documento del cliente para emitir el comprobante legal.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                <span className="font-medium text-neutral-300">Documento del receptor</span>
                <span className="text-neutral-600"> — opcional · CUIT emite Factura A, DNI o vacío emite Factura B</span>
              </p>
            )}
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
