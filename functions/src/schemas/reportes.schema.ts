import {z} from "zod";

export const schemaMes = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2020),
});

export const schemaHistorico = z.object({
  limite: z.coerce.number().int().positive().max(50).default(10),
});
