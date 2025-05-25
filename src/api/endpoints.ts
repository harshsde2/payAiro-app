// Base URL
export const BASE_URL = "https://app.payairo.com/api/";

// Auth endpoints
export const AUTH = {
  SEND_OTP: "auth/send-otp/",
  VERIFY: "auth/verify/",
  STEP_COUNT: "auth/stepcount/",
  UPDATE_ACCOUNT: "auth/update-account/",
  CONTACT_GET: "auth/contact-get/",
  VERIFY_USER: "auth/verify-user/",
  GET_PIN: "auth/get-pin/",
  CREATE_PIN: "auth/create-pin/",
  CHANGE_PIN: "auth/change-pin/",
  STORE_TOKEN: "auth/store-token/",
  CONTACT_ADDING: "auth/contact-adding/",
  MY_BANK_ACCOUNTS: "auth/my-bank-accounts/",
  ALL_BANK_ACCOUNTS: "auth/all-bank-accounts/",
  ALL_BANKACCOUNT_BALANCE: "auth/all-bankaccount-balance/",
  TRADES_HISTORY: "auth/trades-history/",
  CRYPTO_PRICE_LIST: "auth/Crypto-price-list/",
  BANKACCOUNT_CRYPTO_BALANCE: "auth/bankaccount-crypto-balance/",
  UPLOAD_DOCUMENT_LINK: "auth/upload-document-link/",
  CRYPTO_PURCHASE_QUANTITY: "auth/crypto-purchase-quantity/",
  CRYPTO_SELL_QUANTITY: "auth/crypto-sell-quantity/",
  CRYPTO_TRANSFER: "auth/crypto-transfer/",
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
};
// Wallet endpoints
export const WALLET = {
  DETAILS: "wallet/details/",
  BALANCE: "wallet/get_wallet_balance/",
  ALL_TRANSACTION: "wallet/alltransaction/",
  PAYMENT_REQUEST: "wallet/payment-request/",
  PENDING_REQUESTS: "wallet/payment-request/pending/",
  USER_REQUESTS: "wallet/user-all-paymentrequest/",
  PAYMENT_REQUEST_PAY: (id: string) => `wallet/payment-request/pay/${id}/`,
  CANCEL_PAYMENT_REQUEST: (id: string) =>
    `wallet/cancel-payment-request/pay/${id}/`,
  FILTERED_TRANSACTIONS: "wallet/filtered-transactions/",
  SEND_CRYPTO: "wallet/sendcrypto/",
};

// KYC endpoints
export const KYC = {
  SUBMISSION: "kyc/kyc-submition",
  PLAID_GET_BALANCE: "kyc/plaid-get-balance/",
};

// Merchant endpoints
export const MERCHANT = {
  GET_REQUESTS: "merchant/get-requests/",
  CONFIRM_PAYMENT: "merchant/confirm-payment/",
  QR_CONFIRM_PAYMENT: "merchant/Qr-confirm-payment/",
  CANCEL_PAYMENT: "merchant/cancel-payment/",
  TRANSACTIONS: "merchant/transactions/",
};

// Chat endpoints
export const CHAT = {
  SEND_MESSAGE: "chat/send-message/",
};
