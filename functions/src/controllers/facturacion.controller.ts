import type {Request, Response, NextFunction} from "express";
import {facturacionService} from "../services/facturacion.service";
import {schemaActualizarConfig} from "../schemas/facturacion.schema";
import {getCertificate} from "../arca/cert.helper";

export const emitirNotaCredito = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {facturaId} = req.params;
    const resultado = await facturacionService.emitirNotaCredito(facturaId);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const listarFacturas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite as string, 10) : undefined;
    const resultado = await facturacionService.listarRecientes(limite);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const getConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await facturacionService.leerConfig();

    let certVencimiento: string | null = null;
    try {
      const cert = getCertificate();
      certVencimiento = cert.validity.notAfter.toISOString();
    } catch {
      // Cert no configurado o ARCA deshabilitada — no es error
    }

    res.json({...config, certVencimiento});
  } catch (err) {
    next(err);
  }
};

export const updateConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = schemaActualizarConfig.parse(req.body);
    const config = await facturacionService.actualizarConfig(data);
    res.json(config);
  } catch (err) {
    next(err);
  }
};
