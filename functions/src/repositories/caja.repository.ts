import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import {AppError} from "../middleware/error.middleware";
import type {LineaVenta, MetodoPago, ClienteVenta, Venta, VentaRespuesta} from "../models/caja.model";
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
    const snapshot = await db.collection("productos").where("stock", ">", 0).get();

    return snapshot.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          nombre: d.nombre as string,
          marca: d.marca as string,
          articulo: d.articulo as string,
          categoria: d.categoria as string,
          talle: d.talle as string,
          stock: d.stock as number,
          precioEfectivo: d.precioEfectivo as number,
          precioTarjeta: d.precioTarjeta as number,
          imagenUrl: (d.imagenUrl as string | null) ?? null,
        };
      })
      .filter((p) => {
        const campos = `${p.nombre} ${p.marca} ${p.articulo} ${p.categoria} ${p.talle}`.toLowerCase();
        return terminos.every((t) => campos.includes(t));
      });
  },

  async crearVenta(
    items: FinalizarVentaDTO["items"],
    metodoPago: MetodoPago,
    cliente: ClienteVenta | undefined,
    vendedorId: string
  ): Promise<VentaRespuesta> {
    const contadorRef = db.collection("contadores").doc("ventas");
    const ventaRef = db.collection("ventas").doc();
    const productoRefs = items.map((item) => db.collection("productos").doc(item.productoId));

    const resultado = await db.runTransaction(async (tx) => {
      // Fase 1: leer todos los documentos antes de cualquier escritura
      const [contadorSnap, ...productoSnaps] = await Promise.all([
        tx.get(contadorRef),
        ...productoRefs.map((ref) => tx.get(ref)),
      ]);

      // Fase 2: validar stock y construir líneas de venta
      const lineas: LineaVenta[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const snap = productoSnaps[i];

        if (!snap.exists) {
          throw new AppError(404, `Producto ${item.productoId} no encontrado`);
        }

        const data = snap.data()!;
        const stockActual = data.stock as number;

        if (stockActual < item.cantidad) {
          throw new AppError(409, `Stock insuficiente para "${data.nombre as string}"`);
        }

        lineas.push({
          productoId: item.productoId,
          descripcion: data.nombre as string,
          articulo: item.articulo,
          talle: item.talle,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.precioUnitario * item.cantidad,
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

      for (let i = 0; i < items.length; i++) {
        tx.update(productoRefs[i], {
          stock: FieldValue.increment(-items[i].cantidad),
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
