import { AlertCircle, Download, FileUp, Loader } from 'lucide-react'
import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { useTiendaStore } from '../stores/useTiendaStore'
import { inventarioService } from '../services/inventario.service'
import { type CeldaExcel, type ProductoPlano, procesarMultiplesSheets } from '../lib/utilsImportador'

interface Preview {
  productos: ProductoPlano[]
  reportePorCategoria: Map<string, { exitosos: number; filasProcessadas: number; errores: number; mensajes: string[] }>
  totalFichas: number
  totalVariantes: number
  totalErroresParseo: number
}

interface Resultado {
  upsertados: number
  erroresApi: { fila: number; error: string }[]
  reportePorCategoria: Map<string, { exitosos: number; filasProcessadas: number; errores: number; mensajes: string[] }>
}

type Fase = 'idle' | 'parseando' | 'preview' | 'enviando' | 'resultado'

export function ImportadorExcel() {
  const [fase, setFase] = useState<Fase>('idle')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erroresGlobales, setErroresGlobales] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const cargarProductos = useTiendaStore((state) => state.cargarProductos)
  const agregarNotificacion = useTiendaStore((state) => state.agregarNotificacion)

  const parsearArchivo = async (archivo: File) => {
    setFase('parseando')
    setPreview(null)
    setResultado(null)
    setErroresGlobales([])

    try {
      const arrayBuffer = await archivo.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      const sheetsMap = new Map<string, CeldaExcel[][]>()
      workbook.SheetNames.forEach((nombreSheet) => {
        const worksheet = workbook.Sheets[nombreSheet]
        const valores = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
        }) as CeldaExcel[][]
        if (valores && valores.length > 0) sheetsMap.set(nombreSheet, valores)
      })

      if (sheetsMap.size === 0) throw new Error('El archivo Excel no contiene datos válidos')

      const { todosLosProductos, reporteDetalladoPorSheet, totalProductosCreados, totalErrores } =
        procesarMultiplesSheets(sheetsMap)

      if (totalProductosCreados === 0)
        throw new Error('No se pudieron extraer productos. Verifica la estructura del Excel.')

      const reportePorCategoria = new Map<string, { exitosos: number; filasProcessadas: number; errores: number; mensajes: string[] }>()
      reporteDetalladoPorSheet.forEach((stats, categoria) => {
        reportePorCategoria.set(categoria, {
          exitosos: stats.exitosos,
          filasProcessadas: stats.filasProcessadas,
          errores: stats.errores,
          mensajes: stats.detalles,
        })
      })

      const totalFichas = new Set(
        todosLosProductos.map((p) => `${p.marca.toLowerCase().trim()}|${p.articulo.toLowerCase().trim()}`)
      ).size

      setPreview({
        productos: todosLosProductos,
        reportePorCategoria,
        totalFichas,
        totalVariantes: totalProductosCreados,
        totalErroresParseo: totalErrores,
      })
      setFase('preview')

      if (inputRef.current) inputRef.current.value = ''
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido al procesar archivo'
      setErroresGlobales([mensaje])
      setFase('idle')
    }
  }

  const confirmarImportacion = async () => {
    if (!preview) return
    setFase('enviando')

    try {
      const { upsertados, errores: erroresApi } = await inventarioService.importar(preview.productos)
      await cargarProductos()

      setResultado({ upsertados, erroresApi, reportePorCategoria: preview.reportePorCategoria })
      setPreview(null)
      setFase('resultado')

      if (erroresApi.length === 0) {
        agregarNotificacion(`Importación exitosa: ${upsertados} productos guardados.`, 'exito')
      } else {
        agregarNotificacion(
          `Importación completada: ${upsertados} guardados, ${erroresApi.length} rechazados por el servidor.`,
          'advertencia'
        )
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al importar'
      setErroresGlobales([mensaje])
      agregarNotificacion(`Error en importación: ${mensaje}`, 'error')
      setFase('preview')
    }
  }

  const cancelarPreview = () => {
    setPreview(null)
    setFase('idle')
    setErroresGlobales([])
  }

  const reiniciar = () => {
    setResultado(null)
    setFase('idle')
    setErroresGlobales([])
  }

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    const esExcel =
      archivo.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      archivo.type === 'application/vnd.ms-excel' ||
      archivo.name.endsWith('.xlsx') ||
      archivo.name.endsWith('.xls')

    if (!esExcel) {
      agregarNotificacion('El archivo debe ser un Excel (.xlsx o .xls)', 'error')
      return
    }

    parsearArchivo(archivo)
  }

  const descargarPlantilla = () => {
    const plantilla = [
      { 'Artículo': '5660', 'Marca': 'Levis', 'Descripción': 'Jean Classic', 'Precio Ef.': 85000, 'Precio Tarj.': 95000, '36': 10, '38': 15, '40': 8 },
    ]
    const ws = XLSX.utils.json_to_sheet(plantilla)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'pantalones')
    XLSX.writeFile(wb, 'plantilla-hh-blend.xlsx')
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Zona de carga — solo en idle/parseando */}
      {(fase === 'idle' || fase === 'parseando') && (
        <div className="bg-neutral-950 border border-amber-500/20 rounded-lg p-8">
          <div className="text-center">
            <FileUp className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">Importar Inventario desde Excel</h3>
            <p className="text-sm text-neutral-400 mb-6">
              Selecciona un archivo Excel. Podrás revisar los datos antes de confirmar.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <label className="relative inline-block">
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={manejarCambioArchivo}
                  disabled={fase === 'parseando'}
                  className="hidden"
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={fase === 'parseando'}
                  className="inline-flex items-center gap-2 bg-amber-500 text-black px-6 py-3 rounded font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {fase === 'parseando' ? (
                    <><Loader className="h-4 w-4 animate-spin" /> Leyendo archivo...</>
                  ) : (
                    <><FileUp className="h-4 w-4" /> Seleccionar Excel</>
                  )}
                </button>
              </label>
              <button
                onClick={descargarPlantilla}
                className="inline-flex items-center gap-2 bg-neutral-800 text-amber-500 px-6 py-3 rounded font-semibold hover:bg-neutral-700 transition-colors"
              >
                <Download className="h-4 w-4" /> Descargar Plantilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Errores globales */}
      {erroresGlobales.length > 0 && (
        <div className="bg-red-950/30 border border-red-600/50 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-200 mb-1">Error</h4>
              {erroresGlobales.map((e, i) => (
                <p key={i} className="text-xs text-red-300">{e}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview — revisión antes de confirmar */}
      {fase === 'preview' && preview && (
        <div className="bg-neutral-950 border border-amber-500/30 rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-100">Revisá antes de confirmar</h3>
            <span className="text-xs text-neutral-500">
              {preview.totalErroresParseo > 0 && `${preview.totalErroresParseo} filas con errores de parseo`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-4">
              <div className="text-xs text-neutral-400 mb-1">Fichas a importar</div>
              <div className="text-2xl font-bold text-amber-400">{preview.totalFichas}</div>
              <div className="text-xs text-neutral-500 mt-1">{preview.totalVariantes} variantes (talles)</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded p-4">
              <div className="text-xs text-neutral-400 mb-1">Errores de parseo</div>
              <div className={`text-2xl font-bold ${preview.totalErroresParseo > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {preview.totalErroresParseo}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {Array.from(preview.reportePorCategoria.entries()).map(([cat, stats]) => (
              <div key={cat} className="bg-neutral-900 border border-neutral-800 rounded px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium text-amber-500">{cat}</span>
                <span className="text-xs text-neutral-400">
                  {stats.filasProcessadas} filas
                  {stats.errores > 0 && ` · ${stats.errores} errores`}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-neutral-500">
            Re-importar el mismo archivo actualiza precios y stock sin crear duplicados. Es seguro hacerlo varias veces.
          </p>

          <div className="flex gap-3 justify-end pt-2 border-t border-neutral-800">
            <button
              onClick={cancelarPreview}
              className="px-4 py-2 rounded text-sm text-neutral-300 hover:text-neutral-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarImportacion}
              className="px-6 py-2 rounded bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors uppercase tracking-wider"
            >
              Confirmar importación
            </button>
          </div>
        </div>
      )}

      {/* Enviando... */}
      {fase === 'enviando' && (
        <div className="bg-neutral-950 border border-amber-500/20 rounded-lg p-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Guardando en Firestore...</p>
        </div>
      )}

      {/* Resultado final */}
      {fase === 'resultado' && resultado && (
        <div className="bg-neutral-950 border border-amber-500/20 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-950/20 border border-green-600/30 rounded p-4">
              <div className="text-sm text-neutral-400">Fichas guardadas</div>
              <div className="text-2xl font-bold text-green-400">{resultado.upsertados}</div>
            </div>
            <div className="bg-red-950/20 border border-red-600/30 rounded p-4">
              <div className="text-sm text-neutral-400">Rechazados por el servidor</div>
              <div className="text-2xl font-bold text-red-400">{resultado.erroresApi.length}</div>
            </div>
          </div>

          {resultado.erroresApi.length > 0 && (
            <div className="border border-red-600/30 rounded p-3 space-y-1">
              <h4 className="text-xs font-semibold text-red-300">Filas rechazadas</h4>
              {resultado.erroresApi.map((e) => (
                <p key={e.fila} className="text-xs text-red-400">Fila {e.fila}: {e.error}</p>
              ))}
            </div>
          )}

          {resultado.reportePorCategoria.size > 0 && (
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <h4 className="text-sm font-semibold text-neutral-200">Detalle por categoría</h4>
              {Array.from(resultado.reportePorCategoria.entries()).map(([cat, stats]) => (
                <div key={cat} className="bg-neutral-900 border border-neutral-800 rounded p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-amber-500 text-sm">{cat}</span>
                    <span className="text-xs text-neutral-500">{stats.filasProcessadas} filas · {stats.errores} errores de parseo</span>
                  </div>
                  {stats.mensajes.slice(0, 3).map((msg, i) => (
                    <p key={i} className="text-xs text-neutral-400 ml-3">→ {msg}</p>
                  ))}
                  {stats.mensajes.length > 3 && (
                    <p className="text-xs text-neutral-500 ml-3">... y {stats.mensajes.length - 3} más</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={reiniciar}
              className="px-4 py-2 rounded border border-neutral-700 text-neutral-300 text-sm hover:border-neutral-500 hover:text-neutral-100 transition-colors"
            >
              Importar otro archivo
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {fase === 'idle' && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 text-sm text-neutral-300">
          <h4 className="font-semibold text-neutral-200 mb-3">Estructura esperada del Excel</h4>
          <ul className="space-y-2 ml-4 list-disc">
            <li><strong>Pestañas:</strong> cada pestaña = una categoría (ej: "pantalones", "remeras")</li>
            <li><strong>Columnas:</strong> Artículo | Marca | Descripción | Precio Ef. | Precio Tarj. | 36 | 38 | 40 ...</li>
            <li><strong>Stock:</strong> las columnas de talles contienen el stock disponible o están vacías</li>
          </ul>
        </div>
      )}
    </div>
  )
}
