import {Timestamp} from "firebase-admin/firestore";
import {arcaConfig} from "../arca/config";
import {wsfeService} from "../arca/wsfe.service";
import {facturacionRepository} from "../repositories/facturacion.repository";
import type {EmitirFacturaDTO} from "../dtos/facturacion.dto";
import type {ArcaConfig, FacturaRespuesta} from "../models/facturacion.model";

export const facturacionService = {
  async emitirFactura(
    dto: EmitirFacturaDTO
  ): Promise<{factura: FacturaRespuesta; qrUrl: string}> {
    const {puntoVenta: ptoVta, cbteTipo, cuit} = arcaConfig;

    const ultimoNro = await wsfeService.getUltimoNroComprobante(ptoVta, cbteTipo);
    const nroComprobante = ultimoNro + 1;

    const caeResult = await wsfeService.solicitarCAE({
      ptoVta,
      cbteTipo,
      nroComprobante,
      concepto: dto.concepto,
      docTipo: dto.docTipo,
      docNro: dto.docNro,
      fecha: dto.fecha,
      importeTotal: dto.total,
      items: dto.items,
    });

    const factura = await facturacionRepository.guardar({
      ventaId: dto.ventaId,
      nroComprobante,
      ptoVta,
      cbteTipo,
      cuit,
      docTipo: dto.docTipo,
      docNro: dto.docNro,
      fecha: Timestamp.now(),
      total: dto.total,
      cae: caeResult.cae,
      caeFchVto: caeResult.caeFchVto,
      estado: "emitida",
    });

    return {factura, qrUrl: caeResult.qrUrl};
  },

  async listarRecientes(limite?: number): Promise<{facturas: FacturaRespuesta[]}> {
    const facturas = await facturacionRepository.listarRecientes(limite);
    return {facturas};
  },

  async leerConfig(): Promise<ArcaConfig> {
    return facturacionRepository.leerConfig();
  },

  async actualizarConfig(config: ArcaConfig): Promise<ArcaConfig> {
    return facturacionRepository.actualizarConfig(config);
  },
};
