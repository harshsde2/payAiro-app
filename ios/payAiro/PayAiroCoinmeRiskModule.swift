import Foundation
import React
import CoinmeRiskSDK

/**
 * PayAiro Coinme Risk SDK Native Module for iOS
 *
 * All CoinmeRiskEngine access is serialized on `sdkQueue` and executed on the
 * main thread to avoid Sardine MobileIntelligence races (double-free) when JS
 * issues multiple bridge calls between awaits.
 */
@objc(PayAiroCoinmeRisk)
final class PayAiroCoinmeRiskModule: NSObject {

  private enum ErrorCode: String {
    case invalidOptions       = "INVALID_OPTIONS"
    case notInitialized       = "NOT_INITIALIZED"
    case setupFailed          = "SETUP_FAILED"
    case submitFailed         = "SUBMIT_FAILED"
    case partnerSessionFailed = "PARTNER_SESSION_FAILED"
    case updateFailed         = "UPDATE_FAILED"
    case unknownError         = "UNKNOWN_ERROR"
  }

  private static let sdkQueue = DispatchQueue(
    label: "com.payairo.coinmerisk.sdk",
    qos: .userInitiated
  )

  @objc
  static func moduleName() -> String {
    return "PayAiroCoinmeRisk"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  // MARK: - setup

  @objc
  func setup(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.sdkQueue.async {
      DispatchQueue.main.async {
        guard let setupOptions = self.parseSetupOptions(options) else {
          Self.rejectOnMain(
            reject,
            code: ErrorCode.invalidOptions.rawValue,
            message: "Invalid setup options. `mode` and `clientId` are required.",
            error: nil
          )
          return
        }
        do {
          _ = CoinmeRiskEngine.setupCoinmeRiskEngine(options: setupOptions)
          Self.resolveOnMain { resolve(nil) }
        } catch {
          Self.rejectOnMain(
            reject,
            code: ErrorCode.setupFailed.rawValue,
            message: error.localizedDescription,
            error: error
          )
        }
      }
    }
  }

  // MARK: - update

  @objc
  func update(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.runOnSdkQueue(resolve: resolve, reject: reject) {
      guard CoinmeRiskEngine.isInitialized() else {
        throw SdkError.notInitialized
      }
      let updateOptions = self.parseUpdateOptions(options)
      CoinmeRiskEngine.updateCoinmeRiskEngine(updateOptions)
      return nil
    }
  }

  // MARK: - executeSessionPipeline

  /// Atomic: resetSessionKey? → update(flow) → getPartnerSessionTag → update(sessionKey) → submit
  @objc
  func executeSessionPipeline(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.sdkQueue.async {
      Task { @MainActor in
        do {
          guard CoinmeRiskEngine.isInitialized() else {
            Self.rejectOnMain(
              reject,
              code: ErrorCode.notInitialized.rawValue,
              message: "CoinmeRiskEngine is not initialized. Call setup() first.",
              error: nil
            )
            return
          }

          if (options["resetStoredSessionKey"] as? Bool) == true {
            CoinmeRiskEngine.resetStoredSessionKey()
          }

          guard let tagOptions = self.parsePartnerSessionTagOptions(options) else {
            Self.rejectOnMain(
              reject,
              code: ErrorCode.invalidOptions.rawValue,
              message: "Invalid options. `partnerId`, `accountId`, and `fingerprint` are required.",
              error: nil
            )
            return
          }

          let flow = (options["riskFlow"] as? String).flatMap(self.parseFlowType)
          let accountId = tagOptions.accountId

          CoinmeRiskEngine.updateCoinmeRiskEngine(
            RiskEngineUpdateOptions(
              customerId: accountId,
              sessionKey: nil,
              flow: flow
            )
          )

          let data = try await CoinmeRiskEngine.getPartnerSessionTag(options: tagOptions)

          CoinmeRiskEngine.updateCoinmeRiskEngine(
            RiskEngineUpdateOptions(
              customerId: accountId,
              sessionKey: data.webSessionID,
              flow: flow
            )
          )

          try await Self.submitAndWait()

          let result: [String: Any] = [
            "webSessionID": data.webSessionID,
            "orgID": data.orgID as Any
          ]
          Self.resolveOnMain { resolve(result) }
        } catch let error as SdkError {
          Self.rejectOnMain(
            reject,
            code: error.code,
            message: error.message,
            error: nil
          )
        } catch {
          Self.rejectOnMain(
            reject,
            code: ErrorCode.partnerSessionFailed.rawValue,
            message: error.localizedDescription,
            error: error
          )
        }
      }
    }
  }

  // MARK: - getPartnerSessionTag

  @objc
  func getPartnerSessionTag(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.sdkQueue.async {
      Task { @MainActor in
        guard CoinmeRiskEngine.isInitialized() else {
          Self.rejectOnMain(
            reject,
            code: ErrorCode.notInitialized.rawValue,
            message: "CoinmeRiskEngine is not initialized. Call setup() first.",
            error: nil
          )
          return
        }

        guard let tagOptions = self.parsePartnerSessionTagOptions(options) else {
          Self.rejectOnMain(
            reject,
            code: ErrorCode.invalidOptions.rawValue,
            message: "Invalid options. `partnerId`, `accountId`, and `fingerprint` are required.",
            error: nil
          )
          return
        }

        let guardBox = PromiseGuard()
        do {
          let data = try await CoinmeRiskEngine.getPartnerSessionTag(options: tagOptions)
          let result: [String: Any] = [
            "webSessionID": data.webSessionID,
            "orgID": data.orgID as Any
          ]
          guardBox.settle { Self.resolveOnMain { resolve(result) } }
        } catch {
          guardBox.settle {
            Self.rejectOnMain(
              reject,
              code: ErrorCode.partnerSessionFailed.rawValue,
              message: error.localizedDescription,
              error: error
            )
          }
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
    Self.sdkQueue.async {
      Task { @MainActor in
        do {
          guard CoinmeRiskEngine.isInitialized() else {
            Self.rejectOnMain(
              reject,
              code: ErrorCode.notInitialized.rawValue,
              message: "CoinmeRiskEngine is not initialized. Call setup() first.",
              error: nil
            )
            return
          }
          try await Self.submitAndWait()
          Self.resolveOnMain { resolve(nil) }
        } catch {
          Self.rejectOnMain(
            reject,
            code: ErrorCode.submitFailed.rawValue,
            message: error.localizedDescription,
            error: error
          )
        }
      }
    }
  }

  // MARK: - Field tracking

  @objc
  func trackTextChange(
    _ viewId: NSString,
    text: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.runOnSdkQueue(resolve: resolve, reject: reject) {
      guard CoinmeRiskEngine.isInitialized() else {
        throw SdkError.notInitialized
      }
      CoinmeRiskEngine.trackTextChange(viewId: viewId as String, text: text as String)
      return nil
    }
  }

  @objc
  func trackFocusChange(
    _ viewId: NSString,
    isFocus: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.runOnSdkQueue(resolve: resolve, reject: reject) {
      guard CoinmeRiskEngine.isInitialized() else {
        throw SdkError.notInitialized
      }
      CoinmeRiskEngine.trackFocusChange(viewId: viewId as String, isFocus: isFocus)
      return nil
    }
  }

  // MARK: - Config / lifecycle

  @objc
  func getConfig(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.runOnSdkQueue(resolve: resolve, reject: { _, _, _ in }) {
      guard let config = CoinmeRiskEngine.getCoinmeRiskEngineConfig() else {
        return nil
      }
      return [
        "customerId": config.customerId as Any,
        "sessionKey": config.sessionKey as Any,
        "flow": config.flow?.rawValue as Any
      ]
    }
  }

  @objc
  func resetStoredSessionKey(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.runOnSdkQueue(resolve: resolve, reject: { _, _, _ in }) {
      if CoinmeRiskEngine.isInitialized() {
        CoinmeRiskEngine.resetStoredSessionKey()
      }
      return nil
    }
  }

  @objc
  func reset(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.runOnSdkQueue(resolve: resolve, reject: { _, _, _ in }) {
      CoinmeRiskEngine.reset()
      return nil
    }
  }

  @objc
  func isInitialized(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.sdkQueue.async {
      DispatchQueue.main.async {
        Self.resolveOnMain { resolve(CoinmeRiskEngine.isInitialized()) }
      }
    }
  }

  // MARK: - SDK queue helpers

  private struct SdkError: Error {
    let code: String
    let message: String

    static let notInitialized = SdkError(
      code: ErrorCode.notInitialized.rawValue,
      message: "CoinmeRiskEngine is not initialized. Call setup() first."
    )
  }

  private static func runOnSdkQueue(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock,
    operation: @escaping () throws -> Any?
  ) {
    sdkQueue.async {
      DispatchQueue.main.async {
        do {
          let result = try operation()
          Self.resolveOnMain {
            if let result {
              resolve(result)
            } else {
              resolve(nil)
            }
          }
        } catch let error as SdkError {
          Self.rejectOnMain(reject, code: error.code, message: error.message, error: nil)
        } catch {
          Self.rejectOnMain(
            reject,
            code: ErrorCode.updateFailed.rawValue,
            message: error.localizedDescription,
            error: error
          )
        }
      }
    }
  }

  @MainActor
  private static func submitAndWait() async throws {
    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
      let guardBox = PromiseGuard()
      CoinmeRiskEngine.submit(
        onSuccess: {
          guardBox.settle { continuation.resume() }
        },
        onError: { error in
          guardBox.settle { continuation.resume(throwing: error) }
        }
      )
    }
  }

  private static func resolveOnMain(_ work: @escaping () -> Void) {
    if Thread.isMainThread {
      work()
    } else {
      DispatchQueue.main.async(execute: work)
    }
  }

  private static func rejectOnMain(
    _ reject: @escaping RCTPromiseRejectBlock,
    code: String,
    message: String,
    error: Error?
  ) {
    resolveOnMain {
      reject(code, message, error)
    }
  }

  // MARK: - Parsing

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
