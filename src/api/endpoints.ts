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
  RWA_LIST: "/auth/assets/",
  RWA_ALL_LIST: "/auth/assets/",
  IRA_HOLDINGS_ALL_LIST: "/auth/user/rwa-bank-balance/",
  BUY_RWA: "/auth/rwa/buy/",
  SELL_RWA: "/auth/rwa/sell/",
  RWA_USER_HOLDINGS: "/auth/user/rwa-holdings/",
  USER_SUPPORT: "/auth/query/",
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
