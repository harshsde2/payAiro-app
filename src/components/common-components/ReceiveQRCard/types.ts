import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";

export interface IActionButtonProps {
  /** Button text label */
  text: string;
  /** Button icon (React element) */
  icon: ReactNode;
  /** Button press handler */
  onPress: () => void;
}

export interface IReceiveQRCardRef {
  /** Capture the QR card and call the handler with the image URI */
  capture: (handler: (uri: string) => void | Promise<void>) => Promise<void>;
  /** Current capturing state */
  isCapturing: boolean;
}

export interface IReceiveQRCardProps {
  /** Main title (e.g. "PayAiro Bank - 2323" or "PayAiro") */
  title: string;
  /** Subtitle in green (e.g. "Primary account for receiving funds") */
  subtitle: string;
  /** Data to encode in QR. If object, will be JSON.stringify'd. */
  qrValue: string | object;
  /** PayAiro Tag to show and copy (e.g. "John123") */
  payAiroTag: string;
  /** Called when copy icon is pressed */
  onCopyTag: () => void;
  /** Override for the root container */
  containerStyle?: ViewStyle;
  /** Left action button configuration. If not provided, left button is hidden. */
  leftButton?: IActionButtonProps;
  /** Right action button configuration. If not provided, right button is hidden. */
  rightButton?: IActionButtonProps;
  /** Optional: called before capture (e.g. show blocking UI) */
  onBeforeCapture?: () => void | Promise<void>;
  /** Optional: called after capture (e.g. hide blocking UI) */
  onAfterCapture?: () => void | Promise<void>;
  /** Bank details to show in the QR card */
  bankDetails?: ReactNode;
  /** Callback when capturing state changes */
  onCapturingChange?: (isCapturing: boolean) => void;
}
