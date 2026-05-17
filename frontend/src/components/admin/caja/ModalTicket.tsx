import { useState } from 'react'
import { Printer, CheckCircle2, X, Loader2, Share2 } from 'lucide-react'
import type { Ticket } from '../../../types/caja.types'
import { LABELS_METODO_PAGO } from '../../../types/caja.types'

// ─── Formato ──────────────────────────────────────────────────────────────────
const fmt = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// ─── HTML para impresora física (80 mm, monospace) ────────────────────────────
function generarHtmlTicket(ticket: Ticket): string {
  const filas = ticket.lineas
    .map(
      (l) => `
      <tr>
        <td>${l.descripcion}<br><small>${l.articulo} · T:${l.talle} · ${fmt(l.precioUnitario)} c/u</small></td>
        <td class="c">${l.cantidad}</td>
        <td class="r">${fmt(l.subtotal)}</td>
      </tr>`,
    )
    .join('')

  const clienteHtml = ticket.cliente?.nombre
    ? `<p>Cliente: <strong>${ticket.cliente.nombre}</strong>${ticket.cliente.telefono ? ` · ${ticket.cliente.telefono}` : ''}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket ${ticket.numero} — H&H BLEND</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Courier New',monospace; font-size:12px; width:80mm; margin:0 auto; padding:10px 8px; color:#000; background:#fff; }
    .header { text-align:center; padding-bottom:8px; margin-bottom:8px; border-bottom:1px dashed #000; }
    .header h1 { font-size:18px; letter-spacing:5px; font-weight:bold; }
    .header p { font-size:10px; color:#444; margin-top:2px; }
    .info { font-size:11px; margin-bottom:8px; line-height:1.7; }
    .divider { border-top:1px dashed #000; margin:8px 0; }
    table { width:100%; border-collapse:collapse; }
    th { font-size:10px; text-align:left; border-bottom:1px dashed #000; padding:3px 2px; }
    th.c,td.c { text-align:center; }  th.r,td.r { text-align:right; }
    td { font-size:11px; padding:4px 2px; vertical-align:top; border-bottom:1px dotted #ddd; }
    td small { font-size:9px; color:#555; }
    .total-row { margin-top:8px; font-size:14px; font-weight:bold; display:flex; justify-content:space-between; }
    .metodo { font-size:11px; margin-top:4px; }
    .footer { text-align:center; font-size:10px; color:#555; margin-top:10px; border-top:1px dashed #000; padding-top:8px; line-height:1.8; }
    @media print { body { width:80mm; } @page { size:80mm auto; margin:0; } }
  </style>
</head>
<body>
  <div class="header"><h1>H&amp;H BLEND</h1></div>
  <div class="info">
    <p>Ticket N°: <strong>${ticket.numero}</strong></p>
    <p>Fecha: ${formatearFecha(ticket.fecha)}</p>
    ${clienteHtml}
  </div>
  <table>
    <thead><tr><th>Artículo</th><th class="c">Cant</th><th class="r">Subtotal</th></tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="divider"></div>
  <div class="total-row"><span>TOTAL</span><span>${fmt(ticket.total)}</span></div>
  <div class="metodo">Pago: ${LABELS_METODO_PAGO[ticket.metodoPago]}</div>
  <div class="footer"><p>¡Gracias por tu compra!</p><p>H&amp;H Blend</p></div>
</body>
</html>`
}

