import { NativeModules, Platform } from "react-native";

const { PayAiroCoinmeRisk: NativeModule } = NativeModules;

// ---------------------------------------------------------------------------
// Types (mirror the Swift SDK surface; values are lowercase for JS ergonomics
// — the native bridge normalizes case before mapping to Swift enum cases).
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
   * Requires CloudKit capability and a configured iCloud container on the
   * app target. Leave `false` unless the project entitlements include
   * `com.apple.developer.icloud-container-identifiers`, otherwise the SDK
   * will crash at runtime.
   */
  setCloudEntitlements?: boolean;
}

/** Options for `update()`. Only customerId/sessionKey/flow are mutable. */
export interface CoinmeRiskUpdateOptions {
  customerId?: string;
  sessionKey?: string;
  flow?: CoinmeFlowType;
}

/** Options for `getPartnerSessionTag()`. */
export interface GetPartnerSessionTagOptions {
  partnerId: string;
  accountId: string;
  fingerprint: string;
  rampId?: string;
  /** Request timeout in ms (default 10000). */
  timeout?: number;
  additionalHeaders?: Record<string, string>;
}

/** Return value from `getPartnerSessionTag()`. */
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
}

export class CoinmeRiskError extends Error {
  public readonly code: CoinmeRiskErrorCode;

  constructor(code: CoinmeRiskErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "CoinmeRiskError";
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/**
 * PayAiro × Coinme Risk SDK (iOS)
 *
 * Thin, typed wrapper over the native `PayAiroCoinmeRisk` module. All methods
 * are Promise-based. Android is not supported — all calls reject with
 * `UNSUPPORTED_PLATFORM`.
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
  private readonly hasNativeModule: boolean;

  constructor() {
    this.isIOS = Platform.OS === "ios";
    this.hasNativeModule = NativeModule != null;

    if (this.isIOS && !this.hasNativeModule) {
      console.warn(
        "[PayAiroCoinmeRisk] Native module not available. " +
        "Ensure `pod install` ran cleanly and the app was rebuilt."
      );
    }
  }

  /** True only on iOS where the native module resolved. */
  isModuleAvailable(): boolean {
    return this.isIOS && this.hasNativeModule;
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
   * Fetches the partner session tag. The returned `webSessionID` automatically
   * becomes the active session key for subsequent `submit()` calls.
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
    if (!this.isIOS) {
      throw new CoinmeRiskError(
        CoinmeRiskErrorCode.UNSUPPORTED_PLATFORM,
        "PayAiroCoinmeRisk is only available on iOS."
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
