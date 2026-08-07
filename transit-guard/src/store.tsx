import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import {
  SEED_SHIPMENTS,
  DEMO_TODAY,
  type Shipment,
  type Leg,
  type LegKind,
} from './data/seed'

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
  toast: string | null
}

export type Action =
  | { type: 'LOG_SCAN'; scan: ScanEvent; toast: string }
  | { type: 'ADD_LEG'; txId: string; leg: Omit<Leg, 'id' | 'status'>; toast: string }
  | { type: 'COMPLETE_ACTIVE_LEG'; txId: string; date: string }
  | { type: 'START_RMA'; txId: string; toast: string }
  | { type: 'SET_DOC_READY'; txId: string; legId: string; doc: string; toast?: string }
  | { type: 'TOAST'; toast: string }
  | { type: 'CLEAR_TOAST' }

let legSeq = 100

function reverseKind(kind: LegKind): LegKind {
  if (kind === 'pick' || kind === 'outbound') return 'truck'
  if (kind === 'delivery') return 'courier'
  return kind
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
              { ...action.leg, id: `LX-${legSeq++}`, status: 'complete' as const },
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
            id: `LX-${legSeq++}`,
            kind: 'courier',
            vendor: 'Northgate Couriers',
            location: src.legs[src.legs.length - 1]?.location ?? src.destination,
            date: DEMO_TODAY,
            status: 'complete',
            docs: [{ name: 'RMA Authorization', ready: true }],
            note: 'Return intake — same chain, reversed',
          },
          ...reversed.map((l, i) => ({
            id: `LX-${legSeq++}`,
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
