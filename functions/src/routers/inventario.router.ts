import {Router} from "express";
import {autenticarAdmin} from "../middleware/auth.middleware";
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  ajustarPrecios,
  importarProductos,
} from "../controllers/inventario.controller";

export const inventarioRouter = Router();

inventarioRouter.get("/productos", autenticarAdmin, listarProductos);
inventarioRouter.get("/productos/:id", autenticarAdmin, obtenerProducto);
inventarioRouter.post("/productos", autenticarAdmin, crearProducto);
inventarioRouter.put("/productos/:id", autenticarAdmin, actualizarProducto);
inventarioRouter.delete("/productos/:id", autenticarAdmin, eliminarProducto);
inventarioRouter.put("/ajustar-precios", autenticarAdmin, ajustarPrecios);
inventarioRouter.post("/importar", autenticarAdmin, importarProductos);
