import { jsPDF } from 'jspdf'
import {
  CUSTOMS_REQUIREMENTS,
  PRODUCTS,
  fmtUsd,
  fmtDate,
  DEMO_TODAY,
  legLabel,
  type Shipment,
  type Leg,
} from './data/seed'

const INK: [number, number, number] = [15, 23, 42]
const EMERALD: [number, number, number] = [5, 150, 105]
const SLATE: [number, number, number] = [71, 85, 105]
const W = 210
const M = 18

function pageHeader(doc: jsPDF, title: string, s: Shipment): void {
  doc.setFillColor(...INK)
  doc.rect(0, 0, W, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(title, M, 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(150, 220, 190)
  doc.text('TRANSIT GUARD — COMPANY-APPROVED SHIPPING DOCUMENT PACK · FAST INSIGHTS, INC.', M, 17)
  doc.setTextColor(203, 213, 225)
  doc.text(`Transaction ${s.txId}   ·   Order ${s.orderNo ?? '—'}   ·   Generated ${fmtDate(DEMO_TODAY)}`, M, 22)
  doc.setTextColor(...INK)
}

function pageFooter(doc: jsPDF, s: Shipment, label: string): void {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...SLATE)
  doc.text(`${label} · ${s.txId} · Synthetic demo document — Fast Insights is fictional; all data is synthetic.`, M, 287)
  doc.setTextColor(...INK)
}

function kv(doc: jsPDF, x: number, y: number, key: string, value: string): void {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  doc.text(key.toUpperCase(), x, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(...INK)
  doc.text(value, x, y + 5)
}

function sectionTitle(doc: jsPDF, y: number, text: string): void {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...EMERALD)
  doc.text(text, M, y)
  doc.setTextColor(...INK)
}

export function buildDocsPack(doc: jsPDF, s: Shipment, leg: Leg): jsPDF {
  const prod = PRODUCTS[s.product]
  const unitCustoms = prod?.customsUnit ?? 0
  const declared = s.customsValue ?? unitCustoms * s.unitCount

  // ----- Page 1: Customs Valuation Worksheet (company-approved)
  pageHeader(doc, 'CUSTOMS VALUATION WORKSHEET — COMPANY APPROVED', s)
  let y = 40
  kv(doc, M, y, 'Exporter', 'Fast Insights, Inc. — Reno, NV, USA')
  kv(doc, 115, y, 'Consignee', s.customer)
  y += 16
  kv(doc, M, y, 'Destination', s.destination)
  kv(doc, 115, y, 'Incoterms', s.incoterms ?? '—')
  y += 16
  kv(doc, M, y, 'Valuation method', 'Transaction value — company customs price list')
  kv(doc, 115, y, 'HS code', prod?.hs ?? '—')
  y += 18
  sectionTitle(doc, y, 'Declared value computation')
  y += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const rows: [string, string][] = [
    ['Product', s.product],
    ['Quantity', `${s.unitCount} units`],
    ['Customs price list / unit', fmtUsd(unitCustoms)],
    ['Declared customs value', fmtUsd(declared)],
    ['Sales invoice value (reference)', fmtUsd(s.salesValue)],
    ['Variance to be documented', fmtUsd(s.salesValue - declared)],
  ]
  rows.forEach(([k, v], i) => {
    const ry = y + i * 8
    if (i % 2 === 0) {
      doc.setFillColor(241, 245, 249)
      doc.rect(M, ry - 5, W - 2 * M, 8, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.text(k, M + 2, ry)
    doc.setFont('helvetica', 'bold')
    doc.text(v, W - M - 2, ry, { align: 'right' })
  })
  y += rows.length * 8 + 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  doc.text(
    doc.splitTextToSize(
      'The declared customs value follows the company customs price list under the transaction-value method. The variance from the sales invoice is expected and documented here for the customs broker and for audit. This worksheet is generated from custody events recorded in Transit Guard.',
      W - 2 * M,
    ),
    M,
    y,
  )
  y += 22
  doc.setTextColor(...INK)
  doc.setFontSize(10)
  doc.text('Approved: ____________________________', M, y)
  doc.setFontSize(8.5)
  doc.setTextColor(...SLATE)
  doc.text('J. Dougherty, Controller — Fast Insights, Inc. · Approval on file in Transit Guard', M, y + 5)
  pageFooter(doc, s, 'Customs Valuation Worksheet · Page 1 of 4')

  // ----- Page 2: Packing Slip
  doc.addPage()
  pageHeader(doc, 'PACKING SLIP', s)
  y = 40
  kv(doc, M, y, 'Ship from', s.legs[0]?.location ?? 'Fast Insights, Reno, NV, USA')
  kv(doc, 115, y, 'Ship to', s.destination)
  y += 16
  kv(doc, M, y, 'Customer', s.customer)
  kv(doc, 115, y, 'Carrier (this leg)', leg.vendor)
  y += 18
  sectionTitle(doc, y, 'Contents')
  y += 7
  const serials = `${s.serialsSample.join(', ')}${s.unitCount > s.serialsSample.length ? ` (+${s.unitCount - s.serialsSample.length} more — full list in the custody ledger)` : ''}`
  const packRows: [string, string][] = [
    ['Product', s.product],
    ['Quantity', `${s.unitCount} units`],
    ['Serials', serials],
    ['Gross weight (est.)', `${Math.round(s.unitCount * 8.2)} kg`],
    ['Cartons', `${Math.max(1, Math.ceil(s.unitCount / 4))}`],
  ]
  packRows.forEach(([k, v], i) => {
    const ry = y + i * 9
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE)
    doc.text(k.toUpperCase(), M, ry)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(doc.splitTextToSize(v, W - 2 * M - 55), M + 55, ry)
  })
  y += packRows.length * 9 + 8
  if (s.special?.length) {
    sectionTitle(doc, y, 'Special handling')
    y += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(s.special.join('   ·   '), M, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE)
    doc.text('Maintain −2 °C. Re-charge dry ice at every hand-off and record the re-icing event in Transit Guard.', M, y)
    doc.setTextColor(...INK)
  }
  pageFooter(doc, s, 'Packing Slip · Page 2 of 4')

  // ----- Page 3: Bill of Lading
  doc.addPage()
  pageHeader(doc, 'BILL OF LADING', s)
  y = 40
  kv(doc, M, y, 'Shipper', 'Fast Insights, Inc. — Reno, NV, USA')
  kv(doc, 115, y, 'Consignee', s.customer)
  y += 16
  kv(doc, M, y, 'Carrier', leg.vendor)
  kv(doc, 115, y, 'Leg', `${legLabel(leg.kind)} → ${leg.location}`)
  y += 16
  kv(doc, M, y, 'Freight description', `${s.unitCount} × ${s.product} (HS ${prod?.hs ?? '—'})`)
  kv(doc, 115, y, 'Incoterms', s.incoterms ?? '—')
  y += 18
  sectionTitle(doc, y, 'Instructions')
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...SLATE)
  doc.text(
    doc.splitTextToSize(
      `Scan the shipping label in the Transit Guard carrier add-in at pickup and at hand-off — the scan confirms receipt of this document pack and logs the custody transfer under ${s.txId}. ${s.special?.length ? 'Temperature-controlled load: keep the reefer at −2 °C and record every dry-ice re-charge. ' : ''}Do not split the consignment without a new custody event.`,
      W - 2 * M,
    ),
    M,
    y,
  )
  y += 26
  doc.setTextColor(...INK)
  doc.setFontSize(10)
  doc.text('Shipper signature: ____________________', M, y)
  doc.text('Carrier signature: ____________________', 115, y)
  doc.setFontSize(8.5)
  doc.setTextColor(...SLATE)
  doc.text('Signatures are captured digitally at label scan in the carrier add-in.', M, y + 6)
  pageFooter(doc, s, 'Bill of Lading · Page 3 of 4')

  // ----- Page 4: Required customs documents checklist
  doc.addPage()
  pageHeader(doc, 'REQUIRED CUSTOMS DOCUMENTS — DESTINATION CHECKLIST', s)
  y = 40
  const reqs = CUSTOMS_REQUIREMENTS[s.country] ?? []
  sectionTitle(doc, y, `Destination: ${s.destination}`)
  y += 9
  reqs.forEach((r, i) => {
    const ry = y + i * 14
    doc.setDrawColor(...EMERALD)
    doc.rect(M, ry - 4, 5, 5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(r.doc, M + 9, ry)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...SLATE)
    doc.text(doc.splitTextToSize(r.desc, W - 2 * M - 9), M + 9, ry + 4.5)
  })
  y += reqs.length * 14 + 8
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  doc.text(
    doc.splitTextToSize(
      'Checklist state is live in Transit Guard: documents marked ready in the app satisfy this list, and the customs leg cannot complete until every box is checked. Requirement changes are monitored by the Transit Guard AI (customs bulletins).',
      W - 2 * M,
    ),
    M,
    y,
  )
  pageFooter(doc, s, 'Customs Checklist · Page 4 of 4')
  return doc
}

export function downloadDocsPack(s: Shipment, leg: Leg): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  buildDocsPack(doc, s, leg)
  doc.save(`${s.txId}_docs_pack.pdf`)
}

