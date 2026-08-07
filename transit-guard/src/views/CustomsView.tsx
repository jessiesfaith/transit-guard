import { useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { CUSTOMS_REQUIREMENTS, PRODUCTS, fmtUsd } from '../data/seed'
import { downloadCustomsPack } from '../docsPdf'

export default function CustomsView() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const eligible = state.shipments.filter((s) => s.country !== 'US' && s.direction !== 'internal')
  const [txId, setTxId] = useState('TX-20481')
  const s = eligible.find((x) => x.txId === txId) ?? eligible[0]
  if (!s) return null

  const customsLeg = s.legs.find((l) => l.kind === 'customs')
  const reqs = CUSTOMS_REQUIREMENTS[s.country] ?? []
  const product = PRODUCTS[s.product]
  const declared = s.customsValue ?? 0
  const variance = s.salesValue - declared

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-slate-900">{t('customsTitle')}</h2>

      <div>
        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">{t('selectShipment')}</label>
        <select value={s.txId} onChange={(e) => setTxId(e.target.value)} className="w-full rounded-lg border border-slate-300 text-xs p-2 bg-white font-mono">
          {eligible.map((x) => (
            <option key={x.txId} value={x.txId}>
              {x.txId} — {x.destination}
            </option>
          ))}
        </select>
      </div>

      <button onClick={() => downloadCustomsPack(s)} className="w-full rounded-xl bg-slate-900 text-white text-xs font-bold py-3 shadow-sm">
        📄 {t('customsPdf')}
      </button>

      {customsLeg ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">{t('docsReady')}</p>
            <p className="text-xs font-bold text-emerald-700">
              {customsLeg.docs.filter((d) => d.ready).length}/{customsLeg.docs.length}
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(customsLeg.docs.filter((d) => d.ready).length / customsLeg.docs.length) * 100}%` }}
            />
          </div>
          <div className="space-y-2">
            {customsLeg.docs.map((d) => {
              const req = reqs.find((r) => r.doc === d.name)
              return (
                <div key={d.name} className={`rounded-xl border p-2.5 ${d.ready ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-300 bg-amber-50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800">
                      {d.ready ? '✓ ' : ''}{d.name}
                    </p>
                    {d.ready ? (
                      <span className="text-[9px] font-bold uppercase text-emerald-700">{t('ready')}</span>
                    ) : (
                      <button
                        onClick={() => dispatch({ type: 'SET_DOC_READY', txId: s.txId, legId: customsLeg.id, doc: d.name, toast: `${d.name} — ${t('ready')}` })}
                        className="text-[9px] font-bold uppercase rounded-full bg-amber-500 text-white px-2 py-1"
                      >
                        {t('markReady')}
                      </button>
                    )}
                  </div>
                  {req && <p className="text-[10px] text-slate-500 mt-0.5">{req.desc}</p>}
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-slate-400">{customsLeg.vendor} · {customsLeg.location}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
          <p className="text-xs font-bold text-slate-800">{t('docsReady')} — {s.destination}</p>
          {reqs.map((r) => (
            <div key={r.doc} className="rounded-xl border border-slate-200 p-2.5">
              <p className="text-xs font-semibold text-slate-800">{r.doc}</p>
              <p className="text-[10px] text-slate-500">{r.desc}</p>
            </div>
          ))}
        </div>
      )}

      {product && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">{t('valuationTitle')}</p>
            <span className="text-[9px] font-mono bg-slate-100 rounded-full px-2 py-0.5 text-slate-600">{t('hsCode')} {product.hs}</span>
          </div>
          <table className="w-full text-[11px]">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500">{t('customsList')}</td>
                <td className="py-1.5 text-right font-semibold text-slate-800">{fmtUsd(product.customsUnit)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500">{t('salesPrice')}</td>
                <td className="py-1.5 text-right font-semibold text-slate-800">{fmtUsd(product.salesUnit)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500">{t('declaredValue')} × {s.unitCount}</td>
                <td className="py-1.5 text-right font-bold text-slate-900">{fmtUsd(declared)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500">{t('invoiceValue')}</td>
                <td className="py-1.5 text-right font-bold text-slate-900">{fmtUsd(s.salesValue)}</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold text-amber-700">{t('variance')}</td>
                <td className="py-1.5 text-right font-bold text-amber-700">
                  {fmtUsd(variance)} ({declared > 0 ? Math.round((variance / s.salesValue) * 100) : 0}%)
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-slate-500 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-2">{t('valuationNote')}</p>
        </div>
      )}
    </div>
  )
}
