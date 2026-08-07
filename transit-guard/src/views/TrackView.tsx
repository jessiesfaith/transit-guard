import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import {
  VENDORS,
  LEG_KINDS,
  LOCATIONS,
  DEMO_TODAY,
  fmtUsd,
  fmtDate,
  legLabel,
  activeLeg,
  isDelivered,
  type Shipment,
  type LegKind,
} from '../data/seed'
import { downloadDocsPack } from '../docsPdf'

function DirectionBadge({ s }: { s: Shipment }) {
  const { t } = useI18n()
  if (s.direction === 'rma') return <span className="text-[9px] font-bold uppercase rounded-full bg-orange-100 text-orange-700 px-2 py-0.5">RMA</span>
  if (s.direction === 'internal') return <span className="text-[9px] font-bold uppercase rounded-full bg-slate-200 text-slate-600 px-2 py-0.5">{t('statusInternal')}</span>
  return <span className="text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">Sale</span>
}

function statusLine(s: Shipment, delivered: string): string {
  const leg = activeLeg(s)
  if (leg) return `${legLabel(leg.kind)} — ${leg.location.split(',')[0]}`
  if (isDelivered(s)) return delivered
  const last = s.legs[s.legs.length - 1]
  return last ? `${legLabel(last.kind)} — ${last.location.split(',')[0]}` : delivered
}

