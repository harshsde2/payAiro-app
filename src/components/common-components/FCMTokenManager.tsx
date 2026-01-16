/**
 * FCMTokenManager Component
 * Wrapper component that uses useStoreFCMTokenOnLogin hook
 * Must be placed inside PersistQueryProvider to have access to QueryClient
 */

import React from "react";
import { useStoreFCMTokenOnLogin } from "hooks/useStoreFCMTokenOnLogin";

/**
 * Component that manages FCM token storage to backend
 * This component renders nothing but handles the side effect
 * Must be inside PersistQueryProvider for React Query context
 */
export const FCMTokenManager: React.FC = () => {
  // This hook requires QueryClient context, so it must be inside PersistQueryProvider
  useStoreFCMTokenOnLogin({
    retryOnFailure: true,
    maxRetries: 3,
    retryDelay: 5000,
    showErrorToast: true,
  });

  // This component doesn't render anything
  return null;
};

export default FCMTokenManager;
