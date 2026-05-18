import {Timestamp} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import type {LineaVenta, MetodoPago} from "../models/caja.model";
import type {ItemVentaReportes, VentaReportes} from "../models/reportes.model";

// UTC-3 en milisegundos — Argentina no usa horario de verano
const OFFSET_ARG_MS = 3 * 60 * 60 * 1000;

function rangoMes(mes: number, anio: number): {inicio: Timestamp; fin: Timestamp} {
  // 00:00 hora Argentina = 03:00 UTC
  return {
    inicio: Timestamp.fromMillis(Date.UTC(anio, mes - 1, 1, 3, 0, 0, 0)),
    fin: Timestamp.fromMillis(Date.UTC(anio, mes, 1, 3, 0, 0, 0)),
  };
}

function serializarItem(item: LineaVenta): ItemVentaReportes {
  const resultado: ItemVentaReportes = {
    productoId: item.productoId,
    nombre: item.descripcion,
    articulo: item.articulo,
    talle: item.talle,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.subtotal,
  };
  if (item.marca !== undefined) resultado.marca = item.marca;
  if (item.categoria !== undefined) resultado.categoria = item.categoria;
  return resultado;
}

function serializarVenta(doc: FirebaseFirestore.QueryDocumentSnapshot): VentaReportes {
  const d = doc.data();
  const items = (d.items as LineaVenta[]).map(serializarItem);
  const numero = parseInt((d.numero as string).replace("TKT-", ""), 10);
  const cliente = d.cliente as {nombre: string; telefono: string} | undefined;

  const venta: VentaReportes = {
    id: doc.id,
    numero,
    fecha: (d.fecha as Timestamp).toDate().toISOString(),
    metodoPago: d.metodoPago as MetodoPago,
    items,
    total: d.total as number,
  };
  if (cliente) venta.cliente = cliente;
  return venta;
}

export const reportesRepository = {
  async obtenerVentasPorMes(mes: number, anio: number): Promise<VentaReportes[]> {
    const {inicio, fin} = rangoMes(mes, anio);
    const snap = await db.collection("ventas")
      .where("fecha", ">=", inicio)
      .where("fecha", "<", fin)
      .get();
    return snap.docs.map(serializarVenta);
  },

  async obtenerTodasLasVentas(): Promise<VentaReportes[]> {
    const snap = await db.collection("ventas").get();
    return snap.docs.map(serializarVenta);
  },
};

export {OFFSET_ARG_MS};
