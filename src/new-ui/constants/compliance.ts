export type StateCode = 'CT' | 'MN' | 'CA';

export const COMPLIANCE_VERSIONS = {
  CT: '1.0',
  MN: '1.0',
  CA: '1.0',
} as const;

/**
 * OFFLINE FALLBACK ONLY.
 *
 * The backend is the source of truth for all of this:
 * - which disclosures a user needs → GET state-compliance/status/
 * - disclosure content              → GET state-compliance/{state}/disclosure/
 * - receipt footer text             → GET state-compliance/{state}/receipt-footer/
 *
 * These constants are used only when the corresponding API call fails (receipts
 * are regulatory, so a receipt must never render without a footer).
 */
export interface StateComplianceConfig {
  stateCode: StateCode;
  hasOneTimeDisclosure: boolean;
  hasPreTransactionDisclosure: boolean;
  /** Compliance receipt rollout switch — flip per state as its phase ships (CT → MN → CA). */
  receiptEnabled: boolean;
  disclosureVersion: string;
  receiptFooterText: string;
}

const COMMON_FOOTER_DISCLAIMERS =
  '*Includes the difference between the current market price and sale price\n' +
  '**Transaction completed by Coinme on the Coinme Exchange\n' +
  'Coinme is not liable for non-delivery or delayed delivery of a transaction.\n' +
  "Transactions are final and non-refundable, including all fees. Subject to Coinme's Terms of Service and applicable law.";

const COINME_ADDRESS_BLOCK =
  'Coinme Inc.\n' +
  '255 S. King Street Suite 800, Seattle WA 98104\n' +
  '(NMLS ID 1185542)';

export const COMPLIANCE_CONFIG: Record<StateCode, StateComplianceConfig> = {
  CT: {
    stateCode: 'CT',
    hasOneTimeDisclosure: true,
    hasPreTransactionDisclosure: true,
    receiptEnabled: true,
    disclosureVersion: COMPLIANCE_VERSIONS.CT,
    receiptFooterText:
      COMMON_FOOTER_DISCLAIMERS +
      '\n\n' +
      'You may contact the Connecticut Department of Banking with questions or complaints at 860-240-8170 or 1-800-831-7225.\n\n' +
      COINME_ADDRESS_BLOCK +
      '\n888-459-9780',
  },
  MN: {
    stateCode: 'MN',
    hasOneTimeDisclosure: true,
    hasPreTransactionDisclosure: false,
    receiptEnabled: false, // flip in Phase 2 (task 2.2)
    disclosureVersion: COMPLIANCE_VERSIONS.MN,
    receiptFooterText: COMMON_FOOTER_DISCLAIMERS + '\n\n' + COINME_ADDRESS_BLOCK + '\n888-510-9723',
  },
  CA: {
    stateCode: 'CA',
    hasOneTimeDisclosure: false,
    hasPreTransactionDisclosure: false,
    receiptEnabled: false, // flip in Phase 3 (task 3.1)
    disclosureVersion: COMPLIANCE_VERSIONS.CA,
    receiptFooterText: COMMON_FOOTER_DISCLAIMERS + '\n\n' + COINME_ADDRESS_BLOCK + '\n888-510-9723',
  },
};