function abrirPopupImpresion(ticket: Ticket): void {
  const blob = new Blob([generarHtmlTicket(ticket)], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const popup = window.open(url, '_blank', 'width=420,height=680,menubar=no,toolbar=no')
  if (!popup) {
    URL.revokeObjectURL(url)
    alert('Habilitá los popups para este sitio para poder imprimir.')
    return
  }
  popup.onload = () => {
    URL.revokeObjectURL(url)
    popup.focus()
    popup.print()
  }
}

// ─── Tarjeta premium para WhatsApp (Canvas, alta resolución) ──────────────────
// Usa devicePixelRatio para eliminar el pixelado en pantallas retina.
// Diseño de tarjeta: barra dorada, tipografía sans-serif, jerarquía visual.
async function generarImagenPng(ticket: Ticket): Promise<Blob> {
  // Mínimo 2× para que se vea nítido en cualquier pantalla
  const DPR = Math.max(window.devicePixelRatio || 1, 2)

  const W = 480            // ancho lógico en px
  const MRG = 32           // margen lateral
  const GOLD = '#f59e0b'
  const BLACK = '#111111'
  const GRAY = '#6b7280'
  const LGRAY = '#e5e7eb'
  const WHITE = '#ffffff'

  // Fuentes (system-ui es sans-serif nativa sin necesidad de cargar nada)
  const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif"
  const fBrand  = `bold 26px ${SANS}`
  const fLabel  = `600 11px ${SANS}`
  const fBody   = `400 14px ${SANS}`
  const fBold   = `600 14px ${SANS}`
  const fSmall  = `400 12px ${SANS}`
  const fTotal  = `700 22px ${SANS}`

  // ── Canvas de trabajo (sobredimensionado para recortar al final) ───────────
  const canvasTmp = document.createElement('canvas')
  canvasTmp.width  = W * DPR
  canvasTmp.height = 1400 * DPR   // altura máxima estimada; se recorta
  const ctx = canvasTmp.getContext('2d')!
  ctx.scale(DPR, DPR)

  // Helpers
  const fill = (color: string) => { ctx.fillStyle = color }
  const font = (f: string) => { ctx.font = f }
  const align = (a: CanvasTextAlign) => { ctx.textAlign = a }
  const text = (t: string, x: number, y: number) => ctx.fillText(t, x, y)
  const line = (y: number, alpha = 1) => {
    ctx.save()
    ctx.globalAlpha = alpha
    fill(LGRAY)
    ctx.fillRect(MRG, y, W - MRG * 2, 1)
    ctx.restore()
  }
  // Texto con longitud máxima, con truncado automático
  const textTrunc = (t: string, x: number, y: number, maxW: number) => {
    let s = t
    while (ctx.measureText(s).width > maxW && s.length > 1) s = s.slice(0, -1)
    ctx.fillText(s !== t ? s.slice(0, -1) + '…' : s, x, y)
  }

  // ── Fondo blanco ───────────────────────────────────────────────────────────
  fill(WHITE)
  ctx.fillRect(0, 0, W, 1400)

  let y = 0

  // ── Barra dorada superior ──────────────────────────────────────────────────
  fill(GOLD)
  ctx.fillRect(0, 0, W, 6)
  y = 6

  // ── Header ────────────────────────────────────────────────────────────────
  y += 32
  font(fBrand); fill(BLACK); align('center')
  text('H&H BLEND', W / 2, y)

  y += 24; line(y); y += 20

  // ── Ticket + Fecha (dos columnas) ─────────────────────────────────────────
  const COL2 = W / 2 + 8
  font(fLabel); fill(GRAY); align('left')
  text('COMPROBANTE', MRG, y)
  text('FECHA', COL2, y)
  y += 17

  font(fBold); fill(BLACK)
  text(ticket.numero, MRG, y)
  font(fBody); fill(BLACK)
  text(formatearFecha(ticket.fecha), COL2, y)
  y += 24

  // ── Cliente ───────────────────────────────────────────────────────────────
  if (ticket.cliente?.nombre) {
    font(fLabel); fill(GRAY); align('left')
    text('CLIENTE', MRG, y)
    y += 17
    font(fBold); fill(BLACK)
    text(ticket.cliente.nombre, MRG, y)
    if (ticket.cliente.telefono) {
      font(fBody); fill(GRAY); align('right')
      text(ticket.cliente.telefono, W - MRG, y)
      align('left')
    }
    y += 24
  }

  y += 4; line(y); y += 18

  // ── Cabecera tabla ────────────────────────────────────────────────────────
  font(fLabel); fill(GRAY)
  align('left');  text('ARTÍCULO', MRG, y)
  align('center'); text('CANT', W * 0.73, y)
  align('right');  text('SUBTOTAL', W - MRG, y)
  y += 10; line(y); y += 16

  // ── Ítems ─────────────────────────────────────────────────────────────────
  const MAX_DESC = W * 0.56 - MRG
  for (const linea of ticket.lineas) {
    // Nombre del producto
    font(fBold); fill(BLACK); align('left')
    textTrunc(linea.descripcion, MRG, y, MAX_DESC)

    align('center'); font(fBody); fill(BLACK)
    text(String(linea.cantidad), W * 0.73, y)

    align('right'); font(fBold); fill(BLACK)
    text(fmt(linea.subtotal), W - MRG, y)
    y += 18

    // Sub-línea con detalle
    font(fSmall); fill(GRAY); align('left')
    text(`${linea.articulo}  ·  T: ${linea.talle}  ·  ${fmt(linea.precioUnitario)} c/u`, MRG, y)
    y += 24
  }

  y += 4; line(y); y += 20

  // ── Total ─────────────────────────────────────────────────────────────────
  font(fTotal); fill(BLACK); align('left')
  text('TOTAL', MRG, y)
  font(fTotal); fill(GOLD); align('right')
  text(fmt(ticket.total), W - MRG, y)
  y += 22

  font(fBody); fill(GRAY); align('left')
  text(`Pago: ${LABELS_METODO_PAGO[ticket.metodoPago]}`, MRG, y)
  y += 28

  line(y); y += 20

  // ── Footer ────────────────────────────────────────────────────────────────
  font(`400 13px ${SANS}`); fill(GRAY); align('center')
  text('¡Gracias por tu compra!', W / 2, y)
  y += 18
  font(fLabel); fill(LGRAY)
  text('H&H BLEND', W / 2, y)
  y += 32

  // ── Barra dorada inferior (simetría) ─────────────────────────────────────
  fill(GOLD)
  ctx.fillRect(0, y, W, 4)
  y += 4

  // ── Recortar canvas a la altura real usada ────────────────────────────────
  const canvasFinal = document.createElement('canvas')
  canvasFinal.width  = W * DPR
  canvasFinal.height = y * DPR
  const ctxF = canvasFinal.getContext('2d')!
  ctxF.fillStyle = WHITE
  ctxF.fillRect(0, 0, canvasFinal.width, canvasFinal.height)
  ctxF.drawImage(canvasTmp, 0, 0)

  return new Promise<Blob>((resolve, reject) => {
    canvasFinal.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))),
      'image/png',
    )
  })
}

