import type {z} from "zod";
import type {
  schemaCrearProducto,
  schemaActualizarProducto,
  schemaFiltros,
  schemaAjustePrecios,
  schemaImportar,
} from "../schemas/producto.schema";

export type CrearProductoDTO = z.infer<typeof schemaCrearProducto>;
export type ActualizarProductoDTO = z.infer<typeof schemaActualizarProducto>;
export type FiltrosProductoDTO = z.infer<typeof schemaFiltros>;
export type AjustePreciosDTO = z.infer<typeof schemaAjustePrecios>;
export type ImportarDTO = z.infer<typeof schemaImportar>;

export interface ResultadoImportacion {
  upsertados: number;
  errores: {fila: number; error: string}[];
}
