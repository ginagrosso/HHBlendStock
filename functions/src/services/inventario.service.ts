import {Timestamp} from "firebase-admin/firestore";
import {productoRepository} from "../repositories/producto.repository";
import {AppError} from "../middleware/error.middleware";
import {schemaCrearProducto} from "../schemas/producto.schema";
import type {Producto, ProductoRespuesta} from "../models/producto.model";
import type {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltrosProductoDTO,
  AjustePreciosDTO,
  ImportarDTO,
  ResultadoImportacion,
} from "../dtos/producto.dto";

function normalizarTexto(texto: string): string {
  return texto.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function crearArticuloId(marca: string, articulo: string): string {
  return `${normalizarTexto(marca)}-${normalizarTexto(articulo)}`;
}

function crearProductoId(marca: string, articulo: string, talle: string): string {
  return `${crearArticuloId(marca, articulo)}-${normalizarTexto(talle)}`;
}

export const inventarioService = {
  async listar(filtros: FiltrosProductoDTO): Promise<ProductoRespuesta[]> {
    return productoRepository.listar(filtros);
  },

  async getById(id: string): Promise<ProductoRespuesta> {
    const producto = await productoRepository.getById(id);
    if (!producto) throw new AppError(404, "Producto no encontrado");
    return producto;
  },

  async crear(dto: CrearProductoDTO): Promise<ProductoRespuesta> {
    const id = crearProductoId(dto.marca, dto.articulo, dto.talle);
    const articuloId = crearArticuloId(dto.marca, dto.articulo);
    const ahora = Timestamp.now();

    return productoRepository.crear({
      id,
      articuloId,
      nombre: dto.nombre,
      marca: dto.marca,
      articulo: dto.articulo,
      categoria: dto.categoria,
      talle: dto.talle,
      stock: dto.stock,
      precioEfectivo: dto.precioEfectivo,
      precioTarjeta: dto.precioTarjeta,
      imagenUrl: dto.imagenUrl ?? null,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  },

  async actualizar(id: string, dto: ActualizarProductoDTO): Promise<ProductoRespuesta> {
    const producto = await productoRepository.actualizar(id, dto);
    if (!producto) throw new AppError(404, "Producto no encontrado");
    return producto;
  },

  async eliminar(id: string): Promise<void> {
    const eliminado = await productoRepository.eliminar(id);
    if (!eliminado) throw new AppError(404, "Producto no encontrado");
  },

  async ajustarPrecios(dto: AjustePreciosDTO): Promise<{actualizados: number}> {
    const factorEfectivo = 1 + dto.porcentajeEfectivo / 100;
    const factorTarjeta = 1 + dto.porcentajeTarjeta / 100;
    const categoria = dto.categoria === "Todas" ? null : dto.categoria;
    const actualizados = await productoRepository.updatePreciosBatch(categoria, factorEfectivo, factorTarjeta);
    return {actualizados};
  },

  async importar(dto: ImportarDTO): Promise<ResultadoImportacion> {
    const ahora = Timestamp.now();
    const validos: Producto[] = [];
    const errores: {fila: number; error: string}[] = [];

    dto.productos.forEach((item, index) => {
      const resultado = schemaCrearProducto.safeParse(item);
      if (resultado.success) {
        const d = resultado.data;
        validos.push({
          id: crearProductoId(d.marca, d.articulo, d.talle),
          articuloId: crearArticuloId(d.marca, d.articulo),
          nombre: d.nombre,
          marca: d.marca,
          articulo: d.articulo,
          categoria: d.categoria,
          talle: d.talle,
          stock: d.stock,
          precioEfectivo: d.precioEfectivo,
          precioTarjeta: d.precioTarjeta,
          imagenUrl: d.imagenUrl ?? null,
          creadoEn: ahora,
          actualizadoEn: ahora,
        });
      } else {
        errores.push({
          fila: index + 1,
          error: resultado.error.issues.map((i) => i.message).join(", "),
        });
      }
    });

    const upsertados = validos.length > 0 ? await productoRepository.batchUpsert(validos) : 0;
    return {upsertados, errores};
  },
};
