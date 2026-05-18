import {Timestamp} from "firebase-admin/firestore";
import {productoRepository, crearFichaId} from "../repositories/producto.repository";
import {AppError} from "../middleware/error.middleware";
import {schemaProductoPlano} from "../schemas/producto.schema";
import type {FichaRespuesta} from "../models/producto.model";
import type {
  CrearFichaDTO,
  ActualizarFichaDTO,
  FiltrosProductoDTO,
  AjustePreciosDTO,
  ImportarDTO,
  ResultadoImportacion,
  ProductoPlanoDTO,
} from "../dtos/producto.dto";

export const inventarioService = {
  async listar(filtros: FiltrosProductoDTO): Promise<FichaRespuesta[]> {
    return productoRepository.listar(filtros);
  },

  async getById(id: string): Promise<FichaRespuesta> {
    const ficha = await productoRepository.getById(id);
    if (!ficha) throw new AppError(404, "Producto no encontrado");
    return ficha;
  },

  async crear(dto: CrearFichaDTO): Promise<FichaRespuesta> {
    const id = crearFichaId(dto.marca, dto.articulo);
    const ahora = Timestamp.now();
    return productoRepository.crear({
      id,
      nombre: dto.nombre,
      marca: dto.marca,
      articulo: dto.articulo,
      categoria: dto.categoria,
      imagenUrl: dto.imagenUrl ?? null,
      variantes: dto.variantes,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  },

  async actualizar(id: string, dto: ActualizarFichaDTO): Promise<FichaRespuesta> {
    const ficha = await productoRepository.actualizar(id, dto);
    if (!ficha) throw new AppError(404, "Producto no encontrado");
    return ficha;
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
    const validos: ProductoPlanoDTO[] = [];
    const errores: {fila: number; error: string}[] = [];

    dto.productos.forEach((item, index) => {
      const resultado = schemaProductoPlano.safeParse(item);
      if (resultado.success) {
        validos.push(resultado.data);
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
