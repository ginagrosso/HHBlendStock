import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

async function getToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('No autenticado')
  return user.getIdToken()
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Error ${res.status}` })) as { error?: string }
    throw new Error(body.error ?? `Error ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
