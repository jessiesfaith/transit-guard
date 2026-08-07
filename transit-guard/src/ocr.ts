import { createWorker } from 'tesseract.js'

export interface OcrField {
  label: string
  value: string
}

export interface OcrOutcome {
  text: string
  fields: OcrField[]
}

async function hasLocalAssets(): Promise<boolean> {
  try {
    const r = await fetch('/tessdata/eng.traineddata', { method: 'HEAD' })
    return r.ok
  } catch {
    return false
  }
}

export function extractFields(text: string): OcrField[] {
  const fields: OcrField[] = []
  const tx = text.match(/(?:TX|RMA)-\d{4,5}/i)
  if (tx) fields.push({ label: 'Transaction', value: tx[0].toUpperCase() })
  const inv = text.match(/INV-\d{3,5}/i)
  if (inv) fields.push({ label: 'Invoice', value: inv[0].toUpperCase() })
  const dates = text.match(/\b\d{2}[-/.]\d{2}[-/.]\d{4}\b/g)
  if (dates) fields.push({ label: 'Date', value: dates[0] })
  const amount = text.match(/USD\s?[\d.,]{4,}/i)
  if (amount) fields.push({ label: 'Amount', value: amount[0].replace(/\s+/g, ' ') })
  const inco = text.match(/\b(DAP|DDP|FCA|FOB|EXW|CIF|CPT)\b[^\n]*/i)
  if (inco) fields.push({ label: 'Incoterms', value: inco[0].trim().slice(0, 24) })
  return fields
}

/**
 * Runs multilingual OCR (English + Spanish + French) fully on-device.
 * Prefers locally hosted language data / worker assets; falls back to CDN.
 */
export async function runOcr(
  image: File | HTMLCanvasElement,
  onProgress: (pct: number, status: string) => void,
): Promise<OcrOutcome> {
  const local = await hasLocalAssets()
  const logger = (m: { status?: string; progress?: number }) => {
    if (typeof m.progress === 'number') onProgress(Math.round(m.progress * 100), m.status ?? '')
  }
  // The Tesseract worker is spawned from a blob URL, so asset paths must be absolute.
  const base = window.location.origin
  const options = local
    ? { workerPath: `${base}/tesseract/worker.min.js`, corePath: `${base}/tesseract-core`, langPath: `${base}/tessdata`, gzip: false, logger }
    : { logger }
  const worker = await createWorker(['eng', 'spa', 'fra'], 1, options)
  try {
    const { data } = await worker.recognize(image)
    return { text: data.text.trim(), fields: extractFields(data.text) }
  } finally {
    await worker.terminate()
  }
}

/** Renders a synthetic bilingual customs document to a canvas for the one-tap OCR demo. */
export function makeSampleDoc(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 940
  canvas.height = 620
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#111111'
  ctx.font = 'bold 34px Arial'
  ctx.fillText('CUSTOMS VALUATION WORKSHEET', 48, 64)
  ctx.font = '26px Arial'
  ctx.fillText('HOJA DE VALORACION ADUANERA', 48, 104)
  ctx.font = '24px Arial'
  const lines = [
    'EXPORTER: FAST INSIGHTS INC, RENO NV, USA',
    'TRANSACTION: TX-20481',
    'INVOICE NO: INV-8841',
    'FECHA DE EMBARQUE: 19-12-2026',
    'TRANSPORTISTA: PACIFIC MERIDIAN LINES',
    'DESTINATAIRE: MERIDIAN HEALTH EUROPE BV',
    'DESTINO: ROTTERDAM, PAISES BAJOS',
    'METHODE: VALEUR TRANSACTIONNELLE (LISTE DE PRIX DOUANE)',
    'VALOR DECLARADO / VALEUR DECLAREE: USD 147,000',
    'INCOTERMS: DAP UTRECHT',
  ]
  lines.forEach((line, i) => {
    ctx.fillText(line, 48, 168 + i * 42)
  })
  return canvas
}
