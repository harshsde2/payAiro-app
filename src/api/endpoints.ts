/**
 * External Links
 * These are now loaded from environment configuration for consistency
 */
import { EnvConfig } from "../config/env.config";

export const LINKS = {
  privacyPolicy: EnvConfig.PRIVACY_POLICY_URL,
  termsAndConditions: EnvConfig.TERMS_AND_CONDITIONS_URL,
}

// Legacy BASE_URL export kept for backward compatibility during migration
// Will be removed after all references are updated
export const BASE_URL = {
  testing: EnvConfig.API_BASE_URL,
  production: EnvConfig.API_BASE_URL,
}

// Auth endpoints
export const AUTH = {
  SEND_OTP: "auth/V1/send-otp/",
  LOGIN: "auth/V1/login/",
  CYBIRD_KYC: "auth/V1/cybird-kyc/",
  SEND_OTP_FOR_TRANSACTION: "auth/verify/sendotp/",
  VERIFY_USER_FOR_SEND_OTP: "auth/verify-otp-send/",
  CYBIRD_BALANCE: "auth/cybrid/balance/",
  VERIFY: "auth/V1/verify/",
  STEP_COUNT: "auth/stepcount/",
  UPDATE_ACCOUNT: "auth/V1/update-account/",
  CONTACT_GET: "auth/contact-get/",
  VERIFY_USER: "auth/verify-user/",
  GET_PIN: "auth/get-pin/",
  GET_FIAT_DASHBOARD_DATA: "auth/v1/dashboard/",
  GET_WALLET_DASHBOARD_DATA: "auth/v1/wallet-dashboard/",
  CREATE_PIN: "auth/create-pin/",
  CHANGE_PIN: "auth/change-pin/",
  /** GET/PATCH user app-lock (biometric) preference. */
  USER_LOCK: "auth/user-lock/",
  FORGOT_PIN_SEND_OTP: "auth/forget-pin/send-otp/",
  FORGOT_PIN_RESET: "auth/forget-pin/",
  VERIFY_OTP_WITH_MAIL: "auth/verify/sendotp/",
  VERIFY_SEND_OTP: "auth/verify-otp-send/",
  STORE_TOKEN: "auth/store-token/",
  CONTACT_ADDING: "auth/contact-adding/",
  MY_BANK_ACCOUNTS: "auth/my-bank-accounts/",
  CYBIRD_KYC_STATUS: "auth/cybird-kyc/status/",
  ADD_NORMAL_BANK_ACCOUNT: "auth/fortreetrust-bankaccount/",
  ADD_TRADITIONAL_IRA_BANK_ACCOUNT: "auth/fortreetrust-TraditionalIraAccount/",
  ALL_BANK_ACCOUNTS: "auth/all-bank-accounts/",
  ALL_BANKACCOUNT_BALANCE: "auth/all-bankaccount-balance/",
  TRADES_HISTORY: "auth/trades-history/",
  FORMATTED_TRADES_HISTORY: "auth/formatted-trades-history/",
  CRYPTO_PRICE_LIST: "auth/Crypto-price-list/",
  CYBRID_CRYPTO_LIST: "auth/cybrid/prices/",
  BANKACCOUNT_CRYPTO_BALANCE: "auth/bankaccount-crypto-balance/",
  UPLOAD_DOCUMENT_LINK: "auth/upload-document-link/",
  CRYPTO_PURCHASE_QUANTITY: "auth/crypto-purchase-quantity/",
  CRYPTO_SELL_QUANTITY: "auth/crypto-sell-quantity/",
  CRYPTO_TRANSFER: "auth/crypto-transfer/",
  CRYPTO_BUY: "auth/cybrid/buy/",
  CRYPTO_SELL: "auth/cybrid/sell/",
  CRYPTO_ADDRESS: "auth/crypto-adress/",
  FORTRESS_CRYPTO_BUY: "auth/fortress/crypto/buy/",
  FORTRESS_CRYPTO_SELL: "auth/fortress/crypto/sell/",
  SELF_TRANSFER: "auth/self-transfer/",
  NOTIFICATIONS: "auth/notifications/",
  BLOCKCHAIN_DATA1: "auth/blockchain-data1/",
  BLOCKCHAIN_DATA2: "auth/blockchain-data2/",
  MX_CREATE_MEMBER: "auth/create-member/",
  MX_ACCOUNT_DETAILS_EXTERNAL: "auth/fortress/account-details-external/",
  MX_LINK_EXTERNAL_ACCOUNT: "auth/link-external-account",
  MX_REGISTER_EXTERNAL_ACCOUNT: "auth/regester/externalbankaccount/",
  GET_MY_REWARD: "auth/my-rewards/",
  REDEEM_REWARD: "auth/reward-redeem/",
  SCRATCH_CARDS: "auth/scratch-cards/",
  SCRATCH_CARD: "auth/scratch-card/scratch/",
  CLAIM_SCRATCH_REWARD: "auth/scratch-reward/claim/",
  RWA_LIST: "/auth/assets/",
  RWA_ALL_LIST: "/auth/assets/",
  IRA_HOLDINGS_ALL_LIST: "/auth/user/rwa-bank-balance/",
  BUY_RWA: "/auth/rwa/buy/",
  SELL_RWA: "/auth/rwa/sell/",
  RWA_USER_HOLDINGS: "/auth/user/rwa-holdings/",
  USER_SUPPORT: "/auth/query/",
  CONTACT_FORM: "auth/contact-form/",
  USER_TO_USER_FORTRESS_TRANSFER: "auth/fortreetrust-bankaccount-transfer/",
  USER_TO_USER_CYBRID_TRANSFER: "auth/cybrid/transfer/",
  COMBINED_CRYPTO_BALANCE: "auth/CombinedCryptoPrices/?type=",
  CRYPTO_BALANCE_BY_ASSET: "auth/cybrid/crypto-balance/",
  ALL_CRYPTO_BALANCES: "auth/cybrid/V1/crypto-balance/",
  PLAID_ACCESS_TOKEN: "auth/cybrid/plaid-link-token/",
  CREATE_EXTERNAL_BANK_ACCOUNT: "auth/cybrid/create-external-bank-account/",
  DEPOSIT_ADDRESS: "auth/depositAddress/",
  CRYPTO_WITHDRAWAL: "auth/cybrid/Withdrawal/",
  CRYPTO_MARKET_DATA: "auth/coingecko/markets/",
  COINFLOW_CHECKOUT: "auth/coinflow/checkout/",
  WERT_HPP_SESSION: "auth/wert-hpp-session/",
  WERT_HPP: "auth/wert-hpp/",
  GET_REFERRAL_DATA: "auth/users/ref/",
  CONTENT_DATA: "auth/r1/content-data/",
  USER_DETAILS: "auth/r1/user-details/",
  UPLOAD_PROFILE_PHOTO: "auth/upload-profile-photo/",
  ASSET_LIST: "auth/r1/assetlist",
  UNREAD_NOTIFICATIONS_COUNT: "auth/unread-notifications-count/",
  MARK_ALL_NOTIFICATIONS_READ: "auth/r1/mark-all-read/",
};
// Wallet endpoints
export const WALLET = {
  DETAILS: "wallet/details/",
  BALANCE: "wallet/get_wallet_balance/",
  ALL_TRANSACTION: "wallet/alltransaction/",
  ALL_FILTERED_TRANSACTIONS: "wallet/transaction-history/",
  UNIFIED_TRANSACTIONS: "wallet/unified-transactions/",
  PAYMENT_REQUEST: "wallet/payment-request/",
  PENDING_REQUESTS: "wallet/payment-request/pending/",
  USER_REQUESTS: "wallet/user-all-paymentrequest/",
  PAYMENT_REQUEST_PAY: (id: string) => `wallet/payment-request/pay/${id}/`,
  CANCEL_PAYMENT_REQUEST: (id: string) =>
    `wallet/cancel-payment-request/pay/${id}/`,
  FILTERED_TRANSACTIONS: "wallet/filtered-transactions/",
  SEND_CRYPTO: "wallet/sendcrypto/",
  EXTERNAL_WITHDRAWAL_CYBRID: "wallet/external-withdrawal-cybrid/",
};