const INCOTERM_TERMS: [string, string][] = [
  ['DAP', 'Delivered At Place — seller bears transport risk to the named destination; revenue recognizes at delivery.'],
  ['FOB destination', 'Title and risk transfer at the destination on customer acceptance; revenue holds until delivery is proven.'],
  ['FCA', 'Free Carrier — risk transfers when goods are handed to the buyer’s carrier at origin; revenue at origin hand-off.'],
]

/**
 * Customs-only demo pack: valuation & terms page + destination document checklist
 * with live ready-states from the shipment's customs leg. Clearly marked DEMO ONLY.
 */
export function buildCustomsPack(doc: jsPDF, s: Shipment): jsPDF {
  const prod = PRODUCTS[s.product]
  const unitCustoms = prod?.customsUnit ?? 0
  const declared = s.customsValue ?? unitCustoms * s.unitCount
  const customsLeg = s.legs.find((l) => l.kind === 'customs')
  const broker = customsLeg?.vendor ?? 'Customs broker — to be assigned'

  // ----- Page 1: valuation & terms
  pageHeader(doc, 'CUSTOMS VALUATION & TERMS — DEMO ONLY', s)
  let y = 40
  kv(doc, M, y, 'Exporter', 'Fast Insights, Inc. — Reno, NV, USA')
  kv(doc, 115, y, 'Consignee', s.customer)
  y += 16
  kv(doc, M, y, 'Destination', s.destination)
  kv(doc, 115, y, 'Customs broker', broker)
  y += 16
  kv(doc, M, y, 'Valuation method', 'Transaction value — company customs price list')
  kv(doc, 115, y, 'HS code', prod?.hs ?? '—')
  y += 18
  sectionTitle(doc, y, 'Declared value computation')
  y += 7
  const rows: [string, string][] = [
    ['Product', s.product],
    ['Quantity', `${s.unitCount} units`],
    ['Customs price list / unit', fmtUsd(unitCustoms)],
    ['Declared customs value', fmtUsd(declared)],
    ['Sales invoice value (reference)', fmtUsd(s.salesValue)],
    ['Variance to be documented', fmtUsd(s.salesValue - declared)],
  ]
  rows.forEach(([k, v], i) => {
    const ry = y + i * 8
    if (i % 2 === 0) {
      doc.setFillColor(241, 245, 249)
      doc.rect(M, ry - 5, W - 2 * M, 8, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(k, M + 2, ry)
    doc.setFont('helvetica', 'bold')
    doc.text(v, W - M - 2, ry, { align: 'right' })
  })
  y += rows.length * 8 + 10
  sectionTitle(doc, y, 'Terms')
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text(`Incoterms: ${s.incoterms ?? '—'}`, M, y)
  y += 6
  const term = INCOTERM_TERMS.find(([k]) => (s.incoterms ?? '').toUpperCase().includes(k.toUpperCase()))
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  doc.text(
    doc.splitTextToSize(
      `${term ? term[1] + ' ' : ''}The declared customs value follows the company customs price list under the transaction-value method; the variance from the sales invoice is expected and documented for the broker and for audit. Demo document — generated from Transit Guard custody events.`,
      W - 2 * M,
    ),
    M,
    y,
  )
  y += 20
  doc.setTextColor(...INK)
  doc.setFontSize(10)
  doc.text('Approved: ____________________________', M, y)
  doc.setFontSize(8.5)
  doc.setTextColor(...SLATE)
  doc.text('J. Dougherty, Controller — Fast Insights, Inc. · Approval on file in Transit Guard', M, y + 5)
  pageFooter(doc, s, 'Customs Valuation & Terms · Page 1 of 2 · DEMO ONLY')

  // ----- Page 2: destination checklist with live ready-states
  doc.addPage()
  pageHeader(doc, 'REQUIRED CUSTOMS DOCUMENTS — DEMO ONLY', s)
  y = 40
  const reqs = CUSTOMS_REQUIREMENTS[s.country] ?? []
  sectionTitle(doc, y, `Destination: ${s.destination}`)
  y += 9
  reqs.forEach((r, i) => {
    const ry = y + i * 15
    const ready = customsLeg?.docs.find((d) => d.name === r.doc)?.ready ?? false
    doc.setDrawColor(...EMERALD)
    doc.rect(M, ry - 4, 5, 5)
    if (ready) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...EMERALD)
      doc.text('X', M + 1.2, ry)
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(`${r.doc}${ready ? '  — READY' : '  — PENDING'}`, M + 9, ry)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...SLATE)
    doc.text(doc.splitTextToSize(r.desc, W - 2 * M - 9), M + 9, ry + 4.5)
  })
  y += reqs.length * 15 + 8
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  doc.text(
    doc.splitTextToSize(
      `Checklist state is live from ${s.txId}'s customs leg in Transit Guard: the customs stage cannot complete until every document is ready. Requirement changes are monitored by the Transit Guard AI (customs bulletins). Synthetic demo document.`,
      W - 2 * M,
    ),
    M,
    y,
  )
  pageFooter(doc, s, 'Destination Checklist · Page 2 of 2 · DEMO ONLY')
  return doc
}

export function downloadCustomsPack(s: Shipment): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  buildCustomsPack(doc, s)
  doc.save(`${s.txId}_customs_pack_demo.pdf`)
}
