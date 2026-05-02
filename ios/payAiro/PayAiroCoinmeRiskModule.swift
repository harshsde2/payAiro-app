import Foundation
import React
import CoinmeRiskSDK

/**
 * PayAiro Coinme Risk SDK Native Module for iOS
 *
 * Thin bridge over `CoinmeRiskSDK.CoinmeRiskEngine` that exposes the full
 * runtime API to React Native via classic `RCT_EXTERN_MODULE` interop.
 *
 * Design notes:
 * - All public JS methods return Promises. `submit` wraps the SDK's
 *   callback overload; `getPartnerSessionTag` wraps the async-throws
 *   variant via `Task { }`.
 * - All calls after `setup` (except `reset`/`resetStoredSessionKey`) check
 *   `CoinmeRiskEngine.isInitialized()` first and reject with `NOT_INITIALIZED`
 *   if the engine has not been set up yet.
 * - Enum values from JS are accepted as lowercase (`"test"`, `"prod"`,
 *   `"onboarding"`, etc.) for JS ergonomics; this module maps them to the
 *   SDK's capitalized Swift enum cases.
 */
@objc(PayAiroCoinmeRisk)
final class PayAiroCoinmeRiskModule: NSObject {

  // MARK: - Error codes

  private enum ErrorCode: String {
    case invalidOptions       = "INVALID_OPTIONS"
    case notInitialized       = "NOT_INITIALIZED"
    case setupFailed          = "SETUP_FAILED"
    case submitFailed         = "SUBMIT_FAILED"
    case partnerSessionFailed = "PARTNER_SESSION_FAILED"
    case unknownError         = "UNKNOWN_ERROR"
  }

  // MARK: - RN module plumbing

