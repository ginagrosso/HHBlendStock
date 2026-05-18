import type {z} from "zod";
import type {
  schemaCrearFicha,
  schemaActualizarFicha,
  schemaFiltros,
  schemaAjustePrecios,
  schemaImportar,
  schemaProductoPlano,
} from "../schemas/producto.schema";

export type CrearFichaDTO = z.infer<typeof schemaCrearFicha>;
export type ActualizarFichaDTO = z.infer<typeof schemaActualizarFicha>;
export type FiltrosProductoDTO = z.infer<typeof schemaFiltros>;
export type AjustePreciosDTO = z.infer<typeof schemaAjustePrecios>;
export type ImportarDTO = z.infer<typeof schemaImportar>;
export type ProductoPlanoDTO = z.infer<typeof schemaProductoPlano>;

export interface ResultadoImportacion {
  upsertados: number;
  errores: {fila: number; error: string}[];
}
