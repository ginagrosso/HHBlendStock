import { useEffect, useState } from 'react'
import { Download, Plus } from 'lucide-react'

import { ModalProducto, type DatosFicha } from '../../components/ModalProducto'
import { ModalAjustePrecios } from '../../components/ModalAjustePrecios'
import { ImportadorExcel } from '../../components/ImportadorExcel'
import { TarjetasResumenInventario } from '../../components/admin/TarjetasResumenInventario'
import { BarraFiltrosInventario } from '../../components/admin/BarraFiltrosInventario'
import { TablaInventario } from '../../components/admin/TablaInventario'
import { useTiendaStore, type Variante } from '../../stores/useTiendaStore'
import { useInventarioFiltros } from '../../hooks/useInventarioFiltros'
import { exportarInventario } from '../../lib/utilsExportador'

const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor)

const VALORES_VACIOS: DatosFicha = {
  nombre: '',
  marca: '',
  articulo: '',
  categoria: '',
  imagenUrl: null,
  variantes: [],
}

export function PaginaInventarioAdmin() {
  const fichas = useTiendaStore((s) => s.fichas)
  const cargando = useTiendaStore((s) => s.cargando)
  const cargarProductos = useTiendaStore((s) => s.cargarProductos)
  const agregarProducto = useTiendaStore((s) => s.agregarProducto)
  const editarProducto = useTiendaStore((s) => s.editarProducto)
  const eliminarProducto = useTiendaStore((s) => s.eliminarProducto)
  const agregarNotificacion = useTiendaStore((s) => s.agregarNotificacion)

  const [tabImportador, setTabImportador] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false)
  const [fichaActiva, setFichaActiva] = useState<{ id: string; datos: DatosFicha } | null>(null)

  const filtros = useInventarioFiltros(fichas)

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  const abrirModalNuevo = () => {
    setFichaActiva(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (id: string) => {
    const ficha = fichas.find((f) => f.id === id)
    if (!ficha) return
    const { id: _id, ...datos } = ficha
    setFichaActiva({ id, datos })
    setModalAbierto(true)
  }

  const manejarEliminar = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Confirmas eliminar el producto "${nombre}"?`)) return
    try {
      await eliminarProducto(id)
      agregarNotificacion('Producto eliminado con éxito.', 'exito')
    } catch {
      agregarNotificacion('Error al eliminar el producto.', 'error')
    }
  }

  const manejarActualizarStock = async (id: string, variantes: Variante[]) => {
    try {
      await editarProducto(id, { variantes })
      agregarNotificacion('Stock actualizado con éxito.', 'exito')
    } catch (err) {
      agregarNotificacion('Error al actualizar el stock.', 'error')
      throw err
    }
  }

  const manejarGuardar = async (datos: DatosFicha) => {
    try {
      if (fichaActiva) {
        await editarProducto(fichaActiva.id, datos)
        agregarNotificacion('Producto actualizado con éxito.', 'exito')
      } else {
        await agregarProducto(datos)
        agregarNotificacion('Producto creado con éxito.', 'exito')
      }
      setModalAbierto(false)
      setFichaActiva(null)
    } catch {
      agregarNotificacion('Error al guardar el producto.', 'error')
    }
  }

  // Una ficha "sin stock" es aquella que tiene al menos una variante agotada
  const totalBajoStock = fichas.filter((f) => f.variantes.some((v) => v.stock === 0)).length
  const valorInventario = fichas.reduce(
    (acc, f) => acc + f.variantes.reduce((s, v) => s + v.precioEfectivo * v.stock, 0),
    0
  )

  return (
    <section className="flex flex-col gap-10">
      <div className="flex gap-2 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => setTabImportador(false)}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
            !tabImportador ? 'border-b-2 border-amber-500 text-amber-500' : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Inventario
        </button>
        <button
          type="button"
          onClick={() => setTabImportador(true)}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
            tabImportador ? 'border-b-2 border-amber-500 text-amber-500' : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Importar Excel
        </button>
      </div>

      {!tabImportador ? (
        <>
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-neutral-100">Inventario</h2>
              <p className="text-neutral-400 text-sm">Gestiona el catálogo premium con foco en stock y precios.</p>
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
                onClick={() => exportarInventario(fichas).catch(() => agregarNotificacion('Error al exportar el inventario.', 'error'))}
                disabled={cargando || fichas.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-neutral-700 text-neutral-300 font-semibold hover:border-neutral-500 hover:text-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase text-sm tracking-wider"
              >
                <Download className="h-4 w-4" /> Exportar Excel
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

          <TarjetasResumenInventario
            totalProductos={fichas.length}
            totalBajoStock={totalBajoStock}
            valorInventario={formatearMoneda(valorInventario)}
          />

          <BarraFiltrosInventario
            busquedaQuery={filtros.busquedaQuery}
            categoriaSeleccionada={filtros.categoriaSeleccionada}
            talleSeleccionado={filtros.talleSeleccionado}
            soloBajoStock={filtros.soloBajoStock}
            categoriasDisponibles={filtros.categoriasDisponibles}
            tallesDisponibles={filtros.tallesDisponibles}
            onCambiarBusqueda={filtros.cambiarBusqueda}
            onCambiarCategoria={filtros.cambiarCategoria}
            onCambiarTalle={filtros.cambiarTalle}
            onToggleBajoStock={filtros.toggleBajoStock}
          />

          <TablaInventario
            fichas={filtros.fichasPaginadas}
            totalResultados={filtros.fichasFiltradas.length}
            paginaActual={filtros.paginaActual}
            totalPaginas={filtros.totalPaginas}
            cargando={cargando}
            onEditar={abrirModalEditar}
            onEliminar={manejarEliminar}
            onCambiarPagina={filtros.setPaginaActual}
            onActualizarStock={manejarActualizarStock}
          />
        </>
      ) : (
        <ImportadorExcel />
      )}

      <ModalProducto
        abierto={modalAbierto}
        titulo={fichaActiva ? 'Editar Producto' : 'Nuevo Producto'}
        valoresIniciales={fichaActiva?.datos ?? VALORES_VACIOS}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={manejarGuardar}
      />
      <ModalAjustePrecios
        abierto={modalAjusteAbierto}
        onCerrar={() => setModalAjusteAbierto(false)}
      />
    </section>
  )
}