  @objc
  static func moduleName() -> String {
    return "PayAiroCoinmeRisk"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // MARK: - setup

  @objc
  func setup(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let setupOptions = parseSetupOptions(options) else {
      reject(ErrorCode.invalidOptions.rawValue,
             "Invalid setup options. `mode` and `clientId` are required.", nil)
      return
    }

    _ = CoinmeRiskEngine.setupCoinmeRiskEngine(options: setupOptions)
    resolve(nil)
  }

  // MARK: - update

  @objc
  func update(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard CoinmeRiskEngine.isInitialized() else {
      reject(ErrorCode.notInitialized.rawValue,
             "CoinmeRiskEngine is not initialized. Call setup() first.", nil)
      return
    }

    let updateOptions = parseUpdateOptions(options)
    CoinmeRiskEngine.updateCoinmeRiskEngine(updateOptions)
    resolve(nil)
  }

  // MARK: - getPartnerSessionTag

  @objc
  func getPartnerSessionTag(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard CoinmeRiskEngine.isInitialized() else {
      reject(ErrorCode.notInitialized.rawValue,
             "CoinmeRiskEngine is not initialized. Call setup() first.", nil)
      return
    }

    guard let tagOptions = parsePartnerSessionTagOptions(options) else {
      reject(ErrorCode.invalidOptions.rawValue,
             "Invalid options. `partnerId`, `accountId`, and `fingerprint` are required.",
             nil)
      return
    }

    let guardBox = PromiseGuard()
    Task {
      do {
        let data = try await CoinmeRiskEngine.getPartnerSessionTag(options: tagOptions)
        let result: [String: Any] = [
          "webSessionID": data.webSessionID,
          "orgID": data.orgID as Any
        ]
        guardBox.settle { resolve(result) }
      } catch {
        guardBox.settle {
          reject(ErrorCode.partnerSessionFailed.rawValue,
                 error.localizedDescription,
                 error)
        }
      }
    }
  }

  // MARK: - submit

  @objc
  func submit(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard CoinmeRiskEngine.isInitialized() else {
      reject(ErrorCode.notInitialized.rawValue,
             "CoinmeRiskEngine is not initialized. Call setup() first.", nil)
      return
    }

    let guardBox = PromiseGuard()
    CoinmeRiskEngine.submit(
      onSuccess: {
        guardBox.settle { resolve(nil) }
      },
      onError: { error in
        guardBox.settle {
          reject(ErrorCode.submitFailed.rawValue,
                 error.localizedDescription,
                 error)
        }
      }
    )
  }

  // MARK: - Field tracking (manual mode)

  @objc
  func trackTextChange(
    _ viewId: NSString,
    text: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard CoinmeRiskEngine.isInitialized() else {
      reject(ErrorCode.notInitialized.rawValue,
             "CoinmeRiskEngine is not initialized. Call setup() first.", nil)
      return
    }
    CoinmeRiskEngine.trackTextChange(viewId: viewId as String, text: text as String)
    resolve(nil)
  }

  @objc
  func trackFocusChange(
    _ viewId: NSString,
    isFocus: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard CoinmeRiskEngine.isInitialized() else {
      reject(ErrorCode.notInitialized.rawValue,
             "CoinmeRiskEngine is not initialized. Call setup() first.", nil)
      return
    }
    CoinmeRiskEngine.trackFocusChange(viewId: viewId as String, isFocus: isFocus)
    resolve(nil)
  }

  // MARK: - Config / lifecycle

  @objc
  func getConfig(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    guard let config = CoinmeRiskEngine.getCoinmeRiskEngineConfig() else {
      resolve(nil)
      return
    }
    let result: [String: Any] = [
      "customerId": config.customerId as Any,
      "sessionKey": config.sessionKey as Any,
      "flow": config.flow?.rawValue as Any
    ]
    resolve(result)
  }

  @objc
  func resetStoredSessionKey(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    CoinmeRiskEngine.resetStoredSessionKey()
    resolve(nil)
  }

  @objc
  func reset(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    CoinmeRiskEngine.reset()
    resolve(nil)
  }

  @objc
  func isInitialized(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    resolve(CoinmeRiskEngine.isInitialized())
  }

  // MARK: - Private parsing helpers

  private func parseSetupOptions(_ options: NSDictionary) -> RiskEngineSetupOptions? {
    guard
      let modeRaw = options["mode"] as? String,
      let mode = parseMode(modeRaw),
      let clientId = options["clientId"] as? String,
      !clientId.isEmpty
    else {
      return nil
    }

    let partnerId  = options["partnerId"]  as? String
    let customerId = options["customerId"] as? String
    let sessionKey = options["sessionKey"] as? String
    let flow       = (options["flow"] as? String).flatMap(parseFlowType)
    let region     = (options["region"] as? String).flatMap(parseRegion) ?? .default

    let enableBehaviourBiometrics = (options["enableBehaviourBiometrics"] as? Bool) ?? true
    let enableClipboardTracking   = (options["enableClipboardTracking"]   as? Bool) ?? false
    let enableFieldTracking       = (options["enableFieldTracking"]       as? Bool) ?? true
    let setCloudEntitlements      = (options["setCloudEntitlements"]      as? Bool) ?? false

    return RiskEngineSetupOptions(
      mode: mode,
      clientId: clientId,
      partnerId: partnerId,
      customerId: customerId,
      sessionKey: sessionKey,
      flow: flow,
      region: region,
      enableBehaviourBiometrics: enableBehaviourBiometrics,
      enableClipboardTracking: enableClipboardTracking,
      enableFieldTracking: enableFieldTracking,
      setCloudEntitlements: setCloudEntitlements
    )
  }

  private func parseUpdateOptions(_ options: NSDictionary) -> RiskEngineUpdateOptions {
    let customerId = options["customerId"] as? String
    let sessionKey = options["sessionKey"] as? String
    let flow       = (options["flow"] as? String).flatMap(parseFlowType)

    return RiskEngineUpdateOptions(
      customerId: customerId,
      sessionKey: sessionKey,
      flow: flow
    )
  }

  private func parsePartnerSessionTagOptions(_ options: NSDictionary) -> GetPartnerSessionTagOptions? {
    guard
      let partnerId   = options["partnerId"]   as? String, !partnerId.isEmpty,
      let accountId   = options["accountId"]   as? String, !accountId.isEmpty,
      let fingerprint = options["fingerprint"] as? String, !fingerprint.isEmpty
    else {
      return nil
    }

    let rampId            = options["rampId"]  as? String
    let timeout           = (options["timeout"] as? NSNumber)?.intValue ?? 10000
    let additionalHeaders = (options["additionalHeaders"] as? [String: String]) ?? [:]

    return GetPartnerSessionTagOptions(
      partnerId: partnerId,
      accountId: accountId,
      fingerprint: fingerprint,
      rampId: rampId,
      timeout: timeout,
      additionalHeaders: additionalHeaders
    )
  }

  // MARK: - Enum parsing (case-insensitive from JS)

  private func parseMode(_ raw: String) -> Mode? {
    switch raw.lowercased() {
    case "test": return .Test
    case "prod", "production": return .Prod
    default: return nil
    }
  }

  private func parseFlowType(_ raw: String) -> FlowType? {
    switch raw.lowercased() {
    case "onboarding":       return .Onboarding
    case "cardtransaction":  return .CardTransaction
    case "cardlinking":      return .CardLinking
    default: return nil
    }
  }

  private func parseRegion(_ raw: String) -> AppRegion? {
    switch raw.lowercased() {
    case "default", "us": return .default
    case "eu":            return .eu
    case "ca":            return .ca
    case "in":            return .in
    case "au":            return .au
    default: return nil
    }
  }

  // MARK: - Promise guard

  private final class PromiseGuard {
    private var isSettled = false
    private let lock = NSLock()

    func settle(_ block: () -> Void) {
      lock.lock()
      defer { lock.unlock() }
      guard !isSettled else { return }
      isSettled = true
      block()
    }
  }
}
