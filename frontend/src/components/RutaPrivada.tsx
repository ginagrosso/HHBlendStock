import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

interface RutaPrivadaProps {
  children: ReactNode
}

export function RutaPrivada({ children }: RutaPrivadaProps) {
  const { usuario, cargandoAuth } = useAuthStore()

  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
