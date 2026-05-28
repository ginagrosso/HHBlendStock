import {db} from "../config/firebase";
import type {Factura, FacturaRespuesta, ArcaConfig} from "../models/facturacion.model";

const CONFIG_DOC = db.collection("config").doc("arca");
const CONFIG_DEFAULT: ArcaConfig = {montoMaximoAnonimo: 10_000_000};

function serializar(f: Factura): FacturaRespuesta {
  return {
    id: f.id,
    ventaId: f.ventaId,
    nroComprobante: f.nroComprobante,
    ptoVta: f.ptoVta,
    cbteTipo: f.cbteTipo,
    fecha: f.fecha.toDate().toISOString(),
    total: f.total,
    cae: f.cae,
    caeFchVto: f.caeFchVto,
    estado: f.estado,
  };
}

export const facturacionRepository = {
  async guardar(data: Omit<Factura, "id">): Promise<FacturaRespuesta> {
    const ref = db.collection("facturas").doc();
    const factura: Factura = {...data, id: ref.id};
    await ref.set(factura);
    return serializar(factura);
  },

  async listarRecientes(limite = 20): Promise<FacturaRespuesta[]> {
    const snap = await db
      .collection("facturas")
      .orderBy("fecha", "desc")
      .limit(limite)
      .get();
    return snap.docs.map((d) => serializar(d.data() as Factura));
  },

  async leerConfig(): Promise<ArcaConfig> {
    const snap = await CONFIG_DOC.get();
    if (!snap.exists) return CONFIG_DEFAULT;
    return snap.data() as ArcaConfig;
  },

  async actualizarConfig(config: ArcaConfig): Promise<ArcaConfig> {
    await CONFIG_DOC.set(config, {merge: true});
    return config;
  },
};
