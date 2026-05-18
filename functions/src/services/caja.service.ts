import {cajaRepository} from "../repositories/caja.repository";
import type {ProductoCajaData} from "../repositories/caja.repository";
import type {BuscarProductosDTO, FinalizarVentaDTO} from "../dtos/caja.dto";
import type {MetodoPago, LineaVenta} from "../models/caja.model";

export type LineaTicket = Omit<LineaVenta, "productoId">;

export interface TicketRespuesta {
  numero: string;
  fecha: string;
  metodoPago: MetodoPago;
  lineas: LineaTicket[];
  total: number;
  cliente?: {nombre: string; telefono: string};
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
      dto.metodoPago,
      dto.cliente,
      vendedorId
    );

    const ticket: TicketRespuesta = {
      numero: venta.numero,
      fecha: venta.fecha,
      metodoPago: venta.metodoPago,
      lineas: venta.items.map(({productoId: _pid, ...linea}) => linea),
      total: venta.total,
      cliente: venta.cliente,
    };

    return {ticket};
    // futuro ARCA: si dto.tipoComprobante !== "ticket", llamar a arcaService.autorizarComprobante()
  },
};
