# Product Requirements Document — Inventory Close Guard

**Product:** Inventory Close Guard — *The materiality-aware year-end inventory close agent*
**Company:** Fast Insights (fictional Series B physical-AI company; all data is synthetic)
**Tagline:** Every serial. One accounting truth.
**Author:** Jessica Dougherty (jessicadougherty4321@gmail.com)
**Date:** 2026-08-07
**Status:** Approved for build (hackathon prototype)

> **Naming note:** The kickoff prompt and data files spell the product "Gaurd." All documentation and UI use the corrected spelling **Guard**. The misspelling appears only when quoting literal filenames or JSON keys (e.g., `inventory_close_gaurd_seed.json`).

**Related docs:** [README](../README.md) · [CLAUDE.md](../CLAUDE.md) · [SOP](SOP.md) · [HANDOFF](HANDOFF.md)

---

## 1. Overview & Problem Statement

Fast Insights is a rapidly growing physical-AI company. In addition to recurring software revenue, it has serialized edge-computing devices, cameras, access-control equipment, replacement units, demos, loaners, and other hardware moving between vendors, warehouses, carriers, installers, and customer locations.

At December 31, Finance has to establish where that inventory is, whether Fast Insights owns it, whether it exists, whether it is recorded in the right period, and whether it is appropriately valued. For FY2026 (balance-sheet date December 31, 2026) that population is **1,200 serialized units** worth **$3.20M**, scattered across warehouses, vendors, carriers, installation sites, customer locations, demo environments, and RMA facilities.

The pain today:

- **Serial-level truth is fragmented.** The ERP says a unit is in warehouse WH-SJC-A01 while the device telemetry says it has been online at a customer site since December 30. Order systems, carrier records, installation logs, device telemetry, and billing each hold a piece of the story, and none of them agree by default.
- **Cutoff is where inventory closes go wrong.** Units shipped, delivered, and installed in the final days of December — but not relieved from inventory until January — silently misstate both inventory and cost of revenue.
- **Naive AI review is wasteful.** Sending all 1,200 units through a premium reasoning model burns **410K tokens ($1.84)** on 1,200 premium investigations — and roughly 92% of those units reconcile cleanly with deterministic rules that cost nothing. Every exception has a cost. So does investigating it.

Inventory Close Guard's answer is a materiality-aware funnel:

```
Entire Inventory Population
  → Deterministic Reconciliation
  → Accounting Rules Engine
  → Materiality + Risk Scoring
  → Economy AI Classification
  → Premium AI Investigation
  → Controller Judgment
```

**Materiality determines AI spend.** Every unit is screened; expensive intelligence is reserved for the handful of exceptions where accounting judgment is actually required. **100% screened. 1.7% escalated.** And critically: **AI investigates. Controllers conclude.** Inventory Close Guard never posts journal entries automatically.

---

## 2. Goals & Success Criteria

This is a hackathon prototype. Success is measured by demo impact, not production readiness.

| # | Goal | Success criterion (testable) |
|---|------|------------------------------|
| G1 | Judges grasp "materiality determines AI spend" | Within **5 minutes** of demo start, the funnel (population → rules → economy AI → premium AI → controller) and the routing counts (1,108 / 72 / 20) have appeared on screen and been narrated. |
| G2 | Hero metrics land on screen | **$3.20M Inventory Screened**, **$94K Potential Adjustments**, and **85% AI Consumption Reduction** are visible on the Overview immediately after "Run Inventory Close" completes, and again on the closing screen. |
| G3 | The token story is visceral | The 410K → 63K token animation with "**85% Reduction**" plays as part of the run reveal, and the Intelligence P&L comparison ($1.84 vs $0.28; 1,200 vs 20 premium investigations) is visible on the Overview. |
| G4 | The hero exception is fully walkable | EXC-001 (VE-E2-1048) can be opened from Exceptions and narrated end-to-end — evidence timeline, contradiction, AI assessment, "Why premium AI?" panel, and linked JE-001 — without leaving the app. |
| G5 | Demo runs offline with zero external dependencies | The app functions with the network disabled: no API calls, no CDN loads, no AI inference. `npm run dev` (or a static build) plus a browser is sufficient. |
| G6 | Guardrail is unmistakable | The line "Inventory Close Guard never posts journal entries automatically" appears verbatim in the Adjustments section, and no control in the app is labeled "Post." |

