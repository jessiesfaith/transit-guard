// Transit Guard demo seed — all data is synthetic. Fast Insights is fictional.
// Demo "today" is December 30, 2026 (two days before the FY2026 balance-sheet date),
// matching the Inventory Close Guard suite narrative.

export const DEMO_TODAY = '2026-12-30'

export type LegKind =
  | 'pick'
  | 'outbound'
  | 'truck'
  | 'boatyard'
  | 'ocean'
  | 'air'
  | 'port'
  | 'customs'
  | 'courier'
  | 'delivery'

export type LegStatus = 'complete' | 'active' | 'pending'

export interface LegDoc {
  name: string
  ready: boolean
}

/** Carrier-acceptance state for a proposed leg — the Uber-style match loop. */
export type AcceptState = 'contacting' | 'accepted' | 'declined'

/** Company-approved document pack: in-progress until the carrier scans the shipping label. */
export type DocsPackState = 'in-progress' | 'received'

export interface Leg {
  id: string
  kind: LegKind
  vendor: string
  location: string
  /** ISO date the hand-off happened; null while pending */
  date: string | null
  eta?: string
  status: LegStatus
  docs: LegDoc[]
  note?: string
  /** Set when the hand-off was logged by a partner carrier app through the Transit Guard API */
  via?: string
  accept?: AcceptState
  docsPack?: DocsPackState
}

export type Direction = 'outbound' | 'rma' | 'internal'

export interface Shipment {
  txId: string
  direction: Direction
  product: string
  unitCount: number
  serialsSample: string[]
  customer: string
  orderNo?: string
  destination: string
  country: 'US' | 'NL' | 'CA' | 'UK' | 'CH'
  incoterms?: string
  salesValue: number
  customsValue?: number
  invoice?: { id: string; date: string }
  linkedTo?: string
  /** Handling chips, e.g. Perishable / −2 °C / Dry ice / FOB destination */
  special?: string[]
  legs: Leg[]
}

export interface Flag {
  id: string
  severity: 'high' | 'medium' | 'planning'
  title: string
  amount?: number
  txId?: string
  detail: string
  why: string
  action: string
}

export interface Vendor {
  name: string
  kinds: LegKind[]
}

export const VENDORS: Vendor[] = [
  { name: 'Fast Insights WH-RNO-2 (Reno, NV)', kinds: ['pick', 'outbound'] },
  { name: 'Fast Insights Cold Lab (Palo Alto, CA)', kinds: ['pick', 'outbound'] },
  { name: 'Polar Reefer Express', kinds: ['truck'] },
  { name: 'Hudson Gate Marine Terminal (NY)', kinds: ['port', 'boatyard'] },
  { name: 'EuroChill Logistics Sp. z o.o.', kinds: ['truck'] },
  { name: 'Vistula Customs Agency (Gdansk)', kinds: ['customs'] },
  { name: 'Helvetia Customs Brokers AG', kinds: ['customs'] },
  { name: 'Cascade Freight Lines', kinds: ['truck'] },
  { name: 'Redline Haulage Co.', kinds: ['truck'] },
  { name: 'Harbor Point Boatyard (Oakland, CA)', kinds: ['boatyard'] },
  { name: 'Bayside Marine Terminal (Oakland, CA)', kinds: ['boatyard'] },
  { name: 'Pacific Meridian Lines', kinds: ['ocean'] },
  { name: 'Atlantic Crown Shipping', kinds: ['ocean'] },
  { name: 'AeroSwift Cargo', kinds: ['air'] },
  { name: 'Rotterdam Port Services B.V.', kinds: ['port'] },
  { name: 'Halifax Port Terminal', kinds: ['port'] },
  { name: 'VanderZee Customs Brokerage B.V.', kinds: ['customs'] },
  { name: 'Maple Leaf Customs Brokers', kinds: ['customs'] },
  { name: 'Thames Gate Customs Ltd.', kinds: ['customs'] },
  { name: 'Albion Port Services (Felixstowe)', kinds: ['port'] },
  { name: 'Northgate Couriers', kinds: ['courier', 'delivery'] },
]

export const LEG_KINDS: { key: LegKind; label: string }[] = [
  { key: 'pick', label: 'Warehouse pick' },
  { key: 'outbound', label: 'Outbound scan' },
  { key: 'truck', label: 'Truck freight' },
  { key: 'boatyard', label: 'Boatyard hand-off' },
  { key: 'ocean', label: 'Ocean vessel' },
  { key: 'air', label: 'Air freight' },
  { key: 'port', label: 'Port arrival' },
  { key: 'customs', label: 'Customs clearance' },
  { key: 'courier', label: 'Local courier' },
  { key: 'delivery', label: 'Customer delivery' },
]

export const LOCATIONS: string[] = [
  'WH-RNO-2, Reno, NV, USA',
  'Harbor Point Boatyard, Oakland, CA, USA',
  'Bayside Marine Terminal, Oakland, CA, USA',
  'Port of Oakland, CA, USA',
  'Port of Rotterdam, Netherlands',
  'Port of Halifax, Canada',
  'Customs Zone, Rotterdam, Netherlands',
  'Customer site — Utrecht, Netherlands',
  'Customer site — Toronto, Canada',
  'Trade show — Las Vegas, NV, USA',
]

export interface CustomsDocReq {
  doc: string
  desc: string
}

