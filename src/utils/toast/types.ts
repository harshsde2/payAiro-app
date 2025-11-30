/**
 * Toast message types and interfaces
 */

export type ToastType = "success" | "error" | "info" | "warning";

export interface IToastOptions {
  type?: ToastType;
  text1?: string;
  text2?: string;
  visibilityTime?: number;
  position?: "top" | "bottom";
  topOffset?: number;
  bottomOffset?: number;
  onShow?: () => void;
  onHide?: () => void;
  onPress?: () => void;
}

export interface IToastShowOptions extends IToastOptions {
  type: ToastType;
  text1: string;
  text2?: string;
}
