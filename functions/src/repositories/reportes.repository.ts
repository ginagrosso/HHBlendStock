import {Timestamp} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import type {LineaVenta, MetodoPago} from "../models/caja.model";
import type {
  ItemVentaReportes,
  VentaReportes,
  AgregadoMasVendidos,
  EntradaAgregadoMasVendidos,
} from "../models/reportes.model";

// UTC-3 en milisegundos — Argentina no usa horario de verano
export const OFFSET_ARG_MS = 3 * 60 * 60 * 1000;

export const AGREGADO_REF = db.collection("analytics").doc("masVendidos");

// ─── Helpers de serialización ─────────────────────────────────────────────────

function rangoMes(mes: number, anio: number): {inicio: Timestamp; fin: Timestamp} {
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

// ─── Agregado: cálculo puro (sin I/O) ────────────────────────────────────────

/**
 * Acumula las líneas de una venta sobre el agregado existente.
 * Función pura: no accede a Firestore, puede llamarse dentro o fuera de transacciones.
 */
export function computarActualizacionAgregado(
  actual: AgregadoMasVendidos,
  lineas: LineaVenta[]
): AgregadoMasVendidos {
  const resultado: AgregadoMasVendidos = {...actual};
  for (const linea of lineas) {
    const clave = `${linea.articulo}|${linea.talle}`;
    const entrada = resultado[clave];
    if (entrada) {
      resultado[clave] = {
        ...entrada,
        totalUnidades: entrada.totalUnidades + linea.cantidad,
        totalIngresos: entrada.totalIngresos + linea.subtotal,
      };
    } else {
      resultado[clave] = {
        productoId: linea.productoId,
        nombre: linea.descripcion,
        articulo: linea.articulo,
        talle: linea.talle,
        marca: linea.marca ?? "",
        categoria: linea.categoria ?? "",
        totalUnidades: linea.cantidad,
        totalIngresos: linea.subtotal,
      };
    }
  }
  return resultado;
}

// ─── Inicialización lazy del agregado ─────────────────────────────────────────

/**
 * Se ejecuta una sola vez: la primera vez que se lee el agregado y no existe.
 * Construye el documento desde todas las ventas históricas y lo guarda.
 * El costo (N lecturas de ventas) ocurre exactamente una vez en toda la vida del sistema.
 */
async function inicializarAgregadoDesdeHistorico(): Promise<AgregadoMasVendidos> {
  const snap = await db.collection("ventas").get();
  let agregado: AgregadoMasVendidos = {};
  for (const doc of snap.docs) {
    const lineas = doc.data().items as LineaVenta[];
    agregado = computarActualizacionAgregado(agregado, lineas);
  }
  await AGREGADO_REF.set(agregado);
  return agregado;
}

// ─── Repositorio ──────────────────────────────────────────────────────────────

export const reportesRepository = {
  async obtenerVentasPorMes(mes: number, anio: number): Promise<VentaReportes[]> {
    const {inicio, fin} = rangoMes(mes, anio);
    const snap = await db.collection("ventas")
      .where("fecha", ">=", inicio)
      .where("fecha", "<", fin)
      .get();
    return snap.docs.map(serializarVenta);
  },

  async leerAgregado(): Promise<AgregadoMasVendidos> {
    const snap = await AGREGADO_REF.get();
    if (snap.exists) return snap.data() as AgregadoMasVendidos;
    return inicializarAgregadoDesdeHistorico();
  },
};

export type {EntradaAgregadoMasVendidos};
