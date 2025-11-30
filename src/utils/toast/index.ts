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
 * Show a success toast message
 */
export const showSuccess = (
  message: string,
  description?: string,
  options?: Partial<IToastOptions>
) => {
  Toast.show({
    type: "success",
    text1: message,
    text2: description,
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
    text1: message,
    text2: description,
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
    text1: message,
    text2: description,
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
    text1: message,
    text2: description,
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
    text1: message,
    text2: description,
    visibilityTime: type === "error" ? 4000 : 3000,
    position: "top",
    ...options,
  });
};

/**
 * Hide all visible toasts
 */
export const hideToast = () => {
  Toast.hide();
};

// Export types
export * from "./types";
