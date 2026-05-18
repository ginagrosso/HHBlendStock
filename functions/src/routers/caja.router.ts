import {Router} from "express";
import {autenticarAdmin} from "../middleware/auth.middleware";
import {buscarProductos, finalizarVenta} from "../controllers/caja.controller";

export const cajaRouter = Router();

cajaRouter.get("/productos", autenticarAdmin, buscarProductos);
cajaRouter.post("/ventas", autenticarAdmin, finalizarVenta);
