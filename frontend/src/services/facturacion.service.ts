import {apiFetch} from "../lib/api";
import type {IListarFacturasResponse, Factura, ArcaConfig} from "../types/facturacion.types";

export const facturacionService = {
  async listarRecientes(limite?: number): Promise<Factura[]> {
    const qs = limite != null ? `?limite=${limite}` : "";
    const data = await apiFetch<IListarFacturasResponse>(`/facturacion${qs}`);
    return data.facturas;
  },

  async emitirNotaCredito(facturaId: string): Promise<Factura> {
    const data = await apiFetch<{factura: Factura}>(`/facturacion/nota-credito/${facturaId}`, {
      method: "POST",
    });
    return data.factura;
  },

  async getConfig(): Promise<ArcaConfig> {
    return apiFetch<ArcaConfig>("/facturacion/config");
  },

  async updateConfig(config: ArcaConfig): Promise<ArcaConfig> {
    return apiFetch<ArcaConfig>("/facturacion/config", {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(config),
    });
  },
};
