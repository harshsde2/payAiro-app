import { Alert } from "react-native";

/**
 * Ask before repeating an identical transaction.
 *
 * `transactionGuard` blocks a re-submit of the same intent inside the duplicate window,
 * which is what stops an accidental double charge. But paying the same person the same
 * amount twice in a row is also a perfectly normal thing to do, so the block must be a
 * speed bump the user can clear — never a hard wall.
 *
 * Cancel is the default action: if the block fired because of a stray double tap, doing
 * nothing is the correct outcome.
 */
export const confirmDuplicateTransaction = (
  onConfirm: () => void,
  reason: "in-flight" | "succeeded" = "succeeded",
): void => {
  if (reason === "in-flight") {
    // Already running — a second one is never what the user meant.
    Alert.alert(
      "Transaction in progress",
      "Your previous transaction is still being processed. Please wait for it to finish.",
      [{ text: "OK", style: "cancel" }],
    );
    return;
  }

  Alert.alert(
    "Repeat this transaction?",
    "You just made an identical transaction a moment ago. Do you want to make another one?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Yes, continue", style: "destructive", onPress: onConfirm },
    ],
    { cancelable: true },
  );
};
