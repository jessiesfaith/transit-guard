# Standard Operating Procedures — Inventory Close Guard

Operating rules for building and demoing the Inventory Close Guard hackathon prototype at Fast Insights (fictional; all data synthetic). Companion docs: [README](../README.md) for orientation, [CLAUDE.md](../CLAUDE.md) for agent working rules, [PRD](./PRD.md) for requirements, [HANDOFF](./HANDOFF.md) for current state.

---

## 1. Purpose & Scope

This SOP defines the day-to-day rules for the project: which files are authoritative, how the product name and copy are used, how code changes land, how docs stay current, and how the demo is verified before it runs in front of judges.

**In scope:** the React + Vite + Tailwind single-page demo app, the seed data files, and the five project docs.

**Out of scope:** production concerns (auth, persistence, real AI calls, backend services). This is a hackathon prototype — polish and narrative clarity win over engineering ceremony. When this SOP and speed conflict on something that does not affect demo correctness, choose speed.

---

## 2. Source-of-Truth Rules

One rule above all: **data flows one way, from the seed files into the app.** Nothing in the app writes back.

| Question | Authority |
|---|---|
| What are the numbers? | `inventory_close_gaurd_seed.json` (repo root) |
| What does the copy say? What is the demo narrative? | `Kickoff Prompt.md` (repo root) |
| What must the app do? | [docs/PRD.md](./PRD.md) |
| What is the current build state? | [docs/HANDOFF.md](./HANDOFF.md) |

### Seed JSON — read-only, always

- [ ] `inventory_close_gaurd_seed.json` is **reference data. Never mutate it** — not by hand, not by script, not "just to fix one field."
- [ ] Import it directly into the app as the single source of truth. No copies, no forked subsets, no hand-edited fixtures that drift from it.
- [ ] **Derive display values in code.** Formatted currency ("$3.20M"), percentages ("84%"), tier counts, and totals are computed or formatted at render time from seed values — never hard-coded where a derivation is possible, and never written back into the JSON.
- [ ] If a seed value looks wrong, do not "fix" the file. Note the discrepancy in HANDOFF.md and reconcile against the Kickoff Prompt.
- [ ] Do not open the whole file casually — it is 1.8 MB with 1,200 inventory records. Query it with a script or read specific keys.

### The other data files

- [ ] `fast_insights_inventory_close_gaurd_dataset.xlsx` is the **human-readable mirror** of the seed JSON (9 sheets). Use it for eyeballing and spot-checks. The app never reads it, and it is never edited.
- [ ] `Kickoff Prompt.md` is **canonical for product copy and the demo narrative** — headlines, taglines, processing-stage lines, the EXC-001 story, the closing screen. When app copy and the kickoff disagree, the kickoff wins (spelling excepted — see Section 3).
- [ ] The **PRD is canonical for requirements.** If the PRD and this SOP disagree on what to build, the PRD wins; fix this doc.

---

## 3. Naming & Branding Rules

The kickoff prompt and data files misspell the product name as "Gaurd." The team decision:

- [ ] **"Inventory Close Guard"** — correct spelling — in **all** user-facing copy, UI text, docs, commit messages, and code comments. No exceptions.
- [ ] **"Gaurd" only when quoting literal filenames or JSON keys**, e.g. `inventory_close_gaurd_seed.json`, `fast_insights_inventory_close_gaurd_dataset.xlsx`. Never invent new artifacts with the misspelling.
- [ ] When copying lines from the Kickoff Prompt that contain "Gaurd," correct the spelling and change nothing else.

### Product copy — verbatim, from the kickoff

These lines are brand assets. Use them **exactly as written** (spelling correction applied). Do not paraphrase, retitle, or "improve" them:

- Every serial. One accounting truth.
- Spend intelligence where judgment matters.
- Materiality determines AI spend.
- Evidence before inference.
- 100% screened. 1.7% escalated.
- Every exception has a cost. So does investigating it.
- 100% coverage does not require 100% premium AI.
- AI investigates. Controllers conclude.
- Inventory Close Guard never posts journal entries automatically.

