import type {Request, Response, NextFunction} from "express";
import {cajaService} from "../services/caja.service";
import {schemaBuscarProductos, schemaFinalizarVenta} from "../schemas/caja.schema";

export const buscarProductos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaBuscarProductos.parse({q: req.query.q});
    const productos = await cajaService.buscarProductos(dto);
    res.json({productos});
  } catch (err) {
    next(err);
  }
};

export const finalizarVenta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaFinalizarVenta.parse(req.body);
    const vendedorId = req.usuario!.uid;
    const resultado = await cajaService.finalizarVenta(dto, vendedorId);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};
