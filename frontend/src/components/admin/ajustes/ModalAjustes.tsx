import { X, Mail, Clock, KeyRound } from 'lucide-react'
import type { User } from 'firebase/auth'

interface Props {
  usuario: User
  onCerrar: () => void
  onCambiarContrasena: () => void
}

function fmtFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ModalAjustes({ usuario, onCerrar, onCambiarContrasena }: Props) {
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
          <h2 className="text-base font-semibold text-neutral-100">Ajustes</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info de sesión */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">
                Correo
              </p>
              <p className="text-sm text-neutral-200">{usuario.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">
                Último acceso
              </p>
              <p className="text-sm text-neutral-200">
                {fmtFecha(usuario.metadata.lastSignInTime ?? null)}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onCambiarContrasena}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 rounded-lg text-sm transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  )
}