export const CUSTOMS_REQUIREMENTS: Record<string, CustomsDocReq[]> = {
  NL: [
    { doc: 'Commercial Invoice', desc: 'Customs valuation basis — customs price list, not the sales invoice' },
    { doc: 'Packing List', desc: 'Serials and cartons must tie to the custody ledger' },
    { doc: 'EORI Registration', desc: 'EU importer registration number for Fast Insights B.V.' },
    { doc: 'CE Declaration of Conformity', desc: 'Required for electronics entering the EU' },
    { doc: 'Customs Valuation Worksheet', desc: 'Documents why declared value differs from sales price' },
  ],
  CA: [
    { doc: 'Canada Customs Invoice (CCI)', desc: 'Valuation basis for CBSA' },
    { doc: 'Packing List', desc: 'Serials and cartons must tie to the custody ledger' },
    { doc: 'CUSMA Certificate of Origin', desc: 'Duty-free treatment under CUSMA/USMCA' },
    { doc: 'B3-3 Customs Coding Form', desc: 'Filed by the customs broker at entry' },
  ],
  UK: [
    { doc: 'Commercial Invoice', desc: 'Customs valuation basis — customs price list, not the sales invoice' },
    { doc: 'Packing List', desc: 'Serials and cartons must tie to the custody ledger' },
    { doc: 'GB EORI Registration', desc: 'UK importer registration — separate from the EU EORI' },
    { doc: 'UKCA Marking Declaration', desc: 'UK conformity marking — CE-only no longer accepted for security electronics' },
    { doc: 'CDS Import Declaration', desc: 'Filed by the broker in the Customs Declaration Service' },
  ],
  CH: [
    { doc: 'Commercial Invoice', desc: 'Customs valuation basis for Swiss import' },
    { doc: 'Packing List', desc: 'Lots and cartons must tie to the custody ledger' },
    { doc: 'e-dec Import Declaration', desc: 'Swiss electronic customs declaration, filed by the broker' },
    { doc: 'Perishable Goods Certificate', desc: 'Required for temperature-controlled biological goods' },
    { doc: 'Cold-Chain Temperature Log', desc: 'Continuous −2 °C record from origin — attached from custody events' },
  ],
}

export const PRODUCTS: Record<string, { salesUnit: number; customsUnit: number; hs: string }> = {
  'ValeEdge E2': { salesUnit: 12400, customsUnit: 9800, hs: '8471.50' },
  'PerimeterOne P4': { salesUnit: 8200, customsUnit: 6900, hs: '8525.81' },
  'SkyWatch S1 Dock': { salesUnit: 21500, customsUnit: 17200, hs: '8526.91' },
  'CryoSense Assay Kit': { salesUnit: 25000, customsUnit: 21000, hs: '3822.19' },
}

