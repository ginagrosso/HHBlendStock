import { useMemo, useState } from 'react'
import type { Producto } from '../stores/useTiendaStore'
import { useTiendaStore } from '../stores/useTiendaStore'

const ITEMS_POR_PAGINA = 12

export function useInventarioFiltros(productos: Producto[]) {
  const busquedaQuery = useTiendaStore((s) => s.busquedaQuery)
  const setBusquedaQuery = useTiendaStore((s) => s.setBusquedaQuery)

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas')
  const [talleSeleccionado, setTalleSeleccionado] = useState('Todos')
  const [soloBajoStock, setSoloBajoStock] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)

  const categoriasDisponibles = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria))
    return ['Todas', ...Array.from(cats)]
  }, [productos])

  const tallesDisponibles = useMemo(() => {
    const talles = new Set(productos.map((p) => p.talle))
    return ['Todos', ...Array.from(talles).sort()]
  }, [productos])

  const productosFiltrados = useMemo(() => {
    const q = busquedaQuery.trim().toLowerCase()
    return productos.filter((p) => {
      const coincideBusqueda =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.articulo.toLowerCase().includes(q)
      const coincideCategoria = categoriaSeleccionada === 'Todas' || p.categoria === categoriaSeleccionada
      const coincideTalle = talleSeleccionado === 'Todos' || p.talle === talleSeleccionado
      const coincideStock = !soloBajoStock || p.stock === 0
      return coincideBusqueda && coincideCategoria && coincideTalle && coincideStock
    })
  }, [productos, busquedaQuery, categoriaSeleccionada, talleSeleccionado, soloBajoStock])

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA))

  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA
    return productosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA)
  }, [productosFiltrados, paginaActual])

  const cambiarBusqueda = (q: string) => { setBusquedaQuery(q); setPaginaActual(1) }
  const cambiarCategoria = (cat: string) => { setCategoriaSeleccionada(cat); setPaginaActual(1) }
  const cambiarTalle = (talle: string) => { setTalleSeleccionado(talle); setPaginaActual(1) }
  const toggleBajoStock = () => { setSoloBajoStock((v) => !v); setPaginaActual(1) }

  return {
    busquedaQuery,
    categoriaSeleccionada,
    talleSeleccionado,
    soloBajoStock,
    paginaActual,
    setPaginaActual,
    categoriasDisponibles,
    tallesDisponibles,
    productosFiltrados,
    productosPaginados,
    totalPaginas,
    cambiarBusqueda,
    cambiarCategoria,
    cambiarTalle,
    toggleBajoStock,
  }
}
