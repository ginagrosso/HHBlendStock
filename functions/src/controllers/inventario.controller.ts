import type {Request, Response, NextFunction} from "express";
import {inventarioService} from "../services/inventario.service";
import {
  schemaCrearFicha,
  schemaActualizarFicha,
  schemaFiltros,
  schemaAjustePrecios,
  schemaImportar,
} from "../schemas/producto.schema";

export const listarProductos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filtros = schemaFiltros.parse(req.query);
    const fichas = await inventarioService.listar(filtros);
    res.json(fichas);
  } catch (err) {
    next(err);
  }
};

export const obtenerProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ficha = await inventarioService.getById(req.params.id);
    res.json(ficha);
  } catch (err) {
    next(err);
  }
};

export const crearProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaCrearFicha.parse(req.body);
    const ficha = await inventarioService.crear(dto);
    res.status(201).json(ficha);
  } catch (err) {
    next(err);
  }
};

export const actualizarProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaActualizarFicha.parse(req.body);
    const ficha = await inventarioService.actualizar(req.params.id, dto);
    res.json(ficha);
  } catch (err) {
    next(err);
  }
};

export const eliminarProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await inventarioService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const ajustarPrecios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaAjustePrecios.parse(req.body);
    const resultado = await inventarioService.ajustarPrecios(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

export const importarProductos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaImportar.parse(req.body);
    const resultado = await inventarioService.importar(dto);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};
