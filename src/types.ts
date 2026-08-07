// Types for inventory_close_gaurd_seed.json — the app's single source of truth.
// Nullability verified against all records: dates and AI_Confidence are null for
// rule-cleared units; ID linkage fields use empty strings, never null.

export type RouteTier = 'RULES' | 'ECONOMY' | 'PREMIUM'
export type ModelTier = 'ECONOMY' | 'PREMIUM'

export interface Company {
  name: string
  type: string
  closeDate: string
  product: string
}

export interface Summary {
  inventoryRecords: number
  inventoryValue: number
  ruleClearedRecords: number
  ruleClearedValue: number
  economyAIReviews: number
  premiumInvestigations: number
  materialFindings: number
  potentialAdjustments: number
  draftJournalEntries: number
  baselineTokens: number
  tokenReduction: number
  baselineCost: number
  closeReadiness: number
  openActions: number
  inventoryCloseGaurdTokens: number
  inventoryCloseGaurdCost: number
}

export interface MaterialityPolicy {
  Policy: string
  Value: number
  Unit: string
  Notes: string
}

export interface InventoryRecord {
  Inventory_ID: string
  Record_Type: string
  Serial_Number: string
  SKU: string
  Product_Name: string
  Category: string
  Quantity: number
  Unit_Cost: number
  Carrying_Value: number
  ERP_Status: string
  Recorded_Location: string
  Physical_Location: string
  Ownership_Status: string
  PO_Number: string
  Vendor: string
  Customer_ID: string
  Customer_Name: string
  Shipment_Date: string | null
  Delivery_Date: string | null
  Installation_Date: string | null
  First_Online_Date: string | null
  Invoice_Date: string | null
  Last_Activity_Date: string
  Inventory_Age_Days: number
  RMA_Status: string
  Demo_Status: string
  Contract_Evidence: string
  Evidence_Conflict_Score: number
  Dollar_Materiality_Score: number
  Cutoff_Proximity_Score: number
  Ownership_Ambiguity_Score: number
  Aging_Risk_Score: number
  Risk_Score: number
  Accounting_Assertions: string
  Route_Tier: RouteTier
  AI_Confidence: number | null
  AI_Cost_USD: number
  Reviewer: string
  Review_Status: string
  Exception_ID: string
  Finding_Flag: boolean
  Proposed_Adjustment: number
  JE_ID: string
}

export interface ExceptionCase {
  Exception_ID: string
  Inventory_ID: string
  Serial_or_Batch: string
  Title: string
  Product: string
  Book_Value: number
  Risk_Score: number
  Accounting_Assertions: string
  AI_Confidence: number
  AI_Cost_USD: number
  ERP_Status: string
  Recorded_Location: string
  Physical_Location: string
  Contract_Evidence: string
  Finding_Flag: boolean
  Potential_Adjustment: number
  JE_ID: string
  Reviewer: string
  Status: string
  Summary: string
}

export interface EvidenceEvent {
  Evidence_ID: string
  Exception_ID: string
  Event_Date: string
  Event_Type: string
  Source_System: string
  Description: string
  Supports_Conclusion: string
  Conflict_Flag: boolean
}

export interface TokenLedgerRow {
  Run_ID: string
  Inventory_ID: string
  Exception_ID: string
  Task: string
  Model_Tier: ModelTier
  Input_Tokens: number
  Output_Tokens: number
  Total_Tokens: number
  Estimated_Cost_USD: number
  Financial_Exposure: number
  Risk_Score: number
  Escalated: boolean
  Outcome: string
}

export interface JournalEntry {
  JE_ID: string
  Exception_ID: string
  Description: string
  Debit_Account: string
  Debit_Amount: number
  Credit_Account: string
  Credit_Amount: number
  Status: string
  Auto_Post: boolean
}

export interface ClosePackageSection {
  Section: string
  Status: string
  Readiness_Pct: number
}

export interface SeedData {
  company: Company
  summary: Summary
  materialityPolicies: MaterialityPolicy[]
  inventory: InventoryRecord[]
  exceptions: ExceptionCase[]
  evidenceEvents: EvidenceEvent[]
  tokenLedger: TokenLedgerRow[]
  journalEntries: JournalEntry[]
  closePackage: ClosePackageSection[]
}
