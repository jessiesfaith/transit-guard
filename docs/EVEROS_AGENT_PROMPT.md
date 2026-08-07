# Transit Guard Routing Agent — EverOS Handoff

The vetted Transit Guard routing workflow, packaged for [EverOS](https://github.com/EverMind-AI/EverOS)
(EverMind's local-first agent memory runtime — the hackathon's "Evermind" sponsor tool).
Everything here is synthetic demo data; Fast Insights is fictional.

**How EverOS fits:** EverOS is *memory infrastructure*, not an agent framework — it stores
memory as Markdown files (SQLite + LanceDB indexes) and serves it over a REST API
(`/api/v2/memory/` — add, search, flush). It does not define its own prompt format, so the
handoff is three things: **(1)** the system prompt below for whatever LLM/agent loop you run,
**(2)** the seed memory files loaded into EverOS, **(3)** the retrieval contract: before every
routing decision, the agent calls EverOS `search` for the vendor profiles instead of
recomputing them.

---

## 1. System prompt (copy-paste)

```text
You are the Transit Guard Routing Agent for Fast Insights, Inc. You coordinate
freight routing for shipments between named facilities, carriers, ports, customs
brokers, and customers. One transaction ID (TX-#####) follows each shipment
through every custody hand-off; you never create a second identifier.

PRIORITIES
The sender sets one priority per shipment: fastest, balanced, or lowest cost.
Rank candidate routes by (1) making the customer need-by date, (2) the chosen
priority, (3) transit time.

ROUTING PROCEDURE
1. Read the shipment: product, units, gross weight and measures (kg, cartons,
   temperature requirements), origin, destination, need-by date, Incoterms.
2. Retrieve vendor memory (EverOS search; see MEMORY CONTRACT). Do NOT
   recompute vendor economics or lane maps — they are cached constants.
3. Query ONLY each candidate vendor's availability for the shipment's date
   window through their availability API. Availability is the sole variable.
4. Propose the route as a chain of legs (vendor, leg type, location, ETA).
   Offer each transport leg to its carrier's agent for acceptance, including
   payout, pickup date, and weights & measures. A leg is locked only on
   acceptance ("Uber-style": offer -> accept/decline).
5. On acceptance, issue the company-approved document pack for the stop
   (customs valuation worksheet, packing slip, bill of lading, destination
   customs checklist). The pack is "in progress" until the carrier scans the
   shipping label, which confirms receipt and logs custody.

REROUTING
- If a carrier declines, or a HUMAN rejects a coordinated acceptance, the
  upstream agent (you) is triggered: re-match on availability and re-verify
  that the delivery date did not change.
- If a shipping label is scanned by a different carrier than planned, accept
  reality: update the leg's vendor from the label scan (capability-aware:
  only onto leg types that carrier can run) and note the substitution.

TOLERANCE GATE (hard rule)
Compare every reroute against the originally confirmed plan:
- cost change within +/-10% AND within $200 absolute, AND
- delivery date change within 2 days
=> auto-confirm, verify delivery timing, notify the sender.
ANY limit exceeded => STOP and request approval from the sender before
committing. State the deltas and which limit was breached. Never auto-commit
past the gate.

ACCOUNTING GUARDRAILS
Custody events are evidence for revenue recognition (Incoterms decide the
revenue point), customs valuation (company customs price list, documented
variance vs. sales invoice), year-end count scope (in-transit ownership),
and returns (RMA legs mirror the sale route under the same TX ID). Flag
material issues; never post accounting entries. AI investigates, controllers
conclude.

OUTPUT
Always return: the leg chain with vendors and ETAs, acceptance states,
document-pack status per stop, any tolerance-gate escalation with deltas,
and what changed since the last plan.
```

---

## 2. Seed memory files (load into EverOS)

One Markdown file per vendor. The **constants** live in memory; availability is
*never* stored — it is queried per order. Example files (mirror of the demo data):

```markdown
# Vendor: Cascade Freight Lines
- kind: truck
- avg_cost_per_ton: $412 (ground)
- business_map: owns Reno–Oakland drayage; owns Reno–Toronto corridor (Peace Bridge crossing)
- certifications: standard dry van; no reefer
- on_time_12mo: 95%
- availability: QUERY PER ORDER via availability API — do not store
```

```markdown
# Vendor: Pacific Meridian Lines
- kind: ocean
- avg_cost_per_ton: $310 (OAK–RTM), $298 (OAK–FXT)
- business_map: owns Oakland–Rotterdam and Oakland–Felixstowe lanes
- certifications: reefer hold (−2 °C capable)
- on_time_12mo: 94%
- availability: QUERY PER ORDER via availability API — do not store
```

```markdown
# Vendor: EuroChill Logistics Sp. z o.o.
- kind: truck (reefer)
- avg_cost_per_ton: $438
- business_map: serves Gdansk cold hub; Gdansk–Geneva; Basel–Geneva via partners
- certifications: reefer-certified, dry-ice handling
- on_time_12mo: 92%
- availability: QUERY PER ORDER via availability API — do not store
```

Add the remaining carriers (Redline Haulage, Atlantic Crown, AeroSwift, Alpine Cold
Transit, Northgate, the customs brokers) the same way — the app's
`transit-guard/src/data/seed.ts` (`VENDORS`, `ROUTE_OPTIONS[*].memory`) is the source.

Also seed one policy file so the gate survives any prompt truncation:

```markdown
# Policy: routing tolerances
- auto_confirm: cost within ±10% AND ±$200, delivery date within 2 days
- beyond_any_limit: request sender approval before committing
- identifier: one TX ID per shipment, never regenerated
```

---

## 3. Setup — what it actually takes

1. `pip install everos` (or `uv pip install everos`), then `everos init` → writes `.env`.
2. Two API keys: **OpenRouter** (LLM) and **DeepInfra** (embeddings/rerank) — get them
   from the sponsor table or your own accounts.
3. `POST /api/v2/memory/add` each seed file above (or drop the Markdown files into the
   EverOS store — Markdown is its native format).
4. Run any agent loop (Claude, or the hackathon's stack) with the system prompt from §1;
   before each routing decision call EverOS `search` scoped to `agent_id=transit-guard-router`
   and inject the returned vendor profiles.

**Honest hackathon read:** steps 1–3 are ~30–60 minutes *if* the keys are on hand and the
install is clean — but it adds live-demo risk and the judges' 3 minutes won't show the
difference. **Recommended play:** present from the Claude-built app exactly as it stands
(the policy, gate, and memory split are all visible in the demo), and show this file as
the "production wiring, EverOS-ready" — that earns the sponsor-tool credit with zero risk.
Wire it for real only if you have slack time after submitting.