// KYC endpoints
export const KYC = {
  SUBMISSION: "kyc/kyc-submition",
  PLAID_GET_BALANCE: "kyc/plaid-get-balance/",
  PLAID_LINK_TOKEN: "kyc/plaid-kyc-linktoken",
  PLAID_EXTERNAL_ACCOUNT: "kyc/plaid-external-account",
};

// Merchant endpoints
export const MERCHANT = {
  GET_REQUESTS: "merchant/get-requests/",
  CONFIRM_PAYMENT: "merchant/confirm-payment/",
  QR_CONFIRM_PAYMENT: "merchant/Qr-confirm-payment/",
  CANCEL_PAYMENT: "merchant/cancel-payment/",
  TRANSACTIONS: "merchant/transactions/",
  RWA_ICON: "merchant/rwalist/",
};

// Chat endpoints
export const CHAT = {
  SEND_MESSAGE: "chat/send-message/",
};

// FastAPI (users + onboarding) endpoints
// NOTE: These are relative to `USER_API_BASE_URL` (no host, no leading slash).
export const USER_AUTH = {
  OTP_REQUEST: "api/v1/users/auth/otp/request/",
  OTP_VERIFY: "api/v1/users/auth/otp/verify/",
  TOKEN_REFRESH: "api/v1/users/auth/token/refresh/",
  PROFILE_UPDATE: "api/v1/users/profile/update/",
  /** KYC step 1 — fetches the user's identity (DOB, address) from Coinme. Returns step 1. */
  KYC_COMPLETE: "api/v1/users/profile/kyc-complete/",
  /** KYC step 2 — user confirms/corrects the fetched details; finalizes onboarding. Returns step 2. */
  KYC_VERIFY: "api/v1/users/profile/kyc-verify/",
  ADDRESS_UPDATE: "api/v1/users/address/update/",
  USERS_ME: "api/v1/users/me/",
  /** Upload/replace the signed-in user's profile avatar (multipart, field `image`). */
  PROFILE_AVATAR: "api/v1/users/profile/avatar/",
  /** Unauthenticated support/account-recovery form (multipart). */
  GUEST_QUERY: "api/v1/users/guest-query/",
  PHONE_OTP_REQUEST: "api/v1/users/me/phone-otp/request/",
  PHONE_OTP_VERIFY: "api/v1/users/me/phone-otp/verify/",
  EMAIL_OTP_REQUEST: "api/v1/users/me/email-otp/request/",
  EMAIL_OTP_VERIFY: "api/v1/users/me/email-otp/verify/",
  USERS_SEARCH: "api/v1/users/search/",
  USER_CONTACTS: "api/v1/users/contacts/",
  CRYPTO_MARKET: "api/v1/integrations/crypto/market/",
  CRYPTO_BALANCE: "api/v1/integrations/crypto/balance/",
  CRYPTO_CHART: "api/v1/integrations/crypto/chart/",
  PAYMENT_TRANSACTIONS_SEND: "api/v1/payment-transactions/send/",
  PAYMENT_TRANSACTIONS_SEND_HISTORY: "api/v1/payment-transactions/send/history/",
  /** Crypto Request (P2P) — create a request for crypto from another Payairo user. */
  CRYPTO_REQUEST_CREATE: "api/v1/payment-transactions/request/",
  /** Crypto Request history (filter via ?scope=&status=&limit=). */
  CRYPTO_REQUEST_HISTORY: "api/v1/payment-transactions/request/history/",
  /** Pay (fulfill) a crypto request — empty body, just the request id. */
  CRYPTO_REQUEST_PAY: (id: number | string) =>
    `api/v1/payment-transactions/request/${id}/pay/`,
  /** Cancel/decline a crypto request — empty body, just the request id. */
  CRYPTO_REQUEST_CANCEL: (id: number | string) =>
    `api/v1/payment-transactions/request/${id}/cancel/`,
  PAYMENT_METHODS: "api/v1/integrations/payment-methods/",
  COINME_AUTH_TOKEN: "api/v1/integrations/coinme/auth-token/",
  USER_PAYMENT_METHODS: "api/v1/users/payment-methods/",
  LOCATIONS_NEARBY: "api/v1/integrations/locations/nearby/",
  WALLET_ADDRESSES: "api/v1/wallets/addresses/",
  WALLET_LOAD_INSTRUCTIONS: "api/v1/wallets/load-instructions/",
  WALLET_LOAD_INSTRUCTIONS_CONSENT: "api/v1/wallets/load-instructions/consent/",
  COINME_TRADE_EXECUTE: "api/v1/integrations/coinme/trade/execute/",
  COINME_TRADE_QUOTE: "api/v1/integrations/coinme/trade/quote/",
  COINME_ORDER_TEMPLATE: "api/v1/integrations/coinme/order-template/",
  COINME_ORDER_TEMPLATE_STATUS: "api/v1/integrations/coinme/order-template/status/",
  COINME_CASH_OFFRAMP_EXECUTE: "api/v1/integrations/coinme/cash-offramp/execute/",
  COINME_CASH_OFFRAMP_PICKUP_CODE: "api/v1/integrations/coinme/cash-offramp/pickup-code/",
  COINME_TRANSACTION_LIMITS: "api/v1/integrations/coinme/transaction-limits/",
  SECURITY_PIN_SETTINGS: "api/v1/users/security/pin/",
  /** Change the transaction PIN when the user still knows it: { old_pin, new_pin }. */
  SECURITY_PIN_CHANGE: "api/v1/users/security/pin/change/",
  /** Reset the transaction PIN with an action_token from ACTION_OTP_VERIFY: { action_token, new_pin }. */
  SECURITY_PIN_RESET: "api/v1/users/security/pin/reset/",
  /**
   * Sends an OTP for a privileged action (e.g. "transaction_pin_change") to the
   * logged-in user's registered phone/email. Distinct from OTP_REQUEST, which is the
   * unauthenticated login/signup OTP.
   */
  ACTION_OTP_REQUEST: "api/v1/users/action-otp/request/",
  /** Verifies an action OTP and returns a short-lived action_token. */
  ACTION_OTP_VERIFY: "api/v1/users/action-otp/verify/",
  COINME_2FA_MOBILE_AUTH: "api/v1/users/me/coinme-2fa/mobile-auth/",
  COINME_2FA_INSTANT_LINK: "api/v1/users/me/coinme-2fa/instant-link/",
  /** Register/refresh this device's FCM token for push notifications. */
  NOTIFICATIONS_DEVICES: "api/v1/notifications/devices/",
  /** Unregister a device (on logout) by its device_fingerprint. */
  NOTIFICATIONS_DEVICE: (fingerprint: string) =>
    `api/v1/notifications/devices/${encodeURIComponent(fingerprint)}/`,
  /** In-app notification feed (paginated; supports unread/category/event_type filters). */
  NOTIFICATIONS: "api/v1/notifications/",
  /** Unread notification count (+ per-category breakdown) for the bell badge. */
  NOTIFICATIONS_UNREAD_COUNT: "api/v1/notifications/unread-count/",
  /** Batch mark-read: body { ids: [...] } or { all: true }. */
  NOTIFICATIONS_MARK_READ: "api/v1/notifications/mark-read/",
  /** Mark a single notification read by id. */
  NOTIFICATION_MARK_READ: (id: number | string) =>
    `api/v1/notifications/${id}/mark-read/`,
  /** GET/PUT per-user push notification preferences. */
  NOTIFICATIONS_PREFERENCES: "api/v1/notifications/preferences/",
  USER_PROFILE_TRANSACTIONS: (targetUserId: number | string, limit: number = 50) =>
    `api/v1/users/${targetUserId}/profile-transactions/?limit=${limit}`,
};