---

## 3. Personas

The dividing line for every persona: **AI investigates. Controllers conclude.**

### 3.1 Controller (primary)
Owns close readiness and signs the close package. Concludes on exceptions, approves or rejects proposed adjustments, and answers to the CFO and auditors for the December 31, 2026 balance-sheet date. Wants to see: 100% coverage, the readiness percentage (84%), what the AI spent and why, and a defensible package. Never wants the system to post an entry on its own.

### 3.2 Accounting Manager — Jordan Lee
Works the exception queue. Reviews the 20 premium investigations, reads evidence timelines, requests contract review where ownership transfer is ambiguous, and drafts dispositions for the Controller. Jordan Lee is the named reviewer on the hero exception EXC-001. Wants fast triage: risk score, dollar exposure, assertions affected, and the evidence in one screen.

### 3.3 Auditor (consumer, read-only)
Consumes the close package after the fact — especially the Audit Evidence Index, Year-End Cutoff Testing, and the AI Usage Ledger. Wants traceability: every finding tied to source-system evidence, every AI conclusion tied to a cost and confidence, every adjustment tied to a controller approval. **Evidence before inference.**

---

## 4. Functional Requirements

The app is a single-page application with a persistent header and six navigation sections: **Overview, Inventory, Exceptions, Evidence, Adjustments, Close Package**.

### 4.0 Application shell

- **FR-0.1** — Header displays: "Inventory Close Guard," subtitle "Materiality-Aware Inventory Close," company "Fast Insights," period "FY2026," balance-sheet date "December 31, 2026," close status "In Review."
- **FR-0.2** — Navigation renders the six sections in the order above; the active section is visually indicated; switching sections never triggers a page reload.
- **FR-0.3** — All data is loaded from the imported seed JSON (`inventory_close_gaurd_seed.json`). No fetch calls, no backend (see §8).

### 4.1 Overview

