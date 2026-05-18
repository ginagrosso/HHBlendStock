import {FieldValue, Timestamp} from "firebase-admin/firestore";
import type {DocumentData, Query} from "firebase-admin/firestore";
import {db} from "../config/firebase";
import type {Ficha, FichaRespuesta, Variante} from "../models/producto.model";
import type {FiltrosProductoDTO, ProductoPlanoDTO} from "../dtos/producto.dto";

export function normalizarSegmento(texto: string): string {
  return texto.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function crearFichaId(marca: string, articulo: string): string {
  return `${normalizarSegmento(marca)}-${normalizarSegmento(articulo)}`;
}

function serializar(data: Ficha): FichaRespuesta {
  return {
    id: data.id,
    nombre: data.nombre,
    marca: data.marca,
    articulo: data.articulo,
    categoria: data.categoria,
    imagenUrl: data.imagenUrl,
    variantes: data.variantes,
    creadoEn: data.creadoEn.toDate().toISOString(),
    actualizadoEn: data.actualizadoEn.toDate().toISOString(),
  };
}

export const productoRepository = {
  async listar(filtros: FiltrosProductoDTO): Promise<FichaRespuesta[]> {
    let query: Query = db.collection("productos");

    if (filtros.categoria) query = query.where("categoria", "==", filtros.categoria);
    if (filtros.marca) query = query.where("marca", "==", filtros.marca);

    const snapshot = await query.get();
    let resultados = snapshot.docs.map((doc) => serializar(doc.data() as Ficha));

    if (filtros.q) {
      const busqueda = filtros.q.toLowerCase();
      resultados = resultados.filter(
        (f) =>
          f.nombre.toLowerCase().includes(busqueda) ||
          f.marca.toLowerCase().includes(busqueda) ||
          f.articulo.toLowerCase().includes(busqueda)
      );
    }

    if (filtros.sinStock === "true") {
      resultados = resultados.filter((f) => f.variantes.every((v) => v.stock === 0));
    }

    return resultados;
  },

  async getById(id: string): Promise<FichaRespuesta | null> {
    const doc = await db.collection("productos").doc(id).get();
    if (!doc.exists) return null;
    return serializar(doc.data() as Ficha);
  },

  async crear(ficha: Ficha): Promise<FichaRespuesta> {
    await db.collection("productos").doc(ficha.id).set(ficha);
    return serializar(ficha);
  },

  async actualizar(
    id: string,
    campos: Partial<Omit<Ficha, "id" | "creadoEn" | "actualizadoEn">>
  ): Promise<FichaRespuesta | null> {
    const ref = db.collection("productos").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const actualizacion: DocumentData = {...campos, actualizadoEn: FieldValue.serverTimestamp()};
    await ref.update(actualizacion);

    const actualizado = await ref.get();
    return serializar(actualizado.data() as Ficha);
  },

  async eliminar(id: string): Promise<boolean> {
    const ref = db.collection("productos").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  async batchUpsert(productosPlanos: ProductoPlanoDTO[]): Promise<number> {
    const ahora = Timestamp.now();

    // Agrupar por fichaId; dentro de cada grupo, deduplicar variantes por talle (último gana)
    const fichasMap = new Map<string, {base: ProductoPlanoDTO; variantes: Map<string, Variante>}>();
    for (const p of productosPlanos) {
      const fichaId = crearFichaId(p.marca, p.articulo);
      let entry = fichasMap.get(fichaId);
      if (!entry) {
        entry = {base: p, variantes: new Map()};
        fichasMap.set(fichaId, entry);
      }
      entry.variantes.set(normalizarSegmento(p.talle), {
        talle: p.talle,
        stock: p.stock,
        precioEfectivo: p.precioEfectivo,
        precioTarjeta: p.precioTarjeta,
      });
    }

    const fichas: Ficha[] = Array.from(fichasMap.entries()).map(([fichaId, {base, variantes}]) => ({
      id: fichaId,
      nombre: base.nombre,
      marca: base.marca,
      articulo: base.articulo,
      categoria: base.categoria,
      imagenUrl: base.imagenUrl ?? null,
      variantes: Array.from(variantes.values()),
      creadoEn: ahora,
      actualizadoEn: ahora,
    }));

    const coleccion = db.collection("productos");
    const CHUNK_SIZE = 500;
    let total = 0;

    for (let i = 0; i < fichas.length; i += CHUNK_SIZE) {
      const chunk = fichas.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();
      for (const ficha of chunk) {
        const ref = coleccion.doc(ficha.id);
        // merge: true preserva creadoEn si la ficha ya existe
        batch.set(ref, ficha, {merge: true});
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
    if (categoria !== null) query = query.where("categoria", "==", categoria);

    const snapshot = await query.get();
    if (snapshot.empty) return 0;

    const CHUNK_SIZE = 500;
    const docs = snapshot.docs;
    let total = 0;

    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();
      for (const doc of chunk) {
        const ficha = doc.data() as Ficha;
        const variantes = ficha.variantes.map((v) => ({
          ...v,
          precioEfectivo: Math.round(v.precioEfectivo * factorEfectivo),
          precioTarjeta: Math.round(v.precioTarjeta * factorTarjeta),
        }));
        batch.update(doc.ref, {variantes, actualizadoEn: FieldValue.serverTimestamp()});
      }
      await batch.commit();
      total += chunk.length;
    }

    return total;
  },
};
