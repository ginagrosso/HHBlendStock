import { useMemo, useState } from 'react'
import type { Ficha } from '../types/inventario.types'
import { useTiendaStore } from '../stores/useTiendaStore'

const ITEMS_POR_PAGINA = 12

export function useInventarioFiltros(fichas: Ficha[]) {
  const busquedaQuery = useTiendaStore((s) => s.busquedaQuery)
  const setBusquedaQuery = useTiendaStore((s) => s.setBusquedaQuery)

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas')
  const [talleSeleccionado, setTalleSeleccionado] = useState('Todos')
  const [soloBajoStock, setSoloBajoStock] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)

  const categoriasDisponibles = useMemo(() => {
    const seen = new Set<string>()
    const cats: string[] = []
    fichas.forEach((f) => {
      const key = f.categoria.toLowerCase()
      if (!seen.has(key)) { seen.add(key); cats.push(f.categoria) }
    })
    return ['Todas', ...cats.sort()]
  }, [fichas])

  const tallesDisponibles = useMemo(() => {
    const seen = new Set<string>()
    const talles: string[] = []
    fichas.flatMap((f) => f.variantes.map((v) => v.talle)).forEach((t) => {
      const key = t.toUpperCase()
      if (!seen.has(key)) { seen.add(key); talles.push(key) }
    })
    return ['Todos', ...talles.sort()]
  }, [fichas])

  const fichasFiltradas = useMemo(() => {
    const q = busquedaQuery.trim().toLowerCase()
    const terminos = q ? q.split(/\s+/).filter(Boolean) : []
    return fichas.filter((f) => {
      const camposConcatenados = `${f.nombre} ${f.marca} ${f.articulo}`.toLowerCase()
      const coincideBusqueda = terminos.length === 0 || terminos.every((t) => camposConcatenados.includes(t))

      const coincideCategoria =
        categoriaSeleccionada === 'Todas' ||
        f.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()

      const coincideTalle =
        talleSeleccionado === 'Todos' ||
        f.variantes.some((v) => v.talle.toUpperCase() === talleSeleccionado.toUpperCase())

      // "Solo sin stock" muestra fichas donde AL MENOS UNA variante no tiene stock
      const coincideStock = !soloBajoStock || f.variantes.some((v) => v.stock === 0)

      return coincideBusqueda && coincideCategoria && coincideTalle && coincideStock
    })
  }, [fichas, busquedaQuery, categoriaSeleccionada, talleSeleccionado, soloBajoStock])

  const totalPaginas = Math.max(1, Math.ceil(fichasFiltradas.length / ITEMS_POR_PAGINA))

  const fichasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA
    return fichasFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA)
  }, [fichasFiltradas, paginaActual])

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
    fichasFiltradas,
    fichasPaginadas,
    totalPaginas,
    cambiarBusqueda,
    cambiarCategoria,
    cambiarTalle,
    toggleBajoStock,
  }
}
