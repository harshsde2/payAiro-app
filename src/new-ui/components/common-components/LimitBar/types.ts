import type { StyleProp, ViewStyle } from 'react-native';

export interface ILimitBarProps {
  /** Already consumed against the limit. */
  usedUsd: number;
  /** The cap this bar is measured against. Renders empty when <= 0. */
  limitUsd: number;
  /**
   * Amount currently being entered. Added on top of `usedUsd` so the bar previews
   * where the user would land if this transaction went through.
   */
  pendingUsd?: number;
  /** Forces the over-limit colour even if the ratio alone wouldn't trip it. */
  over?: boolean;
  style?: StyleProp<ViewStyle>;
}
