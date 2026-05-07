import type { FormEvent } from 'react'
import { useState } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../lib/firebase'

type Vista = 'login' | 'reset'

export function PaginaLogin() {
  const [vista, setVista] = useState<Vista>('login')
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const manejarLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await signInWithEmailAndPassword(auth, email, contrasena)
      navigate('/admin/inventario', { replace: true })
    } catch {
      setError('Credenciales inválidas. Verificá el email y la contraseña.')
    } finally {
      setCargando(false)
    }
  }

  const manejarEnviarLink = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMensajeExito(null)
    setCargando(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setMensajeExito(
        'Link enviado. Revisá tu email para establecer tu contraseña. ' +
        'Si usás el emulador, el link aparece en la UI de Auth (localhost:4000).'
      )
    } catch {
      setError('No se pudo enviar el link. Verificá que el email sea correcto.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-500 tracking-wide">
            H&H Blend
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Panel de Administración</p>
        </div>

        {vista === 'login' ? (
          <form
            onSubmit={manejarLogin}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-sm text-neutral-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={cargando}
                placeholder="admin@ejemplo.com"
                className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm text-neutral-300 mb-1">
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                disabled={cargando}
                placeholder="••••••••"
                className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>

            <button
              type="button"
              onClick={() => { setVista('reset'); setError(null) }}
              className="w-full text-neutral-500 hover:text-neutral-300 text-xs transition-colors pt-1"
            >
              Establecer / cambiar contraseña
            </button>
          </form>
        ) : (
          <form
            onSubmit={manejarEnviarLink}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4"
          >
            <p className="text-neutral-400 text-sm">
              Ingresá tu email y te enviamos un link para establecer tu contraseña.
            </p>

            <div>
              <label htmlFor="email-reset" className="block text-sm text-neutral-300 mb-1">
                Email
              </label>
              <input
                id="email-reset"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={cargando}
                placeholder="admin@ejemplo.com"
                className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {mensajeExito && <p className="text-green-400 text-sm">{mensajeExito}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Enviando...' : 'Enviar link'}
            </button>

            <button
              type="button"
              onClick={() => { setVista('login'); setError(null); setMensajeExito(null) }}
              className="w-full text-neutral-500 hover:text-neutral-300 text-xs transition-colors pt-1"
            >
              ← Volver al login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
