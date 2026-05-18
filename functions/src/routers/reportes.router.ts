import {Router} from "express";
import {autenticarAdmin} from "../middleware/auth.middleware";
import {obtenerResumen, obtenerHistorial, obtenerMasVendidos, obtenerResumenDiario} from "../controllers/reportes.controller";

export const reportesRouter = Router();

reportesRouter.get("/resumen", autenticarAdmin, obtenerResumen);
reportesRouter.get("/historial", autenticarAdmin, obtenerHistorial);
reportesRouter.get("/mas-vendidos", autenticarAdmin, obtenerMasVendidos);
reportesRouter.get("/resumen-diario", autenticarAdmin, obtenerResumenDiario);
