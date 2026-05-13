import { Platform } from "react-native";
import Config from "react-native-config";
import {
  CoinmeRiskError,
  CoinmeRiskErrorCode,
  PayAiroCoinmeRisk,
  type CoinmeFlowType,
  type SessionTagData,
} from "utils/PayAiroCoinmeRisk";
import { getDeviceFingerprint } from "utils/getDeviceFingerprint";

/**
 * PayAiro × Coinme Risk SDK lifecycle service (iOS + Android).
 *
 * Owns every call into `PayAiroCoinmeRisk` that belongs to the app lifecycle
 * (boot, login, logout) and to the trade pipeline (`fetchWebSessionId`).
 *
 * Platform posture:
 *  - Both iOS and Android (SDK 1.1.0+) use
 *    `getPartnerSessionTag(partnerId, accountId, fingerprint)` — the SDK
 *    hits Coinme's public partner endpoint directly. No backend proxy
 *    required; base URL resolves from the configured mode (Test → staging,
 *    Prod → production).
 *
 * Everything here is:
 *  - Safe no-op on unsupported platforms (the native module is guarded).
 *  - Idempotent where it makes sense (`bootstrapCoinmeRisk`).
 *  - Silent on non-fatal errors; callers get a thrown `CoinmeRiskError` only
 *    from `fetchWebSessionId`, because that one is required to build a trade
 *    payload and its failure must surface to the user.
 */

const TAG = "[CoinmeRiskLifecycle]";

let didBootstrap = false;
let bootstrapPromise: Promise<void> | null = null;
let lastKnownCustomerId: string | null = null;
/** Last `riskFlow` applied via `update`; used to reset session when flow changes. */
let lastSessionRiskFlow: CoinmeFlowType | null = null;

const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";
const isSupportedPlatform = isIOS || isAndroid;
const READINESS_MAX_RETRIES = 5;
const READINESS_RETRY_MS = 50;

/**
 * Resolve the Coinme SDK environment.
 *
 * Priority:
 *   1. `Config.COINME_MODE` from `.env` (`"test"` or `"prod"`) — explicit wins.
 *   2. Fall back to `__DEV__` (debug builds → test, release → prod).
 *
 * IMPORTANT: this MUST match the environment that FastAPI calls Coinme against
 * (`CAAS_API_BASE_URL`). A session minted in `test` does not exist in `prod`
 * and vice versa, which surfaces as
 *   "provided WebSessionId does not match with the saved one (203-404-359-227)".
 */
function resolveCoinmeMode(): "test" | "prod" {
  const raw = (Config.COINME_MODE || "").trim().toLowerCase();
  if (raw === "test" || raw === "prod") return raw;
  return __DEV__ ? "test" : "prod";
}

/**
 * Setup must run before any other SDK call. Safe to invoke at app boot.
 * Reads client / partner ids from `.env` (`Config.COINME_CLIENT_ID`, etc.).
 */
export async function bootstrapCoinmeRisk(): Promise<void> {
  if (!isSupportedPlatform) return;
  if (didBootstrap) return;
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      if (!PayAiroCoinmeRisk.isModuleAvailable()) {
        console.warn(`${TAG} native module unavailable; skipping bootstrap`);
        return;
      }

      const clientId = Config.COINME_CLIENT_ID?.trim();
      const partnerId = Config.COINME_PARTNER_ID?.trim();

      if (!clientId) {
        console.warn(`${TAG} COINME_CLIENT_ID missing in .env; skipping bootstrap`);
        return;
      }

      const mode = resolveCoinmeMode();
      try {
        await PayAiroCoinmeRisk.setup({
          mode,
          clientId,
          partnerId: partnerId || undefined,
          flow: "onboarding",
          region: "default",
          enableBehaviourBiometrics: true,
          enableFieldTracking: true,
          enableClipboardTracking: false,
          // iOS-only; Android bridge ignores this field. Leave false unless
          // the iOS entitlements include iCloud containers — the iOS SDK
          // crashes at runtime if true without the capability.
          setCloudEntitlements: false,
        });
        didBootstrap = true;
        console.log(`${TAG} setup ok (mode=${mode}, platform=${Platform.OS})`);
      } catch (e) {
        didBootstrap = false;
        if (e instanceof CoinmeRiskError) {
          console.warn(`${TAG} setup failed [${e.code}] ${e.message}`);
        } else {
          console.warn(`${TAG} setup failed`, e);
        }
      }
    })();
  }

  try {
    await bootstrapPromise;
  } finally {
    bootstrapPromise = null;
  }
}

