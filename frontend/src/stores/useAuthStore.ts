import { create } from 'zustand'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthStore {
  usuario: User | null
  cargandoAuth: boolean
  cerrarSesion: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => {
  onAuthStateChanged(auth, (user) => {
    set({ usuario: user, cargandoAuth: false })
  })

  return {
    usuario: null,
    cargandoAuth: true,
    cerrarSesion: () => signOut(auth),
  }
})
