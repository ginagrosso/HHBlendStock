import {Router} from "express";
import {autenticarAdmin} from "../middleware/auth.middleware";
import {listarFacturas, getConfig, updateConfig} from "../controllers/facturacion.controller";

export const facturacionRouter = Router();

facturacionRouter.get("/", autenticarAdmin, listarFacturas);
facturacionRouter.get("/config", autenticarAdmin, getConfig);
facturacionRouter.put("/config", autenticarAdmin, updateConfig);
