import { NativeModules, Platform } from "react-native";

const { PayAiroCoinmeRisk: NativeModule } = NativeModules;

// ---------------------------------------------------------------------------
// Types (mirror the SDK surface on both iOS and Android; values are lowercase
// for JS ergonomics — each native bridge normalizes case before mapping to
// the platform-specific enum cases).
// ---------------------------------------------------------------------------

/** Points the SDK at a Coinme risk engine environment. */
export type CoinmeRiskMode = "test" | "prod";

/** High-level flow the user is currently in. */
export type CoinmeFlowType =
  | "onboarding"
  | "cardtransaction"
  | "cardlinking";

/** Region of service. `"default"` and `"us"` both mean the US region. */
export type CoinmeRegion =
  | "default"
  | "us"
  | "eu"
  | "ca"
  | "in"
  | "au";

/** Options for `setup()`. */
export interface CoinmeRiskSetupOptions {
  mode: CoinmeRiskMode;
  clientId: string;
  partnerId?: string;
  customerId?: string;
  sessionKey?: string;
  flow?: CoinmeFlowType;
  region?: CoinmeRegion;
  enableBehaviourBiometrics?: boolean;
  enableClipboardTracking?: boolean;
  enableFieldTracking?: boolean;
  /**
   * iOS-only. Requires CloudKit capability and a configured iCloud container
   * on the app target. Leave `false` unless entitlements include
   * `com.apple.developer.icloud-container-identifiers`, otherwise the iOS SDK
   * will crash at runtime. Ignored on Android.
   */
  setCloudEntitlements?: boolean;
}

/** Options for `update()`. Only customerId/sessionKey/flow are mutable. */
export interface CoinmeRiskUpdateOptions {
  customerId?: string;
  sessionKey?: string;
  flow?: CoinmeFlowType;
}

/**
 * Options for `getPartnerSessionTag()`. The SDK (iOS native, Android 1.1.0+)
 * talks to Coinme's public partner endpoint directly using partnerId /
 * accountId / fingerprint; no bearer token is needed — the base URL is
 * resolved from the SDK's `mode` (test → staging, prod → production).
 */
export interface GetPartnerSessionTagOptions {
  partnerId: string;
  accountId: string;
  fingerprint: string;
  rampId?: string;
  /** Request timeout in ms (default 10000). */
  timeout?: number;
  additionalHeaders?: Record<string, string>;
}

/**
 * Android-only legacy options for `getSessionTag()`. The pre-1.1.0 Android SDK
 * did not know the Coinme backend URL on its own — the caller had to provide
 * the full API base URL + bearer auth token. Prefer `getPartnerSessionTag`
 * on 1.1.0+.
 */
export interface GetSessionTagOptions {
  apiBaseUrl: string;
  authToken: string;
  fingerprint: string;
  /** Request timeout in ms (default 10000). */
  timeout?: number;
  additionalHeaders?: Record<string, string>;
}

/** Return value from `getPartnerSessionTag()` / `getSessionTag()`. */
export interface SessionTagData {
  webSessionID: string;
  orgID?: string | null;
}

/** Snapshot of the current mutable config (from `getConfig()`). */
export interface CoinmeRiskConfig {
  customerId?: string | null;
  sessionKey?: string | null;
  flow?: CoinmeFlowType | null;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export enum CoinmeRiskErrorCode {
  INVALID_OPTIONS        = "INVALID_OPTIONS",
  NOT_INITIALIZED        = "NOT_INITIALIZED",
  SETUP_FAILED           = "SETUP_FAILED",
  SUBMIT_FAILED          = "SUBMIT_FAILED",
  PARTNER_SESSION_FAILED = "PARTNER_SESSION_FAILED",
  UNKNOWN_ERROR          = "UNKNOWN_ERROR",
  MODULE_NOT_AVAILABLE   = "MODULE_NOT_AVAILABLE",
  UNSUPPORTED_PLATFORM   = "UNSUPPORTED_PLATFORM",
  UNSUPPORTED_OPERATION  = "UNSUPPORTED_OPERATION",
}

export class CoinmeRiskError extends Error {
  public readonly code: CoinmeRiskErrorCode;

