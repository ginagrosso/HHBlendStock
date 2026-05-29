import { Plus, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTiendaStore } from '../stores/useTiendaStore'
import type { Variante, DatosFicha } from '../types/inventario.types'

interface ModalProductoProps {
  abierto: boolean
  titulo: string
  valoresIniciales: DatosFicha
  onCerrar: () => void
  onGuardar: (datos: DatosFicha) => void
}

const varianteVacia = (): Variante => ({
  talle: '',
  stock: 0,
  precioEfectivo: 0,
  precioTarjeta: 0,
})

const fichaVacia: DatosFicha = {
  nombre: '',
  marca: '',
  articulo: '',
  categoria: '',
  imagenUrl: null,
  variantes: [varianteVacia()],
}

export function ModalProducto({ abierto, titulo, valoresIniciales, onCerrar, onGuardar }: ModalProductoProps) {
  const categorias = useTiendaStore((state) => state.categorias)

  const [datos, setDatos] = useState<DatosFicha>(fichaVacia)
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({})
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')

  useEffect(() => {
    if (abierto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDatos({
        ...fichaVacia,
        ...valoresIniciales,
        variantes: valoresIniciales.variantes?.length ? valoresIniciales.variantes : [varianteVacia()],
      })
      setErroresCampos({})
      setCreandoCategoria(false)
      setNuevaCategoria('')
    }
  }, [abierto, valoresIniciales])

  if (!abierto) return null

  const actualizarCampo = <K extends keyof DatosFicha>(campo: K, valor: DatosFicha[K]) =>
    setDatos((prev) => ({ ...prev, [campo]: valor }))

  const actualizarVariante = (idx: number, campo: keyof Variante, valor: string | number) =>
    setDatos((prev) => ({
      ...prev,
      variantes: prev.variantes.map((v, i) => (i === idx ? { ...v, [campo]: valor } : v)),
    }))

  const agregarVariante = () =>
    setDatos((prev) => ({ ...prev, variantes: [...prev.variantes, varianteVacia()] }))

  const eliminarVariante = (idx: number) =>
    setDatos((prev) => ({ ...prev, variantes: prev.variantes.filter((_, i) => i !== idx) }))

  const manejarGuardarCategoria = () => {
    const cat = nuevaCategoria.trim()
    if (!cat) return
    const existente = categorias.find((c) => c.toLowerCase() === cat.toLowerCase())
    actualizarCampo('categoria', existente ?? cat)
    setCreandoCategoria(false)
    setNuevaCategoria('')
  }

  const procesarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setErroresCampos((prev) => ({ ...prev, imagenUrl: 'El archivo debe ser una imagen' }))
      return
    }
    const lector = new FileReader()
    lector.onload = (evento) => {
      const resultado = evento.target?.result
      if (typeof resultado === 'string') {
        actualizarCampo('imagenUrl', resultado)
        setErroresCampos((prev) => { const { imagenUrl: _, ...rest } = prev; return rest })
      }
    }
    lector.readAsDataURL(archivo)
  }

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    if (!datos.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.'
    if (!datos.marca.trim()) nuevosErrores.marca = 'La marca es obligatoria.'
    if (!datos.articulo.trim()) nuevosErrores.articulo = 'El artículo es obligatorio.'
    if (!datos.categoria.trim()) nuevosErrores.categoria = 'La categoría es obligatoria.'
    if (datos.variantes.length === 0) nuevosErrores.variantes = 'Se requiere al menos una variante.'

    datos.variantes.forEach((v, i) => {
      if (!v.talle.trim()) nuevosErrores[`v_talle_${i}`] = 'Talle requerido.'
      if (v.precioEfectivo <= 0) nuevosErrores[`v_ef_${i}`] = 'Precio efectivo debe ser mayor a 0.'
      if (v.precioTarjeta <= 0) nuevosErrores[`v_tj_${i}`] = 'Precio tarjeta debe ser mayor a 0.'
    })

    setErroresCampos(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validar()) return
    onGuardar({
      ...datos,
      nombre: datos.nombre.trim(),
      marca: datos.marca.trim(),
      articulo: datos.articulo.trim(),
      categoria: datos.categoria.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCerrar} />
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-amber-500/20 rounded-lg p-6 shadow-xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-100">{titulo}</h3>
          <button type="button" onClick={onCerrar} className="text-neutral-500 hover:text-amber-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="flex flex-col gap-6" onSubmit={manejarGuardar}>
          {/* Datos de la ficha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Campo label="Nombre del Producto" error={erroresCampos.nombre}>
              <input
                className={inputCls}
                value={datos.nombre}
                onChange={(e) => actualizarCampo('nombre', e.target.value)}
                placeholder="Ej: Jean Clásico"
              />
            </Campo>
            <Campo label="Marca" error={erroresCampos.marca}>
              <input
                className={inputCls}
                value={datos.marca}
                onChange={(e) => actualizarCampo('marca', e.target.value)}
                placeholder="Ej: Levis"
              />
            </Campo>
            <Campo label="Artículo" error={erroresCampos.articulo}>
              <input
                className={inputCls}
                value={datos.articulo}
                onChange={(e) => actualizarCampo('articulo', e.target.value)}
                placeholder="Ej: 501"
              />
            </Campo>
          </div>

          {/* Categoría */}
          <Campo label="Categoría" error={erroresCampos.categoria}>
            <div className="flex items-center gap-2">
              {creandoCategoria ? (
                <>
                  <input
                    className={`${inputCls} flex-1`}
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Ej: Pantalones"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={manejarGuardarCategoria}
                    className="bg-amber-500 text-black px-3 py-2 rounded text-sm font-semibold hover:bg-amber-400 transition-colors"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreandoCategoria(false); setNuevaCategoria('') }}
                    className="text-neutral-500 hover:text-neutral-300 px-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <select
                    className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                    value={datos.categoria}
                    onChange={(e) => actualizarCampo('categoria', e.target.value)}
                  >
                    <option value="" disabled>Seleccione una categoría...</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCreandoCategoria(true)}
                    className="text-xs text-amber-500 hover:text-amber-400 font-medium whitespace-nowrap"
                  >
                    + Nueva
                  </button>
                </>
              )}
            </div>
          </Campo>

          <div className="w-full h-px bg-neutral-800" />

          {/* Variantes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Variantes (Talles)</span>
              <button
                type="button"
                onClick={agregarVariante}
                className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar talle
              </button>
            </div>

            {erroresCampos.variantes && (
              <span className="text-xs text-red-400">{erroresCampos.variantes}</span>
            )}

            {/* Encabezado de columnas */}
            <div className="grid grid-cols-[1fr_80px_1fr_1fr_36px] gap-2 px-1">
              {['Talle', 'Stock', 'P. Efectivo', 'P. Tarjeta', ''].map((h) => (
                <span key={h} className="text-[10px] uppercase tracking-widest text-neutral-600">{h}</span>
              ))}
            </div>

            {datos.variantes.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_1fr_1fr_36px] gap-2 items-start">
                <div>
                  <input
                    className={erroresCampos[`v_talle_${i}`] ? inputErrCls : inputCls}
                    value={v.talle}
                    onChange={(e) => actualizarVariante(i, 'talle', e.target.value.toUpperCase())}
                    placeholder="42"
                  />
                  {erroresCampos[`v_talle_${i}`] && (
                    <span className="text-[10px] text-red-400">{erroresCampos[`v_talle_${i}`]}</span>
                  )}
                </div>
                <div>
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    value={v.stock === 0 ? '' : v.stock}
                    onChange={(e) => actualizarVariante(i, 'stock', Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <input
                    className={erroresCampos[`v_ef_${i}`] ? inputErrCls : inputCls}
                    type="number"
                    min={0}
                    step={100}
                    value={v.precioEfectivo === 0 ? '' : v.precioEfectivo}
                    onChange={(e) => actualizarVariante(i, 'precioEfectivo', Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                  {erroresCampos[`v_ef_${i}`] && (
                    <span className="text-[10px] text-red-400">{erroresCampos[`v_ef_${i}`]}</span>
                  )}
                </div>
                <div>
                  <input
                    className={erroresCampos[`v_tj_${i}`] ? inputErrCls : inputCls}
                    type="number"
                    min={0}
                    step={100}
                    value={v.precioTarjeta === 0 ? '' : v.precioTarjeta}
                    onChange={(e) => actualizarVariante(i, 'precioTarjeta', Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                  {erroresCampos[`v_tj_${i}`] && (
                    <span className="text-[10px] text-red-400">{erroresCampos[`v_tj_${i}`]}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => eliminarVariante(i)}
                  disabled={datos.variantes.length === 1}
                  className="mt-1 text-neutral-600 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-neutral-800" />

          {/* Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Imagen del Producto (Opcional)
            </label>
            {datos.imagenUrl ? (
              <div className="relative w-full h-40 rounded border border-amber-500/20 overflow-hidden bg-neutral-900">
                <img src={datos.imagenUrl} alt="Previsualización" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => actualizarCampo('imagenUrl', null)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-700 hover:border-amber-500 rounded p-5 cursor-pointer text-center transition-colors">
                <Upload className="h-7 w-7 text-neutral-500 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">Haz clic o arrastra una imagen</p>
                <p className="text-xs text-neutral-500">PNG, JPG hasta 5MB</p>
                <input type="file" accept="image/*" onChange={procesarImagen} className="hidden" />
              </label>
            )}
            {erroresCampos.imagenUrl && (
              <span className="text-xs text-red-400">{erroresCampos.imagenUrl}</span>
            )}
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded hover:border-neutral-600 hover:text-neutral-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 transition-colors font-semibold"
            >
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── helpers de estilos ────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none'
const inputErrCls =
  'w-full bg-transparent border border-red-500/60 focus:border-red-400 rounded px-3 py-2 text-sm text-neutral-100 outline-none'

interface CampoProps {
  label: string
  error?: string
  children: React.ReactNode
}

function Campo({ label, error, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
