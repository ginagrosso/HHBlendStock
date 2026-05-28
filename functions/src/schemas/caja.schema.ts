import {z} from "zod";

export const schemaBuscarProductos = z.object({
  q: z.string().min(1, "El parámetro de búsqueda es requerido"),
});

const schemaItemVenta = z.object({
  productoId: z.string().min(1, "El ID del producto es requerido"),
  articulo: z.string().min(1, "El artículo es requerido"),
  talle: z.string().min(1, "El talle es requerido"),
  cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().positive("El precio debe ser mayor a 0"),
});

const schemaCliente = z.object({
  nombre: z.string().min(1, "El nombre del cliente es requerido"),
  telefono: z.string().min(1, "El teléfono del cliente es requerido"),
});

const schemaDocReceptor = z.object({
  /** 96 = DNI, 80 = CUIT */
  tipo: z.union([z.literal(96), z.literal(80)]),
  nro: z.number().int().positive("Número de documento inválido"),
});

export const schemaFinalizarVenta = z.object({
  items: z.array(schemaItemVenta).min(1, "El carrito no puede estar vacío"),
  metodoPago: z.enum(["efectivo", "tarjeta", "transferencia"]),
  cliente: schemaCliente.optional(),
  docReceptor: schemaDocReceptor.optional(),
});
