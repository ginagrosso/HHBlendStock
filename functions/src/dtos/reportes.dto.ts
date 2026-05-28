import type {z} from "zod";
import type {schemaMes, schemaHistorico} from "../schemas/reportes.schema";

export type MesDTO = z.infer<typeof schemaMes>;
export type HistoricoDTO = z.infer<typeof schemaHistorico>;
