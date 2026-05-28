import {Router} from "express";
import {autenticarAdmin} from "../middleware/auth.middleware";
import {obtenerMes, obtenerHistorico} from "../controllers/reportes.controller";

export const reportesRouter = Router();

reportesRouter.get("/mes", autenticarAdmin, obtenerMes);
reportesRouter.get("/historico", autenticarAdmin, obtenerHistorico);
