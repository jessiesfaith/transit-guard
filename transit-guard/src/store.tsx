import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import {
  SEED_SHIPMENTS,
  SEED_OFFERS,
  SEED_APPROVALS,
  AGENT_POLICY,
  COMPANY_VENDOR,
  VENDORS,
  DEMO_TODAY,
  CUSTOMS_REQUIREMENTS,
  PRODUCTS,
  PRODUCT_SERIAL_PREFIX,
  addDays,
  type Shipment,
  type Leg,
  type LegKind,
  type RouteOption,
  type PlanCountry,
  type Offer,
  type Approval,
} from './data/seed'

export type Role = 'company' | 'vendor'

const TRANSPORT_KINDS: LegKind[] = ['truck', 'boatyard', 'ocean', 'air', 'port', 'courier']

export interface ScanEvent {
  serial: string
  product: string
  txId: string
  purpose: string
  at: string
}

export interface State {
  shipments: Shipment[]
  scans: ScanEvent[]
  offers: Offer[]
  approvals: Approval[]
  role: Role
  vendorName: string
  toast: string | null
}

export interface ApplyRoutePayload {
  txId: string
  route: RouteOption
  country: PlanCountry
  city: string
  product: string
  unitCount: number
  customer: string
}

export type Action =
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'ACCEPT_OFFER'; offerId: string; toast: string }
  | { type: 'DECLINE_OFFER'; offerId: string; toast: string }
  | { type: 'REROUTE_ACCEPT'; offerId: string; altVendor: string; toast: string }
  | { type: 'RESOLVE_APPROVAL'; approvalId: string; approve: boolean; toast: string }
  | { type: 'VENDOR_LABEL_SCAN'; txId: string; vendor: string; mode: 'pickup' | 'substitute'; toast: string }
  | { type: 'APPLY_ROUTE'; payload: ApplyRoutePayload; toast: string }
  | { type: 'LOG_SCAN'; scan: ScanEvent; toast: string }
  | { type: 'ADD_LEG'; txId: string; leg: Omit<Leg, 'id' | 'status'>; toast: string }
  | { type: 'COMPLETE_ACTIVE_LEG'; txId: string; date: string }
  | { type: 'START_RMA'; txId: string; toast: string }
  | { type: 'SET_DOC_READY'; txId: string; legId: string; doc: string; toast?: string }
  | { type: 'TOAST'; toast: string }
  | { type: 'CLEAR_TOAST' }

function reverseKind(kind: LegKind): LegKind {
  if (kind === 'pick' || kind === 'outbound') return 'truck'
  if (kind === 'delivery') return 'courier'
  return kind
}

