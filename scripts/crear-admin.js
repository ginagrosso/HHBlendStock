#!/usr/bin/env node
/**
 * Crea un usuario administrador en Firebase Authentication.
 *
 * Uso:
 *   node scripts/crear-admin.js <email> <contraseña> [nombre]
 *
 * Flags:
 *   --prod   Apunta a Firebase producción (requiere GOOGLE_APPLICATION_CREDENTIALS)
 *            Sin el flag, usa el emulador local (puerto 9099).
 *
 * Ejemplos:
 *   node scripts/crear-admin.js admin@hhblend.com Passw0rd!
 *   node scripts/crear-admin.js admin@hhblend.com Passw0rd! "Gina Admin"
 *   node scripts/crear-admin.js admin@hhblend.com Passw0rd! --prod
 */

'use strict'

const path = require('path')

// ─── Argumentos ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'))

const [email, password, displayName] = args
const esProduccion = flags.includes('--prod')

if (!email || !password) {
  console.error('\n  ❌  Uso: node scripts/crear-admin.js <email> <contraseña> [nombre] [--prod]\n')
  process.exit(1)
}

if (password.length < 6) {
  console.error('\n  ❌  La contraseña debe tener al menos 6 caracteres.\n')
  process.exit(1)
}

// ─── Configuración emulador / producción ─────────────────────────────────────
const PROJECT_ID = 'hhblend-479f8'
const EMULATOR_HOST = '127.0.0.1:9099'

if (!esProduccion) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = EMULATOR_HOST
  console.log(`\n  ℹ️  Modo emulador → ${EMULATOR_HOST}`)
} else {
  console.log('\n  ⚡  Modo PRODUCCIÓN')
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      '  ❌  Falta GOOGLE_APPLICATION_CREDENTIALS.\n' +
      '      Descargá la clave de servicio desde Firebase Console → Configuración del proyecto → Cuentas de servicio.\n' +
      '      Luego: set GOOGLE_APPLICATION_CREDENTIALS=ruta\\a\\serviceAccountKey.json\n',
    )
    process.exit(1)
  }
}

// ─── Inicialización Firebase Admin ───────────────────────────────────────────
// Con npm workspaces los paquetes se hoistean a la raíz; como fallback
// también busca dentro de functions/node_modules.
const posiblesRutas = [
  path.resolve(__dirname, '..', 'node_modules', 'firebase-admin'),
  path.resolve(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'),
]

let admin
for (const ruta of posiblesRutas) {
  try {
    admin = require(ruta)
    break
  } catch {
    // sigue con la siguiente ruta
  }
}

if (!admin) {
  console.error(
    '\n  ❌  No se encontró firebase-admin.\n' +
    '      Rutas buscadas:\n' +
    posiblesRutas.map((r) => `      • ${r}`).join('\n') + '\n',
  )
  process.exit(1)
}

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
  })
}

const auth = admin.auth()

// ─── Creación del usuario ─────────────────────────────────────────────────────
async function crearAdmin() {
  console.log(`\n  Creando usuario: ${email}`)

  let usuario
  try {
    usuario = await auth.createUser({
      email,
      password,
      displayName: displayName ?? 'Administrador',
      emailVerified: true,
    })
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      console.log('  ⚠️  El email ya existe, actualizando claims de admin...')
      usuario = await auth.getUserByEmail(email)
    } else {
      throw err
    }
  }

  // Custom claims: el middleware del backend debe validar admin === true
  await auth.setCustomUserClaims(usuario.uid, { admin: true })

  console.log('\n  ✅  Usuario administrador listo:')
  console.log(`      UID:     ${usuario.uid}`)
  console.log(`      Email:   ${usuario.email}`)
  console.log(`      Nombre:  ${usuario.displayName}`)
  console.log(`      Claims:  { admin: true }\n`)
}

crearAdmin().catch((err) => {
  console.error(`\n  ❌  Error: ${err.message}\n`)
  process.exit(1)
})
