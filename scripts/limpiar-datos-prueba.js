#!/usr/bin/env node
/**
 * Limpia datos de prueba de Firestore en PRODUCCIÓN.
 *
 * Uso:
 *   node scripts/limpiar-datos-prueba.js --prod
 *
 * Requiere:
 *   set GOOGLE_APPLICATION_CREDENTIALS=ruta\a\serviceAccountKey.json
 *
 * Qué hace:
 *   - Borra TODAS las ventas
 *   - Borra TODOS los productos (se recarga con Excel limpio)
 *   - Borra facturas EXCEPTO las indicadas en CAES_A_CONSERVAR
 *   - Resetea el contador de ventas a 0
 *   - Resetea el agregado de analytics
 */

'use strict'

const path = require('path')

// ─── ⚠️  COMPLETAR ANTES DE CORRER ──────────────────────────────────────────
// Pegá acá los CAE de las 3 facturas reales que hay que conservar.
// Los ves en la vista de Facturación del sistema (columna "CAE").
const CAES_A_CONSERVAR = [
  '86238322235961', // NC B  0004-00000001
  '86228275679500', // Factura B 0004-00000002
  '86228006841550', // Factura B 0004-00000001
]
// ─────────────────────────────────────────────────────────────────────────────

const esProduccion = process.argv.includes('--prod')
const PROJECT_ID = 'hhblend-479f8'

if (!esProduccion) {
  console.error('\n  ❌  Este script solo corre con --prod para evitar accidentes.\n')
  process.exit(1)
}

if (CAES_A_CONSERVAR.length === 0) {
  console.error('\n  ❌  CAES_A_CONSERVAR está vacío. Completalo antes de correr el script.\n')
  process.exit(1)
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    '\n  ❌  Falta GOOGLE_APPLICATION_CREDENTIALS.\n' +
    '      Descargá la clave de servicio desde Firebase Console → Configuración del proyecto → Cuentas de servicio.\n' +
    '      Luego: set GOOGLE_APPLICATION_CREDENTIALS=ruta\\a\\serviceAccountKey.json\n',
  )
  process.exit(1)
}

// ─── Firebase Admin ───────────────────────────────────────────────────────────
const posiblesRutas = [
  path.resolve(__dirname, '..', 'node_modules', 'firebase-admin'),
  path.resolve(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'),
]

let admin
for (const ruta of posiblesRutas) {
  try { admin = require(ruta); break } catch { /* sigue */ }
}

if (!admin) {
  console.error('\n  ❌  No se encontró firebase-admin.\n')
  process.exit(1)
}

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: PROJECT_ID })
const db = admin.firestore()

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function borrarColeccion(nombre) {
  const snap = await db.collection(nombre).get()
  if (snap.empty) { console.log(`  ✓  ${nombre}: ya vacía`); return }

  const batch = db.batch()
  snap.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()
  console.log(`  ✓  ${nombre}: ${snap.size} documentos eliminados`)
}

async function borrarFacturasDePrueba() {
  const snap = await db.collection('facturas').get()
  if (snap.empty) { console.log('  ✓  facturas: ya vacía'); return }

  const aConservar = snap.docs.filter((doc) => CAES_A_CONSERVAR.includes(doc.data().cae))
  const aBorrar = snap.docs.filter((doc) => !CAES_A_CONSERVAR.includes(doc.data().cae))

  if (aConservar.length !== CAES_A_CONSERVAR.length) {
    const encontrados = aConservar.map((d) => d.data().cae)
    const noEncontrados = CAES_A_CONSERVAR.filter((c) => !encontrados.includes(c))
    console.warn(`  ⚠️  Estos CAE no se encontraron en Firestore: ${noEncontrados.join(', ')}`)
  }

  if (aBorrar.length === 0) { console.log('  ✓  facturas: nada para borrar'); return }

  const batch = db.batch()
  aBorrar.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()
  console.log(`  ✓  facturas: ${aBorrar.length} eliminadas, ${aConservar.length} conservadas`)
}

async function resetearContadores() {
  const ref = db.collection('contadores').doc('ventas')
  const snap = await ref.get()
  if (!snap.exists) { console.log('  ✓  contadores/ventas: no existía'); return }
  await ref.set({ ultimo: 0 })
  console.log('  ✓  contadores/ventas: reseteado a 0')
}

async function resetearAnalytics() {
  const ref = db.collection('analytics').doc('masVendidos')
  const snap = await ref.get()
  if (!snap.exists) { console.log('  ✓  analytics/masVendidos: no existía'); return }
  await ref.delete()
  console.log('  ✓  analytics/masVendidos: eliminado')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function limpiar() {
  console.log('\n  ⚡  LIMPIEZA DE DATOS DE PRUEBA — PRODUCCIÓN')
  console.log(`  Conservando ${CAES_A_CONSERVAR.length} factura(s) real(es)\n`)

  await borrarColeccion('ventas')
  await borrarColeccion('productos')
  await borrarFacturasDePrueba()
  await resetearContadores()
  await resetearAnalytics()

  console.log('\n  ✅  Limpieza completa.\n')
}

limpiar().catch((err) => {
  console.error(`\n  ❌  Error: ${err.message}\n`)
  process.exit(1)
})
