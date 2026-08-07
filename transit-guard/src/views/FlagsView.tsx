import { useI18n } from '../i18n'
import { SEED_FLAGS, fmtUsd, type Flag } from '../data/seed'

const SEV_STYLES: Record<Flag['severity'], { chip: string; border: string }> = {
  high: { chip: 'bg-rose-100 text-rose-700', border: 'border-rose-200' },
  medium: { chip: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  planning: { chip: 'bg-sky-100 text-sky-700', border: 'border-sky-200' },
}

export default function FlagsView({ onOpenTx }: { onOpenTx: (txId: string) => void }) {
  const { t } = useI18n()
  const sevLabel: Record<Flag['severity'], string> = {
    high: t('sevHigh'),
    medium: t('sevMedium'),
    planning: t('sevPlanning'),
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t('flagsTitle')}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t('flagsSub')}</p>
      </div>

      {SEED_FLAGS.map((f) => {
        const st = SEV_STYLES[f.severity]
        return (
          <div key={f.id} className={`rounded-2xl border ${st.border} bg-white shadow-sm p-3.5 space-y-2`}>
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[9px] font-bold uppercase rounded-full px-2 py-0.5 ${st.chip}`}>{sevLabel[f.severity]}</span>
              {f.amount !== undefined && <span className="text-sm font-bold text-slate-900">{fmtUsd(f.amount)}</span>}
            </div>
            <p className="text-xs font-bold text-slate-800 leading-snug">{f.title}</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">{f.detail}</p>
            {f.txId && (
              <button onClick={() => onOpenTx(f.txId!)} className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                {f.txId} →
              </button>
            )}
            <details className="group">
              <summary className="text-[10px] font-semibold text-slate-500 cursor-pointer list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform">▸</span> {t('whyMatters')} · {t('suggested')}
              </summary>
              <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-slate-100">
                <p className="text-[11px] text-slate-600 leading-relaxed"><span className="font-semibold">{t('whyMatters')}:</span> {f.why}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed"><span className="font-semibold">{t('suggested')}:</span> {f.action}</p>
              </div>
            </details>
          </div>
        )
      })}

      <p className="text-[10px] text-slate-400 leading-relaxed text-center px-2 pt-1">{t('aiNote')}</p>
    </div>
  )
}
