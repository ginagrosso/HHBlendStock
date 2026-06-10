import {reportesRepository, OFFSET_ARG_MS} from "../repositories/reportes.repository";
import type {
  VentaReportes,
  ProductoMasVendido,
  ResumenDiario,
  DesgloseMedioPago,
  ResumenReportes,
} from "../models/reportes.model";
import type {MesDTO, HistoricoDTO} from "../dtos/reportes.dto";

function fechaArgentina(isoUtc: string): string {
  const ms = new Date(isoUtc).getTime() - OFFSET_ARG_MS;
  const d = new Date(ms);
  const anio = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function hoyArgentina(): string {
  const ms = Date.now() - OFFSET_ARG_MS;
  const d = new Date(ms);
  const anio = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export const reportesService = {
  async obtenerMes({mes, anio}: MesDTO): Promise<{
    resumen: ResumenReportes;
    historial: VentaReportes[];
    masVendidosMes: ProductoMasVendido[];
    resumenDiario: ResumenDiario[];
  }> {
    const ventas = await reportesRepository.obtenerVentasPorMes(mes, anio);
    const hoyStr = hoyArgentina();
    const ventasHoy = ventas.filter((v) => fechaArgentina(v.fecha) === hoyStr);

    // KPIs
    const desglose: DesgloseMedioPago = {efectivo: 0, tarjeta: 0, transferencia: 0};
    for (const v of ventas) {
      for (const pago of v.pagos) desglose[pago.metodo] += pago.monto;
    }
    const resumen: ResumenReportes = {
      ventasHoy: ventasHoy.reduce((s, v) => s + v.total, 0),
      cantidadVentasHoy: ventasHoy.length,
      prendasHoy: ventasHoy.reduce((s, v) => s + v.items.reduce((si, i) => si + i.cantidad, 0), 0),
      ventasMes: ventas.reduce((s, v) => s + v.total, 0),
      cantidadVentasMes: ventas.length,
      prendasMes: ventas.reduce((s, v) => s + v.items.reduce((si, i) => si + i.cantidad, 0), 0),
      desgloseMes: desglose,
    };

    // Historial ordenado desc — frontend pagina en cliente
    const historial = [...ventas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Más vendidos del mes
    const mapa = new Map<string, ProductoMasVendido>();
    for (const venta of ventas) {
      for (const item of venta.items) {
        const clave = `${item.articulo}|${item.talle}`;
        const actual = mapa.get(clave);
        if (actual) {
          actual.totalUnidades += item.cantidad;
          actual.totalIngresos += item.subtotal;
        } else {
          mapa.set(clave, {
            productoId: item.productoId,
            nombre: item.nombre,
            talle: item.talle,
            marca: item.marca ?? "",
            categoria: item.categoria ?? "",
            totalUnidades: item.cantidad,
            totalIngresos: item.subtotal,
            porcentaje: 0,
          });
        }
      }
    }
    const listaMes = Array.from(mapa.values()).sort((a, b) => b.totalUnidades - a.totalUnidades);
    const maxMes = listaMes[0]?.totalUnidades ?? 1;
    for (const p of listaMes) p.porcentaje = Math.round((p.totalUnidades / maxMes) * 100);
    const masVendidosMes = listaMes.slice(0, 10);

    // Resumen diario
    const porDia = new Map<string, ResumenDiario>();
    for (const v of ventas) {
      const clave = fechaArgentina(v.fecha);
      const actual = porDia.get(clave);
      if (actual) {
        actual.totalVentas += v.total;
        actual.cantidadTransacciones += 1;
      } else {
        porDia.set(clave, {fecha: clave, totalVentas: v.total, cantidadTransacciones: 1});
      }
    }
    const resumenDiario = Array.from(porDia.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));

    return {resumen, historial, masVendidosMes, resumenDiario};
  },

  async obtenerHistorico({limite}: HistoricoDTO): Promise<{productos: ProductoMasVendido[]}> {
    const agregado = await reportesRepository.leerAgregado();
    const lista = Object.values(agregado)
      .sort((a, b) => b.totalUnidades - a.totalUnidades)
      .slice(0, limite)
      .map((e) => ({...e, porcentaje: 0}));
    const max = lista[0]?.totalUnidades ?? 1;
    for (const p of lista) p.porcentaje = Math.round((p.totalUnidades / max) * 100);
    return {productos: lista};
  },
};
