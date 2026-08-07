import { useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { SCAN_QUEUE, DEMO_TODAY, fmtDate } from '../data/seed'

type Phase = 'idle' | 'scanning' | 'review'
type Purpose = 'sale' | 'internal' | 'rma'

export default function ScanView({ onOpenTx }: { onOpenTx: (txId: string) => void }) {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const [phase, setPhase] = useState<Phase>('idle')
  const [queueIdx, setQueueIdx] = useState(0)
  const [purpose, setPurpose] = useState<Purpose>('sale')
  const [reason, setReason] = useState('reasonDemo')
  const [attachTx, setAttachTx] = useState('')

  const current = SCAN_QUEUE[queueIdx % SCAN_QUEUE.length]
  const openSaleTx = state.shipments.filter((s) => s.direction === 'outbound')

  function startScan() {
    setPhase('scanning')
    setAttachTx(current.txId)
    window.setTimeout(() => setPhase('review'), 1500)
  }

  function confirm() {
    const purposeLabel =
      purpose === 'sale' ? t('purposeSale') : purpose === 'internal' ? `${t('purposeInternal')} — ${t(reason as 'reasonDemo')}` : t('purposeRma')
    const tx = purpose === 'internal' ? `TX-INT-${String(4460 + queueIdx)}` : attachTx
    dispatch({
      type: 'LOG_SCAN',
      scan: { serial: current.serial, product: current.product, txId: tx, purpose: purposeLabel, at: DEMO_TODAY },
      toast: `${t('loggedToast')} ${tx}`,
    })
    if (purpose === 'sale') {
      dispatch({ type: 'COMPLETE_ACTIVE_LEG', txId: attachTx, date: DEMO_TODAY })
    }
    setQueueIdx((i) => i + 1)
    setPhase('idle')
    setPurpose('sale')
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t('scanTitle')}</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('scanHint')}</p>
      </div>

      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={startScan}
            className="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />
            </svg>
            <span className="font-semibold">{t('scanButton')}</span>
          </button>
          <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            {t('sameTx')}
          </p>
        </div>
      )}

      {phase === 'scanning' && (
        <div className="relative h-56 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-6 border-2 border-emerald-400/60 rounded-xl" />
          <div className="scanline absolute left-8 right-8 h-0.5 bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.8)]" />
          <p className="text-emerald-300 text-sm font-mono animate-pulse">{t('scanning')}</p>
        </div>
      )}

      {phase === 'review' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">{t('scanned')}</span>
            <span className="font-mono text-sm font-bold text-slate-900">{current.serial}</span>
          </div>
          <p className="text-xs text-slate-500">
            {t('product')}: <span className="font-medium text-slate-800">{current.product}</span>
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">{t('purposeQ')}</p>
            {(
              [
                ['sale', t('purposeSale')],
                ['internal', t('purposeInternal')],
                ['rma', t('purposeRma')],
              ] as [Purpose, string][]
            ).map(([key, label]) => (
              <label key={key} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs cursor-pointer ${purpose === key ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600'}`}>
                <input type="radio" name="purpose" className="accent-emerald-600" checked={purpose === key} onChange={() => setPurpose(key)} />
                {label}
              </label>
            ))}
          </div>

          {purpose === 'internal' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('internalReason')}</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white">
                <option value="reasonDemo">{t('reasonDemo')}</option>
                <option value="reasonRnd">{t('reasonRnd')}</option>
                <option value="reasonReplace">{t('reasonReplace')}</option>
              </select>
            </div>
          )}

          {purpose !== 'internal' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('attachTo')}</label>
              <select value={attachTx} onChange={(e) => setAttachTx(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white font-mono">
                {(purpose === 'rma' ? state.shipments.filter((s) => s.direction === 'rma') : openSaleTx).map((s) => (
                  <option key={s.txId} value={s.txId}>
                    {s.txId} — {s.customer}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setPhase('idle')} className="flex-1 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold py-2.5">
              {t('cancel')}
            </button>
            <button onClick={confirm} className="flex-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold py-2.5 shadow-sm">
              {t('confirmLog')}
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{t('recentScans')}</h3>
        <div className="space-y-2">
          {state.scans.map((s, i) => (
            <button key={i} onClick={() => onOpenTx(s.txId)} className="w-full text-left rounded-xl border border-slate-200 bg-white px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-bold text-slate-800">{s.serial}</p>
                <p className="text-[10px] text-slate-500">{s.purpose}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-emerald-700 font-semibold">{s.txId}</p>
                <p className="text-[10px] text-slate-400">{fmtDate(s.at)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
