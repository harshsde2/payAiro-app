import type { StateCode } from '../constants/compliance';

// Shapes match the real backend ("PayAiro State Compliance API" Postman collection).

export type TradeType = 'buy' | 'sell';
export type MNLanguage = 'en' | 'es' | 'so' | 'hmn' | 'vi' | 'zh';
export type ReceiptStatus = 'completed' | 'pending' | 'failed';

/** GET state-compliance/status/ */
export interface ComplianceStatus {
  stateCode: StateCode | string | null;
  requiresCompliance: boolean;
  requiresOnetimeDisclosure: boolean;
  onetimeDisclosureAcknowledged: boolean;
  requiresPreTransactionDisclosure: boolean;
}

/** GET state-compliance/CT/disclosure/ → `disclosure` */
export interface CTDisclosureContent {
  header: string;
  body: string;
  bullet_points: string[];
}

/** GET state-compliance/MN/disclosure/?lang= → `disclosure` (shape confirmed against staging 2026-06-10) */
export interface MNDisclosureContent {
  title: string;
  subtitle: string;
  effective_date: string;
  version: string;
  formatting: {
    title_style: string;
    title_font_size_pt: number;
    body_font_size_pt: number;
    section_spacing: string;
  };
  categories: { title: string; body: string }[];
  acknowledgment: {
    checkbox_label: string;
    supplemental_note: string;
  };
}

export interface DisclosureResponse<C = CTDisclosureContent | MNDisclosureContent> {
  stateCode: StateCode;
  alreadyAcknowledged: boolean;
  /** e.g. "1.0:registry-100001" (observed on staging) */
  currentDisclosureVersion?: string;
  disclosure: C;
}

/** POST state-compliance/{state}/disclosure/acknowledge/ */
export interface CTDisclosureAckPayload {
  checkbox_1_checked: boolean;
  checkbox_2_checked: boolean;
}
export interface MNDisclosureAckPayload {
  checkbox_1_checked: boolean;
  language: MNLanguage;
}
export type OneTimeDisclosureAckPayload = CTDisclosureAckPayload | MNDisclosureAckPayload;

export interface DisclosureAckResponse {
  success: boolean;
  stateCode: StateCode;
  acknowledgedAt: string;
  acknowledgmentId: number;
}

/** GET state-compliance/{state}/disclosure/status/ */
export interface DisclosureStatus {
  stateCode: StateCode;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  disclosureVersion: string;
  language: string;
}

/**
 * GET state-compliance/{state}/pre-transaction/{buy|sell}/ → content shape.
 * No saved example in the Postman collection — fields are a best guess from the
 * PDF screen spec; pin against a real staging response (task 0.3 note).
 */
export interface PreTransactionDisclosureContent {
  stateCode?: StateCode;
  header?: string;
  body?: string;
  disclaimer?: string;
  acknowledgment_text?: string;
  [key: string]: unknown;
}

/**
 * POST state-compliance/{state}/pre-transaction/acknowledge/
 * Backend expects the fee + amount as strings (per the documented curl).
 */
export interface PreTxAckPayload {
  transaction_type: TradeType;
  acknowledged: boolean;
  fee_amount_shown: string;
  purchase_amount_shown: string;
}

/**
 * GET state-compliance/{state}/receipt-footer/ — no saved Postman example;
 * verify shape on staging and tighten.
 */
export interface ReceiptFooterResponse {
  stateCode?: StateCode;
  footer?: string;
  footer_text?: string;
  [key: string]: unknown;
}

/** POST state-compliance/receipts/create/ */
export interface CreateReceiptPayload {
  state_code: StateCode;
  transaction_type: TradeType;
  transaction_status: ReceiptStatus;
  transaction_id: string;
  network_auth_code: string;
  payment_method: string;
  customer_name: string;
  amount: number;
  transaction_fees: number;
  card_processing_fee: number;
  instant_withdrawal_fee: number;
  total: number;
  crypto_asset: string;
  crypto_price: number;
  amount_exchanged: string;
  /** ISO-8601, e.g. "2026-06-09T10:36:00Z" */
  transaction_date: string;
}

// ─── GET state-compliance/me/combined-disclosure-history/ ─────────────────────
// Array (newest first) of acknowledged disclosures — both the one-time state
// disclosure and each per-transaction pre-transaction disclosure, with audit detail.

export interface DisclosureHistoryContent {
  title?: string;
  body?: string;
  displayValues?: Record<string, string>;
}

interface DisclosureHistoryBase {
  action: string;
  state_code: StateCode | string;
  acknowledged_at: string;
  disclosure_version: string;
  disclosure_content?: DisclosureHistoryContent;
}

export interface PreTransactionHistoryItem extends DisclosureHistoryBase {
  type: 'pre_transaction_disclosure';
  details: {
    id: number;
    transaction_type: TradeType;
    fee_amount_shown: string;
    purchase_amount_shown: string;
    disclosure_version: string;
    acknowledged_at: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    [key: string]: unknown;
  };
}

export interface OneTimeHistoryItem extends DisclosureHistoryBase {
  type: 'one_time_disclosure';
  details: {
    id: number;
    language?: string;
    checkbox_1_checked?: boolean;
    checkbox_2_checked?: boolean;
    disclosure_version: string;
    acknowledged_at: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    [key: string]: unknown;
  };
}

export type CombinedDisclosureHistoryItem = PreTransactionHistoryItem | OneTimeHistoryItem;
