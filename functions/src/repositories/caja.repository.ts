import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import {AppError} from "../middleware/error.middleware";
import type {LineaVenta, MetodoPago, ClienteVenta, Venta, VentaRespuesta} from "../models/caja.model";
import type {Ficha} from "../models/producto.model";
import type {FinalizarVentaDTO} from "../dtos/caja.dto";

export interface ProductoCajaData {
  id: string;
  nombre: string;
  marca: string;
  articulo: string;
  categoria: string;
  talle: string;
  stock: number;
  precioEfectivo: number;
  precioTarjeta: number;
  imagenUrl: string | null;
}

function serializarVenta(venta: Venta): VentaRespuesta {
  return {
    id: venta.id,
    numero: venta.numero,
    fecha: venta.fecha.toDate().toISOString(),
    metodoPago: venta.metodoPago,
    items: venta.items,
    total: venta.total,
    cliente: venta.cliente,
    vendedorId: venta.vendedorId,
  };
}

export const cajaRepository = {
  async buscarProductos(query: string): Promise<ProductoCajaData[]> {
    const terminos = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const snapshot = await db.collection("productos").get();

    const resultados: ProductoCajaData[] = [];

    for (const doc of snapshot.docs) {
      const ficha = doc.data() as Ficha;
      const camposBase = `${ficha.nombre} ${ficha.marca} ${ficha.articulo} ${ficha.categoria}`.toLowerCase();

      for (const variante of ficha.variantes) {
        if (variante.stock <= 0) continue;

        const camposCompletos = `${camposBase} ${variante.talle}`.toLowerCase();
        if (terminos.every((t) => camposCompletos.includes(t))) {
          resultados.push({
            id: ficha.id,
            nombre: ficha.nombre,
            marca: ficha.marca,
            articulo: ficha.articulo,
            categoria: ficha.categoria,
            talle: variante.talle,
            stock: variante.stock,
            precioEfectivo: variante.precioEfectivo,
            precioTarjeta: variante.precioTarjeta,
            imagenUrl: ficha.imagenUrl,
          });
        }
      }
    }

    return resultados;
  },

  async crearVenta(
    items: FinalizarVentaDTO["items"],
    metodoPago: MetodoPago,
    cliente: ClienteVenta | undefined,
    vendedorId: string
  ): Promise<VentaRespuesta> {
    const contadorRef = db.collection("contadores").doc("ventas");
    const ventaRef = db.collection("ventas").doc();
    // productoId en el carrito = fichaId
    const fichaRefs = items.map((item) => db.collection("productos").doc(item.productoId));

    const resultado = await db.runTransaction(async (tx) => {
      // Fase 1: leer todos los documentos antes de cualquier escritura
      const [contadorSnap, ...fichaSnaps] = await Promise.all([
        tx.get(contadorRef),
        ...fichaRefs.map((ref) => tx.get(ref)),
      ]);

      // Fase 2: validar stock y construir líneas de venta
      const lineas: LineaVenta[] = [];
      const fichasActualizadas: {index: number; variantes: Ficha["variantes"]}[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const snap = fichaSnaps[i];

        if (!snap.exists) {
          throw new AppError(404, `Producto ${item.productoId} no encontrado`);
        }

        const ficha = snap.data()! as Ficha;
        const varianteIndex = ficha.variantes.findIndex((v) => v.talle === item.talle);

        if (varianteIndex === -1) {
          throw new AppError(404, `Talle "${item.talle}" no encontrado en ${ficha.nombre}`);
        }

        const variante = ficha.variantes[varianteIndex];

        if (variante.stock < item.cantidad) {
          throw new AppError(409, `Stock insuficiente para "${ficha.nombre}" talle ${item.talle}`);
        }

        const variantesActualizadas = ficha.variantes.map((v, idx) =>
          idx === varianteIndex ? {...v, stock: v.stock - item.cantidad} : v
        );
        fichasActualizadas.push({index: i, variantes: variantesActualizadas});

        lineas.push({
          productoId: ficha.id,
          descripcion: ficha.nombre,
          articulo: item.articulo,
          talle: item.talle,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.precioUnitario * item.cantidad,
          marca: ficha.marca,
          categoria: ficha.categoria,
        });
      }

      // Fase 3: generar número de ticket
      const ultimo = (contadorSnap.data()?.ultimo as number | undefined) ?? 0;
      const nuevo = ultimo + 1;
      const numero = `TKT-${String(nuevo).padStart(5, "0")}`;

      // Fase 4: calcular total
      const total = lineas.reduce((acc, l) => acc + l.subtotal, 0);

      // Fase 5: escribir todo atómicamente
      tx.set(contadorRef, {ultimo: nuevo}, {merge: true});

      for (const {index, variantes} of fichasActualizadas) {
        tx.update(fichaRefs[index], {
          variantes,
          actualizadoEn: FieldValue.serverTimestamp(),
        });
      }

      const fecha = Timestamp.now();
      const venta: Venta = {
        id: ventaRef.id,
        numero,
        fecha,
        metodoPago,
        items: lineas,
        total,
        vendedorId,
      };
      if (cliente) venta.cliente = cliente;

      tx.set(ventaRef, venta);

      return venta;
    });

    return serializarVenta(resultado);
  },
};
