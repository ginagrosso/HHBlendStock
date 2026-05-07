import { Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTiendaStore, type Producto } from '../stores/useTiendaStore';

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
  marca: '',
  articulo: '',
  categoria: '',
  talle: '',
  stock: 0,
  precioEfectivo: 0,
  precioTarjeta: 0,
  imagenUrl: null,
};

export function ModalProducto({
  abierto,
  titulo,
  valoresIniciales,
  onCerrar,
  onGuardar,
}: ModalProductoProps) {
  const categorias = useTiendaStore((state) => state.categorias);

  const [datos, setDatos] = useState<DatosProducto>(valoresVacios);
  const [errores, setErrores] = useState<{
    nombre?: string;
    marca?: string;
    articulo?: string;
    categoria?: string;
    talle?: string;
    stock?: string;
    precioEfectivo?: string;
    precioTarjeta?: string;
    imagenUrl?: string;
  }>({});

  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  useEffect(() => {
    if (abierto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const manejarGuardarCategoria = () => {
    const cat = nuevaCategoria.trim();
    if (cat) {
      actualizarCampo('categoria', cat);
      setCreandoCategoria(false);
      setNuevaCategoria('');
    }
  };

  const procesarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setErrores((prev) => ({ ...prev, imagenUrl: 'El archivo debe ser una imagen' }));
      return;
    }

    const lector = new FileReader();
    lector.onload = (evento) => {
      const resultado = evento.target?.result;
      if (typeof resultado === 'string') {
        actualizarCampo('imagenUrl', resultado);
        setErrores((prev) => {
          const { imagenUrl: _imagenUrl, ...rest } = prev;
          return rest;
        });
      }
    };
    lector.readAsDataURL(archivo);
  };

  const eliminarImagen = () => {
    actualizarCampo('imagenUrl', null);
  };

  const manejarGuardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombreLimpio = datos.nombre.trim();
    const marcaLimpia = datos.marca.trim();
    const articuloLimpio = datos.articulo.trim();
    const categoriaLimpia = datos.categoria.trim();
    const talleLimpio = datos.talle.trim();
    const nuevosErrores: typeof errores = {};

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    }

    if (!marcaLimpia) {
      nuevosErrores.marca = 'La marca es obligatoria.';
    }

    if (!articuloLimpio) {
      nuevosErrores.articulo = 'El artículo es obligatorio.';
    }

    if (!categoriaLimpia) {
      nuevosErrores.categoria = 'La categoría es obligatoria.';
    }

    if (!talleLimpio) {
      nuevosErrores.talle = 'El talle es obligatorio.';
    }

    if (!Number.isFinite(datos.stock) || datos.stock < 0) {
      nuevosErrores.stock = 'El stock debe ser mayor o igual a cero.';
    }

    if (!Number.isFinite(datos.precioEfectivo) || datos.precioEfectivo <= 0) {
      nuevosErrores.precioEfectivo = 'El precio efectivo debe ser mayor a cero.';
    }

    if (!Number.isFinite(datos.precioTarjeta) || datos.precioTarjeta <= 0) {
      nuevosErrores.precioTarjeta = 'El precio tarjeta debe ser mayor a cero.';
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    onGuardar({
      ...datos,
      nombre: nombreLimpio,
      marca: marcaLimpia,
      articulo: articuloLimpio,
      categoria: categoriaLimpia,
      talle: talleLimpio,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onCerrar}
      />
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-amber-500/20 rounded-lg p-6 shadow-xl transition-all m-4">
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
          {/* Fila 1: Nombre, Marca, Artículo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Nombre del Producto
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                value={datos.nombre}
                onChange={(event) => actualizarCampo('nombre', event.target.value)}
                placeholder="Ej: Jean Clásico"
                required
              />
              {errores.nombre && (
                <span className="text-xs text-red-400">{errores.nombre}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Marca
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                value={datos.marca}
                onChange={(event) => actualizarCampo('marca', event.target.value)}
                placeholder="Ej: Levis"
                required
              />
              {errores.marca && (
                <span className="text-xs text-red-400">{errores.marca}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Artículo
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                value={datos.articulo}
                onChange={(event) => actualizarCampo('articulo', event.target.value)}
                placeholder="Ej: 501"
                required
              />
              {errores.articulo && (
                <span className="text-xs text-red-400">{errores.articulo}</span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          {/* Fila 2: Categoría, Talle, Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="Ej: Pantalones"
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
                    onClick={() => {
                      setCreandoCategoria(false);
                      setNuevaCategoria('');
                    }}
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
                  <option value="" disabled>
                    Seleccione una categoría...
                  </option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              {errores.categoria && (
                <span className="text-xs text-red-400">{errores.categoria}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Talle
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                value={datos.talle}
                onChange={(event) => actualizarCampo('talle', event.target.value)}
                placeholder="Ej: 42 o M"
                required
              />
              {errores.talle && (
                <span className="text-xs text-red-400">{errores.talle}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Stock
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                type="number"
                min={0}
                value={datos.stock === 0 ? '' : datos.stock}
                onChange={(event) => actualizarCampo('stock', Number(event.target.value) || 0)}
                placeholder="0"
                required
              />
              {errores.stock && (
                <span className="text-xs text-red-400">{errores.stock}</span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          {/* Fila 3: Precios (Efectivo y Tarjeta) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Precio Efectivo (ARS)
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                type="number"
                min={0}
                step={100}
                value={datos.precioEfectivo === 0 ? '' : datos.precioEfectivo}
                onChange={(event) => actualizarCampo('precioEfectivo', Number(event.target.value) || 0)}
                placeholder="0.00"
                required
              />
              {errores.precioEfectivo && (
                <span className="text-xs text-red-400">{errores.precioEfectivo}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Precio Tarjeta (ARS)
              </label>
              <input
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                type="number"
                min={0}
                step={100}
                value={datos.precioTarjeta === 0 ? '' : datos.precioTarjeta}
                onChange={(event) => actualizarCampo('precioTarjeta', Number(event.target.value) || 0)}
                placeholder="0.00"
                required
              />
              {errores.precioTarjeta && (
                <span className="text-xs text-red-400">{errores.precioTarjeta}</span>
              )}
            </div>
          </div>

          {/* Comparativa de precios */}
          {datos.precioEfectivo > 0 && datos.precioTarjeta > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-neutral-400">Efectivo:</span>
                  <span className="ml-2 font-semibold text-green-400">
                    ${datos.precioEfectivo.toLocaleString('es-AR')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Tarjeta:</span>
                  <span className="ml-2 font-semibold text-blue-400">
                    ${datos.precioTarjeta.toLocaleString('es-AR')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Diferencia:</span>
                  <span className="ml-2 font-semibold text-amber-400">
                    ${(datos.precioTarjeta - datos.precioEfectivo).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="w-full h-px bg-neutral-800" />

          {/* Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Imagen del Producto (Opcional)
            </label>

            {datos.imagenUrl ? (
              <div className="relative w-full h-48 rounded border border-amber-500/20 overflow-hidden bg-neutral-900">
                <img
                  src={datos.imagenUrl}
                  alt="Previsualización"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={eliminarImagen}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-700 hover:border-amber-500 rounded p-6 cursor-pointer text-center transition-colors">
                <Upload className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">Haz clic o arrastra una imagen</p>
                <p className="text-xs text-neutral-500">PNG, JPG, GIF hasta 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={procesarImagen}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="w-full h-px bg-neutral-800" />

          {/* Botones de acción */}
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
  );
}
