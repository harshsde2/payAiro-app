import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { toKycMode, KycMode } from "types/kyc";
import { getItem, setItem, STORAGE_KEYS } from "storage/mmkv";
import KycCongratulationsModal from "./KycCongratulationsModal";

/**
 * Component to handle showing KYC congratulations modal when KYC is approved.
 * Shows the modal only once per approval using persistent storage.
 * 
 * Production-ready features:
 * - Tracks approval state using persistent storage (MMKV)
 * - Only shows modal once per approval, even after app restarts/logins
 * - Handles edge cases (unknown state, status changes)
 * - Prevents multiple triggers with ref-based guard
 * - Checks storage first before showing modal
 */
const KycCongratulationsHandler: React.FC = () => {
  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const previousModeRef = useRef<KycMode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Skip if status is unknown (initial load or no status yet)
    if (mode === "unknown") {
      previousModeRef.current = mode;
      return;
    }

    // Check storage first - if modal was already shown, never show again
    const congratulationsShown = getItem(STORAGE_KEYS.KYC_CONGRATULATIONS_SHOWN);
    if (congratulationsShown === "true") {
      // Already shown, update previous mode and return
      previousModeRef.current = mode;
      return;
    }

    // If KYC is already approved on initial mount (previousModeRef is null),
    // it means user is logging in with already-approved KYC (old user)
    // Don't show modal in this case - mark as shown silently
    if (mode === "approved" && previousModeRef.current === null) {
      // Old user with already-approved KYC - mark as shown to prevent popup
      setItem(STORAGE_KEYS.KYC_CONGRATULATIONS_SHOWN, "true");
      previousModeRef.current = mode;
      return;
    }

    // Only show modal if KYC just transitioned to approved (not on initial mount)
    // This ensures we don't show on login if KYC was already approved
    const justApproved = 
      mode === "approved" && 
      previousModeRef.current !== "approved" &&
      previousModeRef.current !== null; // Must have a previous state (not initial mount)

    if (justApproved) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Small delay to ensure UI is ready and user sees the transition
      timeoutRef.current = setTimeout(() => {
        setIsModalVisible(true);
      }, 800);
    }

    // Update previous mode for next comparison
    previousModeRef.current = mode;
  }, [mode, kycStatus]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    // Mark as shown in storage to prevent showing again (use "true" for clarity)
    setItem(STORAGE_KEYS.KYC_CONGRATULATIONS_SHOWN, "true");
  };

  return (
    <KycCongratulationsModal
      isVisible={isModalVisible}
      onClose={handleCloseModal}
    />
  );
};

export default KycCongratulationsHandler;