export const SEED_SHIPMENTS: Shipment[] = [
  {
    txId: 'TX-20481',
    direction: 'outbound',
    product: 'ValeEdge E2',
    unitCount: 15,
    serialsSample: ['VE-E2-2201', 'VE-E2-2202', 'VE-E2-2203'],
    customer: 'Meridian Health Europe B.V.',
    orderNo: 'ORD-88412',
    destination: 'Utrecht, Netherlands',
    country: 'NL',
    incoterms: 'DAP Utrecht',
    salesValue: 186000,
    customsValue: 147000,
    invoice: { id: 'INV-8841', date: '2026-12-30' },
    legs: [
      { id: 'L1', kind: 'pick', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-15', status: 'complete', docs: [{ name: 'Pick List PL-5521', ready: true }] },
      { id: 'L2', kind: 'outbound', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-16', status: 'complete', docs: [{ name: 'Bill of Lading BOL-7719', ready: true }] },
      { id: 'L3', kind: 'truck', vendor: 'Cascade Freight Lines', location: 'Harbor Point Boatyard, Oakland, CA, USA', date: '2026-12-17', status: 'complete', docs: [{ name: 'Delivery Receipt DR-1180', ready: true }], note: 'Driver-to-boatyard hand-off signed' },
      { id: 'L4', kind: 'boatyard', vendor: 'Harbor Point Boatyard (Oakland, CA)', location: 'Port of Oakland, CA, USA', date: '2026-12-19', status: 'complete', docs: [{ name: 'Dock Receipt DKR-0442', ready: true }], note: 'Loaded MV Meridian Star' },
      { id: 'L5', kind: 'ocean', vendor: 'Pacific Meridian Lines', location: 'Port of Rotterdam, Netherlands', date: '2026-12-28', status: 'complete', docs: [{ name: 'Ocean B/L OBL-3327', ready: true }] },
      { id: 'L6', kind: 'customs', vendor: 'VanderZee Customs Brokerage B.V.', location: 'Customs Zone, Rotterdam, Netherlands', date: '2026-12-29', status: 'active', docs: [
        { name: 'Commercial Invoice', ready: true },
        { name: 'Packing List', ready: true },
        { name: 'EORI Registration', ready: true },
        { name: 'CE Declaration of Conformity', ready: false },
        { name: 'Customs Valuation Worksheet', ready: false },
      ], note: 'Broker requested valuation worksheet' },
      { id: 'L7', kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Utrecht, Netherlands', date: null, eta: '2027-01-04', status: 'pending', docs: [{ name: 'Proof of Delivery', ready: false }] },
    ],
  },
  {
    txId: 'TX-20499',
    direction: 'outbound',
    product: 'CryoSense Assay Kit',
    unitCount: 40,
    serialsSample: ['CS-AK-0711', 'CS-AK-0712', 'CS-AK-0713'],
    customer: 'Helvetia BioLogistics AG',
    orderNo: 'ORD-88433',
    destination: 'Geneva, Switzerland',
    country: 'CH',
    incoterms: 'FOB destination — Geneva',
    salesValue: 1000000,
    customsValue: 840000,
    special: ['Perishable', '−2 °C required', 'Dry ice', 'FOB destination'],
    legs: [
      { id: 'C1', kind: 'pick', vendor: 'Fast Insights Cold Lab (Palo Alto, CA)', location: 'Cold Lab, Palo Alto, CA, USA', date: '2026-12-18', status: 'complete', docs: [{ name: 'Pick List PL-5533', ready: true }, { name: 'Temp Log — start (−2 °C)', ready: true }], note: 'Reefer packed, dry ice loaded' },
      { id: 'C2', kind: 'outbound', vendor: 'Fast Insights Cold Lab (Palo Alto, CA)', location: 'Cold Lab, Palo Alto, CA, USA', date: '2026-12-19', status: 'complete', docs: [{ name: 'Bill of Lading BOL-7731', ready: true }] },
      { id: 'C3', kind: 'truck', vendor: 'Polar Reefer Express', location: 'Hudson Gate Marine Terminal, New York, NY, USA', date: '2026-12-22', status: 'complete', via: 'Partner API', docs: [{ name: 'Reefer Receipt RR-2088', ready: true }, { name: 'Temp Log — re-ice, Chicago', ready: true }], note: 'Dry ice re-charged in Chicago — logged by carrier app' },
      { id: 'C4', kind: 'port', vendor: 'Hudson Gate Marine Terminal (NY)', location: 'Port of New York, NY, USA', date: '2026-12-23', status: 'complete', docs: [{ name: 'Dock Receipt DKR-0466', ready: true }], note: 'Loaded MV Crown Atlantic — reefer hold −2 °C' },
      { id: 'C5', kind: 'ocean', vendor: 'Atlantic Crown Shipping', location: 'Port of Southampton, United Kingdom', date: null, eta: '2027-01-02', status: 'active', via: 'Partner API', docs: [{ name: 'Ocean B/L OBL-3341', ready: true }, { name: 'Temp telemetry feed', ready: true }] },
      { id: 'C6', kind: 'customs', vendor: 'Thames Gate Customs Ltd.', location: 'Southampton Customs, United Kingdom', date: null, eta: '2027-01-03', status: 'pending', docs: [{ name: 'UK Transit Declaration (T1)', ready: true }, { name: 'Perishable Goods Certificate', ready: true }] },
      { id: 'C7', kind: 'truck', vendor: 'EuroChill Logistics Sp. z o.o.', location: 'Cold hub, Gdansk, Poland', date: null, eta: '2027-01-05', status: 'pending', accept: 'accepted', docsPack: 'in-progress', docs: [{ name: 'CMR Consignment Note', ready: false }], note: 'Dry ice re-charge scheduled — Gdansk cold hub' },
      { id: 'C8', kind: 'customs', vendor: 'Vistula Customs Agency (Gdansk)', location: 'EU entry — Gdansk, Poland', date: null, eta: '2027-01-06', status: 'pending', docs: [{ name: 'EU Import Declaration', ready: false }, { name: 'Sanitary Certificate (EU)', ready: true }] },
      { id: 'C9', kind: 'truck', vendor: 'EuroChill Logistics Sp. z o.o.', location: 'Geneva, Switzerland', date: null, eta: '2027-01-08', status: 'pending', accept: 'contacting', docs: [{ name: 'CMR Consignment Note', ready: false }], note: 'Reroute 2 of 3 — first carrier unavailable Jan 7; agent re-matched on balanced priority' },
      { id: 'C10', kind: 'customs', vendor: 'Helvetia Customs Brokers AG', location: 'Swiss customs, Geneva', date: null, eta: '2027-01-09', status: 'pending', docs: [{ name: 'e-dec Import Declaration', ready: false }, { name: 'Perishable Goods Certificate', ready: true }, { name: 'Cold-Chain Temperature Log', ready: false }] },
      { id: 'C11', kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Geneva, Switzerland', date: null, eta: '2027-01-10', status: 'pending', docs: [{ name: 'Proof of Delivery + temp acceptance', ready: false }], note: 'FOB destination — revenue recognizes here' },
    ],
  },
  {
    txId: 'TX-20490',
    direction: 'outbound',
    product: 'PerimeterOne P4',
    unitCount: 8,
    serialsSample: ['PO-P4-3312', 'PO-P4-3313', 'PO-P4-3314'],
    customer: 'Aurora Security Co.',
    orderNo: 'ORD-88421',
    destination: 'Toronto, Canada',
    country: 'CA',
    incoterms: 'FCA Reno',
    salesValue: 65600,
    customsValue: 55200,
    legs: [
      { id: 'L1', kind: 'pick', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-29', status: 'complete', docs: [{ name: 'Pick List PL-5544', ready: true }] },
      { id: 'L2', kind: 'outbound', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: null, eta: '2026-12-30', status: 'active', docs: [{ name: 'Bill of Lading', ready: false }], note: 'Awaiting outbound scan — demo the scan flow here' },
    ],
  },
  {
    txId: 'TX-20476',
    direction: 'outbound',
    product: 'PerimeterOne P4',
    unitCount: 6,
    serialsSample: ['PO-P4-3288', 'PO-P4-3289', 'PO-P4-3290'],
    customer: 'Nordbank Facilities Ltd.',
    orderNo: 'ORD-88402',
    destination: 'Toronto, Canada',
    country: 'CA',
    incoterms: 'FCA Reno',
    salesValue: 49200,
    customsValue: 41400,
    invoice: { id: 'INV-8802', date: '2026-12-18' },
    legs: [
      { id: 'L1', kind: 'pick', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-16', status: 'complete', docs: [{ name: 'Pick List PL-5510', ready: true }] },
      { id: 'L2', kind: 'outbound', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-17', status: 'complete', docs: [{ name: 'Bill of Lading BOL-7702', ready: true }] },
      { id: 'L3', kind: 'air', vendor: 'AeroSwift Cargo', location: 'Toronto Pearson, Canada', date: '2026-12-18', status: 'complete', docs: [{ name: 'Air Waybill AWB-9012', ready: true }] },
      { id: 'L4', kind: 'customs', vendor: 'Maple Leaf Customs Brokers', location: 'Toronto Pearson, Canada', date: '2026-12-19', status: 'complete', docs: [
        { name: 'Canada Customs Invoice (CCI)', ready: true },
        { name: 'Packing List', ready: true },
        { name: 'CUSMA Certificate of Origin', ready: true },
        { name: 'B3-3 Customs Coding Form', ready: true },
      ] },
      { id: 'L5', kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Toronto, Canada', date: '2026-12-21', status: 'complete', docs: [{ name: 'Proof of Delivery POD-6631', ready: true }] },
    ],
  },
  {
    txId: 'TX-20470',
    direction: 'outbound',
    product: 'ValeEdge E2',
    unitCount: 10,
    serialsSample: ['VE-E2-2251', 'VE-E2-2252', 'VE-E2-2253'],
    customer: 'Harrington Estates Security Ltd.',
    orderNo: 'ORD-88415',
    destination: 'London, United Kingdom',
    country: 'UK',
    incoterms: 'DAP London',
    salesValue: 124000,
    customsValue: 98000,
    legs: [
      { id: 'U1', kind: 'pick', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-24', status: 'complete', docs: [{ name: 'Pick List PL-5529', ready: true }] },
      { id: 'U2', kind: 'outbound', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-26', status: 'complete', docs: [{ name: 'Bill of Lading BOL-7726', ready: true }] },
      { id: 'U3', kind: 'air', vendor: 'AeroSwift Cargo', location: 'London Heathrow, United Kingdom', date: '2026-12-27', status: 'complete', via: 'Partner API', docs: [{ name: 'Air Waybill AWB-9044', ready: true }] },
      { id: 'U4', kind: 'customs', vendor: 'Thames Gate Customs Ltd.', location: 'Heathrow Customs, United Kingdom', date: null, eta: '2027-01-02', status: 'active', docs: [
        { name: 'Commercial Invoice', ready: true },
        { name: 'Packing List', ready: true },
        { name: 'GB EORI Registration', ready: true },
        { name: 'UKCA Marking Declaration', ready: false },
        { name: 'CDS Import Declaration', ready: false },
      ], note: 'UKCA declaration required — CE-only no longer accepted (bulletin Dec 15)' },
      { id: 'U5', kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — London, United Kingdom', date: null, eta: '2027-01-06', status: 'pending', docs: [{ name: 'Proof of Delivery', ready: false }] },
    ],
  },
  {
    txId: 'TX-20461',
    direction: 'outbound',
    product: 'SkyWatch S1 Dock',
    unitCount: 4,
    serialsSample: ['SW-S1-1104', 'SW-S1-1105'],
    customer: 'Meridian Health Europe B.V.',
    orderNo: 'ORD-88409',
    destination: 'Utrecht, Netherlands',
    country: 'NL',
    incoterms: 'DAP Utrecht',
    salesValue: 86000,
    customsValue: 68800,
    legs: [
      { id: 'L1', kind: 'pick', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-18', status: 'complete', docs: [{ name: 'Pick List PL-5516', ready: true }] },
      { id: 'L2', kind: 'outbound', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-19', status: 'complete', docs: [{ name: 'Bill of Lading BOL-7710', ready: true }] },
      { id: 'L3', kind: 'truck', vendor: 'Redline Haulage Co.', location: 'Bayside Marine Terminal, Oakland, CA, USA', date: '2026-12-21', status: 'complete', docs: [{ name: 'Delivery Receipt DR-1194', ready: true }] },
      { id: 'L4', kind: 'boatyard', vendor: 'Bayside Marine Terminal (Oakland, CA)', location: 'Bayside Marine Terminal, Oakland, CA, USA', date: null, eta: '2027-01-02', status: 'active', docs: [{ name: 'Dock Receipt', ready: false }], note: 'Awaiting vessel space — at boatyard since Dec 21' },
    ],
  },
  {
    txId: 'RMA-1043',
    direction: 'rma',
    product: 'SkyWatch S1 Dock',
    unitCount: 2,
    serialsSample: ['SW-S1-1071', 'SW-S1-1072'],
    customer: 'Meridian Health Europe B.V.',
    orderNo: 'ORD-88377',
    destination: 'WH-RNO-2, Reno, NV (return)',
    country: 'NL',
    incoterms: 'Return — seller freight',
    salesValue: 43000,
    linkedTo: 'TX-20412',
    legs: [
      { id: 'R1', kind: 'courier', vendor: 'Northgate Couriers', location: 'Customer site — Utrecht, Netherlands', date: '2026-12-22', status: 'complete', docs: [{ name: 'RMA Authorization RMA-1043', ready: true }], note: 'Defect confirmed — same TX chain, reversed' },
      { id: 'R2', kind: 'port', vendor: 'Rotterdam Port Services B.V.', location: 'Port of Rotterdam, Netherlands', date: '2026-12-27', status: 'complete', docs: [{ name: 'Export Declaration EXD-2210', ready: true }] },
      { id: 'R3', kind: 'ocean', vendor: 'Atlantic Crown Shipping', location: 'Port of Oakland, CA, USA', date: null, eta: '2027-01-09', status: 'active', docs: [{ name: 'Ocean B/L', ready: false }] },
      { id: 'R4', kind: 'truck', vendor: 'Redline Haulage Co.', location: 'WH-RNO-2, Reno, NV, USA', date: null, eta: '2027-01-11', status: 'pending', accept: 'accepted', docsPack: 'in-progress', docs: [{ name: 'Return Receipt', ready: false }], note: 'Planned carrier — final leg to warehouse' },
    ],
  },
  {
    txId: 'TX-20455',
    direction: 'internal',
    product: 'ValeEdge E2',
    unitCount: 1,
    serialsSample: ['VE-E2-2140'],
    customer: 'Internal — Marketing (demo unit)',
    destination: 'Trade show — Las Vegas, NV, USA',
    country: 'US',
    salesValue: 12400,
    legs: [
      { id: 'L1', kind: 'pick', vendor: 'Fast Insights WH-RNO-2 (Reno, NV)', location: 'WH-RNO-2, Reno, NV, USA', date: '2026-12-12', status: 'complete', docs: [{ name: 'Internal Use Form IU-0097', ready: true }], note: 'Internal use — no revenue event' },
      { id: 'L2', kind: 'delivery', vendor: 'Northgate Couriers', location: 'Trade show — Las Vegas, NV, USA', date: '2026-12-13', status: 'complete', docs: [{ name: 'Transfer Receipt', ready: true }], note: 'Return due Jan 15 — still Fast Insights inventory' },
    ],
  },
]

export const SEED_FLAGS: Flag[] = [
  {
    id: 'FLG-01',
    severity: 'high',
    title: 'Revenue cutoff risk — DAP delivery lands in FY2027',
    amount: 186000,
    txId: 'TX-20481',
    detail: 'Incoterms are DAP Utrecht: revenue recognizes at customer delivery (ETA Jan 4, 2027). Invoice INV-8841 is dated Dec 30, 2026.',
    why: 'Recognizing $186,000 in FY2026 for goods still at Rotterdam customs would misstate December revenue. Custody events prove control has not transferred.',
    action: 'Hold INV-8841 out of December revenue; route to Controller with the custody ledger as cutoff evidence.',
  },
  {
    id: 'FLG-06',
    severity: 'high',
    title: 'FOB destination — $1M revenue holds until Geneva delivery',
    amount: 1000000,
    txId: 'TX-20499',
    detail: '40 CryoSense Assay Kits (perishable, −2 °C, dry ice) crossing the Atlantic at year-end. FOB destination: title and revenue transfer only at Geneva acceptance (ETA Jan 10).',
    why: 'A $1,000,000 December invoice would misstate FY2026 revenue — and a cold-chain excursion at any of 6 hand-offs converts revenue into a spoilage write-off. The custody chain carries the re-icing and temperature evidence.',
    action: 'Hold revenue until the Geneva proof-of-delivery with temperature acceptance; verify the Gdansk re-ice hand-off is QR-scanned on arrival.',
  },
  {
    id: 'FLG-02',
    severity: 'high',
    title: 'Customs valuation differs from sales invoice — document it',
    amount: 39000,
    txId: 'TX-20481',
    detail: 'Declared customs value $147,000 (customs price list, $9,800/unit) vs. sales invoice $186,000 ($12,400/unit).',
    why: 'A price-list valuation is legitimate but auditors and brokers need the method documented. Missing worksheet is already holding clearance.',
    action: 'Complete the Customs Valuation Worksheet and attach it to TX-20481 before broker follow-up on Jan 2.',
  },
  {
    id: 'FLG-03',
    severity: 'medium',
    title: 'RMA in transit — credit memo not yet accrued',
    amount: 43000,
    txId: 'RMA-1043',
    detail: '2 SkyWatch S1 Docks returning from Utrecht (defect). Return acknowledged Dec 22; units on the water at year-end.',
    why: 'FY2026 revenue is overstated by $43,000 if the return accrual is missed; the reverse custody chain is the evidence.',
    action: 'Accrue sales return reserve for RMA-1043 in December; Controller approves the credit memo on receipt.',
  },
  {
    id: 'FLG-04',
    severity: 'medium',
    title: 'In-transit aging — 9 days at boatyard, include in count',
    amount: 86000,
    txId: 'TX-20461',
    detail: '4 SkyWatch S1 Docks at Bayside Marine Terminal since Dec 21 awaiting vessel space (DAP terms — still Fast Insights inventory).',
    why: 'Goods off-site but owned must appear in the Dec 31 physical count as in-transit inventory, or existence testing fails.',
    action: 'Add TX-20461 to the year-end count as in-transit; request vessel ETA from Bayside.',
  },
  {
    id: 'FLG-05',
    severity: 'planning',
    title: 'Tax timing — shift $500K stock receipt from Dec 30 to Jan 2',
    amount: 500000,
    detail: 'Replenishment PO-7788 ($500,000, 48 units) is scheduled to arrive Dec 30. Receiving Jan 2 keeps it off the Jan 1 personal-property-tax assessment date and out of year-end count scope.',
    why: 'Inventory on hand at the assessment date drives property tax in several states; December receipts also expand count scope and working capital at the worst moment. Estimated saving ≈ $6,500 (confirm with tax advisor).',
    action: 'Ask Purchasing to reschedule PO-7788 receipt to Jan 2; Transit Guard will track the inbound chain.',
  },
]

export interface CountBucket {
  key: string
  units: number
}

/** Dec 31 physical count snapshot — ties to the 1,200-unit fleet in the Close Guard suite. */
export const COUNT_SNAPSHOT: CountBucket[] = [
  { key: 'countWarehouse', units: 412 },
  { key: 'countInTransit', units: 35 },
  { key: 'countAtCustoms', units: 15 },
  { key: 'countDelivered', units: 731 },
  { key: 'countInternal', units: 7 },
]

export const SCAN_QUEUE: { serial: string; product: string; txId: string }[] = [
  { serial: 'PO-P4-3312', product: 'PerimeterOne P4', txId: 'TX-20490' },
  { serial: 'PO-P4-3313', product: 'PerimeterOne P4', txId: 'TX-20490' },
  { serial: 'VE-E2-2205', product: 'ValeEdge E2', txId: 'TX-20481' },
]

export function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number)
  const [ty, tm, td] = toIso.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000)
}

// ---------------------------------------------------------------------------
// AI vendor search (Plan tab) — precomputed route options and customs bulletins.
// In production this would be a live AI search over carrier and customs data.

export type RouteStrategy = 'fastest' | 'balanced' | 'economy'

export interface RouteLeg {
  kind: LegKind
  vendor: string
  location: string
  days: number
  rating: number
}

export interface RouteOption {
  id: string
  name: string
  strategy: RouteStrategy
  transitDays: number
  cost: number
  onTime: number
  legs: RouteLeg[]
  note?: string
  /** What the agent read from vendor memory vs. queried live — no per-order recompute. */
  memory?: string
}

export type PlanCountry = 'NL' | 'CA' | 'UK'

export interface PlanDestination {
  key: PlanCountry
  city: string
  label: string
}

export const PLAN_DESTINATIONS: PlanDestination[] = [
  { key: 'NL', city: 'Utrecht', label: 'Utrecht, Netherlands' },
  { key: 'CA', city: 'Toronto', label: 'Toronto, Canada' },
  { key: 'UK', city: 'London', label: 'London, United Kingdom' },
]

export const ROUTE_OPTIONS: Record<PlanCountry, RouteOption[]> = {
  NL: [
    {
      id: 'NL-AIR', memory: 'Memory: AeroSwift avg $2,140/ton air · owns RNO–AMS lane · queried Dec 30–Jan 1 availability via API', name: 'Express Air', strategy: 'fastest', transitDays: 4, cost: 8400, onTime: 98,
      legs: [
        { kind: 'air', vendor: 'AeroSwift Cargo', location: 'Amsterdam Schiphol, Netherlands', days: 2, rating: 4.8 },
        { kind: 'customs', vendor: 'VanderZee Customs Brokerage B.V.', location: 'Schiphol Customs, Netherlands', days: 1, rating: 4.9 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Utrecht, Netherlands', days: 1, rating: 4.6 },
      ],
    },
    {
      id: 'NL-OCEXP', memory: 'Memory: Pacific Meridian avg $310/ton ocean · owns OAK–RTM lane · queried vessel space Dec 30–Jan 2 via API', name: 'Priority Ocean', strategy: 'balanced', transitDays: 14, cost: 3900, onTime: 94,
      legs: [
        { kind: 'truck', vendor: 'Cascade Freight Lines', location: 'Harbor Point Boatyard, Oakland, CA, USA', days: 1, rating: 4.6 },
        { kind: 'boatyard', vendor: 'Harbor Point Boatyard (Oakland, CA)', location: 'Port of Oakland, CA, USA', days: 1, rating: 4.4 },
        { kind: 'ocean', vendor: 'Pacific Meridian Lines', location: 'Port of Rotterdam, Netherlands', days: 9, rating: 4.5 },
        { kind: 'customs', vendor: 'VanderZee Customs Brokerage B.V.', location: 'Customs Zone, Rotterdam, Netherlands', days: 2, rating: 4.9 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Utrecht, Netherlands', days: 1, rating: 4.6 },
      ],
    },
    {
      id: 'NL-OCECO', memory: 'Memory: Atlantic Crown avg $186/ton ocean · serves OAK–RTM · queried vessel space Jan 2–6 via API', name: 'Economy Ocean', strategy: 'economy', transitDays: 21, cost: 2100, onTime: 88,
      note: 'Misses the need-by date if customs slips more than 3 days.',
      legs: [
        { kind: 'truck', vendor: 'Redline Haulage Co.', location: 'Bayside Marine Terminal, Oakland, CA, USA', days: 1, rating: 4.1 },
        { kind: 'boatyard', vendor: 'Bayside Marine Terminal (Oakland, CA)', location: 'Port of Oakland, CA, USA', days: 2, rating: 3.9 },
        { kind: 'ocean', vendor: 'Atlantic Crown Shipping', location: 'Port of Rotterdam, Netherlands', days: 14, rating: 4.0 },
        { kind: 'customs', vendor: 'VanderZee Customs Brokerage B.V.', location: 'Customs Zone, Rotterdam, Netherlands', days: 3, rating: 4.9 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Utrecht, Netherlands', days: 1, rating: 4.6 },
      ],
    },
  ],
  CA: [
    {
      id: 'CA-AIR', memory: 'Memory: AeroSwift avg $1,890/ton air · owns RNO–YYZ lane · queried Dec 30 availability via API', name: 'Express Air', strategy: 'fastest', transitDays: 3, cost: 2900, onTime: 98,
      legs: [
        { kind: 'air', vendor: 'AeroSwift Cargo', location: 'Toronto Pearson, Canada', days: 1, rating: 4.8 },
        { kind: 'customs', vendor: 'Maple Leaf Customs Brokers', location: 'Toronto Pearson, Canada', days: 1, rating: 4.7 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Toronto, Canada', days: 1, rating: 4.6 },
      ],
    },
    {
      id: 'CA-GRND', memory: 'Memory: Cascade avg $412/ton ground · owns Reno–Toronto corridor · queried truck slots Dec 30–31 via API', name: 'Cross-Border Ground', strategy: 'balanced', transitDays: 6, cost: 1450, onTime: 95,
      legs: [
        { kind: 'truck', vendor: 'Cascade Freight Lines', location: 'Peace Bridge, Buffalo NY → Fort Erie ON', days: 4, rating: 4.6 },
        { kind: 'customs', vendor: 'Maple Leaf Customs Brokers', location: 'Fort Erie, Canada', days: 1, rating: 4.7 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Toronto, Canada', days: 1, rating: 4.6 },
      ],
    },
    {
      id: 'CA-LTL', memory: 'Memory: Redline avg $255/ton LTL · serves Reno–Toronto · queried consolidation space Jan 2 via API', name: 'Economy LTL', strategy: 'economy', transitDays: 9, cost: 780, onTime: 90,
      legs: [
        { kind: 'truck', vendor: 'Redline Haulage Co.', location: 'Peace Bridge, Buffalo NY → Fort Erie ON', days: 7, rating: 4.1 },
        { kind: 'customs', vendor: 'Maple Leaf Customs Brokers', location: 'Fort Erie, Canada', days: 1, rating: 4.7 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — Toronto, Canada', days: 1, rating: 4.6 },
      ],
    },
  ],
  UK: [
    {
      id: 'UK-AIR', memory: 'Memory: AeroSwift avg $2,050/ton air · owns RNO–LHR lane · queried Dec 30–Jan 1 availability via API', name: 'Express Air', strategy: 'fastest', transitDays: 4, cost: 7900, onTime: 97,
      legs: [
        { kind: 'air', vendor: 'AeroSwift Cargo', location: 'London Heathrow, United Kingdom', days: 2, rating: 4.8 },
        { kind: 'customs', vendor: 'Thames Gate Customs Ltd.', location: 'Heathrow Customs, United Kingdom', days: 1, rating: 4.5 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — London, United Kingdom', days: 1, rating: 4.6 },
      ],
    },
    {
      id: 'UK-OCEXP', memory: 'Memory: Pacific Meridian avg $298/ton ocean · owns OAK–FXT lane · queried vessel space Dec 30–Jan 2 via API', name: 'Priority Ocean', strategy: 'balanced', transitDays: 17, cost: 3600, onTime: 92,
      legs: [
        { kind: 'truck', vendor: 'Cascade Freight Lines', location: 'Harbor Point Boatyard, Oakland, CA, USA', days: 1, rating: 4.6 },
        { kind: 'boatyard', vendor: 'Harbor Point Boatyard (Oakland, CA)', location: 'Port of Oakland, CA, USA', days: 1, rating: 4.4 },
        { kind: 'ocean', vendor: 'Pacific Meridian Lines', location: 'Port of Felixstowe, United Kingdom', days: 11, rating: 4.5 },
        { kind: 'port', vendor: 'Albion Port Services (Felixstowe)', location: 'Port of Felixstowe, United Kingdom', days: 1, rating: 4.3 },
        { kind: 'customs', vendor: 'Thames Gate Customs Ltd.', location: 'Felixstowe Customs, United Kingdom', days: 2, rating: 4.5 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — London, United Kingdom', days: 1, rating: 4.6 },
      ],
    },
    {
      id: 'UK-OCECO', memory: 'Memory: Atlantic Crown avg $172/ton ocean · serves OAK–FXT · queried vessel space Jan 3–8 via API', name: 'Economy Ocean', strategy: 'economy', transitDays: 23, cost: 1950, onTime: 86,
      note: 'Tight against most need-by dates — buffer for UKCA document review.',
      legs: [
        { kind: 'truck', vendor: 'Redline Haulage Co.', location: 'Bayside Marine Terminal, Oakland, CA, USA', days: 1, rating: 4.1 },
        { kind: 'boatyard', vendor: 'Bayside Marine Terminal (Oakland, CA)', location: 'Port of Oakland, CA, USA', days: 2, rating: 3.9 },
        { kind: 'ocean', vendor: 'Atlantic Crown Shipping', location: 'Port of Felixstowe, United Kingdom', days: 16, rating: 4.0 },
        { kind: 'port', vendor: 'Albion Port Services (Felixstowe)', location: 'Port of Felixstowe, United Kingdom', days: 1, rating: 4.3 },
        { kind: 'customs', vendor: 'Thames Gate Customs Ltd.', location: 'Felixstowe Customs, United Kingdom', days: 2, rating: 4.5 },
        { kind: 'delivery', vendor: 'Northgate Couriers', location: 'Customer site — London, United Kingdom', days: 1, rating: 4.6 },
      ],
    },
  ],
}

export interface CustomsUpdate {
  country: PlanCountry
  date: string
  kind: 'new' | 'change'
  title: string
  detail: string
}

export const CUSTOMS_UPDATES: CustomsUpdate[] = [
  {
    country: 'NL', date: '2026-12-01', kind: 'change',
    title: 'EU CBAM scope expanded to electronics housings',
    detail: 'Electronics with embedded aluminum housings now need an embedded-emissions declaration at import. Applies to ValeEdge E2 enclosures.',
  },
  {
    country: 'NL', date: '2026-11-14', kind: 'new',
    title: 'Rotterdam requests valuation worksheets up front',
    detail: 'When declared value uses a price list instead of the sales invoice, the valuation worksheet is now requested at filing — not on follow-up.',
  },
  {
    country: 'CA', date: '2026-10-20', kind: 'change',
    title: 'CARM release 3 changes importer billing',
    detail: 'Duties are billed through the importer’s CARM portal; broker security bonds no longer cover first-time importers.',
  },
  {
    country: 'UK', date: '2026-12-15', kind: 'new',
    title: 'UKCA marking grace period ends Jan 1',
    detail: 'CE-only markings are no longer accepted for security electronics — shipments need the UKCA declaration in the customs pack.',
  },
]

// ---------------------------------------------------------------------------
// Carrier add-in (two-profile) demo data — the Uber-style acceptance loop.

export const COMPANY_VENDOR = 'Cascade Freight Lines'

export interface Offer {
  id: string
  txId: string
  vendor: string
  kind: LegKind
  summary: string
  pickup: string
  payout: number
  status: 'offered' | 'accepted' | 'declined'
  from: string
  to: string
  special?: string[]
}

export const SEED_OFFERS: Offer[] = [
  {
    id: 'OFF-101', txId: 'TX-20490', vendor: 'Cascade Freight Lines', kind: 'truck',
    summary: 'Cross-border ground — Reno, NV → Toronto, ON', pickup: '2026-12-30', payout: 1450,
    status: 'offered', from: 'WH-RNO-2, Reno, NV, USA', to: 'Customer site — Toronto, Canada',
  },
  {
    id: 'OFF-097', txId: 'TX-20481', vendor: 'Cascade Freight Lines', kind: 'truck',
    summary: 'Drayage — Reno, NV → Harbor Point Boatyard, Oakland', pickup: '2026-12-17', payout: 980,
    status: 'accepted', from: 'WH-RNO-2, Reno, NV, USA', to: 'Harbor Point Boatyard, Oakland, CA, USA',
  },
]

export interface LabelScan {
  orderNo: string
  carrier: string
  txId: string
  serial: string
}

/** Scripted shipping-label scans for the company profile. */
export const LABEL_QUEUE: LabelScan[] = [
  { orderNo: 'ORD-88421', carrier: 'Cascade Freight Lines', txId: 'TX-20490', serial: 'PO-P4-3312' },
  { orderNo: 'ORD-88412', carrier: 'Pacific Meridian Lines', txId: 'TX-20481', serial: 'VE-E2-2205' },
]

/** Scripted shipping-label scans for the carrier profile: a pickup, then a vendor substitution. */
export const VENDOR_SCAN_QUEUE: { txId: string; orderNo: string; mode: 'pickup' | 'substitute' }[] = [
  { txId: 'TX-20490', orderNo: 'ORD-88421', mode: 'pickup' },
  { txId: 'RMA-1043', orderNo: 'ORD-88377', mode: 'substitute' },
]

/**
 * Agent coordination policy — auto-confirm tolerances for reroutes.
 * Within ALL limits: the upstream agent re-verifies delivery timing and confirms
 * automatically. Beyond ANY limit: the sender must approve.
 */
export const AGENT_POLICY = {
  pctLimit: 10, // ±10% cost change
  usdLimit: 200, // or $200 absolute
  daysLimit: 2, // or 2-day delivery date change
}

export interface Approval {
  id: string
  txId: string
  legId: string
  title: string
  detail: string
  altVendor: string
  costDelta: number
  daysDelta: number
  breach: string
}

export const SEED_APPROVALS: Approval[] = [
  {
    id: 'APR-01',
    txId: 'TX-20499',
    legId: 'C9',
    title: 'Reroute exceeds tolerance — sender approval required',
    detail:
      'EuroChill truck #2 is unavailable Jan 7 (availability API). Upstream agent matched Alpine Cold Transit AG on the Basel–Geneva lane (vendor memory: avg $438/ton, reefer-certified). Delivery Jan 8 verified unchanged.',
    altVendor: 'Alpine Cold Transit AG',
    costDelta: 450,
    daysDelta: 0,
    breach: 'Cost Δ +$450 exceeds the $200 auto-confirm limit (±10% / $200 / 2 days)',
  },
]

export const PRODUCT_SERIAL_PREFIX: Record<string, string> = {
  'ValeEdge E2': 'VE-E2',
  'PerimeterOne P4': 'PO-P4',
  'SkyWatch S1 Dock': 'SW-S1',
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + n))
  return dt.toISOString().slice(0, 10)
}

export function legLabel(kind: LegKind): string {
  return LEG_KINDS.find((l) => l.key === kind)?.label ?? kind
}

export function activeLeg(s: Shipment): Leg | undefined {
  return s.legs.find((l) => l.status !== 'complete')
}

export function isDelivered(s: Shipment): boolean {
  const last = s.legs[s.legs.length - 1]
  if (!last || !s.legs.every((l) => l.status === 'complete')) return false
  return last.kind === 'delivery' || s.direction === 'rma'
}
