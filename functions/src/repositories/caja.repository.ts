import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import {AppError} from "../middleware/error.middleware";
import type {LineaVenta, MetodoPago, ClienteVenta, Venta, VentaRespuesta} from "../models/caja.model";
import type {Ficha} from "../models/producto.model";
import type {AgregadoMasVendidos} from "../models/reportes.model";
import type {FinalizarVentaDTO} from "../dtos/caja.dto";
import {AGREGADO_REF, computarActualizacionAgregado} from "./reportes.repository";

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

    const resultado = await db.runTransaction(async (tx) => {
      // Fase 1: leer fichas únicas (un mismo productoId puede aparecer en varios items
      // con distintos talles — leer y escribir el mismo doc dos veces en una transacción
      // hace que el segundo tx.update sobreescriba al primero, perdiendo el primer descuento).
      const fichaIdsUnicas = [...new Set(items.map((i) => i.productoId))];
      const fichaRefsUnicas = fichaIdsUnicas.map((id) => db.collection("productos").doc(id));

      const [contadorSnap, agregadoSnap, ...fichaSnaps] = await Promise.all([
        tx.get(contadorRef),
        tx.get(AGREGADO_REF),
        ...fichaRefsUnicas.map((ref) => tx.get(ref)),
      ]);

      // Mapa fichaId → copia mutable de variantes (acumula todos los descuentos del carrito)
      type FichaEnProceso = {ref: FirebaseFirestore.DocumentReference; ficha: Ficha; variantes: Ficha["variantes"]};
      const fichasEnProceso = new Map<string, FichaEnProceso>();
      fichaIdsUnicas.forEach((id, i) => {
        if (!fichaSnaps[i].exists) throw new AppError(404, `Producto ${id} no encontrado`);
        const ficha = fichaSnaps[i].data()! as Ficha;
        fichasEnProceso.set(id, {
          ref: fichaRefsUnicas[i],
          ficha,
          variantes: ficha.variantes.map((v) => ({...v})),
        });
      });

      // Fase 2: validar stock y acumular descuentos en la copia mutable
      const lineas: LineaVenta[] = [];

      for (const item of items) {
        const enProceso = fichasEnProceso.get(item.productoId)!;
        const varianteIndex = enProceso.variantes.findIndex((v) => v.talle === item.talle);

        if (varianteIndex === -1) {
          throw new AppError(404, `Talle "${item.talle}" no encontrado en ${enProceso.ficha.nombre}`);
        }

        const variante = enProceso.variantes[varianteIndex];
        if (variante.stock < item.cantidad) {
          throw new AppError(409, `Stock insuficiente para "${enProceso.ficha.nombre}" talle ${item.talle}`);
        }

        enProceso.variantes[varianteIndex] = {...variante, stock: variante.stock - item.cantidad};

        lineas.push({
          productoId: enProceso.ficha.id,
          descripcion: enProceso.ficha.nombre,
          articulo: item.articulo,
          talle: item.talle,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.precioUnitario * item.cantidad,
          marca: enProceso.ficha.marca,
          categoria: enProceso.ficha.categoria,
        });
      }

      // Fase 3: generar número de ticket
      const ultimo = (contadorSnap.data()?.ultimo as number | undefined) ?? 0;
      const nuevo = ultimo + 1;
      const numero = `TKT-${String(nuevo).padStart(5, "0")}`;

      // Fase 4: calcular total
      const total = lineas.reduce((acc, l) => acc + l.subtotal, 0);

      // Fase 5: escribir todo atómicamente — una escritura por ficha única
      tx.set(contadorRef, {ultimo: nuevo}, {merge: true});

      for (const {ref, variantes} of fichasEnProceso.values()) {
        tx.update(ref, {variantes, actualizadoEn: FieldValue.serverTimestamp()});
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

      // Solo actualizar si ya existe: si no existe, leerAgregado() lo inicializa
      // desde el historial completo en la próxima consulta de reportes.
      if (agregadoSnap.exists) {
        const agregadoActual = agregadoSnap.data() as AgregadoMasVendidos;
        tx.set(AGREGADO_REF, computarActualizacionAgregado(agregadoActual, lineas));
      }

      return venta;
    });

    return serializarVenta(resultado);
  },
};
