import type {Request, Response, NextFunction} from "express";
import {reportesService} from "../services/reportes.service";
import {
  schemaResumenReportes,
  schemaHistorialVentas,
  schemaMasVendidos,
  schemaResumenDiario,
} from "../schemas/reportes.schema";

export const obtenerResumen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaResumenReportes.parse(req.query);
    const resultado = await reportesService.obtenerResumen(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const obtenerHistorial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaHistorialVentas.parse(req.query);
    const resultado = await reportesService.obtenerHistorial(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const obtenerMasVendidos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaMasVendidos.parse(req.query);
    const resultado = await reportesService.obtenerMasVendidos(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const obtenerResumenDiario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaResumenDiario.parse(req.query);
    const resultado = await reportesService.obtenerResumenDiario(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};
