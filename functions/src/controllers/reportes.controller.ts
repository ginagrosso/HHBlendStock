import type {Request, Response, NextFunction} from "express";
import {reportesService} from "../services/reportes.service";
import {schemaMes, schemaHistorico} from "../schemas/reportes.schema";

export const obtenerMes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaMes.parse(req.query);
    const resultado = await reportesService.obtenerMes(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const obtenerHistorico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaHistorico.parse(req.query);
    const resultado = await reportesService.obtenerHistorico(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};
