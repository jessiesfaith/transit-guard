import { seed } from './data'

// Scaffold-verification shell. Every number below is derived from the seed at
// runtime so a rendering page proves the data pipeline works end to end.
// The real six-section app shell replaces this (docs/HANDOFF.md queue item 3).

const usd = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${Math.round(n / 1000)}K`

function App() {
  const { summary, inventory, exceptions, evidenceEvents, tokenLedger, journalEntries, closePackage } = seed

  const tierCount = (tier: string) =>
    inventory.filter((r) => r.Route_Tier === tier).length

  const checks: Array<[string, string | number]> = [
    ['Inventory records', inventory.length.toLocaleString()],
    ['Inventory value screened', usd(summary.inventoryValue)],
    ['Rule-cleared (RULES)', tierCount('RULES').toLocaleString()],
    ['Economy AI reviews (ECONOMY)', tierCount('ECONOMY')],
    ['Premium investigations (PREMIUM)', tierCount('PREMIUM')],
    ['Exception cases', exceptions.length],
    ['Evidence events', evidenceEvents.length],
    ['Token ledger rows', tokenLedger.length],
    ['Draft journal entries', journalEntries.length],
    ['Close package sections', closePackage.length],
    ['Potential adjustments', usd(summary.potentialAdjustments)],
    ['AI consumption reduction', `${Math.round(summary.tokenReduction * 100)}%`],
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-8 py-5">
        <div className="mx-auto flex max-w-5xl items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Inventory Close Guard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Materiality-Aware Inventory Close
            </p>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p className="font-medium text-slate-200">{seed.company.name}</p>
            <p>FY2026 · Balance-Sheet Date December 31, 2026</p>
            <p>
              Close Status:{' '}
              <span className="font-medium text-amber-400">In Review</span>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-medium">Scaffold verification</h2>
          <p className="mt-1 text-sm text-slate-400">
            Seed data loaded from{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">
              inventory_close_gaurd_seed.json
            </code>{' '}
            — all figures below are derived at runtime.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            {checks.map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-8 pb-10 text-sm text-slate-500">
        Every serial. One accounting truth.
      </footer>
    </div>
  )
}

export default App
