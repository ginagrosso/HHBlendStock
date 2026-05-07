import express from "express";
import {corsMiddleware} from "./middleware/cors.middleware";
import {manejarError} from "./middleware/error.middleware";
import {inventarioRouter} from "./routers/inventario.router";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/inventario", inventarioRouter);

app.use(manejarError);

export {app};
