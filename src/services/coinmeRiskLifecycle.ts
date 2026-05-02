import { Platform } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import {
  CoinmeRiskError,
  CoinmeRiskErrorCode,
  PayAiroCoinmeRisk,
  type SessionTagData,
} from "utils/PayAiroCoinmeRisk";

/**
 * PayAiro × Coinme Risk SDK lifecycle service.
 *
 * Owns every call into `PayAiroCoinmeRisk` that belongs to the app lifecycle
 * (boot, login, logout) and to the trade pipeline (`fetchWebSessionId`).
 *
 * Everything here is:
 *  - iOS-only (no-op / rejected on Android — the native module only exists there).
 *  - Idempotent where it makes sense (`bootstrapCoinmeRisk`).
 *  - Silent on non-fatal errors; callers get a thrown `CoinmeRiskError` only
 *    from `fetchWebSessionId`, because that one is required to build a trade
 *    payload and its failure must surface to the user.
 */

const TAG = "[CoinmeRiskLifecycle]";

// Module-level guard: React 18 Strict Mode double-invokes effects in dev, and
// App.js boot logic can also run more than once if the app re-mounts. We only
// ever want `setup()` to hit the SDK once per JS runtime.
let didBootstrap = false;
let bootstrapPromise: Promise<void> | null = null;
let lastKnownCustomerId: string | null = null;

const isIOS = Platform.OS === "ios";
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
  if (!isIOS) return;
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
          // Leave false unless the app entitlements include iCloud containers;
          // the SDK crashes at runtime if true without the capability.
          setCloudEntitlements: false,
        });
        didBootstrap = true;
        console.log(`${TAG} setup ok (mode=${mode})`);
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
  if (!isIOS) return;
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
  if (!isIOS) return;
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
  if (!isIOS) return;
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
}

/**
 * Wrap `getPartnerSessionTag` and return only the `webSessionID` string.
 * Throws `CoinmeRiskError` on failure — callers should show the message in
 * their result screen.
 *
 * Defensive ordering:
 *  1. Make sure setup is complete and the engine is initialized.
 *  2. `resetStoredSessionKey()` so any session key cached during this app
 *     process (possibly bound to a previous identity) is cleared. The Coinme
 *     docs are explicit that `getPartnerSessionTag` returns a tag that
 *     "automatically becomes the active session key", so reusing a prior tag
 *     would otherwise leak across users on the same device.
 *  3. `update({ customerId: accountId })` so the engine's local config and
 *     the `accountId` parameter agree. Mismatches here are how we got the
 *     "WebSessionId does not match" bug previously.
 *  4. `getPartnerSessionTag(accountId, partnerId, fingerprint)`.
 */
export async function fetchWebSessionId(
  options: FetchWebSessionIdOptions
): Promise<string> {
  if (!isIOS) {
    throw new CoinmeRiskError(
      CoinmeRiskErrorCode.UNSUPPORTED_PLATFORM,
      "PayAiroCoinmeRisk is iOS-only."
    );
  }

  await ensureCoinmeRiskReady();

  const partnerId = (options.partnerId || Config.COINME_PARTNER_ID || "").trim();
  if (!partnerId) {
    throw new CoinmeRiskError(
      CoinmeRiskErrorCode.INVALID_OPTIONS,
      "Missing Coinme partnerId (set COINME_PARTNER_ID in .env)."
    );
  }

  const accountId = options.accountId?.trim();
  if (!accountId) {
    throw new CoinmeRiskError(
      CoinmeRiskErrorCode.INVALID_OPTIONS,
      "fetchWebSessionId requires a non-empty accountId."
    );
  }

  const fingerprint =
    options.fingerprint?.trim() || (await getDeviceFingerprint());

  // Belt-and-suspenders against any cached session key from a prior identity.
  // Failures here are non-fatal — we only care that the next call mints a
  // fresh tag bound to `accountId` on the Coinme backend.
  try {
    await PayAiroCoinmeRisk.resetStoredSessionKey();
  } catch {
    /* ignore */
  }
  try {
    await PayAiroCoinmeRisk.update({ customerId: accountId });
    lastKnownCustomerId = accountId;
  } catch {
    /* ignore */
  }

  console.log(
    `${TAG} fetchWebSessionId mode=${resolveCoinmeMode()} ` +
      `partnerId=${prefix(partnerId)} accountId=${prefix(accountId)} ` +
      `fingerprint=${prefix(fingerprint)}`
  );

  const data: SessionTagData = await PayAiroCoinmeRisk.getPartnerSessionTag({
    partnerId,
    accountId,
    fingerprint,
    rampId: options.rampId,
    timeout: options.timeoutMs ?? 10000,
  });

  console.log(
    `${TAG} getPartnerSessionTag ok webSessionID=${prefix(data.webSessionID)} ` +
      `orgID=${prefix(data.orgID ?? "")}`
  );

  return data.webSessionID;
}

/**
 * Stable device fingerprint used as the `fingerprint` argument to the
 * partner-session-tag call. Uses `react-native-device-info.getUniqueId()`
 * which is per-install on iOS and survives logout/login.
 */
async function getDeviceFingerprint(): Promise<string> {
  try {
    const id = await DeviceInfo.getUniqueId();
    if (id && typeof id === "string") return id;
  } catch {
    // fall through to the cheap fallback
  }
  return `dev-${Platform.OS}-${Date.now().toString(36)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Truncate a value for safe logging (first 8 chars + ellipsis). */
function prefix(value: string | null | undefined): string {
  if (!value) return "<empty>";
  return value.length <= 8 ? value : `${value.slice(0, 8)}…`;
}
