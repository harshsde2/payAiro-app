package com.payairo.coinmerisk

import android.app.Activity
import android.util.Log
import com.coinme.risksdk.CoinmeRiskEngine
import com.coinme.risksdk.RiskEngineSetupOptions
import com.coinme.risksdk.RiskEngineUpdateOptions
import com.coinme.risksdk.enums.AppRegion
import com.coinme.risksdk.enums.FlowType
import com.coinme.risksdk.enums.Mode
import com.coinme.risksdk.exceptions.SessionTagException
import com.coinme.risksdk.models.GetPartnerSessionTagOptions
import com.coinme.risksdk.models.GetSessionTagOptions
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * PayAiro × Coinme Risk SDK native bridge for Android.
 *
 * Mirrors [PayAiroCoinmeRiskModule.swift](../../../../../../ios/payAiro/PayAiroCoinmeRiskModule.swift)
 * method-for-method, with two necessary deltas:
 *   - Android SDK's [CoinmeRiskEngine.setupCoinmeRiskEngine] requires an [Activity]; we
 *     pull it from `reactContext.currentActivity` and reject with SETUP_FAILED if null.
 *   - Android SDK's session-tag entry point is `getSessionTag(apiBaseUrl, authToken,
 *     fingerprint, additionalHeaders, timeout)` — not iOS's partnerId/accountId shape.
 *     The bridge accepts the native shape; the TS wrapper/lifecycle service translates.
 *
 * Enum values are accepted case-insensitively from JS (`"test"`, `"prod"`, `"onboarding"`,
 * `"cardtransaction"`, `"cardlinking"`, `"default"`/`"us"`/`"eu"`/`"ca"`/`"in"`/`"au"`).
 */
class PayAiroCoinmeRiskModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    // Last-resort net: anything that escapes a per-call catch (e.g. thrown while acquiring the
    // mutex) would otherwise propagate out of the coroutine and terminate the process.
    private val exceptionHandler = CoroutineExceptionHandler { _, e ->
        Log.e(TAG, "Unhandled exception in Coinme Risk coroutine", e)
    }

    private val moduleScope =
        CoroutineScope(Dispatchers.Main.immediate + SupervisorJob() + exceptionHandler)

    /**
     * Guards every CoinmeRiskEngine call. Sardine (the engine's underlying SDK) is not safe
     * against concurrent operations — two overlapping calls corrupt its heap and abort the
     * process, which no `catch` can intercept. Every method that touches the engine must hold
     * this, including the read-only ones: a `getConfig()` racing an in-flight `submit()` is
     * enough to trip it.
     */
    private val sdkMutex = Mutex()

    override fun getName(): String = MODULE_NAME

    override fun invalidate() {
        moduleScope.cancel()
        super.invalidate()
    }

    // ---------------- Lifecycle ----------------

    @ReactMethod
    fun setup(options: ReadableMap, promise: Promise) {
        val activity: Activity? = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject(
                ErrorCodes.SETUP_FAILED,
                "No current Activity. setup() must be called after the React Native host attaches."
            )
            return
        }

        val setupOpts = try {
            parseSetupOptions(options)
        } catch (e: IllegalArgumentException) {
            promise.reject(ErrorCodes.INVALID_OPTIONS, e.message ?: "Invalid setup options")
            return
        }

        // moduleScope runs on Dispatchers.Main.immediate — MobileIntelligence.init() is safest on
        // the main thread — and the mutex keeps it from overlapping any in-flight engine call.
        moduleScope.launch {
            sdkMutex.withLock {
                try {
                    CoinmeRiskEngine.setupCoinmeRiskEngine(activity, setupOpts)
                    promise.resolve(null)
                } catch (e: Throwable) {
                    Log.e(TAG, "setup failed", e)
                    promise.reject(ErrorCodes.SETUP_FAILED, e.localizedMessage ?: "setup failed", e)
                }
            }
        }
    }

    @ReactMethod
    fun update(options: ReadableMap, promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }
                try {
                    val updateOpts = parseUpdateOptions(options)
                    CoinmeRiskEngine.updateCoinmeRiskEngine(updateOpts)
                    promise.resolve(null)
                } catch (e: Throwable) {
                    Log.e(TAG, "update failed", e)
                    promise.reject(ErrorCodes.UNKNOWN_ERROR, e.localizedMessage ?: "update failed", e)
                }
            }
        }
    }

    @ReactMethod
    fun reset(promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                try {
                    CoinmeRiskEngine.reset()
                    promise.resolve(null)
                } catch (e: Throwable) {
                    Log.w(TAG, "reset failed (non-fatal): ${e.localizedMessage}")
                    promise.resolve(null)
                }
            }
        }
    }

    @ReactMethod
    fun resetStoredSessionKey(promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.resolve(null)
                    return@withLock
                }
                try {
                    CoinmeRiskEngine.resetStoredSessionKey()
                    promise.resolve(null)
                } catch (e: Throwable) {
                    Log.w(TAG, "resetStoredSessionKey failed (non-fatal): ${e.localizedMessage}")
                    promise.resolve(null)
                }
            }
        }
    }

    @ReactMethod
    fun isInitialized(promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                try {
                    promise.resolve(CoinmeRiskEngine.isInitialized())
                } catch (e: Throwable) {
                    Log.w(TAG, "isInitialized failed (non-fatal): ${e.localizedMessage}")
                    promise.resolve(false)
                }
            }
        }
    }

    @ReactMethod
    fun getConfig(promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.resolve(null)
                    return@withLock
                }
                try {
                    val config: RiskEngineUpdateOptions = CoinmeRiskEngine.getCoinmeRiskEngineConfig()
                    val result = Arguments.createMap().apply {
                        putString("customerId", config.customerId)
                        putString("sessionKey", config.sessionKey)
                        putString("flow", config.flow?.value)
                    }
                    promise.resolve(result)
                } catch (e: Throwable) {
                    Log.w(TAG, "getConfig failed (non-fatal): ${e.localizedMessage}")
                    promise.resolve(null)
                }
            }
        }
    }

    // ---------------- Risk pipeline ----------------

    @ReactMethod
    fun submit(promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }
                try {
                    submitAndWait()
                    // Sardine keeps working after the success callback fires; hold the lock
                    // until it settles so the next engine mutation cannot overlap it.
                    delay(POST_SUBMIT_SETTLE_MS)
                    promise.resolve(null)
                } catch (e: Throwable) {
                    promise.reject(
                        ErrorCodes.SUBMIT_FAILED,
                        e.localizedMessage ?: "submit failed",
                        e
                    )
                }
            }
        }
    }

    /** Fire-and-forget Sardine upload (Coinme cardlinking Phase 1 / early Phase 3). */
    @ReactMethod
    fun submitWithoutCallbacks(promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }
                try {
                    CoinmeRiskEngine.submit()
                    promise.resolve(null)
                    // Fire-and-forget to the SDK, but Sardine keeps uploading after submit()
                    // returns. Hold the lock until it settles so the next engine mutation
                    // cannot land mid-upload and corrupt its heap.
                    delay(POST_SUBMIT_SETTLE_MS)
                } catch (e: Throwable) {
                    promise.reject(
                        ErrorCodes.SUBMIT_FAILED,
                        e.localizedMessage ?: "submitWithoutCallbacks failed",
                        e
                    )
                }
            }
        }
    }

    /**
     * Atomic session pipeline: resetSessionKey? → update(flow) → getPartnerSessionTag
     * → update(sessionKey) → submit. Serialized on main thread to avoid Sardine races.
     */
    @ReactMethod
    fun executeSessionPipeline(options: ReadableMap, promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }

                try {
                    if (optBool(options, "resetStoredSessionKey", false)) {
                        CoinmeRiskEngine.resetStoredSessionKey()
                    }

                    val tagOpts = parsePartnerSessionTagOptions(options)
                    val flow = optString(options, "riskFlow")?.let { parseFlowType(it) }
                    val accountId = tagOpts.accountId

                    CoinmeRiskEngine.updateCoinmeRiskEngine(
                        RiskEngineUpdateOptions(
                            customerId = accountId,
                            sessionKey = null,
                            flow = flow,
                        )
                    )

                    val data = CoinmeRiskEngine.getPartnerSessionTag(tagOpts)

                    CoinmeRiskEngine.updateCoinmeRiskEngine(
                        RiskEngineUpdateOptions(
                            customerId = accountId,
                            sessionKey = data.webSessionID,
                            flow = flow,
                        )
                    )

                    submitAndWait()
                    delay(POST_SUBMIT_SETTLE_MS)

                    val result = Arguments.createMap().apply {
                        putString("webSessionID", data.webSessionID)
                        putString("orgID", data.orgID)
                    }
                    promise.resolve(result)
                } catch (e: IllegalArgumentException) {
                    promise.reject(ErrorCodes.INVALID_OPTIONS, e.message ?: "Invalid pipeline options")
                } catch (e: SessionTagException) {
                    promise.reject(
                        ErrorCodes.PARTNER_SESSION_FAILED,
                        e.localizedMessage ?: "executeSessionPipeline failed",
                        e
                    )
                } catch (e: Throwable) {
                    promise.reject(
                        ErrorCodes.PARTNER_SESSION_FAILED,
                        e.localizedMessage ?: "executeSessionPipeline failed",
                        e
                    )
                }
            }
        }
    }

    private suspend fun submitAndWait() {
        suspendCancellableCoroutine { cont ->
            val settled = AtomicBoolean(false)
            try {
                CoinmeRiskEngine.submit(
                    onSuccess = {
                        if (settled.compareAndSet(false, true)) cont.resume(Unit)
                    },
                    onError = { e ->
                        if (settled.compareAndSet(false, true)) {
                            cont.resumeWithException(e)
                        }
                    }
                )
            } catch (e: Throwable) {
                if (settled.compareAndSet(false, true)) {
                    cont.resumeWithException(e)
                }
            }
        }
    }

    /**
     * SDK 1.1.0+ — talks to Coinme's public partner endpoint directly (no
     * auth token, no backend proxy needed). Base URL is resolved from the
     * SDK mode (Test → staging, Prod → production). Mirrors the iOS
     * `getPartnerSessionTag`.
     */
    @ReactMethod
    fun getPartnerSessionTag(options: ReadableMap, promise: Promise) {
        val tagOpts = try {
            parsePartnerSessionTagOptions(options)
        } catch (e: IllegalArgumentException) {
            promise.reject(ErrorCodes.INVALID_OPTIONS, e.message ?: "Invalid partner session tag options")
            return
        }

        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }
                try {
                    val data = CoinmeRiskEngine.getPartnerSessionTag(tagOpts)
                    val result = Arguments.createMap().apply {
                        putString("webSessionID", data.webSessionID)
                        putString("orgID", data.orgID)
                    }
                    promise.resolve(result)
                } catch (e: SessionTagException) {
                    promise.reject(
                        ErrorCodes.PARTNER_SESSION_FAILED,
                        e.localizedMessage ?: "getPartnerSessionTag failed",
                        e
                    )
                } catch (e: Throwable) {
                    promise.reject(
                        ErrorCodes.PARTNER_SESSION_FAILED,
                        e.localizedMessage ?: "getPartnerSessionTag failed",
                        e
                    )
                }
            }
        }
    }

    /**
     * Legacy SDK shape — takes `apiBaseUrl`, `authToken`, `fingerprint`. The SDK fires
     * a GET to `${apiBaseUrl}/caas/v2/get-session-tag` with `Bearer ${authToken}` and an
     * `x-device-fingerprint` header, then auto-updates the active session key.
     * Retained for callers that want to route session-tag retrieval through their own
     * backend proxy. Prefer [getPartnerSessionTag] on 1.1.0+.
     */
    @ReactMethod
    fun getSessionTag(options: ReadableMap, promise: Promise) {
        val tagOpts = try {
            parseSessionTagOptions(options)
        } catch (e: IllegalArgumentException) {
            promise.reject(ErrorCodes.INVALID_OPTIONS, e.message ?: "Invalid session tag options")
            return
        }

        val settled = AtomicBoolean(false)
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }
                try {
                    val data = CoinmeRiskEngine.getSessionTag(tagOpts)
                    if (settled.compareAndSet(false, true)) {
                        val result = Arguments.createMap().apply {
                            putString("webSessionID", data.webSessionID)
                            putString("orgID", data.orgID)
                        }
                        promise.resolve(result)
                    }
                } catch (e: SessionTagException) {
                    if (settled.compareAndSet(false, true)) {
                        promise.reject(
                            ErrorCodes.PARTNER_SESSION_FAILED,
                            e.localizedMessage ?: "getSessionTag failed",
                            e
                        )
                    }
                } catch (e: Throwable) {
                    if (settled.compareAndSet(false, true)) {
                        promise.reject(
                            ErrorCodes.PARTNER_SESSION_FAILED,
                            e.localizedMessage ?: "getSessionTag failed",
                            e
                        )
                    }
                }
            }
        }
    }

    // ---------------- Manual field tracking ----------------

    @ReactMethod
    fun trackTextChange(viewId: String, text: String, promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }
                try {
                    CoinmeRiskEngine.trackTextChange(viewId, text)
                    promise.resolve(null)
                } catch (e: Throwable) {
                    Log.w(TAG, "trackTextChange failed (non-fatal): ${e.localizedMessage}")
                    promise.resolve(null)
                }
            }
        }
    }

    @ReactMethod
    fun trackFocusChange(viewId: String, isFocus: Boolean, promise: Promise) {
        moduleScope.launch {
            sdkMutex.withLock {
                if (!CoinmeRiskEngine.isInitialized()) {
                    promise.reject(
                        ErrorCodes.NOT_INITIALIZED,
                        "CoinmeRiskEngine is not initialized. Call setup() first."
                    )
                    return@withLock
                }
                try {
                    CoinmeRiskEngine.trackFocusChange(viewId, isFocus)
                    promise.resolve(null)
                } catch (e: Throwable) {
                    Log.w(TAG, "trackFocusChange failed (non-fatal): ${e.localizedMessage}")
                    promise.resolve(null)
                }
            }
        }
    }

    // ---------------- Parsing helpers ----------------

    private fun parseSetupOptions(options: ReadableMap): RiskEngineSetupOptions {
        val modeRaw = options.getString("mode")
            ?: throw IllegalArgumentException("`mode` is required.")
        val mode = parseMode(modeRaw)
            ?: throw IllegalArgumentException("Invalid mode: `$modeRaw` (expected `test` or `prod`).")
        val clientId = options.getString("clientId")?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("`clientId` is required and must be non-empty.")

        val partnerId = optString(options, "partnerId")
        val customerId = optString(options, "customerId")
        val sessionKey = optString(options, "sessionKey")
        val flow = optString(options, "flow")?.let { parseFlowType(it) }
        val appRegion =
            optString(options, "region")?.let { parseRegion(it) }
                ?: optString(options, "appRegion")?.let { parseRegion(it) }
                ?: AppRegion.DEFAULT

        val enableBehaviourBiometrics = optBool(options, "enableBehaviourBiometrics", true)
        val enableClipboardTracking = optBool(options, "enableClipboardTracking", false)
        val enableFieldTracking = optBool(options, "enableFieldTracking", true)

        return RiskEngineSetupOptions(
            mode = mode,
            clientId = clientId,
            partnerId = partnerId,
            customerId = customerId,
            sessionKey = sessionKey,
            flow = flow,
            appRegion = appRegion,
            enableBehaviourBiometrics = enableBehaviourBiometrics,
            enableClipboardTracking = enableClipboardTracking,
            enableFieldTracking = enableFieldTracking,
        )
    }

    private fun parseUpdateOptions(options: ReadableMap): RiskEngineUpdateOptions {
        val customerId = optString(options, "customerId")
        val sessionKey = optString(options, "sessionKey")
        val flow = optString(options, "flow")?.let { parseFlowType(it) }
        return RiskEngineUpdateOptions(
            customerId = customerId,
            sessionKey = sessionKey,
            flow = flow,
        )
    }

    private fun parsePartnerSessionTagOptions(options: ReadableMap): GetPartnerSessionTagOptions {
        val partnerId = options.getString("partnerId")?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("`partnerId` is required for getPartnerSessionTag.")
        val accountId = options.getString("accountId")?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("`accountId` is required for getPartnerSessionTag.")
        val fingerprint = options.getString("fingerprint")?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("`fingerprint` is required for getPartnerSessionTag.")

        val rampId = optString(options, "rampId")

        val timeout = if (options.hasKey("timeout") && !options.isNull("timeout"))
            options.getDouble("timeout").toLong()
        else 10000L

        val additionalHeaders = mutableMapOf<String, String>()
        if (options.hasKey("additionalHeaders") && !options.isNull("additionalHeaders")) {
            options.getMap("additionalHeaders")?.let { headers ->
                val iter = headers.keySetIterator()
                while (iter.hasNextKey()) {
                    val k = iter.nextKey()
                    val v = headers.getString(k) ?: continue
                    additionalHeaders[k] = v
                }
            }
        }

        return GetPartnerSessionTagOptions(
            partnerId = partnerId,
            accountId = accountId,
            fingerprint = fingerprint,
            rampId = rampId,
            additionalHeaders = additionalHeaders,
            timeout = timeout,
        )
    }

    private fun parseSessionTagOptions(options: ReadableMap): GetSessionTagOptions {
        val apiBaseUrl = options.getString("apiBaseUrl")?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("`apiBaseUrl` is required for getSessionTag.")
        val authToken = options.getString("authToken")?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("`authToken` is required for getSessionTag.")
        val fingerprint = options.getString("fingerprint")?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("`fingerprint` is required for getSessionTag.")

        val timeout = if (options.hasKey("timeout") && !options.isNull("timeout"))
            options.getDouble("timeout").toLong()
        else 10000L

        val additionalHeaders = mutableMapOf<String, String>()
        if (options.hasKey("additionalHeaders") && !options.isNull("additionalHeaders")) {
            options.getMap("additionalHeaders")?.let { headers ->
                val iter = headers.keySetIterator()
                while (iter.hasNextKey()) {
                    val k = iter.nextKey()
                    val v = headers.getString(k) ?: continue
                    additionalHeaders[k] = v
                }
            }
        }

        return GetSessionTagOptions(
            apiBaseUrl = apiBaseUrl,
            authToken = authToken,
            fingerprint = fingerprint,
            additionalHeaders = additionalHeaders,
            timeout = timeout,
        )
    }

    private fun optString(options: ReadableMap, key: String): String? {
        if (!options.hasKey(key) || options.isNull(key)) return null
        val s = options.getString(key) ?: return null
        return s.ifEmpty { null }
    }

    private fun optBool(options: ReadableMap, key: String, default: Boolean): Boolean {
        if (!options.hasKey(key) || options.isNull(key)) return default
        return try {
            options.getBoolean(key)
        } catch (_: Exception) {
            default
        }
    }

    private fun parseMode(raw: String): Mode? = when (raw.lowercase()) {
        "test" -> Mode.Test
        "prod", "production" -> Mode.Prod
        else -> null
    }

    private fun parseFlowType(raw: String): FlowType? = when (raw.lowercase()) {
        "onboarding" -> FlowType.Onboarding
        "cardtransaction" -> FlowType.CardTransaction
        "cardlinking" -> FlowType.CardLinking
        else -> null
    }

    private fun parseRegion(raw: String): AppRegion? = when (raw.lowercase()) {
        "default", "us" -> AppRegion.DEFAULT
        "eu" -> AppRegion.EU
        "ca" -> AppRegion.CA
        "in" -> AppRegion.IN
        "au" -> AppRegion.AU
        else -> null
    }

    companion object {
        const val MODULE_NAME = "PayAiroCoinmeRisk"
        private const val TAG = "PayAiroCoinmeRisk"

        /**
         * Sardine keeps uploading after `submit()` reports completion. The SDK lock is held
         * this long afterwards so the next engine mutation cannot land mid-upload.
         */
        private const val POST_SUBMIT_SETTLE_MS = 1200L
    }

    private object ErrorCodes {
        const val INVALID_OPTIONS = "INVALID_OPTIONS"
        const val NOT_INITIALIZED = "NOT_INITIALIZED"
        const val SETUP_FAILED = "SETUP_FAILED"
        const val SUBMIT_FAILED = "SUBMIT_FAILED"
        const val PARTNER_SESSION_FAILED = "PARTNER_SESSION_FAILED"
        const val UNKNOWN_ERROR = "UNKNOWN_ERROR"
    }
}
