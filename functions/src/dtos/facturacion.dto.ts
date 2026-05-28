import type {z} from "zod";
import type {schemaEmitirFactura} from "../schemas/facturacion.schema";

export type EmitirFacturaDTO = z.infer<typeof schemaEmitirFactura>;
