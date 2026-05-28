import { useState, useCallback, useRef, useEffect } from 'react'
import type { ProductoCaja, ItemCarrito, MetodoPago, DatosCliente, DocReceptor, Ticket } from '../types/caja.types'
import type { ArcaConfig } from '../types/facturacion.types'
import { cajaService } from '../services/caja.service'
import { facturacionService } from '../services/facturacion.service'

export type EtapaCaja = 'carrito' | 'pago' | 'ticket'

export interface UseCajaReturn {
  // Búsqueda
  query: string
  resultados: ProductoCaja[]
  buscando: boolean
  setQuery: (q: string) => void
  limpiarBusqueda: () => void

  // Carrito
  items: ItemCarrito[]
  totalItems: number
  calcularTotal: (metodo: MetodoPago) => number
  agregarAlCarrito: (producto: ProductoCaja) => void
  cambiarCantidad: (productoId: string, talle: string, delta: number) => void
  quitarDelCarrito: (productoId: string, talle: string) => void
  vaciarCarrito: () => void

  // Flujo de pago
  etapa: EtapaCaja
  metodoPago: MetodoPago | null
  ticketActual: Ticket | null
  procesando: boolean
  erroPago: string | null
  arcaConfig: ArcaConfig | null
  iniciarPago: () => void
  seleccionarMetodoPago: (metodo: MetodoPago) => void
  volverAlCarrito: () => void
  confirmarVenta: (cliente?: DatosCliente, docReceptor?: DocReceptor) => Promise<void>
  cerrarTicket: () => void
}

export function useCaja(): UseCajaReturn {
  const [query, setQueryEstado] = useState('')
  const [resultados, setResultados] = useState<ProductoCaja[]>([])
  const [buscando, setBuscando] = useState(false)

  const [items, setItems] = useState<ItemCarrito[]>([])

  const [etapa, setEtapa] = useState<EtapaCaja>('carrito')
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null)
  const [ticketActual, setTicketActual] = useState<Ticket | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [erroPago, setErroPago] = useState<string | null>(null)
  const [arcaConfig, setArcaConfig] = useState<ArcaConfig | null>(null)

  useEffect(() => {
    facturacionService.getConfig()
      .then(setArcaConfig)
      .catch(() => { /* falla silenciosa: el modal no bloqueará sin config */ })
  }, [])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Búsqueda ──────────────────────────────────────────────────────────────────
  const setQuery = useCallback((q: string) => {
    setQueryEstado(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!q.trim()) {
      setResultados([])
      setBuscando(false)
      return
    }

    setBuscando(true)
    debounceRef.current = setTimeout(async () => {
      const productos = await cajaService.buscarProductos(q)
      setResultados(productos)
      setBuscando(false)
    }, 300)
  }, [])

  const limpiarBusqueda = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQueryEstado('')
    setResultados([])
    setBuscando(false)
  }, [])

  // ── Carrito ───────────────────────────────────────────────────────────────────
  const agregarAlCarrito = useCallback((producto: ProductoCaja) => {
    setItems((prev) => {
      const existe = prev.find(
        (i) => i.productoId === producto.id && i.talle === producto.talle,
      )
      if (existe) {
        return prev.map((i) =>
          i.productoId === producto.id && i.talle === producto.talle
            ? { ...i, cantidad: Math.min(i.cantidad + 1, producto.stock) }
            : i,
        )
      }
      const nuevo: ItemCarrito = {
        productoId: producto.id,
        nombre: producto.nombre,
        marca: producto.marca,
        articulo: producto.articulo,
        talle: producto.talle,
        cantidad: 1,
        stockDisponible: producto.stock,
        precioEfectivo: producto.precioEfectivo,
        precioTarjeta: producto.precioTarjeta,
      }
      return [...prev, nuevo]
    })
  }, [])

  const cambiarCantidad = useCallback(
    (productoId: string, talle: string, delta: number) => {
      setItems((prev) =>
        prev.flatMap((i) => {
          if (i.productoId !== productoId || i.talle !== talle) return [i]
          const nuevaCantidad = i.cantidad + delta
          if (nuevaCantidad <= 0) return []
          if (nuevaCantidad > i.stockDisponible) return [i]
          return [{ ...i, cantidad: nuevaCantidad }]
        }),
      )
    },
    [],
  )

  const quitarDelCarrito = useCallback((productoId: string, talle: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productoId === productoId && i.talle === talle)),
    )
  }, [])

  const vaciarCarrito = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  const calcularTotal = useCallback(
    (metodo: MetodoPago): number =>
      items.reduce((acc, item) => {
        const precio =
          metodo === 'tarjeta' ? item.precioTarjeta : item.precioEfectivo
        return acc + precio * item.cantidad
      }, 0),
    [items],
  )

  // ── Flujo de pago ─────────────────────────────────────────────────────────────
  const iniciarPago = useCallback(() => {
    setEtapa('pago')
    setErroPago(null)
  }, [])

  const seleccionarMetodoPago = useCallback((metodo: MetodoPago) => {
    setMetodoPago(metodo)
  }, [])

  const volverAlCarrito = useCallback(() => {
    setEtapa('carrito')
    setMetodoPago(null)
    setErroPago(null)
  }, [])

  const confirmarVenta = useCallback(
    async (cliente?: DatosCliente, docReceptor?: DocReceptor) => {
      if (!metodoPago) return
      setProcesando(true)
      setErroPago(null)
      try {
        const resultado = await cajaService.finalizarVenta({
          items,
          metodoPago,
          cliente,
          docReceptor,
        })
        setTicketActual(resultado.ticket)
        setEtapa('ticket')
      } catch (err) {
        setErroPago(err instanceof Error ? err.message : 'Error al procesar la venta. Intentá de nuevo.')
      } finally {
        setProcesando(false)
      }
    },
    [items, metodoPago],
  )

  const cerrarTicket = useCallback(() => {
    setItems([])
    limpiarBusqueda()
    setTicketActual(null)
    setMetodoPago(null)
    setEtapa('carrito')
  }, [limpiarBusqueda])

  return {
    query,
    resultados,
    buscando,
    setQuery,
    limpiarBusqueda,
    items,
    totalItems,
    calcularTotal,
    agregarAlCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    vaciarCarrito,
    etapa,
    metodoPago,
    ticketActual,
    procesando,
    erroPago,
    arcaConfig,
    iniciarPago,
    seleccionarMetodoPago,
    volverAlCarrito,
    confirmarVenta,
    cerrarTicket,
  }
}
