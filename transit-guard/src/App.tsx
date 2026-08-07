import { useEffect, useState } from 'react'
import { I18nProvider, useI18n, LANGS } from './i18n'
import { StoreProvider, useStore } from './store'
import ScanView from './views/ScanView'
import PlanView from './views/PlanView'
import TrackView from './views/TrackView'
import CustomsView from './views/CustomsView'
import FlagsView from './views/FlagsView'
import AuditView from './views/AuditView'
import { OffersView, JobsView, VendorScanView } from './views/VendorViews'

type Tab = 'scan' | 'plan' | 'track' | 'customs' | 'flags' | 'audit' | 'offers' | 'jobs'

function TabIcon({ tab }: { tab: Tab }) {
  const paths: Record<Tab, string> = {
    scan: 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10',
    plan: 'M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3zM18.5 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z',
    track: 'M1 8h12v8H1zM13 11h4l3 3v2h-7zM5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    customs: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
    flags: 'M5 21V4M5 4h12l-2.5 4L17 12H5',
    audit: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zM9 12l2 2 4-4',
    offers: 'M2 12h5l2 3h6l2-3h5M4.5 5h15L22 12v7H2v-7l2.5-7z',
    jobs: 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 7h18v13H3V7zM3 12h18',
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[tab]} />
    </svg>
  )
}

function Toast() {
  const { state, dispatch } = useStore()
  useEffect(() => {
    if (!state.toast) return
    const id = window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2600)
    return () => window.clearTimeout(id)
  }, [state.toast, dispatch])
  if (!state.toast) return null
  return (
    <div className="absolute bottom-20 left-4 right-4 z-30">
      <div className="rounded-xl bg-slate-900/95 text-white text-xs font-medium px-4 py-3 shadow-lg text-center">
        ✓ {state.toast}
      </div>
    </div>
  )
}

