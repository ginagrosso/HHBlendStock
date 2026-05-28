import {apiFetch} from "../lib/api";
import type {IReportesMesResponse, IHistoricoResponse} from "../types/reportes.types";

export interface IReportesService {
  obtenerMes(mes: number, anio: number): Promise<IReportesMesResponse>
  obtenerHistorico(limite?: number): Promise<IHistoricoResponse>
}

export const reportesService: IReportesService = {
  obtenerMes(mes, anio) {
    return apiFetch<IReportesMesResponse>(`/reportes/mes?mes=${mes}&anio=${anio}`);
  },

  obtenerHistorico(limite = 10) {
    return apiFetch<IHistoricoResponse>(`/reportes/historico?limite=${limite}`);
  },
};
