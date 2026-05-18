import type { Ficha, Variante } from '../types/inventario.types'

// ARGB color tokens (prefijo FF = opacidad 100%)
const C = {
  headerBg:   'FFF59E0B', // amber-400
  headerFont: 'FF000000', // negro
  rowEvenBg:  'FFFFFFFF', // blanco
  rowOddBg:   'FFFFFBEB', // amber-50
  stockFont:  'FF92400E', // amber-900
  priceFont:  'FF374151', // gris-700
  textFont:   'FF1F2937', // gris-800
  borderAmber:'FFD97706', // amber-600
} as const

type GrupoPrecio = {
  precioEfectivo: number
  precioTarjeta: number
  variantes: Variante[]
}

function agruparVariantesPorPrecio(variantes: Variante[]): GrupoPrecio[] {
  const mapa = new Map<string, GrupoPrecio>()
  variantes.forEach((v) => {
    const clave = `${v.precioEfectivo}_${v.precioTarjeta}`
    if (!mapa.has(clave)) {
      mapa.set(clave, { precioEfectivo: v.precioEfectivo, precioTarjeta: v.precioTarjeta, variantes: [] })
    }
    mapa.get(clave)!.variantes.push(v)
  })
  return [...mapa.values()]
}

export async function exportarInventario(fichas: Ficha[]): Promise<void> {
  // Carga diferida: exceljs (~1 MB) solo se descarga al exportar, no en el bundle inicial
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'HH Blend Stock'

  const porCategoria = new Map<string, Ficha[]>()
  fichas.forEach((f) => {
    if (!porCategoria.has(f.categoria)) porCategoria.set(f.categoria, [])
    porCategoria.get(f.categoria)!.push(f)
  })

  const TALLES_COL_INICIO = 6 // columna 1-indexed donde comienzan los talles

  porCategoria.forEach((fichasCategoria, categoria) => {
    const sheet = workbook.addWorksheet(categoria, {
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    const tallesSet = new Set<string>()
    fichasCategoria.forEach((f) => f.variantes.forEach((v) => tallesSet.add(v.talle)))
    const talles = [...tallesSet].sort()

    sheet.columns = [
      { key: 'articulo',    width: 13 },
      { key: 'marca',       width: 18 },
      { key: 'descripcion', width: 28 },
      { key: 'precioEf',    width: 14 },
      { key: 'precioTj',    width: 14 },
      ...talles.map((t) => ({ key: t, width: 7 })),
    ]

    // ── Fila de encabezado ────────────────────────────────────────────────────
    const headerRow = sheet.addRow([
      'Artículo', 'Marca', 'Descripción', 'Precio Ef.', 'Precio Tarj.', ...talles,
    ])
    headerRow.height = 22
    headerRow.eachCell((cell, col) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } }
      cell.font = { bold: true, color: { argb: C.headerFont }, size: 10 }
      cell.alignment = {
        horizontal: col >= TALLES_COL_INICIO ? 'center' : 'left',
        vertical: 'middle',
      }
      cell.border = { bottom: { style: 'medium', color: { argb: C.borderAmber } } }
    })

    // ── Filas de datos ────────────────────────────────────────────────────────
    let dataIdx = 0
    fichasCategoria.forEach((f) => {
      agruparVariantesPorPrecio(f.variantes).forEach(({ precioEfectivo, precioTarjeta, variantes: grupo }) => {
        const stockPorTalle = new Map(grupo.map((v) => [v.talle, v.stock]))
        const bgColor = dataIdx % 2 === 0 ? C.rowEvenBg : C.rowOddBg

        const rowValues: (string | number)[] = [
          f.articulo, f.marca, f.nombre, precioEfectivo, precioTarjeta,
          ...talles.map((t) => {
            const s = stockPorTalle.get(t)
            return s !== undefined && s > 0 ? s : ''
          }),
        ]

        const row = sheet.addRow(rowValues)
        row.height = 18
        row.eachCell({ includeEmpty: true }, (cell, col) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }

          if (col <= 3) {
            cell.font = { color: { argb: C.textFont }, size: 10 }
            cell.alignment = { horizontal: 'left', vertical: 'middle' }
          } else if (col <= 5) {
            cell.font = { color: { argb: C.priceFont }, size: 10 }
            cell.alignment = { horizontal: 'right', vertical: 'middle' }
            if (typeof cell.value === 'number') cell.numFmt = '#,##0'
          } else {
            const tieneStock = cell.value !== '' && cell.value !== null && cell.value !== undefined
            cell.font = tieneStock
              ? { bold: true, color: { argb: C.stockFont }, size: 10 }
              : { color: { argb: 'FFCCCCCC' }, size: 10 }
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
          }
        })

        dataIdx++
      })
    })
  })

  // ── Descarga ──────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `inventario-hh-blend-${new Date().toISOString().split('T')[0]}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}
