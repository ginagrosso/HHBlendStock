import express from "express";
import {corsMiddleware} from "./middleware/cors.middleware";
import {manejarError} from "./middleware/error.middleware";
import {inventarioRouter} from "./routers/inventario.router";
import {cajaRouter} from "./routers/caja.router";
import {reportesRouter} from "./routers/reportes.router";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/inventario", inventarioRouter);
app.use("/caja", cajaRouter);
app.use("/reportes", reportesRouter);

app.use(manejarError);

export {app};