export default function TrackView({
  selectedTx,
  setSelectedTx,
}: {
  selectedTx: string | null
  setSelectedTx: (tx: string | null) => void
}) {
  const { t } = useI18n()
  const { state } = useStore()
  const selected = state.shipments.find((s) => s.txId === selectedTx)

  if (selected) return <Detail s={selected} onBack={() => setSelectedTx(null)} onOpenTx={setSelectedTx} />

  const sorted = [...state.shipments].sort((a, b) => Number(isDelivered(a)) - Number(isDelivered(b)))
  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-bold text-slate-900">{t('trackTitle')}</h2>
      {sorted.map((s) => {
        const done = s.legs.filter((l) => l.status === 'complete').length
        return (
          <button
            key={s.txId}
            onClick={() => setSelectedTx(s.txId)}
            className="w-full text-left rounded-2xl border border-slate-200 bg-white shadow-sm p-3.5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-slate-900">{s.txId}</span>
              <DirectionBadge s={s} />
            </div>
            <p className="text-xs text-slate-600">
              {s.product} × {s.unitCount} · {s.customer}
            </p>
            <div className="flex items-center justify-between">
              <p className={`text-[11px] font-medium ${isDelivered(s) ? 'text-emerald-600' : 'text-amber-600'}`}>
                {statusLine(s, t('statusDelivered'))}
              </p>
              <p className="text-[11px] font-semibold text-slate-700">{fmtUsd(s.salesValue)}</p>
            </div>
            <div className="flex gap-1">
              {s.legs.map((l) => (
                <div
                  key={l.id}
                  className={`h-1.5 flex-1 rounded-full ${l.status === 'complete' ? 'bg-emerald-500' : l.status === 'active' ? 'bg-amber-400' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              {done}/{s.legs.length} · {s.destination}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function QrPanel({ s }: { s: Shipment }) {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const leg = activeLeg(s)
  useEffect(() => {
    if (canvasRef.current && leg) {
      QRCode.toCanvas(canvasRef.current, `TG1|${s.txId}|${leg.id}|${leg.kind}`, {
        width: 104,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      }).catch(() => {})
    }
  }, [s.txId, leg])
  if (!leg) return null
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3.5 flex items-center gap-3">
      <canvas ref={canvasRef} className="rounded-lg border border-slate-100 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800">{t('qrTitle')}</p>
        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{t('qrHint')}</p>
        <p className="font-mono text-[10px] font-bold text-emerald-700 mt-1">{s.txId} · {legLabel(leg.kind)}</p>
      </div>
    </div>
  )
}

function Detail({ s, onBack, onOpenTx }: { s: Shipment; onBack: () => void; onOpenTx: (tx: string) => void }) {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [kind, setKind] = useState<LegKind>('truck')
  const [vendor, setVendor] = useState(VENDORS[1].name)
  const [location, setLocation] = useState(LOCATIONS[1])
  const [date, setDate] = useState(DEMO_TODAY)
  const [note, setNote] = useState('')

  const vendorOptions = VENDORS.filter((v) => v.kinds.includes(kind))
  const rmaExists = state.shipments.some((x) => x.linkedTo === s.txId)
  const canRma = s.direction === 'outbound' && isDelivered(s) && !rmaExists

  function saveLeg() {
    dispatch({
      type: 'ADD_LEG',
      txId: s.txId,
      leg: { kind, vendor, location, date, docs: [{ name: 'Hand-off receipt', ready: true }], note: note || undefined },
      toast: `${t('loggedToast')} ${s.txId}`,
    })
    setShowForm(false)
    setNote('')
  }

  function startRma() {
    const newId = `RMA-${s.txId.replace(/\D/g, '').slice(-4)}`
    dispatch({ type: 'START_RMA', txId: s.txId, toast: t('rmaStarted') })
    onOpenTx(newId)
  }

  return (
    <div className="p-4 space-y-4">
      <button onClick={onBack} className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
        ← {t('back')}
      </button>

      <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-base font-bold">{s.txId}</span>
          <DirectionBadge s={s} />
        </div>
        {s.linkedTo && (
          <p className="text-[10px] text-orange-300">
            ↩ {t('returnChain')} · <button className="underline" onClick={() => onOpenTx(s.linkedTo!)}>{s.linkedTo}</button>
          </p>
        )}
        <p className="text-xs text-slate-300">
          {s.product} × {s.unitCount} {t('unitsLbl')} · {s.serialsSample.join(', ')}
          {s.unitCount > s.serialsSample.length ? ` +${s.unitCount - s.serialsSample.length}` : ''}
        </p>
        <p className="text-xs text-slate-300">{s.customer} → {s.destination}</p>
        {s.orderNo && (
          <p className="text-[11px] text-slate-400">{t('orderNo')}: <span className="font-mono font-bold text-white">{s.orderNo}</span></p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px]">
          <span className="text-slate-400">{t('value')}: <span className="text-white font-semibold">{fmtUsd(s.salesValue)}</span></span>
          {s.incoterms && <span className="text-slate-400">{t('incoterms')}: <span className="text-white font-semibold">{s.incoterms}</span></span>}
          {s.invoice && <span className="text-slate-400">{t('invoiceLbl')}: <span className="text-white font-semibold">{s.invoice.id} · {fmtDate(s.invoice.date)}</span></span>}
        </div>
        {s.special && s.special.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1.5">
            {s.special.map((c) => (
              <span key={c} className="text-[9px] font-bold uppercase rounded-full bg-sky-900/80 border border-sky-500/50 text-sky-200 px-2 py-0.5">
                ❄ {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {s.country !== 'US' && s.country !== 'CA' && <QrPanel s={s} />}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{t('custodyChain')}</h3>
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-slate-200" />
          <div className="space-y-3">
            {s.legs.map((leg) => (
              <div key={leg.id} className="relative">
                <span
                  className={`absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                    leg.status === 'complete'
                      ? 'bg-emerald-500 border-emerald-500'
                      : leg.status === 'active'
                        ? 'bg-amber-400 border-amber-400 animate-pulse'
                        : 'bg-white border-slate-300'
                  }`}
                />
                <div className={`rounded-xl border p-3 ${leg.status === 'active' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">
                      {legLabel(leg.kind)}
                      {leg.via && (
                        <span className="ml-1.5 text-[8px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-700 px-1.5 py-0.5 align-middle">
                          ⇄ {t('viaApi')}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500">
                      {leg.date ? fmtDate(leg.date) : `${t('eta')} ${fmtDate(leg.eta)}`}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-600">{leg.vendor}</p>
                  <p className="text-[10px] text-slate-400">{leg.location}</p>
                  {leg.docs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {leg.docs.map((d) => (
                        <span
                          key={d.name}
                          className={`text-[9px] px-1.5 py-0.5 rounded-full border ${d.ready ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-amber-300 text-amber-700'}`}
                        >
                          {d.ready ? '✓' : '…'} {d.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {leg.accept === 'contacting' && (
                      <span className="text-[9px] font-semibold rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 animate-pulse">
                        ⏳ {t('agentContacting')}
                      </span>
                    )}
                    {leg.accept === 'accepted' && (
                      <span className="text-[9px] font-semibold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5">
                        ✓ {t('acceptedBy')}
                      </span>
                    )}
                    <button
                      onClick={() => downloadDocsPack(s, leg)}
                      className="text-[9px] font-bold rounded-lg bg-slate-900 text-white px-2 py-1"
                    >
                      📄 {t('docsPack')}
                    </button>
                    {leg.docsPack && (
                      <span className={`text-[9px] font-semibold rounded-full border px-2 py-0.5 ${leg.docsPack === 'received' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
                        {leg.docsPack === 'received' ? `✓ ${t('docsReceived')}` : `… ${t('docsInProgress')}`}
                      </span>
                    )}
                  </div>
                  {leg.note && <p className="text-[10px] italic text-slate-400 mt-1">{leg.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {canRma && (
        <button onClick={startRma} className="w-full rounded-xl border-2 border-orange-300 bg-orange-50 text-orange-700 text-xs font-bold py-2.5">
          ↩ {t('startRma')}
        </button>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="w-full rounded-xl bg-emerald-600 text-white text-xs font-bold py-3 shadow-sm">
          + {t('addLeg')}
        </button>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">{t('addLeg')}</p>
            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">{s.txId}</span>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('legType')}</label>
            <select
              value={kind}
              onChange={(e) => {
                const k = e.target.value as LegKind
                setKind(k)
                const v = VENDORS.find((vv) => vv.kinds.includes(k))
                if (v) setVendor(v.name)
              }}
              className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white"
            >
              {LEG_KINDS.map((l) => (
                <option key={l.key} value={l.key}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('vendor')}</label>
            <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white">
              {(vendorOptions.length ? vendorOptions : VENDORS).map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('location')}</label>
            <input list="tg-locations" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
            <datalist id="tg-locations">
              {LOCATIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('date')}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('notes')}</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="…" className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold py-2.5 bg-white">
              {t('cancel')}
            </button>
            <button onClick={saveLeg} className="flex-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold py-2.5">
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