async function ensureCoinmeRiskReady(): Promise<void> {
  if (!isSupportedPlatform) return;
  if (!PayAiroCoinmeRisk.isModuleAvailable()) return;

  await bootstrapCoinmeRisk();

  for (let attempt = 0; attempt < READINESS_MAX_RETRIES; attempt += 1) {
    const ready = await PayAiroCoinmeRisk.isInitialized();
    if (ready) return;
    if (attempt < READINESS_MAX_RETRIES - 1) {
      await sleep(READINESS_RETRY_MS);
    }
  }

  throw new CoinmeRiskError(
    CoinmeRiskErrorCode.NOT_INITIALIZED,
    "Risk engine is still initializing. Please retry."
  );
}

/**
 * Attach the signed-in user to the running risk engine. Should be called
 * whenever the app transitions from "logged out" to "logged in" (app boot
 * with a valid token, or after an OTP-verify login/signup).
 *
 * IMPORTANT: `coinmeAccountId` MUST be the Coinme/CAAS customer id
 * (`usersMe.caas_onboarding.caas_customer_id`), NOT the host-app's user PK.
 * Coinme pins the partner-session tag and all subsequent risk/transactional
 * data to this id; using the wrong one yields:
 *   "provided WebSessionId does not match with the saved one (code: 203-404-…)"
 * from the partner endpoints.
 */
export async function onUserLoggedIn(coinmeAccountId: string | undefined | null): Promise<void> {
  if (!isSupportedPlatform) return;
  if (!PayAiroCoinmeRisk.isModuleAvailable()) return;

  const id = typeof coinmeAccountId === "string" ? coinmeAccountId.trim() : "";
  if (!id) {
    console.warn(`${TAG} onUserLoggedIn called without a Coinme caas_customer_id; skipping`);
    return;
  }

  await ensureCoinmeRiskReady();

  if (lastKnownCustomerId === id) return;

  try {
    await PayAiroCoinmeRisk.update({ customerId: id });
    lastKnownCustomerId = id;
    console.log(`${TAG} update ok (customerId=${id.slice(0, 8)}…)`);
  } catch (e) {
    if (e instanceof CoinmeRiskError) {
      console.warn(`${TAG} update failed [${e.code}] ${e.message}`);
    } else {
      console.warn(`${TAG} update failed`, e);
    }
  }
}

/**
 * Clear the SDK's per-user state. Call on logout, before MMKV is wiped.
 */
export async function onUserLoggedOut(): Promise<void> {
  if (!isSupportedPlatform) return;
  if (!PayAiroCoinmeRisk.isModuleAvailable()) return;

  try {
    await PayAiroCoinmeRisk.resetStoredSessionKey();
  } catch {
    // best-effort; do not block logout
  }

  try {
    await PayAiroCoinmeRisk.reset();
    console.log(`${TAG} reset ok`);
  } catch (e) {
    if (e instanceof CoinmeRiskError) {
      console.warn(`${TAG} reset failed [${e.code}] ${e.message}`);
    } else {
      console.warn(`${TAG} reset failed`, e);
    }
  } finally {
    didBootstrap = false;
    bootstrapPromise = null;
    lastKnownCustomerId = null;
    lastSessionRiskFlow = null;
  }
}

export interface FetchWebSessionIdOptions {
  /** Coinme partner id (falls back to `Config.COINME_PARTNER_ID`). */
  partnerId?: string;
  /**
   * Coinme/CAAS customer id for this user
   * (`usersMe.caas_onboarding.caas_customer_id`). NOT the host-app user PK.
   * The returned `webSessionId` is server-pinned to this id; downstream
   * partner calls (payment-method create, trade execute, …) will reject the
   * session if the customer they resolve doesn't match it.
   */
  accountId: string;
  /** Optional override; when omitted, a stable device id is used. */
  fingerprint?: string;
  /** Optional ramp id passed through to the Coinme API. */
  rampId?: string;
  /** Request timeout in ms (default 10000). */
  timeoutMs?: number;
  /**
   * Coinme risk `flow` for this session. Use `cardlinking` when adding a card,
   * `cardtransaction` for buy/sell. Omit only for legacy callers; bootstrap
   * defaults to `onboarding`, which does not match partner payment-method APIs.
   */
  riskFlow?: CoinmeFlowType;
}

