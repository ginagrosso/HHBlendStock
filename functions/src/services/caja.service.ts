import {cajaRepository} from "../repositories/caja.repository";
import type {ProductoCajaData} from "../repositories/caja.repository";
import type {BuscarProductosDTO, FinalizarVentaDTO} from "../dtos/caja.dto";
import type {PagoSplit, LineaVenta} from "../models/caja.model";
import {facturacionService} from "./facturacion.service";
import {arcaConfig} from "../arca/config";

export type LineaTicket = Omit<LineaVenta, "productoId">;

export interface ArcaFacturaTicket {
  cae: string;
  caeFchVto: string;
  nroComprobante: number;
  ptoVta: number;
  cbteTipo: number;
  qrUrl: string;
}

export interface TicketRespuesta {
  numero: string;
  fecha: string;
  pagos: PagoSplit[];
  lineas: LineaTicket[];
  total: number;
  cliente?: {nombre: string; telefono?: string};
  arcaFactura?: ArcaFacturaTicket;
  arcaError?: string;
}

export const cajaService = {
  async buscarProductos(dto: BuscarProductosDTO): Promise<ProductoCajaData[]> {
    return cajaRepository.buscarProductos(dto.q);
  },

  async finalizarVenta(
    dto: FinalizarVentaDTO,
    vendedorId: string
  ): Promise<{ticket: TicketRespuesta}> {
    const venta = await cajaRepository.crearVenta(
      dto.items,
      dto.pagos,
      dto.cliente,
      vendedorId
    );

    const ticket: TicketRespuesta = {
      numero: venta.numero,
      fecha: venta.fecha,
      pagos: venta.pagos,
      lineas: venta.items.map(({productoId: _pid, ...linea}) => linea),
      total: venta.total,
      cliente: venta.cliente,
    };

    // Solo se factura el monto pagado con medios electrónicos (tarjeta + transferencia).
    // El efectivo nunca se incluye en el comprobante ARCA.
    const montoFacturable = dto.pagos
      .filter((p) => p.metodo !== "efectivo")
      .reduce((acc, p) => acc + p.monto, 0);

    if (arcaConfig.habilitada && dto.facturarEnArca !== false && montoFacturable > 0) {
      try {
        const fecha = new Date().toISOString().slice(0, 10);
        const docTipo = dto.docReceptor?.tipo ?? 99;
        const docNro = dto.docReceptor?.nro ?? 0;
        // CUIT (80) → Factura A (RI→RI); cualquier otro → tipo configurado en servidor (Factura B o C)
        const cbteTipo = docTipo === 80 ? 1 : undefined;
        const {factura, qrUrl} = await facturacionService.emitirFactura({
          ventaId: venta.id,
          total: montoFacturable,
          docTipo,
          docNro,
          cbteTipo,
          concepto: 1,
          fecha,
          items: venta.items.map((l) => ({
            descripcion: l.descripcion,
            cantidad: l.cantidad,
            precioUnitario: l.precioUnitario,
          })),
        });
        ticket.arcaFactura = {
          cae: factura.cae,
          caeFchVto: factura.caeFchVto,
          nroComprobante: factura.nroComprobante,
          ptoVta: factura.ptoVta,
          cbteTipo: factura.cbteTipo,
          qrUrl,
        };
      } catch (err) {
        // La venta ya fue registrada; no la cancelamos por un fallo de ARCA.
        // El operador puede re-emitir desde el historial de facturación.
        const msg = err instanceof Error ? err.message : "Error desconocido en ARCA";
        console.error(`[ARCA] Falló la emisión para venta ${venta.id}: ${msg}`);
        ticket.arcaError = msg;
      }
    }

    return {ticket};
  },
};
