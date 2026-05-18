import {z} from "zod";

export const schemaResumenReportes = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2020),
});

export const schemaHistorialVentas = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2020),
  pagina: z.coerce.number().int().positive().default(1),
  porPagina: z.coerce.number().int().positive().max(100).default(10),
});

export const schemaMasVendidos = z.object({
  periodo: z.enum(["historico", "mes"]),
  mes: z.coerce.number().int().min(1).max(12).optional(),
  anio: z.coerce.number().int().min(2020).optional(),
  limite: z.coerce.number().int().positive().max(50).default(5),
});

export const schemaResumenDiario = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2020),
});
