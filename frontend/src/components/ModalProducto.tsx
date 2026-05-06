import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTiendaStore, type Producto, type Variante } from '../stores/useTiendaStore';

export type DatosProducto = Omit<Producto, 'id'>;

interface ModalProductoProps {
  abierto: boolean;
  titulo: string;
  valoresIniciales: DatosProducto;
  onCerrar: () => void;
  onGuardar: (datos: DatosProducto) => void;
}

const valoresVacios: DatosProducto = {
  nombre: '',
  categoria: '',
  precio: 0,
  stock: 0,
  stockMinimo: 0,
  imagenUrl: '',
  variantes: [],
};

const varianteVacia: Variante = {
  id: '',
  talla: '',
  colorNombre: '',
  colorHex: '#111111',
  stock: 0,
};

export function ModalProducto({
  abierto,
  titulo,
  valoresIniciales,
  onCerrar,
  onGuardar,
}: ModalProductoProps) {
  const categorias = useTiendaStore((state) => state.categorias);
  const agregarCategoriaStore = useTiendaStore((state) => state.agregarCategoria);

  const [datos, setDatos] = useState<DatosProducto>(valoresVacios);
  const [errores, setErrores] = useState<{
    nombre?: string;
    categoria?: string;
    precio?: string;
    stock?: string;
    variantes?: string;
  }>({});

  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  useEffect(() => {
    if (abierto) {
      setDatos({ ...valoresVacios, ...valoresIniciales });
      setErrores({});
      setCreandoCategoria(false);
      setNuevaCategoria('');
    }
  }, [abierto, valoresIniciales]);

  if (!abierto) {
    return null;
  }

  const actualizarCampo = <K extends keyof DatosProducto>(
    campo: K,
    valor: DatosProducto[K]
  ) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
  };

  const agregarVariante = () => {
    setDatos((actual) => ({
      ...actual,
      variantes: [...actual.variantes, { ...varianteVacia, id: Math.random().toString(36).slice(2) }],
    }));
  };

  const actualizarVariante = (index: number, campo: keyof Variante, valor: any) => {
    setDatos((actual) => {
      const nuevasVariantes = [...actual.variantes];
      nuevasVariantes[index] = { ...nuevasVariantes[index], [campo]: valor };
      return { ...actual, variantes: nuevasVariantes };
    });
  };

  const eliminarVariante = (index: number) => {
    setDatos((actual) => {
      const nuevasVariantes = actual.variantes.filter((_, i) => i !== index);
      return { ...actual, variantes: nuevasVariantes };
    });
  };

  const manejarGuardarCategoria = () => {
    const cat = nuevaCategoria.trim();
    if (cat) {
      agregarCategoriaStore(cat);
      actualizarCampo('categoria', cat);
      setCreandoCategoria(false);
      setNuevaCategoria('');
    }
  };

  const procesarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (evento) => {
      const resultado = evento.target?.result;
      if (typeof resultado === 'string') {
        actualizarCampo('imagenUrl', resultado);
      }
    };
    lector.readAsDataURL(archivo);
  };

  const stockTotalValido = datos.variantes.reduce((sum, v) => sum + (v.stock || 0), 0) || datos.stock || 0;

  const manejarGuardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombreLimpio = datos.nombre.trim();
    const categoriaLimpia = datos.categoria.trim();
    const nuevosErrores: typeof errores = {};

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    }

    if (!categoriaLimpia) {
      nuevosErrores.categoria = 'La categor\u00eda es obligatoria.';
    }

    if (!Number.isFinite(datos.precio) || datos.precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a cero.';
    }

    // El stock puede ser 0
    if (!Number.isFinite(stockTotalValido) || stockTotalValido < 0) {
      nuevosErrores.stock = 'El stock no puede ser negativo.';
    }

    // Validar variantes
    const variantesValidas = datos.variantes.every(v => v.talla.trim() && v.colorNombre.trim() && v.stock >= 0);
    if (datos.variantes.length > 0 && !variantesValidas) {
      nuevosErrores.variantes = 'Revisa que las variantes tengan talla, color y stock valido.';
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    onGuardar({
      ...datos,
      stock: stockTotalValido,
      nombre: nombreLimpio,
      categoria: categoriaLimpia,
      imagenUrl: datos.imagenUrl?.trim() ? datos.imagenUrl : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onCerrar}
      />
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-amber-500/20 rounded p-6 shadow-xl transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-100">{titulo}</h3>
          <button
            type="button"
            onClick={onCerrar}
            className="text-neutral-500 hover:text-amber-500 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="flex flex-col gap-6" onSubmit={manejarGuardar}>
          
          {/* Fila 1: Nombre, Categoria, Precio base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Nombre del Producto
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                value={datos.nombre}
                onChange={(event) => actualizarCampo('nombre', event.target.value)}
                placeholder="Ej: Camisa Oxford"
                required
              />
              {errores.nombre && (
                <span className="text-xs text-amber-500">{errores.nombre}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Categoría
                </label>
                {!creandoCategoria && (
                  <button
                    type="button"
                    onClick={() => setCreandoCategoria(true)}
                    className="text-xs text-amber-500 hover:text-amber-400 font-medium underline underline-offset-2"
                  >
                    + Nueva
                  </button>
                )}
              </div>
              
              {creandoCategoria ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Nombre de la categoría"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={manejarGuardarCategoria}
                    className="bg-amber-500 text-black px-3 rounded text-sm font-semibold hover:bg-amber-400 transition-colors"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreandoCategoria(false); setNuevaCategoria(''); }}
                    className="text-neutral-500 hover:text-neutral-300 px-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <select
                  className="bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none w-full"
                  value={datos.categoria}
                  onChange={(event) => actualizarCampo('categoria', event.target.value)}
                  required
                >
                  <option value="" disabled>Seleccione una categoría...</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
              {errores.categoria && (
                <span className="text-xs text-amber-500">{errores.categoria}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Precio Base (ARS)
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                type="number"
                min={0}
                value={datos.precio === 0 ? '' : datos.precio}
                onChange={(event) => actualizarCampo('precio', Number(event.target.value))}
                placeholder="0.00"
                required
              />
              {errores.precio && (
                <span className="text-xs text-amber-500">{errores.precio}</span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-neutral-800 my-2" />

          {/* Fila 2: Variantes */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Variantes (Talle / Color / Stock)
              </label>
              <button
                type="button"
                onClick={agregarVariante}
                className="inline-flex items-center gap-2 px-3 py-1 border border-amber-500/30 text-amber-500 rounded text-xs font-semibold hover:bg-amber-500/10 transition-colors uppercase"
              >
                + Agregar variante
              </button>
            </div>

            {datos.variantes.length === 0 ? (
              <p className="text-sm text-neutral-600 italic">No hay variantes cargadas. Usa el botón para añadir talles y colores.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {datos.variantes.map((variante, index) => (
                  <div key={variante.id || index} className="flex flex-col md:flex-row items-center gap-3 bg-neutral-900/50 p-2 rounded border border-neutral-800">
                    <input
                      className="flex-1 bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none w-full"
                      value={variante.talla}
                      onChange={(e) => actualizarVariante(index, 'talla', e.target.value)}
                      placeholder="Talle (ej: M)"
                      required
                    />
                    
                    <div className="flex flex-1 items-center gap-2">
                       <input
                        className="flex-1 bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none w-full"
                        value={variante.colorNombre}
                        onChange={(e) => actualizarVariante(index, 'colorNombre', e.target.value)}
                        placeholder="Color (ej: Negro)"
                        required
                      />
                      <div className="relative w-10 h-10 rounded overflow-hidden border border-neutral-700 flex-shrink-0 cursor-pointer hover:border-amber-500 transition-colors">
                        <input 
                          type="color" 
                          className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                          value={variante.colorHex}
                          onChange={(e) => actualizarVariante(index, 'colorHex', e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <input
                      className="w-full md:w-24 bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                      type="number"
                      min={0}
                      value={variante.stock === 0 && !variante.stock ? '' : variante.stock}
                      onChange={(e) => actualizarVariante(index, 'stock', Number(e.target.value))}
                      placeholder="Ej: 10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => eliminarVariante(index)}
                      className="p-2 text-neutral-500 hover:text-red-500 transition-colors border border-neutral-800 hover:border-red-500/50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errores.variantes && (
              <span className="text-xs text-amber-500">{errores.variantes}</span>
            )}
          </div>

          <div className="w-full h-px bg-neutral-800 my-2" />

          {/* Fila 3: Stock y Fotos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Stock Total
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none opacity-80 cursor-not-allowed"
                type="number"
                value={stockTotalValido}
                disabled
              />
              <span className="text-xs text-neutral-600">Calculado automáticamente</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Stock Mínimo (Alerta)
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                type="number"
                min={0}
                value={datos.stockMinimo}
                onChange={(event) => actualizarCampo('stockMinimo', Number(event.target.value))}
                required
              />
              {datos.stockMinimo > stockTotalValido && (
                <span className="text-xs text-amber-500">
                  El stock mínimo supera el stock actual.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Imagen del Producto (Opcional)
              </label>
              {datos.imagenUrl ? (
                <div className="relative w-full h-32 rounded border border-amber-500/20 overflow-hidden group">
                  <img 
                    src={datos.imagenUrl} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => actualizarCampo('imagenUrl', '')}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">Quitar</span>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors rounded cursor-pointer">
                  <span className="text-sm text-neutral-400 text-center px-4">Toca para abrir la cámara o galería</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const archivo = event.target.files?.[0];
                      if (archivo) {
                        const lector = new FileReader();
                        lector.onload = (e) => {
                          if (e.target?.result) {
                            actualizarCampo('imagenUrl', e.target.result as string);
                          }
                        };
                        lector.readAsDataURL(archivo);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 rounded text-sm text-neutral-300 hover:text-neutral-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors uppercase tracking-wider"
            >
              Guardar producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
