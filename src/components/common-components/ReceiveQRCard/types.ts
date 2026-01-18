import type { ViewStyle } from "react-native";

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
  /** Called with captured image URI when Download is pressed. Component captures ViewShot. */
  onDownload?: (uri: string) => void | Promise<void>;
  /** Called with captured image URI when Share is pressed. */
  onShare?: (uri: string) => void | Promise<void>;
  /** Optional: called before capture (e.g. show blocking UI) */
  onBeforeCapture?: () => void | Promise<void>;
  /** Optional: called after capture (e.g. hide blocking UI) */
  onAfterCapture?: () => void | Promise<void>;
  /** When false, Download button is hidden. Default: true if onDownload is provided. */
  showDownloadButton?: boolean;
  /** When false, Share button is hidden. Default: true if onShare is provided. */
  showShareButton?: boolean;
  /** Override for the root container */
  containerStyle?: ViewStyle;
  /** Filename base for share/download. Default: "PayAiro_QR" */
  filenameBase?: string;
}
