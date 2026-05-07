import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { ModalProducto, type DatosProducto } from '../../components/ModalProducto';
import { ModalAjustePrecios } from '../../components/ModalAjustePrecios';
import { ImportadorExcel } from '../../components/ImportadorExcel';
import { useTiendaStore } from '../../stores/useTiendaStore';

const ITEMS_POR_PAGINA = 12;

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
};

export function PaginaInventarioAdmin() {
  const productos = useTiendaStore((state) => state.productos);
  const busquedaQuery = useTiendaStore((state) => state.busquedaQuery);
  const setBusquedaQuery = useTiendaStore((state) => state.setBusquedaQuery);
  const agregarNotificacion = useTiendaStore((state) => state.agregarNotificacion);
  const agregarProducto = useTiendaStore((state) => state.agregarProducto);
  const editarProducto = useTiendaStore((state) => state.editarProducto);
  const eliminarProducto = useTiendaStore((state) => state.eliminarProducto);
  const cargarProductos = useTiendaStore((state) => state.cargarProductos);
  const cargando = useTiendaStore((state) => state.cargando);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [talleSeleccionado, setTalleSeleccionado] = useState('Todos');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false);
  const [modalImportadorAbierto, setModalImportadorAbierto] = useState(false);
  const [productoActivo, setProductoActivo] = useState<
    { id: string; datos: DatosProducto } | null
  >(null);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

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

  const categoriasDisponibles = useMemo(() => {
    const categorias = new Set(productos.map((producto) => producto.categoria));
    return ['Todas', ...Array.from(categorias)];
  }, [productos]);

  const tallesDisponibles = useMemo(() => {
    const talles = new Set(productos.map((producto) => producto.talle));
    return ['Todos', ...Array.from(talles).sort()];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(busquedaQuery.trim().toLowerCase()) ||
        producto.marca.toLowerCase().includes(busquedaQuery.trim().toLowerCase()) ||
        producto.articulo.toLowerCase().includes(busquedaQuery.trim().toLowerCase());

      const coincideCategoria =
        categoriaSeleccionada === 'Todas' ||
        producto.categoria === categoriaSeleccionada;

      const coincideTalle =
        talleSeleccionado === 'Todos' ||
        producto.talle === talleSeleccionado;

      const coincideStock = !soloBajoStock || producto.stock === 0;

      return coincideBusqueda && coincideCategoria && coincideTalle && coincideStock;
    });
  }, [productos, busquedaQuery, categoriaSeleccionada, talleSeleccionado, soloBajoStock]);

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA));

  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return productosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [productosFiltrados, paginaActual]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaQuery, categoriaSeleccionada, talleSeleccionado, soloBajoStock]);

  const totalProductos = productos.length;
  const totalBajoStock = productos.filter((p) => p.stock === 0).length;
  const valorInventario = productos.reduce((acc, p) => acc + p.precioEfectivo * p.stock, 0);

  const abrirModalNuevo = () => {
    setProductoActivo(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (id: string) => {
    const producto = productos.find((item) => item.id === id);
    if (!producto) return;
    const { id: _id, ...datos } = producto;
    setProductoActivo({ id, datos });
    setModalAbierto(true);
  };

  const manejarEliminar = async (id: string, nombre: string) => {
    const confirmado = window.confirm(`¿Confirmas eliminar el producto "${nombre}"?`);
    if (!confirmado) return;
    try {
      await eliminarProducto(id);
      agregarNotificacion('Producto eliminado con éxito.', 'exito');
    } catch {
      agregarNotificacion('Error al eliminar el producto.', 'error');
    }
  };

  const manejarGuardar = async (datos: DatosProducto) => {
    try {
      if (productoActivo) {
        await editarProducto(productoActivo.id, datos);
        agregarNotificacion('Producto actualizado con éxito.', 'exito');
      } else {
        await agregarProducto(datos);
        agregarNotificacion('Producto creado con éxito.', 'exito');
      }
      setModalAbierto(false);
      setProductoActivo(null);
    } catch {
      agregarNotificacion('Error al guardar el producto.', 'error');
    }
  };

  return (
    <section className="flex flex-col gap-10">
      {/* TABS: Inventario / Importador */}
      <div className="flex gap-2 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => setModalImportadorAbierto(false)}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
            !modalImportadorAbierto
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Inventario
        </button>
        <button
          type="button"
          onClick={() => setModalImportadorAbierto(true)}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
            modalImportadorAbierto
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Importar Excel
        </button>
      </div>

      {!modalImportadorAbierto ? (
        <>
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-neutral-100">Inventario</h2>
              <p className="text-neutral-400 text-sm">
                Gestiona el catálogo premium con foco en stock y precios.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setModalAjusteAbierto(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-amber-500/50 text-amber-500 font-semibold hover:bg-amber-500/10 transition-colors uppercase text-sm tracking-wider"
              >
                <span className="text-xs">▲</span> Ajustar Precios
              </button>
              <button
                type="button"
                onClick={abrirModalNuevo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors uppercase text-sm tracking-wider"
              >
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
              <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">Total de Productos</span>
              <span className="text-3xl font-semibold text-amber-500">{totalProductos}</span>
            </div>
            <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
              <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">Sin Stock</span>
              <span className="text-3xl font-semibold text-amber-500">{totalBajoStock}</span>
            </div>
            <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
              <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">Valor Total del Inventario</span>
              <span className="text-2xl font-semibold text-neutral-100">{formatearMoneda(valorInventario)}</span>
            </div>
          </div>

          <div className="bg-black/60 border border-amber-500/10 rounded p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
              <input
                className="w-full bg-transparent border border-neutral-800 focus:border-amber-500 rounded pl-10 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
                placeholder="Buscar por nombre, marca o talle..."
                value={busquedaQuery}
                onChange={(e) => setBusquedaQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              >
                {categoriasDisponibles.map((categoria) => (
                  <option key={categoria} value={categoria} className="bg-neutral-950 text-neutral-100">
                    {categoria}
                  </option>
                ))}
              </select>
              <select
                className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
                value={talleSeleccionado}
                onChange={(e) => setTalleSeleccionado(e.target.value)}
              >
                {tallesDisponibles.map((talle) => (
                  <option key={talle} value={talle} className="bg-neutral-950 text-neutral-100">
                    {talle === 'Todos' ? 'Todos los talles' : talle}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSoloBajoStock((v) => !v)}
                className={[
                  'px-4 py-2 rounded text-sm border transition-colors',
                  soloBajoStock
                    ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                    : 'border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600',
                ].join(' ')}
              >
                Solo sin Stock
              </button>
            </div>
          </div>

          <div className="bg-neutral-950 border border-amber-500/10 rounded overflow-hidden">
            {cargando ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 bg-neutral-950/80">
                      <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Producto</th>
                      <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Marca</th>
                      <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Talle</th>
                      <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">P. Efectivo</th>
                      <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">P. Tarjeta</th>
                      <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">Stock</th>
                      <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {productosPaginados.map((producto) => {
                      const estaSinStock = producto.stock === 0;
                      return (
                        <tr
                          key={producto.id}
                          className="border-b border-neutral-900 hover:bg-neutral-900/40 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {producto.imagenUrl ? (
                                <img
                                  src={producto.imagenUrl}
                                  alt={producto.nombre}
                                  className="w-10 h-10 rounded object-cover border border-amber-500/20"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-500/20" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-neutral-100 font-medium">{producto.nombre}</span>
                                <span className="text-xs text-neutral-500">{producto.articulo}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-neutral-300">{producto.marca}</td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
                              {producto.talle}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-green-400 font-semibold">
                            {formatearMoneda(producto.precioEfectivo)}
                          </td>
                          <td className="py-4 px-6 text-blue-400 font-semibold">
                            {formatearMoneda(producto.precioTarjeta)}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded text-xs font-semibold ${
                                estaSinStock
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
                              }`}
                            >
                              {producto.stock} un.
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                className="px-3 py-1 text-xs border border-neutral-800 rounded text-neutral-400 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
                                onClick={() => abrirModalEditar(producto.id)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1 text-xs border border-neutral-800 rounded text-neutral-400 hover:text-red-500 hover:border-red-500/50 transition-colors"
                                onClick={() => manejarEliminar(producto.id, producto.nombre)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {productosFiltrados.length === 0 && !cargando && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-neutral-500">
                          No hay productos que coincidan con los filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {!cargando && productosFiltrados.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-900">
                <span className="text-xs text-neutral-500">
                  {productosFiltrados.length} resultados · página {paginaActual} de {totalPaginas}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="p-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="p-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <ImportadorExcel />
      )}

      <ModalProducto
        abierto={modalAbierto}
        titulo={productoActivo ? 'Editar Producto' : 'Nuevo Producto'}
        valoresIniciales={productoActivo?.datos ?? valoresVacios}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={manejarGuardar}
      />
      <ModalAjustePrecios
        abierto={modalAjusteAbierto}
        onCerrar={() => setModalAjusteAbierto(false)}
      />
    </section>
  );
}