- **FR-1.1 — Hero metrics.** Three prominent stat tiles: **$3.20M** Inventory Screened, **$94K** Potential Adjustments, **85%** AI Consumption Reduction, with the supporting line "**100% screened. 1.7% escalated.**"
- **FR-1.2 — Intelligence P&L.** A side-by-side comparison card:
  - *Traditional / Naive AI Review:* 1,200 serialized units · 410K AI tokens · $1.84 estimated intelligence cost · 1,200 premium investigations.
  - *Inventory Close Guard:* 1,200 serialized units screened · 63K AI tokens · $0.28 estimated intelligence cost · 20 premium investigations.
  - Prominent banner: "**85% LESS AI CONSUMPTION**" with supporting copy "**100% accounting coverage does not require 100% premium AI.**" (the kickoff's P&L-specific variant; the shorter "100% coverage…" line is general product copy used elsewhere).
- **FR-1.3 — Funnel visualization.** The seven-stage funnel from §1 rendered with stage counts: 1,200 in population → 1,108 rule-cleared → 72 economy AI reviews → 20 premium investigations → 6 material findings → Controller judgment.
- **FR-1.4 — Primary CTA.** A button labeled "**Run Inventory Close**" with secondary text: "Screen the entire FY2026 inventory population using accounting controls, materiality-aware routing, and selective AI investigation."
- **FR-1.5 — Staged processing sequence.** Clicking the CTA plays a scripted sequence displaying these status lines in order (each visible long enough to read; total sequence roughly 8–15 seconds):
  1. Loading Fast Insights inventory...
  2. Reconciling serial records...
  3. Matching purchase and receiving records...
  4. Matching shipment evidence...
  5. Analyzing device-location evidence...
  6. Testing year-end cutoff...
  7. Detecting ownership conflicts...
  8. Scoring materiality...
  9. Allocating intelligence budget...
  10. Routing material exceptions...
  11. Building Controller package...
- **FR-1.6 — Run reveal.** On completion, display "**Inventory Close Review Ready**" with the run results: 1,200 units screened · 1,108 rule-cleared · 72 economy AI reviews · 20 premium investigations · 6 material findings. Then animate a token counter from **410K** baseline tokens down to **63K** Inventory Close Guard tokens, resolving to "**85% Reduction**."
- **FR-1.7 — Idempotent replay.** The run can be replayed any number of times (for demo retakes) and always produces the identical reveal. Before the first run, hero metrics may show in a "pre-run" or muted state; after the run, the full Overview is populated. Refreshing the page resets to the pre-run state (session-only state; no persistence).
- **FR-1.8 — Run summary strip.** After the run, the Overview also surfaces: Close readiness **84%**, **3** draft journal entries, **7** open actions, each linking to the relevant section (Close Package / Adjustments / Exceptions).

### 4.2 Inventory

- **FR-2.1 — Full-population table.** A table of all **1,200** inventory records showing at minimum: Serial_Number, Product_Name, Category, Carrying_Value, ERP_Status, Recorded_Location, Physical_Location, Route_Tier, Risk_Score, Review_Status.
- **FR-2.2 — Filters.** Filter controls for **Route_Tier** (RULES / ECONOMY / PREMIUM), **Category**, and **ERP_Status**. Filters combine (AND) and update the visible row count. Filtering by Route_Tier must yield exactly 1,108 / 72 / 20 rows respectively.
- **FR-2.3 — Risk-score display.** Risk_Score (0–100) is displayed with a visual treatment (bar, badge, or color scale) so high-risk rows are scannable. Route_Tier is displayed as a distinct badge per tier.
- **FR-2.4 — Search.** A text search box matching Serial_Number and Product_Name (substring, case-insensitive).
- **FR-2.5 — Exception linkage.** Rows with an Exception_ID link through to that exception's detail view in the Exceptions section.
- **FR-2.6 — Performance.** The table renders and filters 1,200 rows without perceptible lag (see NFR-3). Pagination or virtualization is acceptable; a fixed page size of 25–100 rows with a row-count indicator ("Showing X of 1,200") is the default expectation.

### 4.3 Exceptions

- **FR-3.1 — Queue.** A list of all **20** exception cases (the premium-tier escalations) showing: Exception_ID, Serial_Number, Product_Name, Carrying_Value, Risk_Score, Accounting_Assertions, Review_Status, Reviewer, and Finding_Flag. Sortable by Risk_Score and Carrying_Value; default sort is Risk_Score descending so EXC-001 leads the queue.
- **FR-3.2 — Detail view.** Selecting a case opens a detail view containing: header facts (serial, product, book value, recorded vs. physical location), risk sub-scores (Evidence_Conflict, Dollar_Materiality, Cutoff_Proximity, Ownership_Ambiguity, Aging_Risk), overall Risk_Score, assertions affected, AI confidence, AI investigation cost, reviewer, status, evidence timeline, AI assessment narrative, "Why premium AI?" panel, and linked JE (if any).
- **FR-3.3 — Hero flow: EXC-001 / VE-E2-1048.** This case is the demo centerpiece and must render exactly as specified:
  - **Header facts:** Serial **VE-E2-1048** · Product **ValeEdge E2** (Edge AI Appliance E2) · Book value **$14,800** · ERP status **Warehouse (WH-SJC-A01)** · Physical location **Customer Site - Northstar Health**.
  - **Contradiction panel:** two opposing cards — "Accounting Record: **WAREHOUSE**" vs. "Operational Evidence: **CUSTOMER SITE**."
  - **Evidence timeline** (chronological, with dates):
    - Dec 22 — Customer order approved
    - Dec 27 — Hardware shipped
    - Dec 29 — Carrier delivery confirmed
    - Dec 30 — Installation completed
    - Dec 30 — Device first online
    - Dec 31 — Inventory system still reports warehouse
    - Jan 2 — Customer invoice generated
  - **Assertions affected:** Existence · Cutoff · Classification.
  - **AI assessment** (verbatim): "Operational evidence indicates that serial VE-E2-1048 was physically deployed and active at a customer location before December 31. The inventory subledger continued to classify the device as warehouse inventory. Contractual transfer, customer acceptance, and hardware ownership provisions must be reviewed before determining whether inventory relief or related accounting treatment was required before year-end."
  - **"Why did Inventory Close Guard authorize premium AI?" panel** with exactly these five bullets:
    1. $14,800 financial exposure
    2. Inside year-end cutoff window
    3. ERP conflicts with operational evidence
    4. Multiple systems contain relevant evidence
    5. Contract interpretation is required
  - **Cost-vs-exposure callout:** AI investigation cost **$0.04** vs. financial exposure **$14,800**, with the copy "**Every exception has a cost. So does investigating it.**"
  - **Metrics:** Risk score **86.6** · AI confidence **0.93**.
  - **Workflow:** Reviewer **Jordan Lee - Accounting Manager** · Status **Needs Contract Review**.
  - **Linked adjustment:** JE-001 chip linking to the Adjustments section.
- **FR-3.4 — Non-hero cases.** The other 19 cases render through the same detail template using their seed data; no case may show empty required fields.

### 4.4 Evidence

- **FR-4.1 — Event log.** All **81** evidence events, grouped by Exception_ID (grouped list or accordion). Each event shows: date/time, source system, event description, and related serial.
- **FR-4.2 — Source-system attribution.** Every event displays its originating system (e.g., ERP, order management, carrier, installation, device telemetry, billing) as a labeled badge, reinforcing "**Evidence before inference.**"
- **FR-4.3 — Conflict flags.** Events that contradict the ERP record are visually flagged (icon + color). For EXC-001, the Dec 30 telemetry/installation events and the Dec 31 warehouse record are flagged as the conflicting pair.
- **FR-4.4 — Cross-navigation.** Each evidence group links back to its exception detail view; exception detail views deep-link into their evidence group.

### 4.5 Adjustments

- **FR-5.1 — Draft JE list.** Exactly **3** proposed journal entries, each showing JE ID, description, debit/credit lines with accounts and amounts, linked exception, status, and Auto_Post flag:
  - **JE-001** — Year-end cutoff correction: Dr Cost of Hardware Revenue $14,800 / Cr Inventory $14,800 · linked EXC-001 · **Pending Contract Review**.
  - **JE-002** — RMA inventory correction, $4,500 · linked EXC-003 · **Pending Physical Confirmation**.
  - **JE-003** — Obsolescence reserve, $42,000 · linked EXC-004 · **Pending Controller Approval**.
- **FR-5.2 — Guardrail banner.** The section displays, prominently and verbatim: "**Inventory Close Guard never posts journal entries automatically.**" Every JE shows `Auto_Post: false` (rendered as a "Draft — will not auto-post" badge or equivalent).
- **FR-5.3 — No posting affordance.** There is no button, toggle, or menu item anywhere in the app that posts, submits, or books an entry. Allowed statuses are review-workflow states only. (Testable: a text search of the rendered UI finds no actionable "Post" control.)
- **FR-5.4 — Total tie-out.** The section shows aggregate proposed adjustments summing to the **$94K** hero metric (14,800 + 4,500 + 42,000 = $61.3K in draft JEs; the remainder is exception exposure not yet drafted — display both figures so the $94K is explainable; see §9 Open Questions).

### 4.6 Close Package

- **FR-6.1 — Package header.** Titled "**Fast Insights FY2026 Inventory Close Package**" with overall status "**84% Close Ready**" shown as a progress indicator.
- **FR-6.2 — Section checklist.** All **14** named sections listed with a per-section readiness status (e.g., Ready / In Review / Blocked):
  1. Inventory Roll-Forward
  2. Inventory Subledger-to-GL Reconciliation
  3. Serialized Inventory Listing
  4. Year-End Cutoff Testing
  5. Goods-in-Transit Schedule
  6. Customer-Deployed Inventory
  7. Demo & Loaner Inventory
  8. RMA Reconciliation
  9. Inventory Aging
  10. Obsolescence Analysis
  11. Proposed Adjustments
  12. Controller Approval Log
  13. Audit Evidence Index
  14. AI Usage Ledger
  Note: the seed `closePackage` array contains **13** status rows; the 14th section's status is derived in app code (see §9).
- **FR-6.3 — AI Usage Ledger.** This section surfaces the token ledger (92 entries): tokens and cost by route tier, totaling 63K tokens / $0.28, against the materiality policy caps (Maximum Intelligence Budget $0.50; Baseline Premium Tokens 410,000; Baseline Estimated AI Cost $1.84; Baseline Premium Reviews 1,200). Copy: "**Spend intelligence where judgment matters.**"
- **FR-6.4 — Materiality policy display.** All 9 materiality policies visible (in this section or a linked panel): Overall Inventory Materiality $75,000 · Individual Exception Threshold $5,000 · Cutoff Review Window 7 days +/- · High-Risk Confidence Threshold 0.8 · Inventory Aging Threshold 270 days · Maximum Intelligence Budget $0.50 · Baseline Premium Tokens 410,000 · Baseline Estimated AI Cost $1.84 · Baseline Premium Reviews 1,200.
- **FR-6.5 — Open actions.** The **7 open actions** are listed with owners and linked exceptions/JEs, explaining why readiness is 84% rather than 100%.

---

## 5. Demo Script Requirements

The app must support this narrative without improvisation or dead ends. Full presenter script lives in [SOP.md](SOP.md); the app-level requirements are:

- **DS-1 — Opening frame.** The presenter opens on the Overview (pre-run state) and delivers the kickoff framing: "Fast Insights is a rapidly growing physical-AI company... At December 31, Finance has to establish where that inventory is, whether Fast Insights owns it, whether it exists, whether it is recorded in the right period, and whether it is appropriately valued. Inventory Close Guard screens the entire population but only spends expensive AI intelligence where accounting judgment is actually required." The pre-run screen must visually support this (header facts + funnel + CTA visible).
- **DS-2 — The run.** Presenter clicks "Run Inventory Close." The staged sequence (FR-1.5) plays uninterrupted; the reveal and token animation (FR-1.6) land the routing counts and 85% reduction.
- **DS-3 — Hero exception walkthrough.** Presenter navigates Overview → Exceptions → EXC-001 and walks: contradiction panel → evidence timeline → AI assessment → "Why premium AI?" five bullets → $0.04 vs. $14,800 → Jordan Lee / Needs Contract Review → JE-001 link into Adjustments, where the guardrail banner delivers "AI investigates. Controllers conclude."
- **DS-4 — Close Package beat.** Presenter shows the 14-section package at 84% Close Ready and points at the AI Usage Ledger as the auditor-facing receipt for AI spend.
- **DS-5 — Closing screen.** A dedicated, uncluttered end state (route, modal, or presenter-mode view) showing only:
  - **$3.20M** Inventory Screened · **$94K** Potential Adjustments · **85%** Less AI Consumption
  - then: "**Inventory Close Guard**" · "*Spend intelligence where judgment matters.*" · "**Fast Insights**"
- **DS-6 — Timing.** DS-1 through DS-5 must be performable in under 5 minutes by a single presenter; no step may require typing, waiting on network, or more than three clicks between beats.

---

## 6. Non-Functional Requirements

- **NFR-1 — Fully local, zero network.** The app makes no network requests at runtime. All data, fonts, and assets are bundled. It must run correctly with Wi-Fi disabled (hackathon-venue insurance).
- **NFR-2 — Zero external dependencies at demo time.** No API keys, no environment variables, no backend process. `npm run dev` or serving the built `dist/` folder is the entire runtime.
- **NFR-3 — Fast with 1,200 rows.** Initial load to interactive under ~2 seconds on a mid-range laptop; Inventory table filter/sort interactions respond in under ~150 ms. The 1.8 MB seed JSON is imported at build time and parsed once.
- **NFR-4 — Projector-presentable.** Legible at 1280×720 from the back of a room: large hero numerals, high-contrast text, no information conveyed by color alone on critical badges (tier and conflict badges carry text labels). Layout holds at 1920×1080 and 1366×768 without horizontal scroll.
- **NFR-5 — Deterministic.** Every run, animation, and screen renders identically on every execution — no randomness, no clock-dependent behavior that could differ between rehearsal and stage.
- **NFR-6 — Crash-tolerant navigation.** No route can render a blank screen or unhandled error; missing/optional seed fields render as an explicit em dash, never `undefined`.

---

## 7. Non-Goals / Out of Scope

Explicitly not being built for the hackathon:

- **No real AI inference.** All "AI" output (assessments, confidence scores, token counts, costs) is precomputed synthetic data from the seed file. No model calls, no keys.
- **No real ERP/system integrations.** Source systems (ERP, carrier, telemetry, billing) exist only as labels on synthetic evidence.
- **No authentication or roles.** Personas are narrative, not enforced. Single anonymous user.
- **No multi-period support.** FY2026 / December 31, 2026 only. No period switcher, no roll-forward into FY2027.
- **No posting of journal entries** — not as a stretch goal, not behind a flag. This is a product principle, not a cut feature.
- **No persistence.** State is session-only; refresh resets. No database, no localStorage requirements.
- **No exports** (PDF/XLSX generation of the close package) — the on-screen package is the deliverable. (Future idea, §9.)

---

## 8. Technical Approach

- **Stack:** React + Vite + Tailwind CSS, single-page application. No router library required if simple state-driven navigation suffices; either is acceptable.
- **Data:** `inventory_close_gaurd_seed.json` (repo root) is imported directly as the single source of truth. Top-level keys consumed: `company`, `summary`, `materialityPolicies` (9), `inventory` (1,200), `exceptions` (20), `evidenceEvents` (81), `tokenLedger` (92), `journalEntries` (3), `closePackage` (13). No derived numbers may contradict the seed; where the UI aggregates (e.g., tier counts, adjustment totals), aggregate from the seed rather than hard-coding, except for pure copy (hero metric strings) which may be constants that match the seed.
- **"Run" is theater.** The Run Inventory Close experience is a scripted, timed reveal over precomputed data — a staged simulation, not computation. Status lines advance on timers; the token counter is an animation from 410,000 to 63,000.
- **Repo state:** The app scaffold does not exist yet — the repo currently contains only docs and data. `git init` is a planned next step. Build order and conventions are in [CLAUDE.md](../CLAUDE.md); operational steps in [SOP.md](SOP.md); current status in [HANDOFF.md](HANDOFF.md).
- **Companion dataset:** `fast_insights_inventory_close_gaurd_dataset.xlsx` mirrors the seed across 9 sheets (Dashboard, Inventory_Snapshot, Exception_Cases, Evidence_Events, Token_Ledger, Proposed_JEs, Model_Assumptions, Close_Package, README) — useful for spot-checking, not consumed by the app.

---

## 9. Open Questions / Future Ideas

**Open questions**

1. **$94K bridge.** Draft JEs total $61.3K; the hero metric is $94K Potential Adjustments. Confirm the composition of the remaining ~$32.7K from the exceptions' `Proposed_Adjustment` fields and render the bridge in Adjustments (FR-5.4) so the number survives judge scrutiny.
2. **13 vs. 14 close-package rows.** The kickoff names 14 sections; the seed `closePackage` array has 13 status rows. Identify the missing row and synthesize its status in app code (likely candidate: AI Usage Ledger, which can derive its status from `tokenLedger`).
3. **Closing screen mechanics.** Dedicated route vs. keyboard-triggered presenter overlay — decide during build; requirement DS-5 is agnostic.
4. **Pre-run Overview depth.** How much of the Overview is visible before the first run (muted tiles vs. empty state)? Default assumption in FR-1.7 stands unless rehearsal suggests otherwise.

**Future ideas (post-hackathon)**

- Live model integration with a real economy/premium tier router and an enforced intelligence budget.
- Close-package export (PDF binder + XLSX) with the Audit Evidence Index hyperlinked to evidence.
- Controller approval workflow with sign-off capture feeding the Controller Approval Log.
- Multi-period roll-forward (FY2027 opening balances from FY2026 conclusions).
- Configurable materiality policies with live re-routing preview ("what does a $10K exception threshold do to premium volume?").

---

*Every serial. One accounting truth.*
