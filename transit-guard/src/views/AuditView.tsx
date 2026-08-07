import { useI18n, type StringKey } from '../i18n'
import { useStore } from '../store'
import { COUNT_SNAPSHOT } from '../data/seed'

export default function AuditView() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()

  const totalUnits = COUNT_SNAPSHOT.reduce((a, b) => a + b.units, 0)
  const maxUnits = Math.max(...COUNT_SNAPSHOT.map((b) => b.units))

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

      <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 leading-relaxed text-center">
        {t('goalNote')}
      </p>
      <p className="text-[10px] text-slate-400 text-center">{t('demoDate')}</p>
    </div>
  )
}
