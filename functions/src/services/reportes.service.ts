import {reportesRepository, OFFSET_ARG_MS} from "../repositories/reportes.repository";
import type {
  VentaReportes,
  ProductoMasVendido,
  ResumenDiario,
  DesgloseMedioPago,
  ResumenReportes,
} from "../models/reportes.model";
import type {ResumenReportesDTO, HistorialVentasDTO, MasVendidosDTO, ResumenDiarioDTO} from "../dtos/reportes.dto";

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
  async obtenerResumen({mes, anio}: ResumenReportesDTO): Promise<{resumen: ResumenReportes}> {
    const ventasMes = await reportesRepository.obtenerVentasPorMes(mes, anio);
    const hoyStr = hoyArgentina();
    const ventasHoy = ventasMes.filter((v) => fechaArgentina(v.fecha) === hoyStr);

    const desglose: DesgloseMedioPago = {efectivo: 0, tarjeta: 0, transferencia: 0};
    for (const v of ventasMes) desglose[v.metodoPago] += v.total;

    return {
      resumen: {
        ventasHoy: ventasHoy.reduce((s, v) => s + v.total, 0),
        cantidadVentasHoy: ventasHoy.length,
        prendasHoy: ventasHoy.reduce((s, v) => s + v.items.reduce((si, i) => si + i.cantidad, 0), 0),
        ventasMes: ventasMes.reduce((s, v) => s + v.total, 0),
        cantidadVentasMes: ventasMes.length,
        prendasMes: ventasMes.reduce((s, v) => s + v.items.reduce((si, i) => si + i.cantidad, 0), 0),
        desgloseMes: desglose,
      },
    };
  },

  async obtenerHistorial({mes, anio, pagina, porPagina}: HistorialVentasDTO): Promise<{
    ventas: VentaReportes[];
    totalPaginas: number;
    totalRegistros: number;
  }> {
    const ventasMes = await reportesRepository.obtenerVentasPorMes(mes, anio);
    ventasMes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const totalRegistros = ventasMes.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / porPagina));
    const inicio = (pagina - 1) * porPagina;
    return {
      ventas: ventasMes.slice(inicio, inicio + porPagina),
      totalPaginas,
      totalRegistros,
    };
  },

  async obtenerMasVendidos({periodo, mes, anio, limite}: MasVendidosDTO): Promise<{productos: ProductoMasVendido[]}> {
    const ventas = periodo === "mes"
      ? await reportesRepository.obtenerVentasPorMes(mes!, anio!)
      : await reportesRepository.obtenerTodasLasVentas();

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

    const lista = Array.from(mapa.values())
      .sort((a, b) => b.totalUnidades - a.totalUnidades)
      .slice(0, limite);

    const maxUnidades = lista[0]?.totalUnidades ?? 1;
    for (const p of lista) p.porcentaje = Math.round((p.totalUnidades / maxUnidades) * 100);

    return {productos: lista};
  },

  async obtenerResumenDiario({mes, anio}: ResumenDiarioDTO): Promise<{dias: ResumenDiario[]}> {
    const ventasMes = await reportesRepository.obtenerVentasPorMes(mes, anio);
    const porDia = new Map<string, ResumenDiario>();

    for (const v of ventasMes) {
      const clave = fechaArgentina(v.fecha);
      const actual = porDia.get(clave);
      if (actual) {
        actual.totalVentas += v.total;
        actual.cantidadTransacciones += 1;
      } else {
        porDia.set(clave, {fecha: clave, totalVentas: v.total, cantidadTransacciones: 1});
      }
    }

    return {dias: Array.from(porDia.values()).sort((a, b) => a.fecha.localeCompare(b.fecha))};
  },
};
