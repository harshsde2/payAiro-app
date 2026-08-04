import React, { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Connectivity watcher. Shows a "No Internet" alert while offline, and — critically —
 * when connectivity is restored (either detected automatically OR via the "Try again"
 * button) it forces a full React-Query refetch. That refetch re-hydrates everything,
 * including the `/users/me` profile query (`UsersMeHydrator`), so the dashboard header /
 * balances fill in without needing to restart the app.
 */
export default function UseNet() {
  const netInfo = useNetInfo();
  const queryClient = useQueryClient();
  const wasOfflineRef = useRef(false);
  const alertShownRef = useRef(false);

  const reloadAll = useCallback(() => {
    // Refetch every query (profile, balances, contacts, history, …).
    queryClient.invalidateQueries();
  }, [queryClient]);

  const showAlert = useCallback(() => {
    if (alertShownRef.current) return;
    alertShownRef.current = true;
    Alert.alert(
      "No Internet !",
      "Your internet does not seem to work",
      [
        {
          text: "Try again",
          onPress: async () => {
            alertShownRef.current = false;
            // Check live state (not the possibly-stale hook value) on explicit retry.
            const state = await NetInfo.fetch();
            if (state.isConnected) {
              wasOfflineRef.current = false;
              reloadAll();
            } else {
              showAlert();
            }
          },
        },
      ],
      { cancelable: false }
    );
  }, [reloadAll]);

  useEffect(() => {
    if (netInfo.isConnected === false) {
      wasOfflineRef.current = true;
      showAlert();
    } else if (netInfo.isConnected === true) {
      // Transitioned offline → online: reload data that failed while offline.
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        alertShownRef.current = false;
        reloadAll();
      }
    }
  }, [netInfo.isConnected, reloadAll, showAlert]);

  return null;
}