function Phone({ wide }: { wide: boolean }) {
  const { t, lang, setLang } = useI18n()
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState<Tab>('scan')
  const [selectedTx, setSelectedTx] = useState<string | null>(null)
  const role = state.role

  function openTx(txId: string) {
    setSelectedTx(txId)
    setTab('track')
  }

  function switchRole(next: 'company' | 'vendor') {
    if (next === role) return
    dispatch({ type: 'SET_ROLE', role: next })
    setSelectedTx(null)
    setTab(next === 'company' ? 'scan' : 'offers')
  }

  const companyTabs: { key: Tab; label: string }[] = [
    { key: 'scan', label: t('navScan') },
    { key: 'plan', label: t('navPlan') },
    { key: 'track', label: t('navTrack') },
    { key: 'customs', label: t('navCustoms') },
    { key: 'flags', label: t('navFlags') },
    { key: 'audit', label: t('navAudit') },
  ]
  const vendorTabs: { key: Tab; label: string }[] = [
    { key: 'offers', label: t('navOffers') },
    { key: 'jobs', label: t('navJobs') },
    { key: 'scan', label: t('navScan') },
  ]
  const tabs = role === 'company' ? companyTabs : vendorTabs

  const tabBar = (
    <div className={wide ? 'bg-white border-b border-slate-200 px-2 py-1 flex justify-center gap-5' : 'bg-white border-t border-slate-200 px-2 py-2 flex'}>
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => {
            setTab(key)
            if (key !== 'track') setSelectedTx(null)
          }}
          className={`${wide ? 'px-3' : 'flex-1'} flex flex-col items-center gap-0.5 py-1 rounded-xl ${tab === key ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <TabIcon tab={key} />
          <span className="text-[9px] font-semibold">{label}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div
      className={
        wide
          ? 'relative w-[900px] max-w-[94vw] h-[92vh] bg-slate-50 rounded-2xl border border-slate-700 shadow-2xl shadow-black/50 overflow-hidden flex flex-col'
          : 'relative w-[390px] max-w-full h-[800px] max-h-[94vh] bg-slate-50 rounded-[2.5rem] border-[10px] border-slate-900 shadow-2xl shadow-black/50 overflow-hidden flex flex-col'
      }
    >
      <div className="bg-slate-900 text-white px-5 pt-2 pb-3">
        {!wide && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
            <span>9:41</span>
            <span className="w-16 h-4 bg-black rounded-full" />
            <span>▮▮▮ 100%</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-tight">
              {t('appName')} <span className={role === 'company' ? 'text-emerald-400' : 'text-indigo-400'}>·</span>
            </h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest">
              {role === 'company' ? `${t('suite')} — ${t('tagline')}` : `${state.vendorName} — ${t('vendorTagline')}`}
            </p>
          </div>
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-[9px] font-bold rounded-md px-1.5 py-1 ${lang === l.code ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => switchRole('company')}
            className={`flex-1 text-[10px] font-bold rounded-lg px-2 py-1.5 ${role === 'company' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            🏢 {t('roleCompany')}
          </button>
          <button
            onClick={() => switchRole('vendor')}
            className={`flex-1 text-[10px] font-bold rounded-lg px-2 py-1.5 ${role === 'vendor' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            🚚 {t('roleVendor')} — {state.vendorName.split(' ')[0]}
          </button>
        </div>
      </div>

      {wide && tabBar}

      <div className="flex-1 overflow-y-auto phone-scroll">
        <div className={wide ? 'max-w-xl mx-auto' : undefined}>
        {role === 'company' ? (
          <>
            {tab === 'scan' && <ScanView onOpenTx={openTx} />}
            {tab === 'plan' && <PlanView onOpenTx={openTx} />}
            {tab === 'track' && <TrackView selectedTx={selectedTx} setSelectedTx={setSelectedTx} />}
            {tab === 'customs' && <CustomsView />}
            {tab === 'flags' && <FlagsView onOpenTx={openTx} />}
            {tab === 'audit' && <AuditView />}
          </>
        ) : (
          <>
            {tab === 'offers' && <OffersView />}
            {tab === 'jobs' && <JobsView />}
            {tab === 'scan' && <VendorScanView />}
          </>
        )}
        <div className="h-4" />
        </div>
      </div>

      <Toast />

      {!wide && tabBar}
    </div>
  )
}

function Device() {
  const [mode, setMode] = useState<'mobile' | 'web'>('mobile')
  return (
    <div className="flex flex-col items-center gap-3 min-w-0">
      <div className="flex gap-1 rounded-full bg-slate-800/80 border border-slate-700 p-1">
        <button
          onClick={() => setMode('mobile')}
          className={`text-[11px] font-bold rounded-full px-3 py-1 ${mode === 'mobile' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
        >
          📱 Mobile
        </button>
        <button
          onClick={() => setMode('web')}
          className={`text-[11px] font-bold rounded-full px-3 py-1 ${mode === 'web' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
        >
          🖥️ Web
        </button>
      </div>
      <Phone wide={mode === 'web'} />
    </div>
  )
}

function SidePanels({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center gap-10 p-6">
      <aside className="hidden xl:block w-64 text-slate-300 space-y-4">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2">Fast Insights Guard Suite</p>
          <p className="text-sm font-bold text-white leading-snug">Transit Guard tracks custody in motion.</p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Every hand-off feeds Inventory Close Guard at year-end — one transaction ID from shelf to customer to close package.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2">Complementary to</p>
          <p className="text-xs text-slate-300 leading-relaxed">NetSuite · Oracle · SAP · BlackLine</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">The capture layer your ERP is missing — not a replacement.</p>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed"><span className="text-indigo-300 font-semibold">⇄ Carrier apps plug in too:</span> partner shipping apps log hand-offs through the Transit Guard API and keep the same transaction ID — QR scans in the EU.</p>
        </div>
      </aside>

      {children}

      <aside className="hidden xl:block w-64 text-slate-300">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-3">Demo script</p>
          <ol className="text-xs text-slate-400 space-y-2.5 leading-snug list-decimal list-inside">
            <li><b className="text-slate-200">Scan</b> — scan a serial, answer "why is it leaving?", log to TX-20490.</li>
            <li><b className="text-slate-200">Plan</b> — AI vendor search: Utrecht, need-by Jan 12 → ranked routes + customs bulletins → Apply → new chain appears in Track.</li>
            <li><b className="text-slate-200">Track</b> — open TX-20481: warehouse → truck → boatyard → ocean → Rotterdam → customs. Add a hand-off with dropdowns.</li>
            <li><b className="text-slate-200">$1M lane</b> — open TX-20499: Palo Alto → New York → ocean → UK → Poland → Geneva. Perishable −2 °C, dry ice re-icing, FOB destination, EU hand-off QR, partner-API legs.</li>
            <li><b className="text-slate-200">Docs pack</b> — on a proposed vendor leg, tap "Docs pack (PDF)": company-approved valuation worksheet + packing slip + BOL. Status stays "in progress" until the carrier scans the label.</li>
            <li><b className="text-slate-200">Carrier add-in</b> — switch profile (🚚): accept the AI-proposed load in Offers (Uber-style), then Scan the label — pickup receives the docs pack; the second scan shows a different carrier taking a load and the chain auto-updating.</li>
            <li><b className="text-slate-200">Customs</b> — doc checklist + customs price list vs. sales invoice ($147K vs $186K).</li>
            <li><b className="text-slate-200">Flags</b> — $186K DAP cutoff risk, RMA accrual, Dec-vs-Jan tax timing.</li>
            <li><b className="text-slate-200">Audit</b> — count snapshot, CSV export, run OCR on the sample doc (ES/FR/EN) and attach it.</li>
          </ol>
        </div>
      </aside>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <StoreProvider>
        <SidePanels>
          <Device />
        </SidePanels>
      </StoreProvider>
    </I18nProvider>
  )
}