/**
 * Wrap the SDK's session-tag call and return only the `webSessionID` string.
 * Throws `CoinmeRiskError` on failure — callers should show the message in
 * their result screen.
 *
 * Uses `getPartnerSessionTag(partnerId, accountId, fingerprint)` on both
 * platforms — iOS native + Android 1.1.0+. The SDK talks to Coinme's public
 * partner endpoint directly; no PayAiro backend proxy is required.
 *
 * Ordering (aligned with Coinme SDK):
 *  1. Setup + initialized engine (`ensureCoinmeRiskReady`).
 *  2. Clear stored session key when `accountId` or `riskFlow` changes so the SDK
 *     does not reuse another customer or the wrong flow (203-404-359-227).
 *  3. `update({ customerId, flow: riskFlow })` — CAAS id + Coinme flow
 *     (`cardlinking` vs `cardtransaction`) must match the partner call.
 *  4. `getPartnerSessionTag` — returned `webSessionID` becomes the active key.
 *  5. `submit()` — push risk payload for that session.
 */
export async function fetchWebSessionId(
  options: FetchWebSessionIdOptions
): Promise<string> {
  if (!isSupportedPlatform) {
    throw new CoinmeRiskError(
      CoinmeRiskErrorCode.UNSUPPORTED_PLATFORM,
      "PayAiroCoinmeRisk is only supported on iOS and Android."
    );
  }

  await ensureCoinmeRiskReady();
  const accountId = options.accountId?.trim();
  if (!accountId) {
    throw new CoinmeRiskError(
      CoinmeRiskErrorCode.INVALID_OPTIONS,
      "fetchWebSessionId requires a non-empty accountId."
    );
  }

  const fingerprint =
    options.fingerprint?.trim() || (await getDeviceFingerprint());

  const partnerId = (options.partnerId || Config.COINME_PARTNER_ID || "").trim();
  if (!partnerId) {
    throw new CoinmeRiskError(
      CoinmeRiskErrorCode.INVALID_OPTIONS,
      "Missing Coinme partnerId (set COINME_PARTNER_ID in .env)."
    );
  }

  const riskFlow = options.riskFlow;
  const customerChanged = lastKnownCustomerId !== accountId;
  const flowChanged =
    riskFlow != null && lastSessionRiskFlow !== riskFlow;

  if (customerChanged || flowChanged) {
    try {
      await PayAiroCoinmeRisk.resetStoredSessionKey();
    } catch {
      /* ignore */
    }
  }

  try {
    await PayAiroCoinmeRisk.update({
      customerId: accountId,
      ...(riskFlow ? { flow: riskFlow } : {}),
    });
    lastKnownCustomerId = accountId;
    if (riskFlow) {
      lastSessionRiskFlow = riskFlow;
    } else if (customerChanged) {
      lastSessionRiskFlow = null;
    }
  } catch (e) {
    const err = e as Error & { code?: string; message?: string };
    console.warn(
      `${TAG} update(customerId/flow) FAILED code=${err?.code ?? "?"} ` +
        `message=${err?.message ?? "<no message>"}`
    );
    throw e;
  }

  console.log(
    `${TAG} fetchWebSessionId[${Platform.OS}] mode=${resolveCoinmeMode()} ` +
      `partnerId=${partnerId} accountId=${accountId} ` +
      `fingerprint=${fingerprint} riskFlow=${riskFlow ?? "<default>"}`
  );
  console.log("Partner ID: ", partnerId);
  console.log("Account ID: ", accountId);
  console.log("Fingerprint: ", fingerprint);
  console.log("Risk Flow: ", riskFlow);
  console.log("Ramp ID: ", options.rampId);
  console.log("Timeout: ", options.timeoutMs);
  
  let data: SessionTagData;
  try {
    data = await PayAiroCoinmeRisk.getPartnerSessionTag({
      partnerId,
      accountId,
      fingerprint,
      rampId: options.rampId,
      timeout: options.timeoutMs ?? 10000,
    });
  } catch (e) {
    const err = e as Error & { code?: string; message?: string };
    console.warn(
      `${TAG} getPartnerSessionTag FAILED code=${err?.code ?? "?"} ` +
        `message=${err?.message ?? "<no message>"}`
    );
    throw e;
  }

  console.log(
    `${TAG} getPartnerSessionTag ok webSessionID=${prefix(data.webSessionID)} ` +
      `orgID=${prefix(data.orgID ?? "")}`
  );

  // Bind the freshly minted webSessionID into the engine as `sessionKey`.
  // Coinme's guidance: mint tag → update(sessionKey) → submit() → partner API.
  // Re-assert customerId + flow in the same update so native RiskEngineUpdateOptions
  // stays consistent (some stacks ignore sessionKey if customer/flow were stale).
  try {
    await PayAiroCoinmeRisk.update({
      customerId: accountId,
      ...(riskFlow ? { flow: riskFlow } : {}),
      sessionKey: data.webSessionID,
    });
  } catch (e) {
    const err = e as Error & { code?: string; message?: string };
    console.warn(
      `${TAG} update(sessionKey+customerId/flow) FAILED code=${err?.code ?? "?"} ` +
        `message=${err?.message ?? "<no message>"}`
    );
    throw e;
  }

  await PayAiroCoinmeRisk.submit();

  if (__DEV__) {
    await debugLogCoinmeRiskEngine("fetchWebSessionId:afterSubmit", {
      expectedWebSessionId: data.webSessionID,
      accountId,
      partnerId,
    });
  }

  return data.webSessionID;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Truncate a value for safe logging (first 8 chars + ellipsis). */
function prefix(value: string | null | undefined): string {
  if (!value) return "<empty>";
  return value.length <= 8 ? value : `${value.slice(0, 8)}…`;
}

export type CoinmeRiskDebugLogOptions = {
  /** Full string from `getPartnerSessionTag` — logs strict equality vs engine `sessionKey`. */
  expectedWebSessionId?: string;
  /** CAAS id passed into `fetchWebSessionId` / shown to Coinme as accountId. */
  accountId?: string;
  /** Partner id used for the tag call (defaults to env in logs). */
  partnerId?: string;
};

/**
 * Dev-only: reads `getConfig()` (maps to Coinme's getCoinmeRiskEngineConfig) and logs a safe snapshot.
 * Use after mint/submit and again right before (or after failure of) the payment-methods POST to prove
 * whether the engine still holds the same sessionKey as the payload — i.e. client vs server cause for 203-*.
 */
export async function debugLogCoinmeRiskEngine(
  context: string,
  options?: CoinmeRiskDebugLogOptions
): Promise<void> {
  if (!__DEV__) return;
  if (!PayAiroCoinmeRisk.isModuleAvailable()) {
    console.log(`${TAG} [debug] ${context}: native module unavailable`);
    return;
  }
  try {
    const cfg = await PayAiroCoinmeRisk.getConfig();
    const exp = options?.expectedWebSessionId?.trim() ?? "";
    const sk = (cfg?.sessionKey ?? "").trim();
    const keysMatch = exp.length > 0 && sk.length > 0 ? exp === sk : undefined;

    const pid =
      (options?.partnerId || Config.COINME_PARTNER_ID || "").trim() || "<empty>";

    console.log(
      `${TAG} [debug] ${context}\n` +
        `  coinmeMode=${resolveCoinmeMode()} partnerId=${prefix(pid)}\n` +
        `  accountId(input)=${prefix(options?.accountId ?? null)} customerId(engine)=${prefix(cfg?.customerId ?? null)}\n` +
        `  sessionKey(engine)=${prefix(sk)} flow=${cfg?.flow ?? "<empty>"}\n` +
        (keysMatch !== undefined
          ? `  sessionKey===expectedWebSessionId: ${String(keysMatch)}`
          : "  sessionKey===expectedWebSessionId: (pass expectedWebSessionId to compare)")
    );
  } catch (e) {
    console.warn(`${TAG} [debug] ${context} getConfig failed`, e);
  }
}
