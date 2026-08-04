import Foundation
import React
import CoinmeRiskSDK

/**
 * PayAiro Coinme Risk SDK Native Module for iOS
 *
 * Every CoinmeRiskEngine call is funnelled through `serialize(_:)`, which guarantees that no
 * two engine operations overlap — including across `await` suspension points.
 *
 * Why that guarantee needs real machinery: a plain `DispatchQueue.async { DispatchQueue.main.async { … } }`
 * serializes nothing, because the queue block returns the instant it schedules the inner work
 * and frees its slot. `Task { @MainActor in … await … }` is no better: the MainActor is released
 * at every `await`, so two tasks interleave. Sardine (MobileIntelligence, bundled by
 * CoinmeRiskSDK) is not safe against that — two concurrent operations double-free and the
 * process dies with `malloc_zone_error` → SIGABRT, which no Swift `catch` can intercept.
 *
 * `serialize` therefore blocks its (background) queue slot on a semaphore until the operation
 * signals completion, so the SDK sees strictly one caller at a time. The main thread is never
 * blocked: the work runs on main, the waiting happens on `sdkQueue`.
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

  /// Sardine keeps uploading after `submit()` reports success. Hold the gate this long
  /// afterwards so the next engine mutation cannot land mid-upload.
  private static let postSubmitSettle: TimeInterval = 1.2

  /// Upper bound on how long one operation may hold the gate. Guards against a vendor
  /// callback that never fires wedging every later call.
  private static let operationTimeout: TimeInterval = 30

  @objc
  static func moduleName() -> String {
    return "PayAiroCoinmeRisk"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  // MARK: - Serial gate

  /**
   * Runs `body` on the main thread and holds the serial queue slot until `body` calls its
   * `done` argument. `done` is idempotent and safe to call from any thread.
   */
  private static func serialize(_ body: @escaping (@escaping () -> Void) -> Void) {
    sdkQueue.async {
      let semaphore = DispatchSemaphore(value: 0)
      let guardBox = PromiseGuard()
      let done: () -> Void = { guardBox.settle { semaphore.signal() } }

      DispatchQueue.main.async { body(done) }

      if semaphore.wait(timeout: .now() + operationTimeout) == .timedOut {
        NSLog("[PayAiroCoinmeRisk] operation exceeded %.0fs; releasing gate", operationTimeout)
      }
    }
  }

  // MARK: - setup

  @objc
  func setup(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      defer { done() }
      guard let setupOptions = self.parseSetupOptions(options) else {
        reject(
          ErrorCode.invalidOptions.rawValue,
          "Invalid setup options. `mode` and `clientId` are required.",
          nil
        )
        return
      }
      _ = CoinmeRiskEngine.setupCoinmeRiskEngine(options: setupOptions)
      resolve(nil)
    }
  }

  // MARK: - update

  @objc
  func update(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      defer { done() }
      guard CoinmeRiskEngine.isInitialized() else {
        Self.rejectNotInitialized(reject)
        return
      }
      CoinmeRiskEngine.updateCoinmeRiskEngine(self.parseUpdateOptions(options))
      resolve(nil)
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
    Self.serialize { done in
      Task { @MainActor in
        defer { done() }
        do {
          guard CoinmeRiskEngine.isInitialized() else {
            Self.rejectNotInitialized(reject)
            return
          }

          if (options["resetStoredSessionKey"] as? Bool) == true {
            CoinmeRiskEngine.resetStoredSessionKey()
          }

          guard let tagOptions = self.parsePartnerSessionTagOptions(options) else {
            reject(
              ErrorCode.invalidOptions.rawValue,
              "Invalid options. `partnerId`, `accountId`, and `fingerprint` are required.",
              nil
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
          await Self.settleAfterSubmit()

          resolve([
            "webSessionID": data.webSessionID,
            "orgID": data.orgID as Any
          ])
        } catch {
          reject(
            ErrorCode.partnerSessionFailed.rawValue,
            error.localizedDescription,
            error
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
    Self.serialize { done in
      Task { @MainActor in
        defer { done() }
        guard CoinmeRiskEngine.isInitialized() else {
          Self.rejectNotInitialized(reject)
          return
        }

        guard let tagOptions = self.parsePartnerSessionTagOptions(options) else {
          reject(
            ErrorCode.invalidOptions.rawValue,
            "Invalid options. `partnerId`, `accountId`, and `fingerprint` are required.",
            nil
          )
          return
        }

        do {
          let data = try await CoinmeRiskEngine.getPartnerSessionTag(options: tagOptions)
          resolve([
            "webSessionID": data.webSessionID,
            "orgID": data.orgID as Any
          ])
        } catch {
          reject(
            ErrorCode.partnerSessionFailed.rawValue,
            error.localizedDescription,
            error
          )
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
    Self.serialize { done in
      Task { @MainActor in
        defer { done() }
        do {
          guard CoinmeRiskEngine.isInitialized() else {
            Self.rejectNotInitialized(reject)
            return
          }
          try await Self.submitAndWait()
          await Self.settleAfterSubmit()
          resolve(nil)
        } catch {
          reject(
            ErrorCode.submitFailed.rawValue,
            error.localizedDescription,
            error
          )
        }
      }
    }
  }

  /// Fire-and-forget Sardine upload (Coinme cardlinking Phase 1 / early Phase 3).
  @objc
  func submitWithoutCallbacks(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      guard CoinmeRiskEngine.isInitialized() else {
        Self.rejectNotInitialized(reject)
        done()
        return
      }
      CoinmeRiskEngine.submit()
      resolve(nil)
      // Fire-and-forget to the SDK, but the gate stays held until the upload settles so the
      // next engine mutation cannot overlap it.
      DispatchQueue.main.asyncAfter(deadline: .now() + Self.postSubmitSettle) { done() }
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
    Self.serialize { done in
      defer { done() }
      guard CoinmeRiskEngine.isInitialized() else {
        Self.rejectNotInitialized(reject)
        return
      }
      CoinmeRiskEngine.trackTextChange(viewId: viewId as String, text: text as String)
      resolve(nil)
    }
  }

  @objc
  func trackFocusChange(
    _ viewId: NSString,
    isFocus: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      defer { done() }
      guard CoinmeRiskEngine.isInitialized() else {
        Self.rejectNotInitialized(reject)
        return
      }
      CoinmeRiskEngine.trackFocusChange(viewId: viewId as String, isFocus: isFocus)
      resolve(nil)
    }
  }

  // MARK: - Config / lifecycle

  @objc
  func getConfig(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      defer { done() }
      guard let config = CoinmeRiskEngine.getCoinmeRiskEngineConfig() else {
        resolve(nil)
        return
      }
      resolve([
        "customerId": config.customerId as Any,
        "sessionKey": config.sessionKey as Any,
        "flow": config.flow?.rawValue as Any
      ])
    }
  }

  @objc
  func resetStoredSessionKey(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      defer { done() }
      if CoinmeRiskEngine.isInitialized() {
        CoinmeRiskEngine.resetStoredSessionKey()
      }
      resolve(nil)
    }
  }

  @objc
  func reset(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      defer { done() }
      CoinmeRiskEngine.reset()
      resolve(nil)
    }
  }

  @objc
  func isInitialized(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    Self.serialize { done in
      defer { done() }
      resolve(CoinmeRiskEngine.isInitialized())
    }
  }

  // MARK: - SDK helpers

  private static func rejectNotInitialized(_ reject: RCTPromiseRejectBlock) {
    reject(
      ErrorCode.notInitialized.rawValue,
      "CoinmeRiskEngine is not initialized. Call setup() first.",
      nil
    )
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

  /// Keeps the serial gate held while Sardine finishes the work `submit()` kicked off.
  private static func settleAfterSubmit() async {
    try? await Task.sleep(nanoseconds: UInt64(postSubmitSettle * 1_000_000_000))
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
