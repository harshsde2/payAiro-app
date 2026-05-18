export const CASH_OFFRAMP_CARD_TITLE = "ATM Sale";

export const CASH_OFFRAMP_STATUS_LABEL = {
  processing: "Processing",
  ready: "ReadyCode Generated",
  completed: "Completed",
  error: "ReadyCode Error",
  failed: "ReadyCode Failed",
  expired: "ReadyCode Expired",
} as const;

export const CASH_OFFRAMP_BADGE_LABEL = {
  processing: "Processing",
  ready: "Sold",
  completed: "Sold",
  error: "Error",
  failed: "Failed",
  expired: "Expired",
} as const;

export const CASH_OFFRAMP_PROCESSING_MESSAGE =
  "Your ReadyCode is being generated. We're working on getting you a ReadyCode for this transaction as soon as possible. You'll be notified once this is ready.";

export const CASH_OFFRAMP_ERROR_TITLE = "Cash Code Error";
export const CASH_OFFRAMP_ERROR_BODY =
  "Unfortunately, we were not able to retrieve your ReadyCode. If funds were removed from your account during this transaction, we will issue a credit back to your account. If you need further assistance, please contact customer support here.";

export const CASH_OFFRAMP_FAILED_TITLE = "Something Went Wrong";
export const CASH_OFFRAMP_FAILED_BODY =
  "Unfortunately, we were unable to complete this transaction. If funds were removed from your account during this transaction, we will issue a credit back to your account. If you need further assistance, please contact customer support here.";

export const CASH_OFFRAMP_EXPIRED_TITLE = "Your ReadyCode has Expired";
export const CASH_OFFRAMP_EXPIRED_BODY =
  "Unfortunately, the ReadyCode has expired. To return your funds, please contact customer support here.";

export const CASH_OFFRAMP_READY_CODE_LABEL = "Your ReadyCode";
export const CASH_OFFRAMP_PHONE_HINT_SUFFIX = "(Verified Coinme phone number)";
export const CASH_OFFRAMP_PICKUP_WITHIN = "Pick-up within";
export const CASH_OFFRAMP_PICKUP_DAYS = "30 Days";
export const CASH_OFFRAMP_PICKUP_DISCLAIMER =
  "After 30 days your transaction will be cancelled and refunded (minus fees).";

export const CASH_OFFRAMP_SELL_METHOD = "ATM";
export const CASH_OFFRAMP_SUPPORT_URL = "https://www.payairo.com";

export const CASH_OFFRAMP_ROW_DATE = "Date and Time";
export const CASH_OFFRAMP_ROW_SELL_METHOD = "Sell Method";
export const CASH_OFFRAMP_ROW_TXN_ID = "Transaction ID";
export const CASH_OFFRAMP_ROW_ADDRESS = "Address";
export const CASH_OFFRAMP_ROW_EXCHANGE_FEE = "Exchange Fee";
export const CASH_OFFRAMP_ROW_ATM_FEE = "ATM Fee";
export const CASH_OFFRAMP_ROW_TOTAL_SALE = "Total Sale";
export const CASH_OFFRAMP_ROW_TOTAL_CASH = "Total Cash To Pick-Up";
export const CASH_OFFRAMP_LOCATION_FALLBACK = "ATM location";
