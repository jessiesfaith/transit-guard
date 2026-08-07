# Inventory Close Guard

### Every serial. One accounting truth.

**The materiality-aware year-end inventory close agent** — a hackathon prototype built for **Fast Insights**, a fictional Series B physical-AI company.

Inventory Close Guard performs the FY2026 year-end inventory close (balance-sheet date December 31, 2026) across 1,200 serialized hardware units spread across warehouses, vendors, carriers, installation sites, customer locations, demo environments, and RMA facilities. Instead of pushing the entire population through expensive AI, it routes every unit through a materiality-aware funnel: deterministic controls clear the bulk, risk scoring escalates the rest, and premium AI investigates only where accounting judgment is actually worth the cost. The result: **$3.20M inventory screened**, **$94K potential adjustments**, **85% AI consumption reduction**. 100% screened. 1.7% escalated. AI investigates. Controllers conclude — Inventory Close Guard never posts journal entries automatically.

---

## How the Funnel Works

Every serialized unit passes through a 7-stage pipeline. Materiality determines AI spend.

```
Entire Inventory Population   (1,200 units)
        ↓
Deterministic Reconciliation
        ↓
Accounting Rules Engine       (1,108 rule-cleared)
        ↓
Materiality + Risk Scoring
        ↓
Economy AI Classification     (72 economy reviews)
        ↓
Premium AI Investigation      (20 premium investigations)
        ↓
Controller Judgment           (6 material findings, 3 draft JEs)
```

| | Traditional / Naive AI Review | Inventory Close Guard |
|---|---|---|
| Units | 1,200 | 1,200 screened |
| AI tokens | 410K | 63K |
| Estimated intelligence cost | $1.84 | $0.28 |
| Premium investigations | 1,200 | 20 |

**85% less AI consumption.** 100% coverage does not require 100% premium AI.

---

## Repository Structure

```
Inventory Close Guard/
├── README.md                                       ← you are here
├── CLAUDE.md                                       ← guidance for AI-assisted development
├── Kickoff Prompt.md                               ← original hackathon brief
├── inventory_close_gaurd_seed.json                 ← seed data (1.8 MB, single source of truth)
├── fast_insights_inventory_close_gaurd_dataset.xlsx← same data as a 9-sheet workbook
├── docs/
│   ├── PRD.md                                      ← product requirements
│   ├── SOP.md                                      ← repo operating rules + demo checklist
│   └── HANDOFF.md                                  ← build handoff and next steps
└── src/                                            ← app scaffold (planned — not yet scaffolded)
    └── React + Vite + Tailwind single-page app
```

The app itself does not exist yet — this repo currently contains docs and data only. `git init` is a planned next step.

---

## Data Files

> **Spelling note:** the kickoff prompt and both data files spell the product name "Gaurd". That misspelling is intentionally **preserved as-is in filenames and JSON keys** so nothing breaks; all product copy, docs, and UI use the correct spelling **"Guard"**.

### `inventory_close_gaurd_seed.json` (1.8 MB)

The single source of truth for the app. Top-level sections:

| Key | Records | Contents |
|---|---|---|
| `company` | — | Fast Insights profile, FY2026 period, close status |
| `summary` | — | Hero metrics and run results |
| `materialityPolicies` | 9 | Thresholds driving the routing funnel (see below) |
| `inventory` | 1,200 | Serialized units: SKU, carrying value, ERP vs. physical location, ownership, lifecycle dates, risk sub-scores, `Route_Tier` (RULES 1,108 / ECONOMY 72 / PREMIUM 20), AI confidence and cost, reviewer, review status |
| `exceptions` | 20 | Premium-tier exception cases (EXC-001 through EXC-020) |
| `evidenceEvents` | 81 | Timestamped evidence timeline entries |
| `tokenLedger` | 92 | Per-investigation AI token and cost records |
| `journalEntries` | 3 | Draft JEs — all `Auto_Post: false` |
| `closePackage` | 13 | Close package section status rows |

Key materiality policies: overall inventory materiality $75,000; individual exception threshold $5,000; cutoff review window ±7 days; high-risk confidence threshold 0.8; aging threshold 270 days; maximum intelligence budget $0.50; baselines of 410,000 premium tokens / $1.84 / 1,200 premium reviews.

### `fast_insights_inventory_close_gaurd_dataset.xlsx`

The same data as a 9-sheet workbook for human browsing: **Dashboard, Inventory_Snapshot, Exception_Cases, Evidence_Events, Token_Ledger, Proposed_JEs, Model_Assumptions, Close_Package, README**.

All data is synthetic — see the disclaimer below.

---

## Quickstart

> **Planned — available once the Vite app is scaffolded.** The commands below will work after the React + Vite + Tailwind scaffold lands (see [docs/HANDOFF.md](docs/HANDOFF.md)).

```bash
npm install
npm run dev
```

Then open the local dev URL and hit **Run Inventory Close**. The app has no backend, no API keys, and makes no real AI calls — the seed JSON is imported directly and the run experience is a staged reveal over precomputed data. Navigation: Overview, Inventory, Exceptions, Evidence, Adjustments, Close Package. Final deliverable: the **Fast Insights FY2026 Inventory Close Package** (84% Close Ready).

---

## Documentation

| Doc | Purpose |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product requirements: screens, funnel logic, hero exception EXC-001, demo flow |
| [docs/SOP.md](docs/SOP.md) | Operating rules for the repo: source-of-truth and naming/copy rules, dev workflow, pre-demo checklist |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Build handoff: technical decisions, scaffold plan, next steps |
| [CLAUDE.md](CLAUDE.md) | Repo conventions and guidance for AI-assisted development |
| [Kickoff Prompt.md](Kickoff%20Prompt.md) | The original hackathon brief (source of exact product copy) |

---

## Synthetic Data Disclaimer

Fast Insights is a fictional company. **All** financial information, customers, contracts, products, transactions, serial numbers, employees, vendors, and operational data in this repository are synthetic and generated for a hackathon prototype. Nothing here represents a real company, real people, or real financial records.

---

*Spend intelligence where judgment matters.*
