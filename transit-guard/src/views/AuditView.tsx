import { useRef, useState } from 'react'
import { useI18n, type StringKey } from '../i18n'
import { useStore } from '../store'
import { COUNT_SNAPSHOT } from '../data/seed'
import { runOcr, makeSampleDoc, type OcrOutcome } from '../ocr'

export default function AuditView() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrPct, setOcrPct] = useState(0)
  const [ocrStatus, setOcrStatus] = useState('')
  const [ocr, setOcr] = useState<OcrOutcome | null>(null)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const totalUnits = COUNT_SNAPSHOT.reduce((a, b) => a + b.units, 0)
  const maxUnits = Math.max(...COUNT_SNAPSHOT.map((b) => b.units))

  async function doOcr(image: File | HTMLCanvasElement) {
    setOcrBusy(true)
    setOcr(null)
    setOcrError(null)
    setOcrPct(0)
    try {
      const result = await runOcr(image, (pct, status) => {
        setOcrPct(pct)
        setOcrStatus(status)
      })
      setOcr(result)
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : String(err))
    } finally {
      setOcrBusy(false)
    }
  }

  const txField = ocr?.fields.find((f) => f.label === 'Transaction')?.value
  const attachTarget = txField ? state.shipments.find((s) => s.txId === txField) : undefined
  const pendingDocs = attachTarget?.legs.flatMap((l) => l.docs.filter((d) => !d.ready).map((d) => ({ legId: l.id, doc: d.name }))) ?? []
  const attachDoc = pendingDocs.find((d) => ocr?.text.toLowerCase().includes(d.doc.toLowerCase())) ?? pendingDocs[0]

  function attach() {
    if (!attachTarget || !attachDoc) return
    dispatch({
      type: 'SET_DOC_READY',
      txId: attachTarget.txId,
      legId: attachDoc.legId,
      doc: attachDoc.doc,
      toast: `${t('ocrAttached')} ${attachTarget.txId}`,
    })
  }

  function exportCsv() {
    const rows = [['Transaction', 'Direction', 'Leg', 'Vendor', 'Location', 'Date', 'Status', 'Docs ready']]
    for (const s of state.shipments) {
      for (const l of s.legs) {
        rows.push([
          s.txId,
          s.direction,
          l.kind,
          l.vendor,
          l.location,
          l.date ?? `ETA ${l.eta ?? ''}`,
          l.status,
          `${l.docs.filter((d) => d.ready).length}/${l.docs.length}`,
        ])
      }
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'transit_guard_custody_ledger.csv'
    a.click()
    URL.revokeObjectURL(url)
    dispatch({ type: 'TOAST', toast: t('exported') })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-slate-900">{t('auditTitle')}</h2>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2.5">
        <p className="text-xs font-bold text-slate-800">{t('countTitle')}</p>
        {COUNT_SNAPSHOT.map((b) => (
          <div key={b.key}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600">{t(b.key as StringKey)}</span>
              <span className="font-bold text-slate-900">{b.units.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-0.5">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max((b.units / maxUnits) * 100, 2)}%` }} />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-700">{t('totalUnits')}</span>
          <span className="font-bold text-emerald-700">{totalUnits.toLocaleString()}</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">{t('auditNote')}</p>
      </div>

      <button onClick={exportCsv} className="w-full rounded-xl bg-slate-900 text-white text-xs font-bold py-3 shadow-sm">
        ⬇ {t('exportCsv')}
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
        <p className="text-xs font-bold text-slate-800">{t('ocrTitle')}</p>
        <p className="text-[11px] text-slate-500 leading-relaxed">{t('ocrHint')}</p>
        <div className="flex gap-2">
          <button
            onClick={() => doOcr(makeSampleDoc())}
            disabled={ocrBusy}
            className="flex-1 rounded-xl bg-emerald-600 disabled:bg-slate-300 text-white text-[11px] font-semibold py-2.5"
          >
            {t('ocrSample')}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={ocrBusy}
            className="flex-1 rounded-xl border border-emerald-600 text-emerald-700 disabled:border-slate-300 disabled:text-slate-400 text-[11px] font-semibold py-2.5"
          >
            {t('ocrUpload')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void doOcr(f)
              e.target.value = ''
            }}
          />
        </div>

        {ocrBusy && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{t('ocrRunning')} {ocrStatus && `(${ocrStatus})`}</span>
              <span>{ocrPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${ocrPct}%` }} />
            </div>
          </div>
        )}

        {ocrError && <p className="text-[10px] text-rose-600">OCR error: {ocrError}</p>}

        {ocr && (
          <div className="space-y-2">
            {ocr.fields.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-600 mb-1">{t('ocrFields')}</p>
                <div className="flex flex-wrap gap-1">
                  {ocr.fields.map((f) => (
                    <span key={f.label} className="text-[9px] font-mono bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 text-slate-700">
                      {f.label}: <b>{f.value}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {attachTarget && attachDoc && (
              <button onClick={attach} className="w-full rounded-xl bg-amber-500 text-white text-[11px] font-bold py-2.5">
                📎 {t('ocrAttach')} {attachTarget.txId} — {attachDoc.doc}
              </button>
            )}
            <div>
              <p className="text-[10px] font-semibold text-slate-600 mb-1">{t('ocrExtract')}</p>
              <pre className="text-[9px] leading-relaxed text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2 whitespace-pre-wrap max-h-36 overflow-y-auto phone-scroll">{ocr.text}</pre>
            </div>
          </div>
        )}
        <p className="text-[10px] text-slate-400">{t('ocrNote')}</p>
      </div>

      <p className="text-[10px] text-slate-400 text-center">{t('demoDate')}</p>
    </div>
  )
}
