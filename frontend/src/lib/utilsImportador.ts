export type CeldaExcel = string | number | boolean | null | undefined

// Formato plano que produce el Excel: una fila = una variante (1 producto × 1 talle)
export interface ProductoPlano {
  nombre: string
  marca: string
  articulo: string
  categoria: string
  talle: string
  stock: number
  precioEfectivo: number
  precioTarjeta: number
  imagenUrl: string | null
}

interface FilaExcelCruda {
  articulo?: string
  marca?: string
  descripcion?: string
  precioEfectivo?: number
  precioTarjeta?: number
  stockUnico?: number
  [talle: string]: CeldaExcel
}

interface ResultadoSheet {
  exitosos: ProductoPlano[]
  errores: Array<{ fila: number; mensaje: string }>
  estadisticas: { totalFilas: number; filasProcessadas: number; variantesCreadas: number; erroresEncontrados: number }
}

const INDICE_PRIMER_TALLE = 5
const FILAS_A_INSPECCIONAR = 10
const CLAVES_RESERVADAS = ['articulo', 'marca', 'descripcion', 'precioefectivo', 'preciotarjeta', 'stockunico']

function normalizarTexto(valor: unknown): string {
  return (valor ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function esCeldaVacia(valor: unknown): boolean {
  const texto = normalizarTexto(valor)
  return texto === '' || texto === '-'
}

function convertirNumero(valor: unknown): number {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor
  const texto = normalizarTexto(valor).replace(/\./g, '').replace(',', '.')
  if (!texto) return 0
  const numero = Number(texto)
  return Number.isFinite(numero) ? numero : 0
}

function esHeaderPrincipal(fila: CeldaExcel[]): boolean {
  const normalizada = fila.map(normalizarTexto)
  return normalizada.includes('articulo') && normalizada.includes('precio ef.') && normalizada.includes('precio tarj.')
}

function detectarFilaEncabezado(datos: CeldaExcel[][]): number {
  for (let i = 0; i < Math.min(datos.length, FILAS_A_INSPECCIONAR); i++) {
    if (esHeaderPrincipal(datos[i] ?? [])) return i
  }
  return 0
}

function detectarTallesOHijoUnico(
  filaEncabezado: CeldaExcel[]
): { tipo: 'talles' | 'stock-unico'; talles: string[] } {
  const celdasExtras = filaEncabezado
    .slice(INDICE_PRIMER_TALLE)
    .map(normalizarTexto)
    .filter(Boolean)

  if (celdasExtras.length === 1 && ['stock', 'cantidad', 'existencia'].includes(celdasExtras[0])) {
    return { tipo: 'stock-unico', talles: ['UNICO'] }
  }

  return {
    tipo: 'talles',
    talles: filaEncabezado
      .slice(INDICE_PRIMER_TALLE)
      .map((valor) => (valor != null ? String(valor).trim() : ''))
      .filter(Boolean),
  }
}

function mapearFilaExcel(filaRaw: CeldaExcel[], headersTalles: string[]): FilaExcelCruda {
  const articuloRaw = filaRaw[0]?.toString().trim() || ''
  const descripcionRaw = filaRaw[2]?.toString().trim() || ''

  const fila: FilaExcelCruda = {
    // Si no hay artículo, usa la descripción como identificador
    articulo: articuloRaw || descripcionRaw,
    marca: filaRaw[1]?.toString().trim() || '',
    descripcion: descripcionRaw,
    precioEfectivo: convertirNumero(filaRaw[3]),
    precioTarjeta: convertirNumero(filaRaw[4]),
  }

  // Solo almacena talles con stock > 0. Los guiones ("-") se ignoran para
  // evitar crear variantes fantasma para talles que el producto no tiene.
  headersTalles.forEach((talle, idx) => {
    const stock = convertirNumero(filaRaw[INDICE_PRIMER_TALLE + idx])
    if (stock > 0) fila[talle] = stock
  })

  return fila
}

function validarFila(fila: FilaExcelCruda, numeroFila: number): string[] {
  const errores: string[] = []
  if (!fila.articulo) errores.push(`Fila ${numeroFila}: Artículo y descripción están vacíos`)
  if (!fila.marca) errores.push(`Fila ${numeroFila}: Marca es obligatoria`)
  if (fila.precioEfectivo === undefined || fila.precioEfectivo < 0) {
    errores.push(`Fila ${numeroFila}: Precio Efectivo inválido`)
  }
  if (fila.precioTarjeta === undefined || fila.precioTarjeta < 0) {
    errores.push(`Fila ${numeroFila}: Precio Tarjeta inválido`)
  }
  return errores
}

function aplanarFilaATalles(
  fila: FilaExcelCruda,
  categoria: string,
  numeroFila: number
): { productos: ProductoPlano[]; errores: string[] } {
  const errores = validarFila(fila, numeroFila)
  if (errores.length > 0) return { productos: [], errores }

  // Solo recoge talles con stock > 0. Los guiones ("-") ya fueron descartados en mapearFilaExcel.
  const talles: { talle: string; stock: number }[] = []

  for (const [clave, valor] of Object.entries(fila)) {
    if (!CLAVES_RESERVADAS.includes(clave.toLowerCase()) && typeof valor === 'number' && valor > 0) {
      talles.push({ talle: clave, stock: valor })
    }
  }

  // Caso producto con columna única de stock
  if (talles.length === 0 && typeof fila.stockUnico === 'number' && fila.stockUnico > 0) {
    talles.push({ talle: 'UNICO', stock: fila.stockUnico })
  }

  // Producto sin stock en ningún talle: se saltea silenciosamente (sin error).
  // No es un error de datos — simplemente el producto está agotado en ese momento.
  if (talles.length === 0) {
    return { productos: [], errores: [] }
  }

  const productos: ProductoPlano[] = talles.map(({ talle, stock }) => ({
    nombre: fila.descripcion || fila.articulo || 'Producto sin nombre',
    marca: fila.marca || 'Sin marca',
    articulo: fila.articulo || 'Sin artículo',
    categoria,
    talle,
    stock,
    precioEfectivo: fila.precioEfectivo || 0,
    precioTarjeta: fila.precioTarjeta || 0,
    imagenUrl: null,
  }))

  return { productos, errores: [] }
}

function procesarSheet(datos: CeldaExcel[][], categoria: string): ResultadoSheet {
  if (!datos || datos.length < 2) {
    return {
      exitosos: [],
      errores: [{ fila: 1, mensaje: 'La pestaña está vacía o no tiene datos' }],
      estadisticas: { totalFilas: 0, filasProcessadas: 0, variantesCreadas: 0, erroresEncontrados: 1 },
    }
  }

  const indiceEncabezado = detectarFilaEncabezado(datos)
  const filaEncabezado = datos[indiceEncabezado] ?? []
  const configTalles = detectarTallesOHijoUnico(filaEncabezado)
  const headersTalles = configTalles.talles

  if (headersTalles.length === 0) {
    return {
      exitosos: [],
      errores: [{ fila: 1, mensaje: 'No se encontraron columnas de talles (columnas F en adelante)' }],
      estadisticas: { totalFilas: Math.max(0, datos.length - 1), filasProcessadas: 0, variantesCreadas: 0, erroresEncontrados: 1 },
    }
  }

  const exitosos: ProductoPlano[] = []
  const errores: Array<{ fila: number; mensaje: string }> = []
  let filasProcessadas = 0

  for (let i = indiceEncabezado + 1; i < datos.length; i++) {
    const filaRaw = datos[i]
    if (!filaRaw || filaRaw.every(esCeldaVacia)) continue

    filasProcessadas++
    const filaMapeada = mapearFilaExcel(filaRaw, headersTalles)

    if (configTalles.tipo === 'stock-unico') {
      const stockUnico = convertirNumero(filaRaw[5])
      if (stockUnico > 0) filaMapeada.stockUnico = stockUnico
    }

    const { productos, errores: erroresValidacion } = aplanarFilaATalles(filaMapeada, categoria, i + 1)
    erroresValidacion.forEach((msg) => errores.push({ fila: i + 1, mensaje: msg }))
    exitosos.push(...productos)
  }

  return {
    exitosos,
    errores,
    estadisticas: {
      totalFilas: datos.length - 1,
      filasProcessadas,
      variantesCreadas: exitosos.length,
      erroresEncontrados: errores.length,
    },
  }
}

export function procesarMultiplesSheets(sheets: Map<string, CeldaExcel[][]>): {
  todosLosProductos: ProductoPlano[]
  reporteDetalladoPorSheet: Map<string, { exitosos: number; filasProcessadas: number; errores: number; detalles: string[] }>
  totalProductosCreados: number
  totalErrores: number
} {
  const todosLosProductos: ProductoPlano[] = []
  const reporteDetalladoPorSheet = new Map<
    string,
    { exitosos: number; filasProcessadas: number; errores: number; detalles: string[] }
  >()
  let totalErrores = 0

  sheets.forEach((datos, nombreSheet) => {
    const resultado = procesarSheet(datos, nombreSheet.trim())
    reporteDetalladoPorSheet.set(nombreSheet, {
      exitosos: resultado.estadisticas.variantesCreadas,
      filasProcessadas: resultado.estadisticas.filasProcessadas,
      errores: resultado.estadisticas.erroresEncontrados,
      detalles: resultado.errores.map((e) => `${e.fila}: ${e.mensaje}`),
    })
    todosLosProductos.push(...resultado.exitosos)
    totalErrores += resultado.errores.length
  })

  return { todosLosProductos, reporteDetalladoPorSheet, totalProductosCreados: todosLosProductos.length, totalErrores }
}