Same rule applies to the subtitle ("The materiality-aware year-end inventory close agent"), the primary CTA ("Run Inventory Close"), the eleven processing-stage lines, the results headline ("Inventory Close Review Ready"), the Intelligence P&L banner ("85% LESS AI CONSUMPTION"), the package name ("Fast Insights FY2026 Inventory Close Package"), and the nav labels (Overview, Inventory, Exceptions, Evidence, Adjustments, Close Package).

---

## 4. Development Workflow

### Git conventions (once initialized — `git init` is a planned next step)

- [ ] `git init` at repo root; work on `main`. No branch ceremony for a solo hackathon — branch only for a risky experiment you might throw away.
- [ ] First commit: docs and data files as they stand, before any app scaffold.
- [ ] **Small commits, clear messages.** One logical change per commit. Imperative mood, specific: `Add staged Run Inventory Close sequence`, not `updates`.
- [ ] Commit before any large refactor or before ending a session, so there is always a known-good point to return to.
- [ ] Never commit changes to the seed JSON or xlsx (there should never be any — see Section 2).

### Definition of done — a feature is done when all four hold

1. **Matches the PRD.** It implements a stated requirement, with the kickoff's copy verbatim.
2. **Uses seed data.** Every number and record on screen traces to `inventory_close_gaurd_seed.json` or a derivation from it. No invented values.
3. **Renders cleanly.** No console errors, no layout breakage at the demo window size, no unstyled flash, light-polish level consistent with the rest of the app.
4. **Demo-safe.** It cannot dead-end the click path. Loading states resolve, the staged sequence completes, navigation always works, and nothing depends on network access or an API key.

---

## 5. Documentation Maintenance

