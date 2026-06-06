export const SELL_DAILY_LIMIT_TITLE = "Daily Sale Limit Reached";
export const SELL_DAILY_LIMIT_BODY =
  "You've reached your daily sale limit. Please wait 24 hours before trying to make another sale.";

export const SELL_MONTHLY_LIMIT_TITLE = "Monthly Sale Limit Reached";
export const SELL_MONTHLY_LIMIT_BODY =
  "You've reached your monthly sale limit. Please wait 29 days before trying to make another sale.";

export const SELL_TX_LIMIT_TITLE = "Transaction Limit Notice";
export const SELL_TX_LIMIT_BODY =
  "You recently submitted a transaction with this amount. Please try again in 5 minutes.";

export const SELL_TX_LIMIT_BUTTON = "Try Again Later";

export const SELL_METHOD_VALUE = "Cash for pick-up";
export const SELL_AVAILABLE_BALANCE_PREFIX = "Available balance to sell:";
export const SELL_AMOUNT_INCREMENT_HINT = "Select an amount in increments of $20";
export const SELL_SINGLE_STEP_HINT =
  "Only $20 is available to sell at your current balance.";
export const SELL_MIN_AMOUNT_ERROR = "Minimum sale amount is $20";
export const SELL_CONTINUE = "Continue";
export const SELL_CONFIRM = "Confirm";
export const SELL_ACK_CHECKBOX =
  "I acknowledge this sale is final and understand the fees shown above.";

export const SELL_SUMMARY_METHOD = "Sell Method";
export const SELL_SUMMARY_AVAILABILITY = "Availability";
export const SELL_SUMMARY_AVAILABILITY_VALUE = "Instantly";
export const SELL_SUMMARY_EXCHANGE_FEE = "Exchange Fee";
export const SELL_SUMMARY_ATM_FEE = "ATM Fee";
export const SELL_SUMMARY_TOTAL_SALE = "Total Sale";
export const SELL_SUMMARY_CASH_PICKUP = "Total Cash To Pick-Up";

export const SELL_OTP_TITLE = "Verify OTP";
export const SELL_OTP_INSTRUCTION =
  "Enter the 6-digit code sent to {phone} to confirm this cash sale.";

export const SELL_WAIT_CARD_TITLE = "Please wait for your ReadyCode!";
export const SELL_WAIT_CARD_BODY =
  "We will notify you when your ReadyCode is available (usually within 5 minutes). You'll be able to find these details in your email and Transaction History.";

export const SELL_READY_CARD_TITLE = "Your ReadyCode is Ready!";
export const SELL_READY_CARD_BODY =
  "Please head to the location and look for the ReadyCode ATM. Enter your phone number and 8-digit ReadyCode within 30 days to get your cash.";

export const SELL_WAIT_MODAL_TITLE = "Please wait for your ReadyCode!";
export const SELL_WAIT_MODAL_BODY =
  "In order to pick up your cash at the ATM, you will need your ReadyCode. You should receive it within the next few minutes. Once you receive your ReadyCode, you will have 30 days to get your cash at the ATM.";

/** First-time only — Find ReadyCode in transaction history (Figma). */
export const SELL_HISTORY_MODAL = {
  title: "Find your ReadyCode in your transaction history",
  paragraphs: [
    "Click on the link sent to you by email in order to access your ReadyCode at any time.",
    "Simply tap on your most recent sell for cash transaction in your transaction history to display your most recent ReadyCode.",
  ],
} as const;

export const SELL_HISTORY_MODAL_TITLE = SELL_HISTORY_MODAL.title;
export const SELL_HISTORY_MODAL_BODY_PARAGRAPHS = SELL_HISTORY_MODAL.paragraphs;

/** Cash Pick-up Instructions button — ATM steps (any time). */
export const SELL_PICKUP_MODAL = {
  title: "Cash Pick-up Instructions",
  steps: [
    "Go to the ReadyCode ATM location shown on this screen.",
    "On the ATM, select the option to sell crypto for cash (ReadyCode).",
    "Enter the mobile phone number registered on your PayAiro account.",
    "Enter your 8-digit ReadyCode when prompted.",
    "Collect your cash from the ATM once the transaction is approved.",
  ],
  footer:
    "You have 30 days from when your ReadyCode is issued to pick up your cash at the ATM.",
} as const;

export const SELL_PICKUP_MODAL_TITLE = SELL_PICKUP_MODAL.title;
export const SELL_PICKUP_MODAL_STEPS = SELL_PICKUP_MODAL.steps;
export const SELL_PICKUP_MODAL_FOOTER = SELL_PICKUP_MODAL.footer;

export const SELL_FRAUD_LEARN_MORE = "Don't be a fraud victim. Learn More";
export const SELL_CASH_PICKUP_INSTRUCTIONS = "Cash Pick-up Instructions";
export const SELL_CLOSE = "Close";
export const SELL_I_UNDERSTAND = "I Understand";
export const SELL_ATM_LOCATION_LABEL = "ReadyCode ATM Location:";
export const SELL_SOLD_PREFIX = "Sold";
export const SELL_EXECUTE_ERROR_TITLE = "Sale could not be completed";
export const SELL_TRY_AGAIN_LATER = "Try Again Later";
export const SELL_TRY_AGAIN = "Try again";
export const SELL_SUBMITTING_SALE = "Submitting your sale…";
export const SELL_EXECUTE_FAILED = "We couldn't submit your sale. Check your connection and try again.";
