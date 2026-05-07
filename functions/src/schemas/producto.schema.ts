import {z} from "zod";

export const schemaCrearProducto = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  marca: z.string().min(1, "La marca es requerida"),
  articulo: z.string().min(1, "El artículo es requerido"),
  categoria: z.string().min(1, "La categoría es requerida"),
  talle: z.string().min(1, "El talle es requerido"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  precioEfectivo: z.number().positive("El precio efectivo debe ser positivo"),
  precioTarjeta: z.number().positive("El precio tarjeta debe ser positivo"),
  imagenUrl: z.string().url().nullable().optional().default(null),
});

export const schemaActualizarProducto = schemaCrearProducto.partial();

export const schemaFiltros = z.object({
  categoria: z.string().optional(),
  marca: z.string().optional(),
  q: z.string().optional(),
  sinStock: z.enum(["true", "false"]).optional(),
});

export const schemaAjustePrecios = z.object({
  categoria: z.string().min(1, "La categoría es requerida"),
  porcentajeEfectivo: z.number(),
  porcentajeTarjeta: z.number(),
});

export const schemaImportar = z.object({
  productos: z.array(z.record(z.unknown())).min(1, "Se requiere al menos un producto"),
});
