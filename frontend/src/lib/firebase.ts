import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const functions = getFunctions(app)
export const storage = getStorage(app)

const useEmulators =
  import.meta.env.VITE_USE_EMULATORS === 'true' || import.meta.env.DEV

if (useEmulators) {
  const host = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1'
  const toPort = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const authPort = toPort(import.meta.env.VITE_AUTH_EMULATOR_PORT, 9099)
  const firestorePort = toPort(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT, 8080)
  const functionsPort = toPort(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT, 5001)
  const storagePort = toPort(import.meta.env.VITE_STORAGE_EMULATOR_PORT, 9199)

  const flagKey = '__FIREBASE_EMULATORS__'
  const alreadyConnected =
    (globalThis as Record<string, unknown>)[flagKey] === true

  if (!alreadyConnected) {
    connectAuthEmulator(auth, `http://${host}:${authPort}`, {
      disableWarnings: true,
    })
    connectFirestoreEmulator(firestore, host, firestorePort)
    connectFunctionsEmulator(functions, host, functionsPort)
    connectStorageEmulator(storage, host, storagePort)
    ;(globalThis as Record<string, unknown>)[flagKey] = true
  }
}

export { app }