  constructor(code: CoinmeRiskErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "CoinmeRiskError";
    // `Error.message` / `Error.name` are non-enumerable by default, so
    // `JSON.stringify(err)` strips them. Re-declare them as enumerable so
    // callers that log via `JSON.stringify` still see the real reason.
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(this, "name", {
      value: "CoinmeRiskError",
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }

  toJSON(): { name: string; code: CoinmeRiskErrorCode; message: string } {
    return { name: this.name, code: this.code, message: this.message };
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/**
 * PayAiro × Coinme Risk SDK (iOS + Android).
 *
 * Thin, typed wrapper over the native `PayAiroCoinmeRisk` module. All methods
 * are Promise-based. Web / unsupported platforms reject with
 * `UNSUPPORTED_PLATFORM`.
 *
 * Session-tag retrieval differs per platform (see `getPartnerSessionTag` vs
 * `getSessionTag`); prefer the `fetchWebSessionId` helper in
 * `services/coinmeRiskLifecycle` which picks the right one automatically.
 *
 * Typical lifecycle:
 * ```ts
 * import { PayAiroCoinmeRisk } from 'utils/PayAiroCoinmeRisk';
 *
 * await PayAiroCoinmeRisk.setup({
 *   mode: 'test',
 *   clientId: Config.COINME_CLIENT_ID,
 *   partnerId: Config.COINME_PARTNER_ID,
 * });
 *
 * // Before any transaction API call:
 * await PayAiroCoinmeRisk.submit();
 * ```
 */
class PayAiroCoinmeRiskClass {
  private readonly isIOS: boolean;
  private readonly isAndroid: boolean;
  private readonly hasNativeModule: boolean;

  constructor() {
    this.isIOS = Platform.OS === "ios";
    this.isAndroid = Platform.OS === "android";
    this.hasNativeModule = NativeModule != null;

    if ((this.isIOS || this.isAndroid) && !this.hasNativeModule) {
      const hint = this.isAndroid
        ? "Ensure the Coinme maven repo resolved and the app was rebuilt (Metro cache cleared if necessary)."
        : "Ensure `pod install` ran cleanly and the app was rebuilt.";
      console.warn(`[PayAiroCoinmeRisk] Native module not available. ${hint}`);
    }
  }

  /** True on iOS/Android when the native module resolved. */
  isModuleAvailable(): boolean {
    return (this.isIOS || this.isAndroid) && this.hasNativeModule;
  }

  /** True only on iOS with the module loaded. */
  isIOSSupported(): boolean {
    return this.isIOS && this.hasNativeModule;
  }

  /** True only on Android with the module loaded. */
  isAndroidSupported(): boolean {
    return this.isAndroid && this.hasNativeModule;
  }

  // ---------------- Lifecycle ----------------

  /** Initializes the Coinme risk engine. Call once at app boot. */
  async setup(options: CoinmeRiskSetupOptions): Promise<void> {
    this.assertAvailable();
    this.assertSetupOptions(options);
    return this.invoke("setup", options);
  }

  /** Updates customerId / sessionKey / flow on the running engine. */
  async update(options: CoinmeRiskUpdateOptions): Promise<void> {
    this.assertAvailable();
    return this.invoke("update", options);
  }

  /** Clears the singleton and releases resources. */
  async reset(): Promise<void> {
    this.assertAvailable();
    return this.invoke("reset");
  }

  /** Clears the cached session key (next call will generate/fetch a new one). */
  async resetStoredSessionKey(): Promise<void> {
    this.assertAvailable();
    return this.invoke("resetStoredSessionKey");
  }

  /** Returns the current mutable config, or `null` if not initialized. */
  async getConfig(): Promise<CoinmeRiskConfig | null> {
    this.assertAvailable();
    const result = (await this.invoke<CoinmeRiskConfig | null | undefined>(
      "getConfig"
    )) ?? null;
    return result;
  }

  /** True once `setup()` has completed (and `reset()` hasn't been called). */
  async isInitialized(): Promise<boolean> {
    if (!this.isModuleAvailable()) return false;
    return this.invoke<boolean>("isInitialized");
  }

  // ---------------- Risk pipeline ----------------

  /**
   * Submits collected behavioral/device data to the Coinme backend.
   * Call before any transaction/login/signup API call.
   */
  async submit(): Promise<void> {
    this.assertAvailable();
    return this.invoke("submit");
  }

  /**
   * Fetches the partner session tag via the Coinme SDK (iOS native, Android
   * 1.1.0+). Talks to Coinme's public partner endpoint directly — no backend
   * proxy required. The returned `webSessionID` automatically becomes the
   * active session key for subsequent `submit()` calls.
   */
  async getPartnerSessionTag(
    options: GetPartnerSessionTagOptions
  ): Promise<SessionTagData> {
    this.assertAvailable();
    if (!options.partnerId || !options.accountId || !options.fingerprint) {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.INVALID_OPTIONS,
        "getPartnerSessionTag requires partnerId, accountId, and fingerprint."
      );
    }
    return this.invoke<SessionTagData>("getPartnerSessionTag", options);
  }

  /**
   * Android-only legacy path. Fetches a session tag via a backend proxy at
   * `${apiBaseUrl}/caas/v2/get-session-tag` with a bearer token. Prefer
   * [getPartnerSessionTag] on Android 1.1.0+.
   */
  async getSessionTag(
    options: GetSessionTagOptions
  ): Promise<SessionTagData> {
    if (!this.isAndroid) {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.UNSUPPORTED_OPERATION,
        "getSessionTag is Android-only. Use getPartnerSessionTag on iOS."
      );
    }
    this.assertAvailable();
    if (!options.apiBaseUrl || !options.authToken || !options.fingerprint) {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.INVALID_OPTIONS,
        "getSessionTag requires apiBaseUrl, authToken, and fingerprint."
      );
    }
    return this.invoke<SessionTagData>("getSessionTag", options);
  }

  // ---------------- Manual field tracking ----------------
  // Only relevant when `enableFieldTracking: false` is passed to `setup()`.

  /** Report a text-input change so the risk engine can observe typing patterns. */
  async trackTextChange(viewId: string, text: string): Promise<void> {
    this.assertAvailable();
    return this.invoke("trackTextChange", viewId, text);
  }

  /** Report a focus change so the risk engine can observe interaction order. */
  async trackFocusChange(viewId: string, isFocus: boolean): Promise<void> {
    this.assertAvailable();
    return this.invoke("trackFocusChange", viewId, isFocus);
  }

  // ---------------- Internals ----------------

  private assertAvailable(): void {
    if (!this.isIOS && !this.isAndroid) {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.UNSUPPORTED_PLATFORM,
        "PayAiroCoinmeRisk is only available on iOS and Android."
      );
    }
    if (!this.hasNativeModule) {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.MODULE_NOT_AVAILABLE,
        "PayAiroCoinmeRisk native module is not available. Rebuild the app."
      );
    }
  }

