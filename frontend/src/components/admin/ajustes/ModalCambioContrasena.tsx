import { useState } from 'react'
import { X, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { auth } from '../../../lib/firebase'

interface Props {
  onCerrar: () => void
  onVolver: () => void
}

function mensajeError(codigo: string): string {
  if (codigo.includes('wrong-password') || codigo.includes('invalid-credential')) {
    return 'La contraseña actual es incorrecta.'
  }
  if (codigo.includes('weak-password')) {
    return 'La nueva contraseña debe tener al menos 6 caracteres.'
  }
  if (codigo.includes('too-many-requests')) {
    return 'Demasiados intentos fallidos. Intentá más tarde.'
  }
  return 'Ocurrió un error. Intentá de nuevo.'
}

export function ModalCambioContrasena({ onCerrar, onVolver }: Props) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verActual, setVerActual] = useState(false)
  const [verNueva, setVerNueva] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const validar = (): string | null => {
    if (!actual || !nueva || !confirmar) return 'Completá todos los campos.'
    if (nueva.length < 6) return 'La nueva contraseña debe tener al menos 6 caracteres.'
    if (nueva !== confirmar) return 'Las contraseñas nuevas no coinciden.'
    if (nueva === actual) return 'La nueva contraseña debe ser distinta a la actual.'
    return null
  }

  const handleGuardar = async () => {
    const mensajeValidacion = validar()
    if (mensajeValidacion) { setError(mensajeValidacion); return }

    const user = auth.currentUser
    if (!user?.email) return

    setGuardando(true)
    setError(null)

    try {
      const credencial = EmailAuthProvider.credential(user.email, actual)
      await reauthenticateWithCredential(user, credencial)
      await updatePassword(user, nueva)
      setExito(true)
    } catch (e: unknown) {
      const codigo = (e as { code?: string }).code ?? ''
      setError(mensajeError(codigo))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onVolver}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-base font-semibold text-neutral-100">
              Cambiar contraseña
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {exito ? (
          /* Estado de éxito */
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-semibold text-neutral-100">
              Contraseña actualizada
            </p>
            <p className="text-xs text-neutral-500">
              Podés cerrar esta ventana.
            </p>
            <button
              type="button"
              onClick={onCerrar}
              className="mt-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* Formulario */
          <div className="px-6 py-5 space-y-4">
            <Campo
              label="Contraseña actual"
              value={actual}
              onChange={setActual}
              ver={verActual}
              onToggleVer={() => setVerActual((v) => !v)}
              disabled={guardando}
            />
            <Campo
              label="Nueva contraseña"
              value={nueva}
              onChange={setNueva}
              ver={verNueva}
              onToggleVer={() => setVerNueva((v) => !v)}
              disabled={guardando}
            />
            <Campo
              label="Confirmar nueva contraseña"
              value={confirmar}
              onChange={setConfirmar}
              ver={verConfirmar}
              onToggleVer={() => setVerConfirmar((v) => !v)}
              disabled={guardando}
            />

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-lg transition-colors"
            >
              {guardando ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Campo de contraseña reutilizable ─────────────────────────────────────────
interface CampoProps {
  label: string
  value: string
  onChange: (v: string) => void
  ver: boolean
  onToggleVer: () => void
  disabled: boolean
}

function Campo({ label, value, onChange, ver, onToggleVer, disabled }: CampoProps) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={ver ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50 transition-colors"
        />
        <button
          type="button"
          onClick={onToggleVer}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
