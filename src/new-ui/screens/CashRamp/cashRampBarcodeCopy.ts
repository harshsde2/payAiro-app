/**
 * PayAiro-specific UX copy for the cash-ramp barcode screen (buy / sell).
 * Keep wording distinct from partner marketing; adjust here for legal/comms review.
 */

const DEFAULT_STORE = "this store";
const DEFAULT_ATM = "the ATM you chose";

export function cashRampTitle(isSell: boolean): string {
  return isSell ? "Pick up cash at the ATM" : "Store checkout code";
}

export function cashRampSubtitleBuy(args: {
  amount: number;
  fiat: string;
  locationDescription: string;
}): string {
  const { amount, fiat, locationDescription } = args;
  const place = locationDescription || DEFAULT_STORE;
  const amt = amount.toFixed(2);
  return `Bring ${fiat} ${amt} in cash to ${place}. A clerk will scan the code below so we can credit your PayAiro wallet.`;
}

export function cashRampSubtitleSell(args: {
  marketCryptoAmountLabel: string;
  locationDescription: string;
  fiat: string;
  amount: number;
}): string {
  const { marketCryptoAmountLabel, locationDescription, fiat, amount } = args;
  const place = locationDescription || DEFAULT_ATM;
  const amt = amount.toFixed(2);
  return `Use the ATM reference below at ${place}. You’re cashing out about ${marketCryptoAmountLabel} for roughly ${fiat} ${amt} at current market pricing (final totals may differ).`;
}

export function cashRampDisclaimerBuy(args: { amount: number; fiat: string }): string {
  const amt = args.amount.toFixed(2);
  return `Figures below assume a ${args.fiat} ${amt} cash add-on. Crypto shown is an estimate until the partner confirms the trade. Network or partner fees can change the final amount.`;
}

export function cashRampDisclaimerSell(args: { amount: number; fiat: string }): string {
  const amt = args.amount.toFixed(2);
  return `Summary reflects selling crypto for about ${args.fiat} ${amt}. Market moves and partner fees can change what you receive or pay at completion.`;
}

export function cashRampDetailRowLabelBuy(cryptoCode: string): string {
  return `Approx. ${cryptoCode} you’ll receive`;
}

export function cashRampDetailRowLabelSell(cryptoCode: string): string {
  return `Approx. ${cryptoCode} to convert`;
}

export function cashRampFeeLabel(
  sessionStatus: "loading" | "success" | "error",
  isSell: boolean
): string {
  if (sessionStatus !== "success") {
    return isSell ? "Fees (estimate)" : "Service fee (estimate)";
  }
  return isSell ? "Fees (total)" : "Service fee";
}

export const ATM_REFERENCE_CAPTION = "ATM reference number";

const QUOTE_NEUTRAL =
  "Pricing can change—confirm on your receipt or with staff before you finish.";

export function cashRampQuoteNote(isSell: boolean, expiry: Date | null): string {
  if (expiry != null && !Number.isNaN(expiry.getTime())) {
    const when = expiry.toLocaleString();
    return isSell
      ? `This pickup window is set until ${when}.`
      : `This checkout offer is held until ${when}.`;
  }
  return QUOTE_NEUTRAL;
}

export function cashRampLoadErrorLine(isSell: boolean): string {
  return isSell
    ? "We couldn’t start your ATM cash-out. Check your connection, then tap Retry."
    : "We couldn’t load your store checkout code. Check your connection, then tap Retry.";
}

export const NO_CHECKOUT_CODE_MESSAGE =
  "No scannable code came back from the server. Try Retry or pick another location.";

export const FOOTER_DONE = "Done";

/** Toasts / guards */
export const ERR_MISSING_LOCATION =
  "Pick a participating location first, then open your code again.";
export const ERR_MISSING_WALLET =
  "Add or select the wallet you’re selling from, then try again.";
export const ERR_MISSING_CHAIN = "Select the asset network, then try again.";
export const ERR_CASH_OFF_RAMP =
  "The cash-out request didn’t complete. Please try again shortly.";
export const ERR_ORDER_TEMPLATE =
  "We couldn’t prepare your checkout code. Please try again shortly.";
