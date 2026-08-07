import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import {
  PLAN_DESTINATIONS,
  ROUTE_OPTIONS,
  CUSTOMS_UPDATES,
  DEMO_TODAY,
  addDays,
  daysBetween,
  fmtUsd,
  fmtDate,
  legLabel,
  type PlanCountry,
  type RouteOption,
  type RouteStrategy,
} from '../data/seed'

type Phase = 'form' | 'searching' | 'results'

function nextPlanTxId(existing: { txId: string }[]): string {
  const used = existing.filter((s) => /^TX-205\d\d$/.test(s.txId)).length
  return `TX-20${505 + used}`
}

export default function PlanView({ onOpenTx }: { onOpenTx: (txId: string) => void }) {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const [phase, setPhase] = useState<Phase>('form')
  const [country, setCountry] = useState<PlanCountry>('NL')
  const [weight, setWeight] = useState(66)
  const [cartons, setCartons] = useState(2)
  const [dims, setDims] = useState('60 × 40 × 35 cm')
  const [customer, setCustomer] = useState('Velocity Health Group')
  const [needBy, setNeedBy] = useState('2027-01-12')
  const [strategy, setStrategy] = useState<RouteStrategy>('balanced')
  const [lines, setLines] = useState<string[]>([])
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current) }, [])

  const dest = PLAN_DESTINATIONS.find((d) => d.key === country) ?? PLAN_DESTINATIONS[0]

  function search() {
    const all = [t('srch1'), t('srch2'), t('srch3'), t('srch4')]
    setLines([])
    setPhase('searching')
    let i = 0
    timer.current = window.setInterval(() => {
      i += 1
      setLines(all.slice(0, i))
      if (i >= all.length) {
        if (timer.current) window.clearInterval(timer.current)
        window.setTimeout(() => setPhase('results'), 650)
      }
    }, 550)
  }

  function apply(route: RouteOption) {
    const txId = nextPlanTxId(state.shipments)
    dispatch({
      type: 'APPLY_ROUTE',
      payload: { txId, route, country, city: dest.city, product: 'ValeEdge E2', unitCount: Math.max(1, Math.round(weight / 8.2)), customer },
      toast: `${t('routeApplied')} · ${txId}`,
    })
    onOpenTx(txId)
  }

  const updates = CUSTOMS_UPDATES.filter((u) => u.country === country)
  const daysAvail = daysBetween(DEMO_TODAY, needBy)
  // Rank: routes that make the need-by date first, then the chosen priority, then speed.
  const routes = [...ROUTE_OPTIONS[country]].sort((a, b) => {
    const am = a.transitDays <= daysAvail ? 0 : 1
    const bm = b.transitDays <= daysAvail ? 0 : 1
    if (am !== bm) return am - bm
    if ((a.strategy === strategy) !== (b.strategy === strategy)) return a.strategy === strategy ? -1 : 1
    return a.transitDays - b.transitDays
  })
  const aiOverrode = routes.length > 0 && routes[0].strategy !== strategy && routes[0].transitDays <= daysAvail

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
          <span className="text-emerald-600">✦</span> {t('planTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('planHint')}</p>
      </div>

      {phase === 'form' && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 space-y-1.5">
          <p className="text-xs font-bold text-indigo-900">✦ {t('policyTitle')}</p>
          <p className="text-[10px] text-slate-600 leading-relaxed">{t('policyMatch')}</p>
          <p className="text-[10px] text-slate-600 leading-relaxed">{t('policyTolerance')}</p>
          <p className="text-[10px] text-slate-600 leading-relaxed">{t('policyMemory')}</p>
        </div>
      )}

      {phase === 'form' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2.5">
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">{t('packageLbl')}</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[9px] text-slate-500 block mb-0.5">{t('weightLbl')}</label>
                <input type="number" min={1} value={weight} onChange={(e) => setWeight(Math.max(1, Number(e.target.value) || 1))} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
              </div>
              <div className="w-20">
                <label className="text-[9px] text-slate-500 block mb-0.5">{t('cartonsLbl')}</label>
                <input type="number" min={1} value={cartons} onChange={(e) => setCartons(Math.max(1, Number(e.target.value) || 1))} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-slate-500 block mb-0.5">{t('dimsLbl')}</label>
                <input value={dims} onChange={(e) => setDims(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('customerLbl')}</label>
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('destination')}</label>
              <select value={country} onChange={(e) => setCountry(e.target.value as PlanCountry)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white">
                {PLAN_DESTINATIONS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div className="w-36">
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('needBy')}</label>
              <input type="date" value={needBy} onChange={(e) => setNeedBy(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">{t('priority')}</label>
            <div className="flex gap-1.5">
              {([['fastest', t('prFastest')], ['balanced', t('prBalanced')], ['economy', t('prEconomy')]] as [RouteStrategy, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStrategy(key)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${strategy === key ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 bg-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={search} className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold py-3 shadow-sm">
            ✦ {t('aiSearch')}
          </button>
        </div>
      )}

      {phase === 'searching' && (
        <div className="rounded-2xl bg-slate-900 p-4 space-y-2.5 min-h-44">
          {lines.map((l, i) => (
            <p key={i} className={`text-[11px] font-mono ${i === lines.length - 1 ? 'text-emerald-300 animate-pulse' : 'text-slate-400'}`}>
              {i === lines.length - 1 ? '▸ ' : '✓ '}{l}
            </p>
          ))}
        </div>
      )}

      {phase === 'results' && (
        <>
          <button onClick={() => setPhase('form')} className="text-xs font-semibold text-emerald-700">← {t('back')}</button>
          {aiOverrode && (
            <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 leading-relaxed">
              ✦ {t('aiOverride')}
            </p>
          )}
          {routes.map((r, idx) => {
            const arrival = addDays(DEMO_TODAY, r.transitDays)
            const meets = r.transitDays <= daysAvail
            const strategyLabel = r.strategy === 'fastest' ? t('prFastest') : r.strategy === 'balanced' ? t('prBalanced') : t('prEconomy')
            return (
              <div key={r.id} className={`rounded-2xl border bg-white shadow-sm p-3.5 space-y-2.5 ${idx === 0 ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{r.name}</p>
                    <span className="text-[9px] font-bold uppercase rounded-full bg-slate-100 text-slate-500 px-2 py-0.5">{strategyLabel}</span>
                    {idx === 0 && <span className="text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">AI ✦</span>}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{fmtUsd(r.cost)}</p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  <span><b className="text-slate-900">{r.transitDays}</b> {t('transitLbl')}</span>
                  <span><b className="text-slate-900">{r.onTime}%</b> {t('onTimeLbl')}</span>
                  <span>{t('arrivesLbl')} <b className="text-slate-900">{fmtDate(arrival)}</b></span>
                </div>
                <p className={`text-[11px] font-semibold ${meets ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {meets ? `✓ ${t('meets')} (${fmtDate(needBy)})` : `⚠ ${t('misses')} (${fmtDate(needBy)})`}
                </p>
                <div className="space-y-1">
                  {r.legs.map((rl, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-600">
                        <span className="text-emerald-600 font-bold">{i + 1}.</span> {legLabel(rl.kind)} — {rl.vendor}
                      </span>
                      <span className="text-slate-400 whitespace-nowrap pl-2">★ {rl.rating.toFixed(1)} · {rl.days}d</span>
                    </div>
                  ))}
                </div>
                {r.memory && <p className="text-[10px] italic text-indigo-700/80">{r.memory} · ~{weight} kg · {cartons} × {dims}</p>}
                {r.note && <p className="text-[10px] italic text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">{r.note}</p>}
                <button onClick={() => apply(r)} className="w-full rounded-xl bg-emerald-600 text-white text-xs font-bold py-2.5">
                  {t('applyRoute')} → {t('custodyChain')}
                </button>
              </div>
            )
          })}

          <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 space-y-2">
            <p className="text-xs font-bold text-slate-800">🛃 {t('customsUpdates')} — {dest.label}</p>
            <p className="text-[10px] text-slate-500">{t('updatesSub')}</p>
            {updates.map((u) => (
              <div key={u.title} className="rounded-xl bg-white border border-sky-200 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-bold uppercase rounded-full px-2 py-0.5 ${u.kind === 'new' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {u.kind === 'new' ? t('newBadge') : t('changeBadge')}
                  </span>
                  <span className="text-[10px] text-slate-400">{fmtDate(u.date)}</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-800 mt-1">{u.title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{u.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed text-center px-2">{t('planNote')}</p>
        </>
      )}
    </div>
  )
}
