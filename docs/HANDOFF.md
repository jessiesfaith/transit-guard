# HANDOFF — Inventory Close Guard

> Living context-restoration document. If you are a new Claude session (or a session whose
> context window just reset), this file is your cold-start briefing. It assumes you have
> **zero conversation history**.

---

## 1. How to Use This Doc

Read in this order (all paths from the repo root):

1. **`CLAUDE.md`** — repo conventions, commands, and working rules for Claude sessions.
2. **This doc (`docs/HANDOFF.md`)** — current state, decisions, data map, and the next-steps queue.
3. **`docs/PRD.md`** — full product requirements: screens, copy, metrics, and demo flow.

Supporting references:

- **`docs/SOP.md`** — standard operating procedures, including the demo checklist and the rules for keeping this handoff current.
- **`README.md`** — public-facing project overview.
- **`Kickoff Prompt.md`** — the original source brief (authoritative for product copy).

**Keep this doc updated.** Per the SOP: whenever you complete a queue item, make a new decision, or discover a gotcha, update the relevant section here *in the same working session*. Add decisions to the Decisions Log with the date; move finished items out of the Next-Steps Queue and reflect them in Current State. This doc is only useful if it is never stale.

---

## 2. Project Snapshot

**Inventory Close Guard** — "The materiality-aware year-end inventory close agent" — is a hackathon prototype for **Fast Insights**, a fictional Series B physical-AI company (all data is synthetic). It demonstrates a FY2026 year-end inventory close (balance-sheet date December 31, 2026) across 1,200 serialized hardware units spread over warehouses, vendors, carriers, installation sites, customer locations, demo environments, and RMA facilities. Instead of sending every unit through expensive AI, a funnel routes by materiality: **Entire Inventory Population → Deterministic Reconciliation → Accounting Rules Engine → Materiality + Risk Scoring → Economy AI Classification → Premium AI Investigation → Controller Judgment**. Tagline: *"Every serial. One accounting truth."* Core principles: *"Materiality determines AI spend"*, *"AI investigates. Controllers conclude"*, and *"Inventory Close Guard never posts journal entries automatically."* Jessica is building this solo as a demo-polish-first hackathon SPA. **Current phase: docs and data are done; the app does not exist yet.**

---

## 3. Current State — as of 2026-08-07