| Doc | Update when |
|---|---|
| [README.md](../README.md) | Setup steps, run commands, or repo layout change |
| [CLAUDE.md](../CLAUDE.md) | A working rule, convention, or architectural decision changes |
| [docs/PRD.md](./PRD.md) | Scope is cut or added, or a requirement is reinterpreted (record the change, don't silently rewrite history) |
| [docs/SOP.md](./SOP.md) (this doc) | A procedure proves wrong or a new recurring procedure emerges |
| [docs/HANDOFF.md](./HANDOFF.md) | **End of every working session, and before any context handoff — no exceptions** |

### HANDOFF.md — what "updated" means

An updated HANDOFF.md contains all three, current as of the moment you stop:

1. **State** — what is built and working, what is in progress, what is broken or flaky, and how to run what exists.
2. **Decisions** — choices made this session and why (especially anything that deviates from or refines the PRD/SOP), so they are not re-litigated or accidentally reversed.
3. **Next steps** — a concrete, ordered list of what to do next, specific enough that a fresh session can start work without re-deriving the plan.

If you only have two minutes at the end of a session, spend them on HANDOFF.md.

---

## 6. Demo-Run Checklist

Run this end-to-end before every demo or recording. Budget ~15 minutes.

### Pre-flight

- [ ] Clean install: delete `node_modules`, then `npm install` — confirm it completes with no errors.
- [ ] `npm run dev` (or the production build + preview) starts clean: no console errors on load.
- [ ] Header shows: Inventory Close Guard / Materiality-Aware Inventory Close / Fast Insights / FY2026 / December 31, 2026 / In Review.
- [ ] All six nav items present and clickable: Overview, Inventory, Exceptions, Evidence, Adjustments, Close Package.

### Full click path (the demo, in order)

- [ ] **Run Inventory Close** — click the primary CTA. All eleven staged processing lines play in order, from "Loading Fast Insights inventory..." through "Building Controller package...", then "Inventory Close Review Ready" reveals: 1,200 units screened / 1,108 rule-cleared / 72 economy AI reviews / 20 premium investigations / 6 material findings. The token animation runs 410K → 63K and lands on "85% Reduction."
- [ ] **Overview metrics** — the three hero metrics render exactly: **$3.20M** Inventory Screened, **$94K** Potential Adjustments, **85%** AI Consumption Reduction, with "100% screened. 1.7% escalated." The Intelligence P&L shows both columns (1,200 units / 410K tokens / $1.84 / 1,200 investigations vs. 1,200 screened / 63K tokens / $0.28 / 20 investigations) and "85% LESS AI CONSUMPTION."
- [ ] **EXC-001 walkthrough** — open the exception for serial VE-E2-1048 (ValeEdge E2, $14,800). Verify: ERP says Warehouse (WH-SJC-A01) vs. physical Customer Site - Northstar Health; the seven-event evidence timeline (Dec 22 → Jan 2) in order; assertions Existence, Cutoff, Classification; risk score 86.6; AI confidence 0.93; the $0.04 investigation cost vs. $14,800 exposure framing; reviewer Jordan Lee; status Needs Contract Review; linked JE-001.
- [ ] **Adjustments** — all three draft JEs render: JE-001 ($14,800 cutoff correction, Dr Cost of Hardware Revenue / Cr Inventory), JE-002 ($4,500 RMA correction), JE-003 ($42,000 obsolescence reserve). Every one shows Auto_Post: false / pending status — "Inventory Close Guard never posts journal entries automatically."
- [ ] **Close Package** — "Fast Insights FY2026 Inventory Close Package" renders its sections with statuses and the overall **84% Close Ready** figure.
- [ ] **Closing screen** — clean screen with $3.20M / $94K / 85%, then "Inventory Close Guard" and "Spend intelligence where judgment matters." / Fast Insights.

### Environment hardening

- [ ] **Offline check:** disconnect from the network and run the entire click path again. Everything must work — the app has no backend, no API keys, and no real AI calls, so nothing may fetch anything.
- [ ] Zero console errors across the full path.
- [ ] Refresh mid-demo recovers gracefully (session state only — a refresh should land somewhere sane, not a broken screen).
- [ ] Check the demo machine's display scale/window size — no clipped metrics or wrapped headlines.

---

## 7. Data Integrity Checks

Spot-check these totals whenever the data layer or any aggregation code changes. Every one must match; a mismatch means a derivation bug, not a data fix (see Section 2).

- [ ] **Inventory records:** exactly **1,200** in the seed `inventory` array, and 1,200 shown as units screened.
- [ ] **Inventory screened:** carrying values sum to **$3.20M** as displayed.
- [ ] **Route tiers:** RULES **1,108** + ECONOMY **72** + PREMIUM **20** = 1,200. No record unrouted, none double-counted.
- [ ] **Escalation rate:** 20 / 1,200 renders as **1.7%**.
- [ ] **Potential adjustments:** proposed adjustments total **$94K** as displayed (JE lines: $14,800 + $4,500 + $42,000 = $61,300 in draft JEs; the $94K figure covers all proposed adjustments — confirm the displayed total ties to the seed's summary, not just the three JEs).
- [ ] **Close readiness:** **84%**, consistent between Overview and Close Package.
- [ ] **Token math:** 410K baseline vs. 63K actual renders as **85%** reduction; costs $1.84 vs. $0.28.
- [ ] **Counts elsewhere:** 20 exceptions, 3 journal entries (all Auto_Post: false), 6 material findings, 7 open actions, 9 materiality policies, 13 close-package status rows in the seed (the kickoff names 14 sections — verify the app handles the difference deliberately, per the PRD).
- [ ] **EXC-001 invariants:** book value $14,800, risk score 86.6, AI confidence 0.93 — these three numbers appear in the demo narration, so they must be right on screen.

Quick verification tip: check counts against the seed with a one-liner (e.g. Node: `node -e "const d=require('./inventory_close_gaurd_seed.json'); console.log(d.inventory.length, d.exceptions.length, d.journalEntries.length)"`) rather than trusting the UI to audit itself.
