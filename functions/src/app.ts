import express from "express";
import {corsMiddleware} from "./middleware/cors.middleware";
import {manejarError} from "./middleware/error.middleware";
import {inventarioRouter} from "./routers/inventario.router";
import {cajaRouter} from "./routers/caja.router";
import {reportesRouter} from "./routers/reportes.router";
import {facturacionRouter} from "./routers/facturacion.router";

const app = express();

app.options("*", corsMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/")) req.url = req.url.slice(4);
  next();
});

app.use("/inventario", inventarioRouter);
app.use("/caja", cajaRouter);
app.use("/reportes", reportesRouter);
app.use("/facturacion", facturacionRouter);

app.use(manejarError);

export {app};
