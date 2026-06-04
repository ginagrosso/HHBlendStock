import {Timestamp} from "firebase-admin/firestore";
import {arcaConfig} from "../arca/config";
import {wsfeService} from "../arca/wsfe.service";
import {facturacionRepository} from "../repositories/facturacion.repository";
import {AppError} from "../middleware/error.middleware";
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

  async emitirNotaCredito(
    facturaId: string
  ): Promise<{factura: FacturaRespuesta; qrUrl: string}> {
    const NC_TIPOS: Record<number, number> = {1: 3, 6: 8, 11: 13};
    const original = await facturacionRepository.obtenerPorId(facturaId);

    const ncTipo = NC_TIPOS[original.cbteTipo];
    if (!ncTipo) {
      throw new AppError(400, `No se puede anular un comprobante de tipo ${original.cbteTipo}`);
    }

    const {puntoVenta: ptoVta, cuit} = arcaConfig;
    const ultimoNro = await wsfeService.getUltimoNroComprobante(ptoVta, ncTipo);
    const nroComprobante = ultimoNro + 1;

    const fechaOrig = original.fecha.toDate();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fechaOrigStr = `${fechaOrig.getFullYear()}${pad(fechaOrig.getMonth() + 1)}${pad(fechaOrig.getDate())}`;

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

    const caeResult = await wsfeService.solicitarCAE({
      ptoVta,
      cbteTipo: ncTipo,
      nroComprobante,
      concepto: 1,
      docTipo: original.docTipo,
      docNro: original.docNro,
      fecha: hoyStr,
      importeTotal: original.total,
      items: [],
      cbteAsoc: {
        tipo: original.cbteTipo,
        ptoVta: original.ptoVta,
        nro: original.nroComprobante,
        cuit,
        fecha: fechaOrigStr,
      },
    });

    const factura = await facturacionRepository.guardar({
      ventaId: `nc_${facturaId}`,
      nroComprobante,
      ptoVta,
      cbteTipo: ncTipo,
      cuit,
      docTipo: original.docTipo,
      docNro: original.docNro,
      fecha: Timestamp.now(),
      total: original.total,
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