// ─── Compartir imagen ─────────────────────────────────────────────────────────
// Estrategia según contexto:
//
// 1. Número de teléfono conocido (desktop):
//    → Copia el PNG al portapapeles
//    → Abre WhatsApp Web directamente al chat de ese número
//    → El usuario sólo hace Ctrl+V (o pega) y envía
//
// 2. Sin número (móvil/tablet con Web Share API):
//    → Abre el selector nativo del SO → el usuario elige WhatsApp
//
// 3. Sin número (desktop sin Web Share API):
//    → Descarga el PNG para adjuntarlo manualmente
//
// Limitación conocida: ninguna API del browser permite adjuntar un archivo
// a un contacto específico de WhatsApp sin intervención del usuario.
// Para eso se necesitaría WhatsApp Business API (integración server-side futura).
async function compartirImagen(ticket: Ticket): Promise<'clipboard' | 'share' | 'download'> {
  const blob = await generarImagenPng(ticket)
  const telefono = ticket.cliente?.telefono?.replace(/\D/g, '') ?? ''

  // ── Estrategia 1: tenemos teléfono → clipboard + abrir chat directo ──────
  if (telefono) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      const numero = telefono.startsWith('549') ? telefono : `549${telefono}`
      window.open(
        `https://web.whatsapp.com/send?phone=${numero}`,
        '_blank',
        'noopener,noreferrer',
      )
      return 'clipboard'
    } catch {
      // Clipboard bloqueado (HTTP, permisos denegados) → fallback a share/download
    }
  }

  // ── Estrategia 2: móvil/tablet con Web Share API ──────────────────────────
  const nombre = `ticket-${ticket.numero}.png`
  const file = new File([blob], nombre, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `Ticket H&H BLEND ${ticket.numero}` })
    return 'share'
  }

  // ── Estrategia 3: descarga directa ────────────────────────────────────────
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
  return 'download'
}

// ─── Componente ───────────────────────────────────────────────────────────────
interface ModalTicketProps {
  ticket: Ticket
  onCerrar: () => void
}

