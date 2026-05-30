import {z} from "zod";

const schemaVariante = z.object({
  talle: z.string().min(1, "El talle es requerido"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  precioEfectivo: z.number().min(0, "El precio efectivo no puede ser negativo"),
  precioTarjeta: z.number().min(0, "El precio tarjeta no puede ser negativo"),
});

export const schemaCrearFicha = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  marca: z.string().min(1, "La marca es requerida"),
  articulo: z.string().min(1, "El artículo es requerido"),
  categoria: z.string().min(1, "La categoría es requerida"),
  imagenUrl: z.string().url().nullable().optional().default(null),
  variantes: z.array(schemaVariante).min(1, "Se requiere al menos una variante"),
});

export const schemaActualizarFicha = schemaCrearFicha.partial();

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

// Formato plano que llega desde el importador Excel (una fila = una variante)
export const schemaProductoPlano = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  marca: z.string().min(1, "La marca es requerida"),
  articulo: z.string().min(1, "El artículo es requerido"),
  categoria: z.string().min(1, "La categoría es requerida"),
  talle: z.string().min(1, "El talle es requerido"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  precioEfectivo: z.number().min(0, "El precio efectivo no puede ser negativo"),
  precioTarjeta: z.number().min(0, "El precio tarjeta no puede ser negativo"),
  imagenUrl: z.string().url().nullable().optional().default(null),
});

export const schemaImportar = z.object({
  productos: z.array(z.record(z.unknown())).min(1, "Se requiere al menos un producto"),
});
