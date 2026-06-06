/**
 * FCMTokenManager Component
 * Registers the device's FCM token with the backend notifications service
 * (iOS + Android) via useRegisterFcmDeviceOnLogin.
 * Must be placed inside PersistQueryProvider to have access to QueryClient.
 */

import React from "react";
import { useRegisterFcmDeviceOnLogin } from "hooks/useRegisterFcmDeviceOnLogin";

/**
 * Renders nothing — runs the FCM device registration side effect.
 * Must be inside PersistQueryProvider for React Query context.
 */
export const FCMTokenManager: React.FC = () => {
  useRegisterFcmDeviceOnLogin();
  return null;
};

export default FCMTokenManager;
