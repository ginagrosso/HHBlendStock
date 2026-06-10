import { useState } from 'react'
import { BadgeDollarSign } from 'lucide-react'
import { useCaja } from '../../hooks/useCaja'
import { BuscadorProductosCaja } from '../../components/admin/caja/BuscadorProductosCaja'
import { CarritoCompra } from '../../components/admin/caja/CarritoCompra'
import { ModalMetodoPago } from '../../components/admin/caja/ModalMetodoPago'
import { ModalTicket } from '../../components/admin/caja/ModalTicket'
import type { ProductoCaja } from '../../types/caja.types'

export function PaginaCajaAdmin() {
  const caja = useCaja()
  const [tabMobile, setTabMobile] = useState<'buscar' | 'carrito'>('buscar')

  const handleAgregarProducto = (producto: ProductoCaja) => {
    caja.agregarAlCarrito(producto)
    setTabMobile('carrito')
  }

  return (
    <>
      {/* ── MOBILE ─────────────────────────────────────────────────────── */}
      <section className="md:hidden flex flex-col gap-3 flex-1 min-h-0">
        <header className="shrink-0 flex items-center gap-3">
          <BadgeDollarSign className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-semibold text-neutral-100">Caja</h2>
        </header>

        {/* Tabs */}
        <div className="shrink-0 flex rounded-xl overflow-hidden border border-neutral-800">
          <button
            type="button"
            onClick={() => setTabMobile('buscar')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tabMobile === 'buscar'
                ? 'bg-amber-500 text-black'
                : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            Buscar productos
          </button>
          <button
            type="button"
            onClick={() => setTabMobile('carrito')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tabMobile === 'carrito'
                ? 'bg-amber-500 text-black'
                : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            Carrito{caja.totalItems > 0 ? ` (${caja.totalItems})` : ''}
          </button>
        </div>

        {/* Contenido activo */}
        <div className="flex-1 min-h-0">
          {tabMobile === 'buscar' ? (
            <BuscadorProductosCaja
              query={caja.query}
              resultados={caja.resultados}
              buscando={caja.buscando}
              onCambiarQuery={caja.setQuery}
              onLimpiar={caja.limpiarBusqueda}
              onAgregarProducto={handleAgregarProducto}
            />
          ) : (
            <CarritoCompra
              items={caja.items}
              totalItems={caja.totalItems}
              hayPreciosSinDefinir={caja.hayPreciosSinDefinir}
              onCambiarCantidad={caja.cambiarCantidad}
              onQuitarItem={caja.quitarDelCarrito}
              onVaciar={caja.vaciarCarrito}
              onFinalizarCompra={caja.iniciarPago}
              onActualizarPrecio={caja.actualizarPrecioItem}
            />
          )}
        </div>
      </section>

      {/* ── DESKTOP ────────────────────────────────────────────────────── */}
      <section className="hidden md:flex flex-col gap-6 h-[calc(100vh-3.5rem)]">
        <header className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center gap-3">
            <BadgeDollarSign className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-neutral-100">Caja</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            Terminal de ventas · Buscá productos, armá el carrito y finalizá la venta.
          </p>
        </header>

        <div className="flex gap-6 flex-1 min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <BuscadorProductosCaja
              query={caja.query}
              resultados={caja.resultados}
              buscando={caja.buscando}
              onCambiarQuery={caja.setQuery}
              onLimpiar={caja.limpiarBusqueda}
              onAgregarProducto={caja.agregarAlCarrito}
            />
          </div>
          <div className="w-80 xl:w-96 shrink-0 min-h-0 flex flex-col">
            <CarritoCompra
              items={caja.items}
              totalItems={caja.totalItems}
              hayPreciosSinDefinir={caja.hayPreciosSinDefinir}
              onCambiarCantidad={caja.cambiarCantidad}
              onQuitarItem={caja.quitarDelCarrito}
              onVaciar={caja.vaciarCarrito}
              onFinalizarCompra={caja.iniciarPago}
              onActualizarPrecio={caja.actualizarPrecioItem}
            />
          </div>
        </div>
      </section>

      {/* ── MODALES ────────────────────────────────────────────────────── */}
      {caja.etapa === 'pago' && (
        <ModalMetodoPago
          procesando={caja.procesando}
          erroPago={caja.erroPago}
          arcaConfig={caja.arcaConfig}
          calcularTotal={caja.calcularTotal}
          onVolver={caja.volverAlCarrito}
          onConfirmar={caja.confirmarVenta}
        />
      )}

      {caja.etapa === 'ticket' && caja.ticketActual && (
        <ModalTicket
          ticket={caja.ticketActual}
          onCerrar={caja.cerrarTicket}
        />
      )}
    </>
  )
}
