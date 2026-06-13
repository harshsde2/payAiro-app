import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STATE_COMPLIANCE } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';
import {
  getCachedComplianceStatus,
  setCachedComplianceStatus,
  setComplianceAckedVersion,
} from 'storage/mmkv';
import { COMPLIANCE_VERSIONS } from 'new-ui/constants/compliance';
import type { StateCode } from 'new-ui/constants/compliance';
import type {
  ComplianceStatus,
  CreateReceiptPayload,
  DisclosureAckResponse,
  DisclosureResponse,
  DisclosureStatus,
  MNLanguage,
  OneTimeDisclosureAckPayload,
  PreTransactionDisclosureContent,
  ReceiptFooterResponse,
  TradeType,
} from 'new-ui/types/compliance';

export const complianceKeys = {
  all: ['compliance'] as const,
  status: ['compliance', 'status'] as const,
  disclosure: (state: StateCode, lang?: string) =>
    ['compliance', 'disclosure', state, lang ?? 'en'] as const,
  disclosureStatus: (state: StateCode) => ['compliance', 'disclosure-status', state] as const,
  preTransaction: (state: StateCode, type: TradeType) =>
    ['compliance', 'pre-transaction', state, type] as const,
  receiptFooter: (state: StateCode) => ['compliance', 'receipt-footer', state] as const,
  receipt: (txnId: string) => ['compliance', 'receipt', txnId] as const,
  disclosureHistory: ['compliance', 'disclosure-history'] as const,
};

/**
 * App-launch driver: which state the user is in and which disclosures are required.
 * Last response is cached in MMKV so the launch gate works offline / without flicker.
 */
export function useComplianceStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.status,
    queryFn: async () => {
      const data = await userApiClient.get<ComplianceStatus>(STATE_COMPLIANCE.STATUS);
      setCachedComplianceStatus(data);
      return data;
    },
    placeholderData: () => getCachedComplianceStatus<ComplianceStatus>() ?? undefined,
    staleTime: 60_000,
    enabled,
  });
}

/** One-time disclosure content (CT; MN supports `lang`). Keeps previous content visible while a language switch refetches. */
export function useOneTimeDisclosure(stateCode: StateCode | null, lang?: MNLanguage) {
  return useQuery({
    queryKey: complianceKeys.disclosure(stateCode ?? 'CT', lang),
    queryFn: async () => {
      return userApiClient.get<DisclosureResponse>(
        STATE_COMPLIANCE.disclosure(stateCode!, lang)
      );
    },
    placeholderData: (previousData) => previousData,
    enabled: !!stateCode,
  });
}

/**
 * Acknowledge the one-time disclosure. Payload differs per state:
 * CT `{checkbox_1_checked, checkbox_2_checked}` · MN `{checkbox_1_checked, language}`.
 * On success the status query is invalidated and the local ack cache updated, so the
 * launch gate drops immediately.
 */
export function useAcknowledgeOneTimeDisclosure(stateCode: StateCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: OneTimeDisclosureAckPayload) => {
      return userApiClient.post<DisclosureAckResponse>(
        STATE_COMPLIANCE.disclosureAcknowledge(stateCode),
        payload
      );
    },
    onSuccess: () => {
      setComplianceAckedVersion(stateCode, COMPLIANCE_VERSIONS[stateCode]);
      const cached = getCachedComplianceStatus<ComplianceStatus>();
      if (cached) {
        setCachedComplianceStatus({ ...cached, onetimeDisclosureAcknowledged: true });
      }
      queryClient.invalidateQueries({ queryKey: complianceKeys.all });
    },
  });
}

/** Server-side one-time disclosure ack status (audit / edge cases). */
export function useDisclosureStatusQuery(stateCode: StateCode | null) {
  return useQuery({
    queryKey: complianceKeys.disclosureStatus(stateCode ?? 'CT'),
    queryFn: async () => {
      return userApiClient.get<DisclosureStatus>(
        STATE_COMPLIANCE.disclosureStatus(stateCode!)
      );
    },
    enabled: !!stateCode,
  });
}

/** Pre-transaction disclosure content (CT only). */
export function usePreTransactionDisclosure(
  stateCode: StateCode | null,
  tradeType: TradeType,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: complianceKeys.preTransaction(stateCode ?? 'CT', tradeType),
    queryFn: async () => {
      return userApiClient.get<PreTransactionDisclosureContent>(
        STATE_COMPLIANCE.preTransaction(stateCode!, tradeType)
      );
    },
    enabled: enabled && !!stateCode,
  });
}

/** State regulatory receipt footer. Rarely changes — cache aggressively; callers fall back to COMPLIANCE_CONFIG on error. */
export function useReceiptFooter(stateCode: StateCode | null) {
  return useQuery({
    queryKey: complianceKeys.receiptFooter(stateCode ?? 'CT'),
    queryFn: async () => {
      return userApiClient.get<ReceiptFooterResponse>(
        STATE_COMPLIANCE.receiptFooter(stateCode!)
      );
    },
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!stateCode,
  });
}

/** Create a compliance receipt after a debit buy/sell transaction. */
export function useCreateReceipt() {
  return useMutation({
    mutationFn: async (payload: CreateReceiptPayload) => {
      return userApiClient.post(STATE_COMPLIANCE.RECEIPTS_CREATE, payload);
    },
  });
}

/** Fetch a compliance receipt by transaction id. */
export function useReceiptByTxn(txnId: string | null) {
  return useQuery({
    queryKey: complianceKeys.receipt(txnId ?? ''),
    queryFn: async () => {
      return userApiClient.get(STATE_COMPLIANCE.receiptByTxn(txnId!));
    },
    enabled: !!txnId,
  });
}

/** Full acknowledgment audit trail for the current user. */
export function useDisclosureHistory() {
  return useQuery({
    queryKey: complianceKeys.disclosureHistory,
    queryFn: async () => {
      return userApiClient.get(STATE_COMPLIANCE.DISCLOSURE_HISTORY);
    },
  });
}
