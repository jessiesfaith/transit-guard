import { useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { VENDOR_SCAN_QUEUE, fmtUsd, fmtDate, legLabel } from '../data/seed'
import { downloadDocsPack } from '../docsPdf'

export function OffersView() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const offers = state.offers.filter((o) => o.vendor === state.vendorName)

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t('offersTitle')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('offersSub')}</p>
      </div>
      {offers.map((o) => (
        <div key={o.id} className={`rounded-2xl border bg-white shadow-sm p-3.5 space-y-2 ${o.status === 'offered' ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-900">{o.txId}</span>
            {o.status === 'offered' && <span className="text-[9px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 animate-pulse">✦ AI offer</span>}
            {o.status === 'accepted' && <span className="text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">✓ {t('acceptedLbl')}</span>}
            {o.status === 'declined' && <span className="text-[9px] font-bold uppercase rounded-full bg-slate-200 text-slate-500 px-2 py-0.5">{t('declinedLbl')}</span>}
          </div>
          <p className="text-xs font-semibold text-slate-800">{o.summary}</p>
          <p className="text-[10px] text-slate-500">{o.from} → {o.to}</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600">{t('pickupLbl')}: <b className="text-slate-900">{fmtDate(o.pickup)}</b></span>
            <span className="font-bold text-emerald-700">{fmtUsd(o.payout)} {t('payoutLbl')}</span>
          </div>
          {o.status === 'offered' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  dispatch({ type: 'DECLINE_OFFER', offerId: o.id, toast: t('rerouting') })
                  window.setTimeout(() => {
                    dispatch({ type: 'REROUTE_ACCEPT', offerId: o.id, altVendor: 'Redline Haulage Co.', toast: t('rerouted') })
                  }, 2600)
                }}
                className="flex-1 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold py-2.5 bg-white"
              >
                {t('declineBtn')}
              </button>
              <button
                onClick={() => dispatch({ type: 'ACCEPT_OFFER', offerId: o.id, toast: t('offerAccepted') })}
                className="flex-1 rounded-xl bg-indigo-600 text-white text-xs font-bold py-2.5 shadow-sm"
              >
                ✓ {t('acceptBtn')}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function JobsView() {
  const { t } = useI18n()
  const { state } = useStore()
  const jobs = state.shipments.filter((s) => s.legs.some((l) => l.vendor === state.vendorName))

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t('jobsTitle')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('jobsSub')}</p>
      </div>
      {jobs.map((s) => {
        const mine = s.legs.filter((l) => l.vendor === state.vendorName)
        return (
          <div key={s.txId} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">{s.txId}</span>
              <span className="font-mono text-[10px] text-slate-500">{s.orderNo ?? ''}</span>
            </div>
            {s.special && s.special.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {s.special.map((c) => (
                  <span key={c} className="text-[9px] font-bold uppercase rounded-full bg-sky-100 text-sky-700 px-2 py-0.5">❄ {c}</span>
                ))}
              </div>
            )}
            {mine.map((l) => (
              <div key={l.id} className={`rounded-xl border p-2.5 ${l.status === 'active' ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">{legLabel(l.kind)}</p>
                  <span className={`text-[9px] font-bold uppercase rounded-full px-2 py-0.5 ${l.status === 'complete' ? 'bg-emerald-100 text-emerald-700' : l.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {l.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">→ {l.location}</p>
                <p className="text-[10px] text-slate-400">{l.date ? fmtDate(l.date) : `${t('eta')} ${fmtDate(l.eta)}`}</p>
                {l.docsPack && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <button
                      onClick={() => downloadDocsPack(s, l, false)}
                      className="text-[10px] font-bold rounded-lg bg-slate-900 text-white px-2.5 py-1.5"
                    >
                      📄 {t('shippingDocs')}
                    </button>
                    <span className={`text-[9px] font-semibold rounded-full border px-2 py-0.5 ${l.docsPack === 'received' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
                      {l.docsPack === 'received' ? `✓ ${t('docsReceived')}` : `… ${t('docsInProgress')}`}
                    </span>
                  </div>
                )}
                {l.note && <p className="text-[10px] italic text-slate-400 mt-1">{l.note}</p>}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function VendorScanView() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const [scanIdx, setScanIdx] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [history, setHistory] = useState<{ orderNo: string; txId: string; mode: string }[]>([])

  function scan() {
    const entry = VENDOR_SCAN_QUEUE[scanIdx % VENDOR_SCAN_QUEUE.length]
    setScanning(true)
    window.setTimeout(() => {
      dispatch({
        type: 'VENDOR_LABEL_SCAN',
        txId: entry.txId,
        vendor: state.vendorName,
        mode: entry.mode,
        toast: `${t('labelScanned')} · ${entry.orderNo} → ${entry.txId}`,
      })
      setHistory((h) => [{ orderNo: entry.orderNo, txId: entry.txId, mode: entry.mode }, ...h])
      setScanIdx((i) => i + 1)
      setScanning(false)
    }, 1500)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t('scanTitle')}</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('vendorScanHint')}</p>
      </div>
      {scanning ? (
        <div className="relative h-56 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-6 border-2 border-indigo-400/60 rounded-xl" />
          <div className="scanline absolute left-8 right-8 h-0.5 bg-indigo-400 shadow-[0_0_12px_2px_rgba(129,140,248,0.8)]" />
          <p className="text-indigo-300 text-sm font-mono animate-pulse">{t('scanning')}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <button
            onClick={scan}
            className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v5M16 8v8" />
            </svg>
            <span className="font-semibold">{t('scanButton')}</span>
          </button>
        </div>
      )}
      {history.length > 0 && (
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-bold text-slate-800">{h.orderNo}</p>
                <p className="text-[10px] text-slate-500">
                  {h.mode === 'substitute' ? '⇄ Vendor auto-updated from label' : '✓ Pickup — docs pack received'}
                </p>
              </div>
              <p className="font-mono text-[10px] text-indigo-700 font-semibold">{h.txId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
