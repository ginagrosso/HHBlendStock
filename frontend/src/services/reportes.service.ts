import {apiFetch} from "../lib/api";
import type {
  IResumenReportesRequest,
  IResumenReportesResponse,
  IHistorialVentasRequest,
  IHistorialVentasResponse,
  IMasVendidosRequest,
  IMasVendidosResponse,
  IResumenDiarioRequest,
  IResumenDiarioResponse,
} from "../types/reportes.types";

export interface IReportesService {
  obtenerResumen(req: IResumenReportesRequest): Promise<IResumenReportesResponse>
  obtenerHistorial(req: IHistorialVentasRequest): Promise<IHistorialVentasResponse>
  obtenerMasVendidos(req: IMasVendidosRequest): Promise<IMasVendidosResponse>
  obtenerResumenDiario(req: IResumenDiarioRequest): Promise<IResumenDiarioResponse>
}

export const reportesService: IReportesService = {
  obtenerResumen({mes, anio}) {
    return apiFetch<IResumenReportesResponse>(`/reportes/resumen?mes=${mes}&anio=${anio}`);
  },

  obtenerHistorial({mes, anio, pagina, porPagina}) {
    return apiFetch<IHistorialVentasResponse>(
      `/reportes/historial?mes=${mes}&anio=${anio}&pagina=${pagina}&porPagina=${porPagina}`,
    );
  },

  obtenerMasVendidos({periodo, mes, anio, limite = 5}) {
    const params = new URLSearchParams({periodo, limite: String(limite)});
    if (mes !== undefined) params.set("mes", String(mes));
    if (anio !== undefined) params.set("anio", String(anio));
    return apiFetch<IMasVendidosResponse>(`/reportes/mas-vendidos?${params.toString()}`);
  },

  obtenerResumenDiario({mes, anio}) {
    return apiFetch<IResumenDiarioResponse>(`/reportes/resumen-diario?mes=${mes}&anio=${anio}`);
  },
};
