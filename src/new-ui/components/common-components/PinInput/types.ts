import type { StyleProp, ViewStyle } from 'react-native';

export interface IPinInputProps {
  /** Fires on every keystroke with the current value. */
  onTextChange?: (pin: string) => void;
  /** Fires once all 4 digits are entered. */
  onFilled?: (pin: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Paints the boxes with the error border — pair it with a message of your own. */
  hasError?: boolean;
  /** Placement only; the box styling is owned by the component. */
  style?: StyleProp<ViewStyle>;
}