  private assertSetupOptions(options: CoinmeRiskSetupOptions): void {
    if (!options || typeof options !== "object") {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.INVALID_OPTIONS,
        "setup() requires an options object."
      );
    }
    if (options.mode !== "test" && options.mode !== "prod") {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.INVALID_OPTIONS,
        "setup() requires mode to be 'test' or 'prod'."
      );
    }
    if (!options.clientId || typeof options.clientId !== "string") {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.INVALID_OPTIONS,
        "setup() requires a non-empty clientId string."
      );
    }
  }

  private async invoke<T = void>(method: string, ...args: unknown[]): Promise<T> {
    try {
      const fn = (NativeModule as Record<string, (...a: unknown[]) => Promise<T>>)[method];
      return await fn(...args);
    } catch (error: unknown) {
      if (error instanceof CoinmeRiskError) throw error;
      const nativeError = error as { code?: string; message?: string };
      const code =
        (nativeError.code as CoinmeRiskErrorCode) ||
        CoinmeRiskErrorCode.UNKNOWN_ERROR;
      const message = nativeError.message || `Unknown error during ${method}`;
      throw new CoinmeRiskError(code, message);
    }
  }
}

/**
 * Singleton instance. Use this anywhere in the app:
 *
 * ```ts
 * import { PayAiroCoinmeRisk } from 'utils/PayAiroCoinmeRisk';
 * await PayAiroCoinmeRisk.setup({ mode: 'test', clientId: '...' });
 * ```
 */
export const PayAiroCoinmeRisk = new PayAiroCoinmeRiskClass();

export default PayAiroCoinmeRisk;
