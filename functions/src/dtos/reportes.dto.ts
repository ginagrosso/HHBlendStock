import type {z} from "zod";
import type {
  schemaResumenReportes,
  schemaHistorialVentas,
  schemaMasVendidos,
  schemaResumenDiario,
} from "../schemas/reportes.schema";

export type ResumenReportesDTO = z.infer<typeof schemaResumenReportes>;
export type HistorialVentasDTO = z.infer<typeof schemaHistorialVentas>;
export type MasVendidosDTO = z.infer<typeof schemaMasVendidos>;
export type ResumenDiarioDTO = z.infer<typeof schemaResumenDiario>;
