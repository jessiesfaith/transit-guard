# Inventory Close Guard

The materiality-aware year-end inventory close agent — a hackathon demo SPA for Fast Insights, a fictional Series B physical-AI security company. Tagline: "Every serial. One accounting truth."

## Context

- Hackathon prototype, solo developer (Jessica). Polish and demo narrative over production concerns.
- FY2026 close, balance-sheet date December 31, 2026. All data is synthetic; Fast Insights is fictional.
- Core principle: "Materiality determines AI spend." AI investigates. Controllers conclude.

## Critical conventions

- **Spelling:** Always "Guard" in docs, code, and UI copy. Use "gaurd" ONLY when quoting literal filenames/keys (`inventory_close_gaurd_seed.json`, `fast_insights_inventory_close_gaurd_dataset.xlsx`).
- **Seed JSON is read-only and 1.8 MB — never read it whole.** Sample with jq/scripts. Top-level keys: company, summary, materialityPolicies (9), inventory (1,200), exceptions (20), evidenceEvents (81), tokenLedger (92), journalEntries (3), closePackage (13).
- **Journal entries never auto-post.** All JEs are drafts, `Auto_Post: false`, Controller approval required. Never build or imply auto-posting.
- **Exact product copy comes from `Kickoff Prompt.md`** — quote it, don't paraphrase hero metrics or taglines.

## Key numbers (do not invent variants)

- Hero: $3.20M screened | $94K potential adjustments | 85% AI consumption reduction | "100% screened. 1.7% escalated."
- Funnel: 1,200 units → 1,108 rule-cleared → 72 economy AI → 20 premium investigations → 6 material findings.
- Intelligence P&L: naive 410K tokens / $1.84 vs. Guard 63K tokens / $0.28.
- Close readiness 84%. 3 draft JEs (JE-001 $14,800 cutoff, JE-002 $4,500 RMA, JE-003 $42,000 obsolescence). 7 open actions.
- Hero exception: EXC-001, serial VE-E2-1048 (ValeEdge E2, $14,800), ERP says warehouse, physically at Customer Site - Northstar Health.

## Stack

- React + Vite + Tailwind single-page app. No backend, no API keys, no real AI calls.
- Seed JSON imported directly as the single source of truth; "Run Inventory Close" is a scripted/staged reveal over precomputed data (animates 410K → 63K tokens).
- No auth, no persistence — session state only.
- Navigation: Overview, Inventory, Exceptions, Evidence, Adjustments, Close Package.

## Doc map

- `README.md` — project overview and entry point.
- `docs/PRD.md` — product requirements.
- `docs/SOP.md` — operating rules for working in this repo.
- `docs/HANDOFF.md` — current state + next steps. **Read it at session start; update it before ending a session.**

## Current status

Docs complete; app not yet scaffolded; repo not yet under git (git init is a planned next step).
