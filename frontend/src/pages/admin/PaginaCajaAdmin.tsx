import { BadgeDollarSign } from 'lucide-react'
import { useCaja } from '../../hooks/useCaja'
import { BuscadorProductosCaja } from '../../components/admin/caja/BuscadorProductosCaja'
import { CarritoCompra } from '../../components/admin/caja/CarritoCompra'
import { ModalMetodoPago } from '../../components/admin/caja/ModalMetodoPago'
import { ModalTicket } from '../../components/admin/caja/ModalTicket'

export function PaginaCajaAdmin() {
  const caja = useCaja()

  return (
    <>
      {/* Layout principal */}
      <section className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
        {/* Encabezado */}
        <header className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center gap-3">
            <BadgeDollarSign className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-neutral-100">Caja</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            Terminal de ventas · Buscá productos, armá el carrito y finalizá la venta.
          </p>
        </header>

        {/* Área principal: buscador + carrito */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Buscador — columna izquierda */}
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

          {/* Carrito — columna derecha */}
          <div className="w-80 xl:w-96 shrink-0 min-h-0 flex flex-col">
            <CarritoCompra
              items={caja.items}
              totalItems={caja.totalItems}
              onCambiarCantidad={caja.cambiarCantidad}
              onQuitarItem={caja.quitarDelCarrito}
              onVaciar={caja.vaciarCarrito}
              onFinalizarCompra={caja.iniciarPago}
            />
          </div>
        </div>
      </section>

      {/* Modales (montados fuera del layout para z-index correcto) */}
      {caja.etapa === 'pago' && (
        <ModalMetodoPago
          metodoPago={caja.metodoPago}
          procesando={caja.procesando}
          erroPago={caja.erroPago}
          calcularTotal={caja.calcularTotal}
          onSeleccionarMetodo={caja.seleccionarMetodoPago}
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
