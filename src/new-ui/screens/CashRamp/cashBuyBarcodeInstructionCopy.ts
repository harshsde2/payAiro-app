export const CASH_BUY_LEGAL_LINKS = {
  pricing: "https://coinme.com/fees/",
  terms: "https://coinme.com/terms/",
  fraudLearnMore:
    "https://help.coinme.com/en/articles/10139767-how-to-avoid-cryptocurrency-scams",
} as const;

export const CASH_BUY_BARCODE_LOAD_SLOW_MS = 1000;
export const CASH_BUY_EXPIRY_URGENT_SECONDS = 60;
export const CASH_BUY_QUOTE_REFRESH_SECONDS = 97;
/** Default barcode window on instruction screen until API returns expiry. */
export const CASH_BUY_INSTRUCTION_EXPIRY_SECONDS = 60 * 60;

export const CASH_BUY_DEFAULT_MAX_RETAIL_FEE = "$4.74";

export function cashBuyHeadline(retailerName: string): string {
  const name = retailerName.trim() || "this store";
  return `Ask cashier at ${name} to scan barcode`;
}

export const CASH_BUY_CASHIER_SUBLINE =
  "Tell cashier you want to load funds into your PayAiro account";

export const CASH_BUY_WALMART_CALLOUT =
  "At Walmart locations please visit the Money Center or Customer Service Desk to complete your transaction.";

export const CASH_BUY_SCAN_LOCATION_ONLY = "Scan at the selected location only.";

export function cashBuyRetailFeeLine(maxFee: string): string {
  return `A retail service fee of up to ${maxFee} will be added to your total at checkout.`;
}

export const CASH_BUY_TAP_CARD_TITLE = "Tap to display barcode for this transaction";
export const CASH_BUY_TAP_CARD_SUB =
  "Please scan barcode at the cashier to complete your purchase.";

export function cashBuyExpiryLabel(mmss: string): string {
  return `Barcode will expire in ${mmss}`;
}

export function cashBuyQuoteUpdatesLabel(duration: string): string {
  return `Quote updates in ${duration}`;
}

export const CASH_BUY_DISPLAY_FEES_LABEL = "Display Fees";

export function cashBuyExchangeRateLine(crypto: string, usdPrice: string): string {
  return `1 ${crypto} ≈ $${usdPrice}`;
}

export const CASH_BUY_LEGAL_BODY_PREFIX =
  "Limit one transaction per barcode. Transaction limits are $1,500 daily and $6,000 monthly. ";
export const CASH_BUY_LEGAL_BODY_EXPIRY_BOLD = "Barcode expires within 1 hour of issuance. ";
export const CASH_BUY_LEGAL_BODY_MID =
  "For more details on pricing, check our ";
export const CASH_BUY_LEGAL_BODY_AFTER_PRICING =
  " page. Scanning the barcode and paying the cashier means you agree to the PayAiro ";
export const CASH_BUY_LEGAL_BODY_SUFFIX = ".";

export const CASH_BUY_FRAUD_PREFIX = "Don't be a fraud victim. ";
export const CASH_BUY_FRAUD_LINK = "Learn More";

export const CASH_BUY_CANCEL_TRANSACTION = "Cancel Transaction";

export const CASH_BUY_LOADING_TITLE = "Loading Barcode";
export const CASH_BUY_LOADING_SUB = "Please wait while we prepare your checkout code.";

export const CASH_BUY_BARCODE_HEADLINE = "Ask cashier to scan barcode";
export function cashBuyAmountToAdd(fiat: string, amount: number): string {
  return `Amount to add: ${fiat} ${amount.toFixed(2)}`;
}
export const CASH_BUY_CASHIER_CONFIRM_FEE =
  "Cashier will confirm total including retail service fee*";
export function cashBuyRetailFeeNote(maxFee: string): string {
  return `*Retail service fee up to ${maxFee} depending on retail location. Cashier will confirm final amount.`;
}

export const CASH_BUY_CLOSE = "Close";

export const CASH_BUY_SCANNED_TITLE = "Barcode Scanned";
export const CASH_BUY_FINALIZE = "Finalize Transaction";

export const CASH_BUY_ALL_DONE = "All Done!";
export const CASH_BUY_SUCCESS_BODY =
  "Your funds will appear in your wallet as soon as we get confirmation from the retailer that the cash was received.";
export const CASH_BUY_SUCCESS_BODY_BOLD = "This can take up to an hour.";
export const CASH_BUY_DONE = "Done";
export const CASH_BUY_COPY = "Copy";

export const CASH_BUY_FAILED_TITLE = "Something Went Wrong";
export const CASH_BUY_FAILED_BODY =
  "Unfortunately, we were unable to process your transaction.";
export const CASH_BUY_FAILED_BODY2 = "Please start a new transaction.";
export const CASH_BUY_START_NEW = "Start New Transaction";

export const CASH_BUY_LOAD_ERROR_TITLE = "Couldn't load barcode";
export const CASH_BUY_LOAD_ERROR_DEFAULT =
  "We couldn't prepare your checkout code. Please try again.";
