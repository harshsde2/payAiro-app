/**
 * Toast utility functions
 * Simple API to show toast messages from anywhere in the app
 * Uses toastify-react-native
 *
 * @example
 * // Basic usage
 * import { showSuccess, showError, showInfo, showWarning } from 'utils/toast';
 *
 * // Show success message
 * showSuccess("Operation successful!");
 *
 * // Show error with description
 * showError("Something went wrong", "Please try again later");
 *
 * // Show info message
 * showInfo("New update available", "Version 2.0 is now available");
 *
 * // Show warning
 * showWarning("Session expiring soon", "Please save your work");
 *
 * // With custom options
 * showSuccess("Saved!", undefined, {
 *   visibilityTime: 5000,
 *   position: "bottom",
 *   onPress: () => console.log("Toast pressed"),
 * });
 *
 * // Generic function
 * import { showToast } from 'utils/toast';
 * showToast("error", "Failed to load data");
 *
 * // Hide toast programmatically
 * import { hideToast } from 'utils/toast';
 * hideToast();
 */

import { Toast } from "toastify-react-native";
import { IToastOptions, ToastType } from "./types";

/**
 * Friendly default headers used when a caller passes only a message. Every toast
 * then still shows a header (title) + subheading (message).
 */
const DEFAULT_TITLES: Record<ToastType, string> = {
  success: "Success",
  error: "Something went wrong",
  info: "Heads up",
  warning: "Please note",
};

/**
 * Resolve the title/subheading pair:
 * - (message, description) → title = message, subheading = description
 * - (message)             → title = friendly default header, subheading = message
 * Callers are encouraged to pass an explicit (title, message).
 */
const resolve = (
  type: ToastType,
  message: string,
  description?: string
): { text1: string; text2?: string } => {
  const hasDescription = typeof description === "string" && description.trim().length > 0;
  return hasDescription
    ? { text1: message, text2: description }
    : { text1: DEFAULT_TITLES[type], text2: message };
};

/**
 * Show a success toast message
 */
export const showSuccess = (
  message: string,
  description?: string,
  options?: Partial<IToastOptions>
) => {
  Toast.show({
    type: "success",
    ...resolve("success", message, description),
    visibilityTime: 3000,
    position: "top",
    ...options,
  });
};

/**
 * Show an error toast message
 */
export const showError = (
  message: string,
  description?: string,
  options?: Partial<IToastOptions>
) => {
  Toast.show({
    type: "error",
    ...resolve("error", message, description),
    visibilityTime: 4000,
    position: "top",
    ...options,
  });
};

/**
 * Show an info toast message
 */
export const showInfo = (
  message: string,
  description?: string,
  options?: Partial<IToastOptions>
) => {
  Toast.show({
    type: "info",
    ...resolve("info", message, description),
    visibilityTime: 3000,
    position: "top",
    ...options,
  });
};

/**
 * Show a warning toast message
 */
export const showWarning = (
  message: string,
  description?: string,
  options?: Partial<IToastOptions>
) => {
  Toast.show({
    type: "warning",
    ...resolve("warning", message, description),
    visibilityTime: 3500,
    position: "top",
    ...options,
  });
};

/**
 * Generic function to show any type of toast
 */
export const showToast = (
  type: ToastType,
  message: string,
  description?: string,
  options?: Partial<IToastOptions>
) => {
  Toast.show({
    type,
    ...resolve(type, message, description),
    visibilityTime: type === "error" ? 4000 : 3000,
    position: "top",
    ...options,
  });
};

/**
 * Extract a user-friendly message from an axios/API error, covering the app's
 * error envelopes: crypto `errorResponse.errorData[].message`, flat `message` /
 * `toast_message`, and `errorResponse.message`. Falls back to a caller-provided
 * string (axios's generic "Request failed with status code N" is skipped).
 *
 * Use it for the SUBHEADING arg: `showError("Payment failed", getApiErrorMessage(e, "Please try again."))`.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as any;
  const data = err?.response?.data ?? err;

  const errorData = data?.errorResponse?.errorData;
  const fromErrorData =
    Array.isArray(errorData) && typeof errorData[0]?.message === "string"
      ? errorData[0].message
      : undefined;

  const rawErrMessage =
    typeof err?.message === "string" &&
    !/^request failed with status code/i.test(err.message)
      ? err.message
      : undefined;

  const candidate =
    fromErrorData ||
    (typeof data?.message === "string" ? data.message : undefined) ||
    (typeof data?.toast_message === "string" ? data.toast_message : undefined) ||
    (typeof data?.errorResponse?.message === "string"
      ? data.errorResponse.message
      : undefined) ||
    rawErrMessage;

  const cleaned = typeof candidate === "string" ? candidate.trim() : "";
  return cleaned.length > 0 ? cleaned : fallback;
};

/**
 * Hide all visible toasts
 */
export const hideToast = () => {
  Toast.hide();
};

// Export types
export * from "./types";