function buildRouteShipment(p: ApplyRoutePayload): Shipment {
  const prod = PRODUCTS[p.product]
  const prefix = PRODUCT_SERIAL_PREFIX[p.product] ?? 'FI-XX'
  const reqs = CUSTOMS_REQUIREMENTS[p.country] ?? []
  let cursor = DEMO_TODAY
  let firstTransport = true
  const routeLegs: Leg[] = p.route.legs.map((rl, i) => {
    cursor = addDays(cursor, rl.days)
    const isTransport = TRANSPORT_KINDS.includes(rl.kind)
    const docsPack = isTransport && firstTransport ? ('in-progress' as const) : undefined
    if (isTransport && firstTransport) firstTransport = false
    return {
      id: `LX-${p.txId}-${i}`,
      kind: rl.kind,
      vendor: rl.vendor,
      location: rl.location,
      date: null,
      eta: cursor,
      status: 'pending',
      accept: isTransport ? ('contacting' as const) : undefined,
      docsPack,
      docs:
        rl.kind === 'customs'
          ? reqs.map((r) => ({ name: r.doc, ready: false }))
          : [{ name: rl.kind === 'delivery' ? 'Proof of Delivery' : 'Hand-off receipt', ready: false }],
      note: i === 0 ? `AI route "${p.route.name}" — vendor rating ${rl.rating.toFixed(1)}` : undefined,
    }
  })
  return {
    txId: p.txId,
    direction: 'outbound',
    orderNo: `ORD-${p.txId.replace(/\D/g, '').slice(-5)}`,
    product: p.product,
    unitCount: p.unitCount,
    serialsSample: Array.from({ length: Math.min(p.unitCount, 3) }, (_, i) => `${prefix}-${2401 + i}`),
    customer: p.customer,
    destination: `${p.city}, ${p.country === 'NL' ? 'Netherlands' : p.country === 'CA' ? 'Canada' : 'United Kingdom'}`,
    country: p.country,
    incoterms: `DAP ${p.city}`,
    salesValue: (prod?.salesUnit ?? 0) * p.unitCount,
    customsValue: (prod?.customsUnit ?? 0) * p.unitCount,
    legs: [
      {
        id: `LX-${p.txId}-pick`,
        kind: 'pick',
        vendor: 'Fast Insights WH-RNO-2 (Reno, NV)',
        location: 'WH-RNO-2, Reno, NV, USA',
        date: null,
        eta: DEMO_TODAY,
        status: 'active',
        docs: [{ name: 'Pick List', ready: false }],
        note: 'Created from AI vendor search',
      },
      {
        id: `LX-${p.txId}-out`,
        kind: 'outbound',
        vendor: 'Fast Insights WH-RNO-2 (Reno, NV)',
        location: 'WH-RNO-2, Reno, NV, USA',
        date: null,
        eta: DEMO_TODAY,
        status: 'pending',
        docs: [{ name: 'Bill of Lading', ready: false }],
      },
      ...routeLegs,
    ],
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, toast: null }
    case 'ACCEPT_OFFER': {
      const offer = state.offers.find((o) => o.id === action.offerId)
      if (!offer || offer.status !== 'offered') return state
      const newLeg: Leg = {
        id: `LX-${offer.id}`,
        kind: offer.kind,
        vendor: offer.vendor,
        location: offer.to,
        date: null,
        eta: addDays(offer.pickup, 3),
        status: 'pending',
        accept: 'accepted',
        docsPack: 'in-progress',
        docs: [{ name: 'Hand-off receipt', ready: false }],
        note: 'Accepted via carrier add-in — matched by the Transit Guard agent',
      }
      return {
        ...state,
        toast: action.toast,
        offers: state.offers.map((o) => (o.id === offer.id ? { ...o, status: 'accepted' as const } : o)),
        shipments: state.shipments.map((s) => (s.txId === offer.txId ? { ...s, legs: [...s.legs, newLeg] } : s)),
      }
    }
    case 'DECLINE_OFFER':
      return {
        ...state,
        toast: action.toast,
        offers: state.offers.map((o) => (o.id === action.offerId ? { ...o, status: 'declined' as const } : o)),
      }
    case 'REROUTE_ACCEPT': {
      const offer = state.offers.find((o) => o.id === action.offerId)
      if (!offer) return state
      const target = state.shipments.find((s) => s.txId === offer.txId)
      if (!target || target.legs.some((l) => l.status !== 'complete' && l.vendor === action.altVendor)) {
        return { ...state, toast: action.toast }
      }
      const reroutedLeg: Leg = {
        id: `LX-${offer.id}-R`,
        kind: offer.kind,
        vendor: action.altVendor,
        location: offer.to,
        date: null,
        eta: addDays(offer.pickup, 4),
        status: 'pending',
        accept: 'accepted',
        docsPack: 'in-progress',
        docs: [{ name: 'Hand-off receipt', ready: false }],
        note:
          `Rerouted by the agent — ${offer.vendor} declined, ${action.altVendor} accepted on availability + weights & measures. ` +
          `Δ +$70 (+4.8%) · +1 day — within tolerance (±${AGENT_POLICY.pctLimit}% / $${AGENT_POLICY.usdLimit} / ${AGENT_POLICY.daysLimit} days): auto-confirmed, delivery timing verified, sender notified.`,
      }
      return {
        ...state,
        toast: action.toast,
        shipments: state.shipments.map((s) => (s.txId === offer.txId ? { ...s, legs: [...s.legs, reroutedLeg] } : s)),
      }
    }
    case 'RESOLVE_APPROVAL': {
      const ap = state.approvals.find((a) => a.id === action.approvalId)
      if (!ap) return state
      return {
        ...state,
        toast: action.toast,
        approvals: state.approvals.filter((a) => a.id !== action.approvalId),
        shipments: state.shipments.map((s) => {
          if (s.txId !== ap.txId) return s
          return {
            ...s,
            legs: s.legs.map((l) => {
              if (l.id !== ap.legId) return l
              return action.approve
                ? {
                    ...l,
                    vendor: ap.altVendor,
                    accept: 'accepted' as const,
                    note: `Sender approved reroute to ${ap.altVendor} (Δ +$${ap.costDelta}) — delivery timing verified unchanged`,
                  }
                : {
                    ...l,
                    accept: 'contacting' as const,
                    note: 'Sender rejected the reroute — upstream agent re-contacting carriers within tolerance',
                  }
            }),
          }
        }),
      }
    }
    case 'VENDOR_LABEL_SCAN':
      return {
        ...state,
        toast: action.toast,
        offers: state.offers.map((o) =>
          o.txId === action.txId && o.vendor === action.vendor && o.status === 'offered' ? { ...o, status: 'accepted' as const } : o,
        ),
        shipments: state.shipments.map((s) => {
          if (s.txId !== action.txId) return s
          if (action.mode === 'substitute') {
            // Prefer legs the scanning carrier can actually run (kind matches its capabilities).
            const capabilities = VENDORS.find((v) => v.name === action.vendor)?.kinds ?? TRANSPORT_KINDS
            const eligible = (l: Leg) =>
              l.status !== 'complete' && TRANSPORT_KINDS.includes(l.kind) && l.vendor !== action.vendor
            const preferred = s.legs.find((l) => eligible(l) && capabilities.includes(l.kind))
            const targetId = (preferred ?? s.legs.find(eligible))?.id
            let done = false
            return {
              ...s,
              legs: s.legs.map((l) => {
                if (!done && l.id === targetId) {
                  done = true
                  return {
                    ...l,
                    vendor: action.vendor,
                    accept: 'accepted' as const,
                    docsPack: 'received' as const,
                    via: 'Label scan',
                    note: `Vendor auto-updated from label scan — plan had ${l.vendor}`,
                  }
                }
                return l
              }),
            }
          }
          // pickup: close the active leg, activate (or create) this carrier's leg, mark docs received
          let legs = s.legs.map((l) => (l.status === 'active' ? { ...l, status: 'complete' as const, date: l.date ?? DEMO_TODAY } : l))
          let idx = legs.findIndex((l) => l.status === 'pending' && l.vendor === action.vendor)
          if (idx === -1) {
            legs = [
              ...legs,
              {
                id: `LX-${s.txId}-scan`,
                kind: 'truck' as const,
                vendor: action.vendor,
                location: s.destination,
                date: null,
                status: 'pending' as const,
                docs: [{ name: 'Hand-off receipt', ready: false }],
              },
            ]
            idx = legs.length - 1
          }
          legs = legs.map((l, i) =>
            i === idx ? { ...l, status: 'active' as const, accept: 'accepted' as const, docsPack: 'received' as const, via: 'Label scan' } : l,
          )
          return { ...s, legs }
        }),
      }
    case 'APPLY_ROUTE':
      if (state.shipments.some((s) => s.txId === action.payload.txId)) return { ...state, toast: action.toast }
      return { ...state, toast: action.toast, shipments: [buildRouteShipment(action.payload), ...state.shipments] }
    case 'LOG_SCAN':
      return { ...state, scans: [action.scan, ...state.scans], toast: action.toast }
    case 'ADD_LEG':
      return {
        ...state,
        toast: action.toast,
        shipments: state.shipments.map((s) => {
          if (s.txId !== action.txId) return s
          const idx = s.legs.findIndex((l) => l.status !== 'complete')
          if (idx >= 0 && s.legs[idx].kind === action.leg.kind) {
            // The scanned hand-off matches the next planned leg — complete it in place.
            return {
              ...s,
              legs: s.legs.map((l, i) =>
                i === idx
                  ? {
                      ...l,
                      vendor: action.leg.vendor,
                      location: action.leg.location,
                      date: action.leg.date,
                      note: action.leg.note ?? l.note,
                      status: 'complete' as const,
                      docs: l.docs.map((d) => ({ ...d, ready: true })),
                    }
                  : l,
              ),
            }
          }
          return {
            ...s,
            legs: [
              ...s.legs.map((l) => (l.status === 'active' ? { ...l, status: 'complete' as const, date: l.date ?? action.leg.date } : l)),
              { ...action.leg, id: `LX-${s.txId}-${s.legs.length}`, status: 'complete' as const },
            ],
          }
        }),
      }
    case 'COMPLETE_ACTIVE_LEG':
      return {
        ...state,
        shipments: state.shipments.map((s) => {
          if (s.txId !== action.txId) return s
          let done = false
          return {
            ...s,
            legs: s.legs.map((l) => {
              if (!done && l.status === 'active') {
                done = true
                return { ...l, status: 'complete' as const, date: action.date }
              }
              return l
            }),
          }
        }),
      }
    case 'START_RMA': {
      const src = state.shipments.find((s) => s.txId === action.txId)
      if (!src || state.shipments.some((s) => s.linkedTo === action.txId)) {
        return { ...state, toast: action.toast }
      }
      const reversed = [...src.legs]
        .reverse()
        .filter((l) => l.kind !== 'pick' && l.kind !== 'outbound')
      const rma: Shipment = {
        ...src,
        txId: `RMA-${src.txId.replace(/\D/g, '').slice(-4)}`,
        direction: 'rma',
        destination: 'WH-RNO-2, Reno, NV (return)',
        linkedTo: src.txId,
        incoterms: 'Return — seller freight',
        invoice: undefined,
        legs: [
          {
            id: `LX-${src.txId}-rma0`,
            kind: 'courier',
            vendor: 'Northgate Couriers',
            location: src.legs[src.legs.length - 1]?.location ?? src.destination,
            date: DEMO_TODAY,
            status: 'complete',
            docs: [{ name: 'RMA Authorization', ready: true }],
            note: 'Return intake — same chain, reversed',
          },
          ...reversed.map((l, i) => ({
            id: `LX-${src.txId}-rma${i + 1}`,
            kind: reverseKind(l.kind),
            vendor: l.vendor,
            location: l.location,
            date: null,
            status: (i === 0 ? 'active' : 'pending') as Leg['status'],
            docs: [{ name: 'Return document', ready: false }],
          })),
        ],
      }
      return { ...state, shipments: [rma, ...state.shipments], toast: action.toast }
    }
    case 'SET_DOC_READY':
      return {
        ...state,
        toast: action.toast ?? state.toast,
        shipments: state.shipments.map((s) =>
          s.txId === action.txId
            ? {
                ...s,
                legs: s.legs.map((l) =>
                  l.id === action.legId
                    ? { ...l, docs: l.docs.map((d) => (d.name === action.doc ? { ...d, ready: true } : d)) }
                    : l,
                ),
              }
            : s,
        ),
      }
    case 'TOAST':
      return { ...state, toast: action.toast }
    case 'CLEAR_TOAST':
      return { ...state, toast: null }
    default:
      return state
  }
}

const initialState: State = {
  shipments: SEED_SHIPMENTS,
  offers: SEED_OFFERS,
  approvals: SEED_APPROVALS,
  role: 'company',
  vendorName: COMPANY_VENDOR,
  scans: [
    { serial: 'VE-E2-2203', product: 'ValeEdge E2', txId: 'TX-20481', purpose: 'External — customer sale', at: '2026-12-16' },
    { serial: 'SW-S1-1104', product: 'SkyWatch S1 Dock', txId: 'TX-20461', purpose: 'External — customer sale', at: '2026-12-19' },
  ],
  toast: null,
}

const StoreCtx = createContext<{ state: State; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => {},
})

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export function useStore() {
  return useContext(StoreCtx)
}
