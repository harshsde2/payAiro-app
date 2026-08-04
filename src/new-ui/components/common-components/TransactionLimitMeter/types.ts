import type { StyleProp, ViewStyle } from 'react-native';
import type { TransactionLimit } from 'hooks/useTransactionLimit';

export interface ITransactionLimitMeterProps {
  /** From useTransactionLimit(flow, rail). Renders null when !limit.available. */
  limit: TransactionLimit;
  /** Current entered amount in USD, used to preview the bar as the user types. */
  amountUsd: number;
  /** Message from limit.validate(amountUsd); null when the amount is allowed. */
  error?: string | null;
  /** Fills the input with limit.effectiveMaxUsd. Omit to hide the "Use max" action. */
  onUseMax?: () => void;
  /** Placement only (margins/padding) — the meter's own look is fixed everywhere. */
  style?: StyleProp<ViewStyle>;
}