| Area | Status |
| --- | --- |
| Kickoff prompt (`Kickoff Prompt.md`) | Analyzed in full |
| Dataset (seed JSON + XLSX) | Analyzed; structure mapped (see Data Map below) |
| Doc suite | **Created** — `README.md`, `CLAUDE.md`, `docs/PRD.md`, `docs/SOP.md`, `docs/HANDOFF.md` (this file) |
| Git | **Initialized** on `main` — commits `9971ae1` (docs + data), `2308c78` (scaffold) |
| App scaffold | **Complete** — Vite 7 + React 19 + TypeScript (strict) + Tailwind 4 (`@tailwindcss/vite`). `npm run build` passes; scaffold-verification page renders all seed-derived counts correctly at `localhost:5173`. Typed data layer in `src/types.ts` + `src/data.ts` (nullability verified against all 1,200 records). `.claude/launch.json` launches the dev server. |
| Six-section UI | **NOT started** — current `App.tsx` is a placeholder verification shell |
| **Transit Guard sibling app** (`transit-guard/`) | **Complete & verified** 2026-08-07 — second Guard-suite product, built for the hackathon pitch. Self-contained Vite 7 + React 19 + strict TS + Tailwind 4 app on **port 5174** (`npm run dev --prefix transit-guard`; launch config `transit-guard-dev`). Mobile phone-frame SPA, **6 tabs**: Scan (simulated scan + intake questionnaire), **Plan (AI vendor search: shipment form + need-by date → staged search → ranked vendor routes with per-leg ratings/cost/on-time for NL/CA/UK → customs-bulletin updates → Apply creates a new custody chain; AI promotes the fastest date-making route when the chosen priority would miss the need-by)**, Track (custody-chain timeline + add-hand-off dropdown form + one-tap RMA reverse chain + **EU hand-off QR** (`qrcode` lib, payload `TG1\|txId\|legId\|kind`) + "via partner API" chips for carrier-app interop), Customs (per-country doc checklists NL/CA/UK/**CH** + customs-list-vs-sales-price valuation table), Flags (6 precomputed AI flags: **$1M FOB-destination cold-chain**, $186K DAP cutoff, $39K valuation variance, $43K RMA accrual, $86K in-transit count, $6.5K Dec→Jan tax timing), Audit (1,200-unit count snapshot tying to the Close Guard fleet, custody-ledger CSV export, on-device Tesseract OCR). **Hero lane TX-20499**: $1M CryoSense Assay Kits, Palo Alto → New York → Atlantic → UK (Southampton T1) → Poland (Gdansk EU entry + re-ice) → Geneva; perishable, −2 °C, dry ice, FOB destination. Trilingual UI EN/ES/FR. OCR assets self-hosted in `transit-guard/public/` (worker + wasm cores, LSTM variants only + eng/spa/fra fast traineddata) so the demo works offline; CDN fallback if assets missing. **Two-profile carrier marketplace**: header profile switcher — 🏢 Fast Insights (6 tabs, full data) vs 🚚 Carrier add-in "Cascade Freight Lines" (3 tabs: Offers / Jobs / Scan; sees only the shipping transaction, never inventory/values/flags). Offers = Uber-style acceptance of AI-proposed loads (accepting adds the leg to the company's chain, $1,450 demo load); Jobs shows the carrier's legs + docs-pack button; vendor Scan is scripted: 1st label scan = pickup (docs pack → received, leg active), 2nd = **vendor auto-substitution** ("plan had Redline Haulage Co." — capability-aware: carrier only substitutes onto leg kinds it can run). Company Scan is now **label-scan-first** (label + order number + intake questionnaire; ORD- numbers on all shipments). **Docs-pack PDF** (jspdf, `src/docsPdf.ts`): company-approved customs valuation worksheet + packing slip + bill of lading + destination customs checklist, downloadable from any leg carrying `docsPack`; status "In progress — awaiting label scan" → "Received via label scan". **Agent rerouting**: declining an offer auto-reroutes it — 2.6s later the alternate carrier (Redline) accepts and the leg lands in the company chain with a "Rerouted by the agent" note (Uber-style availability matching on the chosen priority). **Per-stage documents**: every leg in the custody chain has a one-click "Docs pack (PDF)" button. **Web/mobile toggle** above the device frame: 🖥️ Web renders the same app as a desktop web layout (top nav, wide chrome) — the "responsive web app, viewable on mobile" story for vendors. Leg IDs are now deterministic (`LX-<context>`) — the reducer is pure (fixed a StrictMode duplicate-key bug from the old `legSeq++` counter). **Agent coordination policy** (`AGENT_POLICY` in seed): routes matched on carrier availability + weights & measures via availability APIs; human rejection triggers the upstream agent to reroute and re-verify delivery timing; auto-confirm only within ±10% / $200 / 2 days — beyond that a **sender-approval card** appears in Track (seeded on TX-20499: Δ +$450 breach, Approve swaps to Alpine Cold Transit AG, Reject sends the agent back within tolerance). Plan tab shows the policy card + per-route vendor-memory lines (constant: avg $/ton + owned lanes; variable: date-window availability — no per-order recompute). **EverOS handoff**: `docs/EVEROS_AGENT_PROMPT.md` — system prompt + seed memory files + setup steps for EverMind's EverOS; recommendation is to present from this app and show the doc as production wiring. **Customs tab PDF**: "Customs pack (PDF) — demo" button on the Customs tab downloads a 2-page demo-marked pack (valuation & terms incl. Incoterms explanation; destination checklist with live READY/PENDING states from the customs leg). **UK example shipment TX-20470** (10× ValeEdge E2 → London, DAP, at Heathrow customs, UKCA + CDS pending) seeded for the UK requirements demo; committed sample at `deck/Sample_Customs_Pack_UK_TX-20470.pdf` (renders inline on GitHub). Repo pushed to https://github.com/jessiesfaith/transit-guard (private). | `npm run build` passes; full click path verified in-browser in a fresh tab with zero console errors incl. decline → reroute, offer-accept → leg appears company-side, both vendor scans, OCR → auto-attach, Plan → Apply. Session state only; demo "today" is Dec 30, 2026. |
| **Transit Guard pitch deck** (`deck/Transit_Guard_Pitch.pptx`) | **Complete** 2026-08-07 — **12 slides**: title, problem (5 pains incl. vendor discovery), solution chain diagram, **$1M door-to-door lane (Palo Alto → NY → Atlantic → UK → Poland → Switzerland; perishable −2 °C dry ice, FOB destination)**, product tabs (6) + two-profile marketplace/docs-pack banner, AI flags (**$1.23M exposure**) + vendor-search note, ERP-complementary positioning + carrier-API/QR card, TAM $28B / SAM $6.5B / SOM $48M ARR with sourced market chart, competition, roadmap + pilot ask, **hackathon track slide (primary: Track 2 Value of Intelligence — $12K ACV + ~2% carrier take rate; cross-credit: Track 1 via the suite's 85% AI-consumption reduction; Evermind/Voice Cursor wiring plan; 3-min demo runbook)**, closing with the five-goals line. Validated + rendered via PowerPoint COM; speaker notes on every slide. Also `deck/Sample_Docs_Pack_TX-20499.pdf` — standalone sample of the in-app docs-pack PDF. Generator scripts live in the session scratchpad. |

If you are picking up from here, start at item 3 of the Next-Steps Queue (Section 6).

---

## 4. Decisions Log

| Date | Decision | Detail |
| --- | --- | --- |
| 2026-08-07 | Product spelling corrected to **"Guard"** | The kickoff prompt and data filenames misspell it "Gaurd". All docs and UI use "Guard". Use "Gaurd" **only** when quoting literal filenames or JSON keys (e.g. `inventory_close_gaurd_seed.json`). |
| 2026-08-07 | Stack: **React + Vite + Tailwind** single-page app | TypeScript. No router needed beyond simple section state if preferred; six-section navigation per PRD. |
| 2026-08-07 | **No backend, no API keys, no real AI calls** | The seed JSON is imported directly and is the single source of truth. All AI results, costs, and confidences are precomputed in the data. |
| 2026-08-07 | **"Run Inventory Close" is a staged simulation** | The primary CTA plays a scripted processing sequence over precomputed data, then reveals results and animates 410K → 63K tokens / "85% Reduction". No computation actually happens. |
| 2026-08-07 | **Journal entries never auto-post** | All three JEs are drafts with `Auto_Post: false`. The UI must never imply automatic posting — "AI investigates. Controllers conclude." |
| 2026-08-07 | Hackathon scope | No auth, no persistence (session state only). Polish and narrative clarity over production concerns. |
| 2026-08-07 | **Transit Guard built as a sibling app, not a Close Guard section** | Jessica's hackathon pitch pivoted to chain-of-custody shipment tracking. Built in `transit-guard/` (own package.json, port 5174) so the Close Guard demo and its seed-data conventions stay untouched. Branded as the second Fast Insights Guard-suite product; its Audit count snapshot (412+35+15+731+7 = 1,200 units) deliberately ties to the Close Guard fleet, and Transit Guard custody events are positioned as Close Guard's cutoff/existence evidence. Same suite principles apply: no real AI calls (flags precomputed), nothing auto-posts, all data synthetic. Transit Guard demo numbers ($186K hero shipment TX-20481, etc.) are deliberately distinct from Close Guard's key numbers to avoid confusion. |

---

## 5. Data Map

### Files (repo root)

| File | What it is |
| --- | --- |
| `inventory_close_gaurd_seed.json` | **1.8 MB** — the app's single source of truth. Import it; do not paste it into context (see Gotchas). |
| `fast_insights_inventory_close_gaurd_dataset.xlsx` | Same data across 9 sheets: Dashboard, Inventory_Snapshot, Exception_Cases, Evidence_Events, Token_Ledger, Proposed_JEs, Model_Assumptions, Close_Package, README. Human-readable mirror of the JSON. |

### Seed JSON top-level sections

| Key | Count | Notes |
| --- | --- | --- |
| `company` | — | Fast Insights profile |
| `summary` | — | Hero metrics: $3.20M Inventory Screened, $94K Potential Adjustments, 85% AI Consumption Reduction; "100% screened. 1.7% escalated." |
| `materialityPolicies` | 9 | See policy table below |
| `inventory` | 1,200 | One record per serialized unit |
| `exceptions` | 20 | The premium-investigation cases |
| `evidenceEvents` | 81 | Timeline events linked to exceptions |
| `tokenLedger` | 92 | AI usage rows (economy + premium) |
| `journalEntries` | 3 | JE-001 / JE-002 / JE-003, all `Auto_Post: false` |
| `closePackage` | 13 | Status rows — note: kickoff names **14** sections (see Gotchas) |

### Key inventory record fields

`Serial_Number`, `SKU`, `Product_Name`, `Category`, `Carrying_Value`, `ERP_Status`, `Recorded_Location`, `Physical_Location`, `Ownership_Status`, date fields (`Shipment/Delivery/Installation/First_Online/Invoice`), risk sub-scores (`Evidence_Conflict`, `Dollar_Materiality`, `Cutoff_Proximity`, `Ownership_Ambiguity`, `Aging_Risk`), `Risk_Score`, `Accounting_Assertions`, `Route_Tier`, `AI_Confidence`, `AI_Cost_USD`, `Reviewer`, `Review_Status`, `Exception_ID`, `Finding_Flag`, `Proposed_Adjustment`, `JE_ID`.

### Route tier split (must reconcile everywhere it appears)

| Tier | Units |
| --- | --- |
| RULES (rule-cleared) | 1,108 |
| ECONOMY (economy AI review) | 72 |
| PREMIUM (premium investigation) | 20 |
| **Total** | **1,200** |

Run results: 6 material findings, 3 draft journal entries, 7 open actions, close readiness 84%.

Intelligence P&L: naive baseline = 1,200 units / 410K tokens / $1.84 / 1,200 premium investigations. Inventory Close Guard = 1,200 screened / 63K tokens / $0.28 / 20 premium investigations → **85% less AI consumption**.

### Materiality policies (all 9)

| Policy | Value |
| --- | --- |
| Overall Inventory Materiality | $75,000 |
| Individual Exception Threshold | $5,000 |
| Cutoff Review Window | 7 days +/- |
| High-Risk Confidence Threshold | 0.8 |
| Inventory Aging Threshold | 270 days |
| Maximum Intelligence Budget | $0.50 |
| Baseline Premium Tokens | 410,000 |
| Baseline Estimated AI Cost | $1.84 |
| Baseline Premium Reviews | 1,200 |

### Hero exception — EXC-001 (the demo centerpiece)

- **Serial:** VE-E2-1048 — **Product:** ValeEdge E2 (Edge AI Appliance E2) — **Book value:** $14,800
- **Conflict:** ERP status Warehouse (WH-SJC-A01) vs. physical location Customer Site - Northstar Health
- **Evidence timeline:** Dec 22 order approved → Dec 27 shipped → Dec 29 carrier delivery confirmed → Dec 30 installation completed + device first online → Dec 31 inventory system still says warehouse → Jan 2 customer invoice generated
- **Assertions:** Existence; Cutoff; Classification — **Risk score:** 86.6 — **AI confidence:** 0.93
- **Economics:** ~$0.04 AI investigation cost vs. $14,800 exposure
- **Reviewer:** Jordan Lee - Accounting Manager — **Status:** Needs Contract Review
- **Linked JE:** JE-001 — Dr Cost of Hardware Revenue $14,800 / Cr Inventory $14,800, Pending Contract Review, `Auto_Post: false`

### Journal entries

| JE | Purpose | Amount | Linked exception | Status |
| --- | --- | --- | --- | --- |
| JE-001 | Cutoff correction | $14,800 | EXC-001 | Pending Contract Review |
| JE-002 | RMA inventory correction | $4,500 | EXC-003 | Pending Physical Confirmation |
| JE-003 | Obsolescence reserve | $42,000 | EXC-004 | Pending Controller Approval |

---

## 6. Next-Steps Queue (in order)

1. ~~**`git init` + initial commit** of docs and data files.~~ ✅ Done 2026-08-07 (`9971ae1`).
2. ~~**Scaffold the app** — Vite + React + TypeScript with Tailwind.~~ ✅ Done 2026-08-07 (`2308c78`).
3. **App shell + navigation** — six sections per PRD: Overview, Inventory, Exceptions, Evidence, Adjustments, Close Package. ⟵ **NEXT**
4. **Overview dashboard** — hero metrics ($3.20M / $94K / 85%) + Intelligence P&L comparison.
5. **"Run Inventory Close" staged sequence** — scripted processing messages, results reveal, 410K → 63K token animation, "85% Reduction".
6. **Inventory table** — 1,200 records with tier, risk, and status columns.
7. **Exceptions list + EXC-001 detail** — including the seven-event evidence timeline and the "why premium AI was authorized" panel.
8. **Adjustments view** — the three draft JEs, all clearly marked never-auto-post.
9. **Close Package view** — section statuses, "84% Close Ready".
10. **Closing screen + demo polish pass** — final metrics screen and copy check.
11. **Run the SOP demo checklist** (`docs/SOP.md`) end to end.

When you finish an item: check it off here, update Current State (Section 3), and log any new decisions (Section 4).

---

## 7. Known Gotchas

- **"Gaurd" spelling in data files.** `inventory_close_gaurd_seed.json` and `fast_insights_inventory_close_gaurd_dataset.xlsx` intentionally keep the kickoff's misspelling. Never "fix" the filenames or JSON keys — imports and references depend on them. All prose and UI say **"Guard"**.
- **`resolveJsonModule` is deliberately OFF** in `tsconfig.json`. Turning it on would make tsc infer the full literal type of the 1.8 MB seed on every build. `src/json.d.ts` declares `*.json` as `unknown` and `src/data.ts` casts to `SeedData` — keep this pattern.
- **Seed JSON is 1.8 MB.** Import it in code; do **not** read the whole file into a Claude context window. When you need to inspect structure, sample a few records (e.g. with a small Node/PowerShell snippet or `Read` with tight offsets) rather than reading the file end to end.
- **closePackage has 13 rows; the kickoff names 14 sections.** Verified against the seed: the missing 14th row is **AI Usage Ledger** (Controller Approval Log *is* present, status "Waiting on Evidence"). When building the Close Package view, render AI Usage Ledger as a derived section from the `tokenLedger` array (92 rows), per PRD §9.
- **Close Package label mismatch.** The seed names one row `Inventory-to-GL Reconciliation` while the kickoff (and PRD) call it "Inventory Subledger-to-GL Reconciliation". The Close Package view must map the seed label to the kickoff display name.
