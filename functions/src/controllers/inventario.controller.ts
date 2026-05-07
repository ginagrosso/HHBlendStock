import type {Request, Response, NextFunction} from "express";
import {inventarioService} from "../services/inventario.service";
import {
  schemaCrearProducto,
  schemaActualizarProducto,
  schemaFiltros,
  schemaAjustePrecios,
  schemaImportar,
} from "../schemas/producto.schema";

export const listarProductos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filtros = schemaFiltros.parse(req.query);
    const productos = await inventarioService.listar(filtros);
    res.json(productos);
  } catch (err) {
    next(err);
  }
};

export const obtenerProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const producto = await inventarioService.getById(req.params.id);
    res.json(producto);
  } catch (err) {
    next(err);
  }
};

export const crearProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaCrearProducto.parse(req.body);
    const producto = await inventarioService.crear(dto);
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
};

export const actualizarProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = schemaActualizarProducto.parse(req.body);
    const producto = await inventarioService.actualizar(req.params.id, dto);
    res.json(producto);
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
