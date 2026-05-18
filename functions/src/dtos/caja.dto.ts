import type {z} from "zod";
import type {schemaBuscarProductos, schemaFinalizarVenta} from "../schemas/caja.schema";

export type BuscarProductosDTO = z.infer<typeof schemaBuscarProductos>;
export type FinalizarVentaDTO = z.infer<typeof schemaFinalizarVenta>;
