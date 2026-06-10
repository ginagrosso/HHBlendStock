import {z} from "zod";

const schemaItem = z.object({
  descripcion: z.string().min(1, "descripcion requerida"),
  cantidad: z.number().int().positive("cantidad debe ser mayor a 0"),
  precioUnitario: z.number().positive("precioUnitario debe ser mayor a 0"),
});

export const schemaEmitirFactura = z.object({
  ventaId: z.string().min(1, "ventaId es requerido"),
  total: z.number().positive("total debe ser mayor a 0"),
  /** 99 = Consumidor Final (default). 96 = DNI. 80 = CUIT */
  docTipo: z.number().int().default(99),
  /** 0 para Consumidor Final */
  docNro: z.number().int().nonnegative().default(0),
  /** 1 = Productos (default), 2 = Servicios, 3 = Productos y Servicios */
  concepto: z.number().int().min(1).max(3).default(1),
  /** YYYY-MM-DD */
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "fecha debe tener formato YYYY-MM-DD"),
  items: z.array(schemaItem).min(1, "items no puede estar vacío"),
  /** 1 = Factura A, 6 = Factura B, 11 = Factura C. Omitir para usar el tipo configurado en servidor. */
  cbteTipo: z.union([z.literal(1), z.literal(6), z.literal(11)]).optional(),
});

export const schemaActualizarConfig = z.object({
  montoMaximoAnonimo: z.number().positive("El monto debe ser mayor a 0"),
});