export function ModalTicket({ ticket, onCerrar }: ModalTicketProps) {
  const [compartiendo, setCompartiendo] = useState(false)
  const [mensajePost, setMensajePost] = useState<string | null>(null)

  const handleImprimir = () => abrirPopupImpresion(ticket)

  const handleCompartir = async () => {
    setCompartiendo(true)
    setMensajePost(null)
    try {
      const resultado = await compartirImagen(ticket)
      if (resultado === 'clipboard') {
        setMensajePost('Imagen copiada. WhatsApp se abrió al chat del cliente — pegá con Ctrl+V y enviá.')
      } else if (resultado === 'download') {
        setMensajePost('Imagen descargada — adjuntala en WhatsApp del cliente.')
      }
      // 'share' no necesita mensaje: el selector nativo ya guió al usuario
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    } finally {
      setCompartiendo(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Encabezado */}
        <div className="flex flex-col items-center gap-2 pt-8 pb-4 border-b border-neutral-800">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <h2 className="text-base font-bold text-neutral-100 tracking-widest uppercase">
            H&H BLEND
          </h2>
          <div className="flex flex-col items-center gap-0.5 mt-1">
            <p className="text-xs text-neutral-400">
              Ticket N°{' '}
              <span className="font-mono font-bold text-amber-500">{ticket.numero}</span>
            </p>
            <p className="text-xs text-neutral-500">{formatearFecha(ticket.fecha)}</p>
          </div>
        </div>

        {/* Cliente */}
        {ticket.cliente?.nombre && (
          <div className="px-6 py-3 border-b border-neutral-800/60">
            <p className="text-xs text-neutral-500">
              Cliente:{' '}
              <span className="text-neutral-200 font-medium">{ticket.cliente.nombre}</span>
              {ticket.cliente.telefono && (
                <span className="ml-2 text-neutral-600">· {ticket.cliente.telefono}</span>
              )}
            </p>
          </div>
        )}

        {/* Líneas */}
        <div className="px-6 py-4 max-h-52 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-800">
                <th className="text-left pb-2 font-medium">Artículo</th>
                <th className="text-center pb-2 font-medium">T</th>
                <th className="text-center pb-2 font-medium">Cant.</th>
                <th className="text-right pb-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {ticket.lineas.map((linea, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={idx}>
                  <td className="py-2 pr-2 text-neutral-200">
                    <p className="truncate max-w-[120px]">{linea.descripcion}</p>
                    <p className="text-neutral-500 text-[10px]">
                      {linea.articulo} · {fmt(linea.precioUnitario)} c/u
                    </p>
                  </td>
                  <td className="py-2 text-center text-neutral-300">{linea.talle}</td>
                  <td className="py-2 text-center text-neutral-300">{linea.cantidad}</td>
                  <td className="py-2 text-right font-medium text-neutral-100">
                    {fmt(linea.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="px-6 py-4 border-t border-neutral-800">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-neutral-500">Método de pago</span>
              <span className="text-sm font-semibold text-neutral-200">
                {LABELS_METODO_PAGO[ticket.metodoPago]}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-neutral-500">Total</span>
              <span className="text-xl font-bold text-amber-500">{fmt(ticket.total)}</span>
            </div>
          </div>
        </div>

        {/* Feedback post-compartir */}
        {mensajePost && (
          <p className="mx-6 mb-1 text-xs text-neutral-400 text-center leading-relaxed">
            {mensajePost}
          </p>
        )}

        {/* Acciones */}
        <div className="grid grid-cols-3 gap-2 px-6 pb-6 pt-3">

          {/* Nueva venta */}
          <button
            type="button"
            onClick={onCerrar}
            className="flex flex-col items-center gap-1.5 py-3 px-2 border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl text-xs transition-colors"
          >
            <X className="h-5 w-5" />
            Nueva venta
          </button>

          {/* Imprimir */}
          <button
            type="button"
            onClick={handleImprimir}
            className="flex flex-col items-center gap-1.5 py-3 px-2 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 rounded-xl text-xs transition-colors"
          >
            <Printer className="h-5 w-5" />
            Imprimir
          </button>

          {/* WhatsApp / Compartir imagen */}
          <button
            type="button"
            onClick={handleCompartir}
            disabled={compartiendo}
            className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 overflow-hidden group"
            style={{ background: 'linear-gradient(145deg, #25D366 0%, #075E54 100%)' }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity bg-white rounded-xl" />
            {compartiendo
              ? <Loader2 className="h-5 w-5 text-white animate-spin" />
              : <Share2 className="h-5 w-5 text-white" />
            }
            <span className="text-white leading-tight text-center">
              {compartiendo ? 'Generando…' : ticket.cliente?.telefono ? 'Enviar WSP' : 'Compartir'}
            </span>
          </button>

        </div>
      </div>
    </div>
  )
}
