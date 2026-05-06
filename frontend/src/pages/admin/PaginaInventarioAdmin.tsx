import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { ModalProducto, type DatosProducto } from '../../components/ModalProducto';
import { ModalAjustePrecios } from '../../components/ModalAjustePrecios';
import { useTiendaStore } from '../../stores/useTiendaStore';

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

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false);
  const [productoActivo, setProductoActivo] = useState<
    { id: string; datos: DatosProducto } | null
  >(null);

  const valoresVacios: DatosProducto = {
    nombre: '',
    categoria: '',
    precio: 0,
    stock: 0,
    stockMinimo: 0,
    imagenUrl: '',
    variantes: [],
  };

  const categoriasDisponibles = useMemo(() => {
    const categorias = new Set(productos.map((producto) => producto.categoria));
    return ['Todas', ...Array.from(categorias)];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideBusqueda = producto.nombre
        .toLowerCase()
        .includes(busquedaQuery.trim().toLowerCase());

      const coincideCategoria =
        categoriaSeleccionada === 'Todas' ||
        producto.categoria === categoriaSeleccionada;

      const stockValido = producto.variantes?.reduce((acc, v) => acc + (v.stock || 0), 0) || producto.stock || 0;
      const coincideStock =
        !soloBajoStock || stockValido <= producto.stockMinimo;

      return coincideBusqueda && coincideCategoria && coincideStock;
    });
  }, [productos, busquedaQuery, categoriaSeleccionada, soloBajoStock]);

  const totalProductos = productos.length;
  const totalBajoStock = productos.filter((producto) => {
    const stockValido = producto.variantes?.reduce((acc, v) => acc + (v.stock || 0), 0) || producto.stock || 0;
    return stockValido <= producto.stockMinimo
  }).length;

  const valorInventario = productos.reduce((acumulado, producto) => {
    const stockValido = producto.variantes?.reduce((acc, v) => acc + (v.stock || 0), 0) || producto.stock || 0;
    return acumulado + producto.precio * stockValido;
  }, 0);

  const abrirModalNuevo = () => {
    setProductoActivo(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (id: string) => {
    const producto = productos.find((item) => item.id === id);
    if (!producto) {
      return;
    }

    const { id: _, ...datos } = producto;
    setProductoActivo({ id, datos });
    setModalAbierto(true);
  };

  const manejarEliminar = (id: string, nombre: string) => {
    const confirmado = window.confirm(
      `Confirmas eliminar el producto "${nombre}"?`
    );
    if (!confirmado) {
      return;
    }

    eliminarProducto(id);
    agregarNotificacion('Producto eliminado con exito.', 'exito');
  };

  const manejarGuardar = (datos: DatosProducto) => {
    if (productoActivo) {
      editarProducto(productoActivo.id, datos);
      agregarNotificacion('Producto actualizado con exito.', 'exito');
    } else {
      agregarProducto(datos);
      agregarNotificacion('Producto creado con exito.', 'exito');
    }

    if (datos.stockMinimo > datos.stock) {
      agregarNotificacion(
        'Advertencia: el stock minimo supera el stock actual.',
        'advertencia'
      );
    }

    setModalAbierto(false);
    setProductoActivo(null);
  };

  return (
    <section className="flex flex-col gap-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-neutral-100">Inventario</h2>
          <p className="text-neutral-400 text-sm">
            Gestiona el catalogo premium con foco en stock y precios.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            Nuevo producto
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
          <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">
            Total Productos
          </span>
          <span className="text-3xl font-semibold text-amber-500">
            {totalProductos}
          </span>
        </div>
        <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
          <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">
            Bajo Stock
          </span>
          <span className="text-3xl font-semibold text-amber-500">
            {totalBajoStock}
          </span>
        </div>
        <div className="bg-neutral-950 border border-amber-500/10 rounded p-5 flex flex-col gap-3">
          <span className="text-neutral-500 text-xs uppercase tracking-[0.2em]">
            Valor del Inventario
          </span>
          <span className="text-2xl font-semibold text-neutral-100">
            {formatearMoneda(valorInventario)}
          </span>
        </div>
      </div>

      <div className="bg-black/60 border border-amber-500/10 rounded p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <input
            className="w-full bg-transparent border border-neutral-800 focus:border-amber-500 rounded pl-10 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
            placeholder="Buscar por nombre..."
            value={busquedaQuery}
            onChange={(event) => setBusquedaQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="bg-transparent border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none"
            value={categoriaSeleccionada}
            onChange={(event) => setCategoriaSeleccionada(event.target.value)}
          >
            {categoriasDisponibles.map((categoria) => (
              <option
                key={categoria}
                value={categoria}
                className="bg-neutral-950 text-neutral-100"
              >
                {categoria}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSoloBajoStock((estado) => !estado)}
            className={[
              'px-4 py-2 rounded text-sm border transition-colors',
              soloBajoStock
                ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                : 'border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600',
            ].join(' ')}
          >
            Solo bajo stock
          </button>
        </div>
      </div>

      <div className="bg-neutral-950 border border-amber-500/10 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/80">
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">
                  Producto
                </th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">
                  Categoría
                </th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">
                  Precio Base
                </th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6">
                  Stock / Variantes
                </th>
                <th className="text-xs uppercase tracking-[0.2em] text-neutral-500 py-4 px-6 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {productosFiltrados.map((producto) => {
                const stockValido = producto.variantes?.reduce((acc, v) => acc + (v.stock || 0), 0) || producto.stock || 0;
                const estaBajoStock = stockValido <= producto.stockMinimo;
                return (
                  <tr
                    key={producto.id}
                    className="border-b border-neutral-900 hover:bg-neutral-900/40 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} className="w-10 h-10 rounded object-cover border border-amber-500/20" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-500/20" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-neutral-100 font-medium">
                            {producto.nombre}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-amber-500/80 text-xs">
                      <span className="px-2 py-1 rounded-full border border-amber-500/20 bg-amber-500/5">{producto.categoria}</span>
                    </td>
                    <td className="py-4 px-6 text-neutral-100 font-semibold">
                      {formatearMoneda(producto.precio)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <span className={`text-xs font-semibold ${estaBajoStock ? 'text-amber-500' : 'text-neutral-300'}`}>
                          Total: {stockValido} un.
                        </span>
                        
                        {producto.variantes && producto.variantes.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {producto.variantes.map(v => (
                              <div key={v.id} className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 rounded-full border border-neutral-700" style={{backgroundColor: v.colorHex}} />
                                <span className="text-neutral-500">{v.talla} / {v.colorNombre}:</span>
                                <span className="text-neutral-400">{v.stock} un.</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
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
              {productosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-neutral-500"
                  >
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalProducto
        abierto={modalAbierto}
        titulo={productoActivo ? 'Editar producto' : 'Nuevo producto'}
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
