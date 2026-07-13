import Clipboard from '@react-native-clipboard/clipboard';
import { Platform } from 'react-native';
import Config from 'react-native-config';
import { CoinmeVaultError } from '@coinme-security/vault-sdk-react-native';
import { PayAiroCoinmeRisk } from 'utils/PayAiroCoinmeRisk';
import { resolveCardlinkingPhase } from 'services/coinmeRiskLifecycle';
import { EnvConfig } from 'config/env.config';

/**
 * TEMP-DEBUG: production add-card diagnostics.
 *
 * Captures the Risk-SDK state, webSessionId, CaaS token, device fingerprint and
 * the Coinme add-payment-method response (success body or error envelope) so a
 * tester on a production build can copy the whole attempt as JSON.
 *
 * Removal: set ADD_CARD_DEBUG_COPY_ENABLED to false (all call sites no-op), or
 * delete this file plus the lines marked `// TEMP-DEBUG` in AddDebitCardModal.tsx
 * and CardAddedSuccessModal.tsx.
 */
export const ADD_CARD_DEBUG_COPY_ENABLED = true;

type AddCardDebugOutcome = 'success' | 'failure';

export type AddCardDebugInput = {
  outcome: AddCardDebugOutcome;
  customerId?: string | null;
  providerId?: string;
  webSessionId?: string;
  caasToken?: string;
  deviceFingerprint?: string;
  /** Full vault response body on success, or the thrown error on failure. */
  addPaymentMethod: unknown;
};

let lastReport: Record<string, unknown> | null = null;

/** Serializes CoinmeVaultError / plain errors into JSON-safe shapes. */
const serializeError = (e: unknown): Record<string, unknown> => {
  if (e instanceof CoinmeVaultError) {
    return {
      errorType: 'CoinmeVaultError',
      kind: e.kind,
      status: e.status ?? null,
      message: e.message,
      errorResponse: e.errorResponse ?? null,
    };
  }
  if (e instanceof Error) {
    const anyErr = e as Error & { code?: unknown; response?: { status?: unknown; data?: unknown } };
    return {
      errorType: e.name,
      message: e.message,
      code: anyErr.code ?? null,
      responseStatus: anyErr.response?.status ?? null,
      responseData: anyErr.response?.data ?? null,
    };
  }
  return { errorType: 'unknown', value: String(e) };
};

/**
 * Builds and stores the report for the just-finished add-card attempt.
 * MUST never throw — it runs inside the add-card submit path and a debug-only
 * failure must not affect the real flow.
 */
export const setAddCardDebugReport = async (input: AddCardDebugInput): Promise<void> => {
  if (!ADD_CARD_DEBUG_COPY_ENABLED) return;

  try {
    let riskConfig: Record<string, unknown> | null = null;
    try {
      const cfg = await PayAiroCoinmeRisk.getConfig();
      riskConfig = {
        customerId: cfg?.customerId ?? null,
        sessionKey: cfg?.sessionKey ?? null,
        flow: cfg?.flow ?? null,
      };
    } catch (e) {
      riskConfig = { error: serializeError(e) };
    }

    lastReport = {
      timestamp: new Date().toISOString(),
      env: EnvConfig.ENV_NAME,
      platform: `${Platform.OS} ${Platform.Version}`,
      outcome: input.outcome,
      customerId: input.customerId ?? null,
      providerId: input.providerId ?? null,
      webSessionId: input.webSessionId ?? null,
      riskSdk: {
        ...riskConfig,
        mode: (Config.COINME_MODE || '').trim() || null,
        cardlinkingPhase: resolveCardlinkingPhase(),
      },
      caasToken: input.caasToken ?? null,
      deviceFingerprint: input.deviceFingerprint ?? null,
      addPaymentMethod:
        input.outcome === 'failure'
          ? serializeError(input.addPaymentMethod)
          : input.addPaymentMethod ?? null,
    };
  } catch (e) {
    console.warn('[addCardDebugReport] failed to build report', e);
  }
};

export const getAddCardDebugReportJson = (): string => {
  if (!lastReport) return '';
  try {
    return JSON.stringify(lastReport, null, 2);
  } catch {
    // Circular / non-serializable values: fall back to a shallow stringify.
    return JSON.stringify(
      Object.fromEntries(Object.entries(lastReport).map(([k, v]) => [k, String(v)])),
      null,
      2
    );
  }
};

/** Copies the last report to the clipboard. Returns false when there is nothing to copy. */
export const copyAddCardDebugReport = (): boolean => {
  const json = getAddCardDebugReportJson();
  if (!json) return false;
  Clipboard.setString(json);
  return true;
};