// Rewards & Referrals (user-facing) endpoints — FastAPI, relative to `USER_API_BASE_URL`.
// Source of truth: "PayAiro · Rewards & Referrals API" Postman collection (user APIs only).
export const REWARDS = {
  /** Validate a referral code before signup. Public — no JWT required. */
  REFERRAL_VALIDATE: "api/v1/rewards/referral/validate/",
  /** Current user's referral code (PAY{id}) + shareable URL. First call creates it. */
  REFERRAL_ME: "api/v1/rewards/referral/me/",
  /** Scratch cards list. Supports ?status=issued|scratched|expired. */
  SCRATCH_CARDS: "api/v1/rewards/scratch-cards/",
  /** Scratch (redeem) a single card by id — adds reward_points. */
  SCRATCH_CARD_SCRATCH: (id: number | string) =>
    `api/v1/rewards/scratch-cards/${id}/scratch/`,
  /** Points wallet summary (balance + value). */
  POINTS: "api/v1/rewards/points/",
  /** Claim points into the wallet. Body {} (all) or { points: N }. */
  POINTS_CLAIM: "api/v1/rewards/points/claim/",
};

// State regulatory compliance (CT/MN/CA) endpoints — FastAPI, relative to `USER_API_BASE_URL`.
// Source of truth: "PayAiro State Compliance API" Postman collection.
export const STATE_COMPLIANCE = {
  /** App-launch compliance status for the current user. */
  STATUS: "api/v1/state-compliance/status/",
  /** One-time disclosure content. `lang` only applies to MN (en|es|so|hmn|vi|zh). */
  disclosure: (state: string, lang?: string) =>
    `api/v1/state-compliance/${state}/disclosure/${lang ? `?lang=${lang}` : ""}`,
  disclosureAcknowledge: (state: string) =>
    `api/v1/state-compliance/${state}/disclosure/acknowledge/`,
  disclosureStatus: (state: string) =>
    `api/v1/state-compliance/${state}/disclosure/status/`,
  /** Pre-transaction disclosure content (CT only). */
  preTransaction: (state: string, type: "buy" | "sell") =>
    `api/v1/state-compliance/${state}/pre-transaction/${type}/`,
  /** Acknowledge a pre-transaction disclosure (CT only) — fired every trade. */
  preTransactionAcknowledge: (state: string) =>
    `api/v1/state-compliance/${state}/pre-transaction/acknowledge/`,
  receiptFooter: (state: string) =>
    `api/v1/state-compliance/${state}/receipt-footer/`,
  RECEIPTS_CREATE: "api/v1/state-compliance/receipts/create/",
  receiptByTxn: (txnId: string) =>
    `api/v1/state-compliance/receipts/${encodeURIComponent(txnId)}/`,
  RECEIPTS_LIST: "api/v1/state-compliance/receipts/",
  DISCLOSURE_HISTORY: "api/v1/state-compliance/me/disclosure-history/",
  /** One-time + pre-transaction acknowledgments combined (Acknowledgment History screen). */
  COMBINED_DISCLOSURE_HISTORY: "api/v1/state-compliance/me/combined-disclosure-history/",
};

// FAQ (user-facing) endpoints — FastAPI, relative to `USER_API_BASE_URL`. Public — no JWT required.
export const FAQ = {
  /** List FAQs. Supports ?search=<query> (server-side filter over question/answer/category). */
  LIST: "api/v1/users/faq/",
};
