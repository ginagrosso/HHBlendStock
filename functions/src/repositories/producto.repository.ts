import {FieldValue} from "firebase-admin/firestore";
import type {DocumentData, Query} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import type {Producto, ProductoRespuesta} from "../models/producto.model";
import type {FiltrosProductoDTO} from "../dtos/producto.dto";

function serializar(data: Producto): ProductoRespuesta {
  return {
    id: data.id,
    articuloId: data.articuloId,
    nombre: data.nombre,
    marca: data.marca,
    articulo: data.articulo,
    categoria: data.categoria,
    talle: data.talle,
    stock: data.stock,
    precioEfectivo: data.precioEfectivo,
    precioTarjeta: data.precioTarjeta,
    imagenUrl: data.imagenUrl,
    creadoEn: data.creadoEn.toDate().toISOString(),
    actualizadoEn: data.actualizadoEn.toDate().toISOString(),
  };
}

export const productoRepository = {
  async listar(filtros: FiltrosProductoDTO): Promise<ProductoRespuesta[]> {
    let query: Query = db.collection("productos");

    if (filtros.categoria) {
      query = query.where("categoria", "==", filtros.categoria);
    }
    if (filtros.marca) {
      query = query.where("marca", "==", filtros.marca);
    }
    if (filtros.sinStock === "true") {
      query = query.where("stock", "==", 0);
    }

    const snapshot = await query.get();
    let resultados = snapshot.docs.map((doc) => serializar(doc.data() as Producto));

    if (filtros.q) {
      const busqueda = filtros.q.toLowerCase();
      resultados = resultados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda) ||
          p.marca.toLowerCase().includes(busqueda) ||
          p.articulo.toLowerCase().includes(busqueda)
      );
    }

    return resultados;
  },

  async getById(id: string): Promise<ProductoRespuesta | null> {
    const doc = await db.collection("productos").doc(id).get();
    if (!doc.exists) return null;
    return serializar(doc.data() as Producto);
  },

  async crear(producto: Producto): Promise<ProductoRespuesta> {
    await db.collection("productos").doc(producto.id).set(producto);
    return serializar(producto);
  },

  async actualizar(
    id: string,
    campos: Partial<Omit<Producto, "id" | "articuloId" | "creadoEn" | "actualizadoEn">>
  ): Promise<ProductoRespuesta | null> {
    const ref = db.collection("productos").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const actualizacion: DocumentData = {...campos, actualizadoEn: FieldValue.serverTimestamp()};
    await ref.update(actualizacion);

    const actualizado = await ref.get();
    return serializar(actualizado.data() as Producto);
  },

  async eliminar(id: string): Promise<boolean> {
    const ref = db.collection("productos").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  async batchUpsert(productos: Producto[]): Promise<number> {
    const coleccion = db.collection("productos");
    const CHUNK_SIZE = 500;
    let total = 0;

    for (let i = 0; i < productos.length; i += CHUNK_SIZE) {
      const chunk = productos.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();
      for (const producto of chunk) {
        const ref = coleccion.doc(producto.id);
        batch.set(ref, producto, {merge: true});
      }
      await batch.commit();
      total += chunk.length;
    }

    return total;
  },

  async updatePreciosBatch(
    categoria: string | null,
    factorEfectivo: number,
    factorTarjeta: number
  ): Promise<number> {
    let query: Query = db.collection("productos");
    if (categoria !== null) {
      query = query.where("categoria", "==", categoria);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return 0;

    const CHUNK_SIZE = 500;
    const docs = snapshot.docs;
    let total = 0;

    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();
      for (const doc of chunk) {
        const data = doc.data() as Producto;
        batch.update(doc.ref, {
          precioEfectivo: Math.round(data.precioEfectivo * factorEfectivo),
          precioTarjeta: Math.round(data.precioTarjeta * factorTarjeta),
          actualizadoEn: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      total += chunk.length;
    }

    return total;
  },
};
