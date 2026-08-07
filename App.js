import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { AppState, Linking, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import useDispatchAction from "./src/hooks/useDispatchAction";
import AppStack from "./src/navigations/AppStack";
import AuthStack from "./src/navigations/AuthStack";
import { NAVIGATION_SCREENS } from "./src/navigations/navigationConstants";
import { PersistQueryProvider } from "./src/query/index";
import { focusManager } from "@tanstack/react-query";
import { invalidateQueriesForNotification } from "./src/query/notificationQueryInvalidation";
import {
  setActiveTab,
  setAllCryptoBalances,
  setCryptoData,
  setCurrentRoute,
  setFcmToken,
  setPendingRequest,
  setSelectedCurrency,
  setShowGuide,
  setTokens,
  setTotalDisbursable,
  setWalletData,
} from "./src/redux/slices/authenticationSlice";
import AnimatedBootSplashV3 from "./src/screens/TSX-Screens/AnimatedBootSplash/AnimatedBootSplashV3";
import { getWalletDataAuth } from "./src/services/Auth";
import { getMechentPay } from "./src/services/Services";
import { getItem, setItem, removeItem, STORAGE_KEYS, getComplianceAckedVersion } from "./src/storage/mmkv";
import { COMPLIANCE_CONFIG } from "./src/new-ui/constants/compliance";
import { getProfileResidentialStateCode } from "./src/new-ui/screens/CashRamp/LocationFinder/cashRampProfileState";
import { userApiClient } from "./src/api/userApiClient";
import { USER_AUTH } from "./src/api/endpoints";
import {
  hydrateUserFromMe,
  setAppAccessGranted,
  setUserData,
} from "./src/redux/slices/newBackendAuthSlice";
import {
  clearAuthSession,
  readAuthSession,
  getAuthStackInitialRoute,
  hasCompletedSession,
} from "./src/auth/authSession";
import {
  bootstrapCoinmeRisk,
  scheduleOnUserLoggedIn,
} from "./src/services/coinmeRiskLifecycle";
import { ThemeProvider } from "./src/styles";
import { ThemeProvider as NewUIThemeProvider } from "./src/new-ui/styles/ThemeContext";
import ErrorBoundary from "./src/new-ui/components/common-components/ErrorBoundary";
import GlobalLoader from "./src/tsx-components/GlobalLoader";
import { LinkingPath } from "./src/utils/linking";
import {
  initializeDeepLinking,
  setNavigationRef,
} from "./src/utils/deepLinkHandler";
import UseNet from "./src/utils/UseNet";
import AppLockScreen from "./src/components/common-components/AppLockScreen";
import AppGateOverlay from "./src/components/common-components/AppGateOverlay";
import BootHydrationOverlay from "./src/tsx-components/BootHydrationOverlay";
import Toast from "./src/components/common-components/Toast";
import ForceUpdateModal from "./src/components/common-components/ForceUpdateModal";
import { AppLockProvider } from "./src/contexts/AppLockContext";
// Import config for verification (remove after testing)
import { EnvConfig } from "./src/config/env.config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppVersionCheck } from "./src/hooks/useAppVersionCheck";
import FCMService from "./src/services/FCMService";
import FCMTokenManager from "./src/components/common-components/FCMTokenManager";
import UsersMeHydrator from "./src/components/common-components/UsersMeHydrator";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GorhomBottomSheetProvider } from "@new-ui/components/common-components/GorhomBottomSheet";

/**
 * Resolve a deep-link URL from an FCM `data` payload. The backend may send the
 * link under `deeplink` / `deepLink` / `deep_link`; for crypto requests it also
 * carries `request_id`, from which we build the canonical link. Returns null
 * when nothing routable is present.
 */
const resolveNotificationDeepLink = (data = {}) =>
  data?.deeplink ||
  data?.deepLink ||
  data?.deep_link ||
  (data?.request_id ? `payairo://requests/${data.request_id}` : null);

export default function App() {
  
  // -------------------- Redux State --------------------
  const { isLogin, tokens, showLoader, isCrypto, usersMe, userData } =
    useSelector((state) => state.authenticationSlice);

  const dispatch = useDispatch();

  console.log("Tokens ->",tokens)

  // -------------------- Navigation Ref --------------------
  // Create navigation ref for deep link navigation
  const navigationRef = useRef(null);
  // Store initial URL (notification / direct deep link) to replay after navigator is ready
  const initialUrlRef = useRef(null);

  // Set navigation ref for deep link handler
  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, []);

  // Wire React Query's focusManager to AppState so `refetchOnWindowFocus`
  // actually fires on native (it's a no-op otherwise). Active queries refetch
  // when the app returns to the foreground — smooth, no visible spinner.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
      // Consume any refresh flag left by the background push handler and
      // invalidate the right queries immediately (bypasses screen throttles).
      if (status === "active") {
        try {
          const raw = getItem(STORAGE_KEYS.PENDING_PUSH_REFRESH);
          if (raw) {
            removeItem(STORAGE_KEYS.PENDING_PUSH_REFRESH);
            const parsed = JSON.parse(raw);
            invalidateQueriesForNotification({
              eventType: parsed?.eventType,
              category: parsed?.category,
            });
          }
        } catch (_) {}
      }
    });
    return () => sub.remove();
  }, []);

  // -------------------- Local State --------------------
  const [appState, setAppState] = useState(AppState.currentState);
  const [isFetching, setisFetching] = useState(true);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(null);

  // -------------------- App Initialization --------------------
  // Fetch initial data when app loads
  useEffect(() => {
    getInitialData();
    // Safety backstop: never let the launch loader hang if a bootstrap await stalls.
    const bootTimeout = setTimeout(() => setisFetching(false), 6000);
    return () => clearTimeout(bootTimeout);
  }, []);

  // Reconnect/foreground re-hydration of /users/me is handled by <UsersMeHydrator /> (a
  // React-Query query: refetchOnReconnect + refetchOnWindowFocus), and the UseNet "Try
  // again" button forces a full refetch via queryClient.invalidateQueries().

  // -------------------- Deep Link Initialization --------------------
  // Initialize deep linking for referral codes
  useEffect(() => {
    const cleanup = initializeDeepLinking();
    return cleanup;
  }, []);

  // Fetch + hydrate the signed-in user's profile (/users/me). Reusable so it can run on
  // cold-launch bootstrap AND again when connectivity returns (offline launch strands the
  // raw fetch, leaving an empty "dummy user" until this re-runs). A ref prevents overlapping
  // in-flight calls. Returns true if the profile was hydrated.
  const usersMeInFlightRef = useRef(false);
  const hydrateUsersMe = useCallback(async () => {
    if (usersMeInFlightRef.current) return false;
    usersMeInFlightRef.current = true;
    try {
      const me = await userApiClient.get(USER_AUTH.USERS_ME);
      if (me?.ok && me?.data) {
        setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(me?.data?.user || {}));
        useDispatchAction(hydrateUserFromMe(me.data));
        const coinmeAccountId = me.data?.caas_onboarding?.caas_customer_id;
        if (coinmeAccountId != null) {
          scheduleOnUserLoggedIn(String(coinmeAccountId));
        }
        return true;
      }
      return false;
    } catch (e) {
      if (e?.response?.status === 401) {
        clearAuthSession();
        useDispatchAction(setTokens(null));
        useDispatchAction(setAppAccessGranted(false));
      } else {
        console.log("[App] Failed to fetch /users/me:", e?.message || e);
      }
      return false;
    } finally {
      usersMeInFlightRef.current = false;
    }
  }, []);

  // Get all necessary data from storage and set in Redux
  const getInitialData = async () => {
    try {
      const session = readAuthSession();
      const guide = getItem(STORAGE_KEYS.GUIDE) || null;
      const selectedCurrency = getItem(STORAGE_KEYS.SELECTED_CURRENCY) || null;
      const totalDisbursable = getItem(STORAGE_KEYS.TOTAL_DISBURSABLE) || null;
      const cryptoData = getItem(STORAGE_KEYS.CRYPTO_DATA) || null;
      const allCryptoBalances = getItem(STORAGE_KEYS.ALL_CRYPTO_BALANCES) || null;

      bootstrapCoinmeRisk().catch(() => {});

      if (session.tokens) {
        useDispatchAction(setTokens(session.tokens));
        if (guide) {
          try {
            useDispatchAction(setShowGuide(JSON.parse(guide)));
          } catch {
            // ignore invalid guide cache
          }
        }

        // Seed the header identity from the last-known persisted profile so it shows
        // immediately — even on an OFFLINE launch, before /users/me can be re-fetched.
        const persistedUser = getItem(STORAGE_KEYS.USER_DATA);
        if (persistedUser) {
          try {
            const parsedUser = JSON.parse(persistedUser);
            if (parsedUser && Object.keys(parsedUser).length > 0) {
              useDispatchAction(setUserData(parsedUser));
            }
          } catch {
            // ignore corrupt cached user
          }
        }

        const applyLoggedInBootstrap = (tokensForMerchant) => {
          getMerchentRequest(tokensForMerchant);
          useDispatchAction(setAppAccessGranted(true));

          if (selectedCurrency) {
            useDispatchAction(setSelectedCurrency(JSON.parse(selectedCurrency)));
          }
          if (totalDisbursable) {
            useDispatchAction(setTotalDisbursable(JSON.parse(totalDisbursable)));
          }
          if (cryptoData) {
            useDispatchAction(setCryptoData(JSON.parse(cryptoData)));
          }
          if (allCryptoBalances) {
            useDispatchAction(
              setAllCryptoBalances(JSON.parse(allCryptoBalances))
            );
          }
        };

        // Grant app access SYNCHRONOUSLY from MMKV for a completed session (tokens +
        // onboardingComplete). This flips `isLogin` immediately so the root gate shows the
        // app — never the Auth stack — no matter how slow/offline the network is. Wallet +
        // /users/me hydrate afterwards (best-effort) and must NOT block this grant.
        // Only a completed onboarding enters the app; step 1 (KYC fetched, not verified) falls
        // through to the AuthStack, which getAuthStackInitialRoute() resolves to KYC verify.
        const grantedUpFront = !!session.tokens && session.onboardingComplete;
        if (grantedUpFront) {
          applyLoggedInBootstrap(session.tokens);
        }

        // Wallet data — best-effort; may stall/fail offline, so it runs AFTER access is granted.
        try {
          const wallet = await getWalletDataAuth();
          if (wallet) {
            useDispatchAction(setWalletData(wallet));
          }
        } catch (e) {
          console.log("[App] getWalletDataAuth failed:", e?.message || e);
        }

        await hydrateUsersMe();

        // If onboarding was completed during this launch (wasn't complete at start), grant now.
        if (!grantedUpFront) {
          const refreshed = readAuthSession();
          if (refreshed.tokens && refreshed.onboardingComplete) {
            applyLoggedInBootstrap(refreshed.tokens);
          }
        }
      }
    } catch (e) {
      console.log("[App] getInitialData error:", e?.message || e);
    } finally {
      // Always clear the boot gate so the launch loader can never hang (e.g. offline).
      setisFetching(false);
    }
  };



  // -------------------- State Compliance Gate --------------------
  // Show one-time disclosure for states that require it (CT first, MN/CA via same logic).
  // Fires after login + usersMe is hydrated. Uses MMKV for fast local version check.
  useEffect(() => {
    if (!isLogin || !usersMe) return;

    const stateCode = getProfileResidentialStateCode(userData, usersMe);
    if (!stateCode) return;

    const config = COMPLIANCE_CONFIG[stateCode];
    if (!config?.hasOneTimeDisclosure) return;

    const ackedVersion = getComplianceAckedVersion(stateCode);
    if (ackedVersion === config.disclosureVersion) return;

    const timer = setTimeout(() => {
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate(
          NAVIGATION_SCREENS.STATE_COMPLIANCE_ACKNOWLEDGMENT,
          { stateCode }
        );
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isLogin, usersMe]);

  // -------------------- Push Notifications (iOS + Android) --------------------
  // Request notification permissions (iOS: AUTHORIZED or PROVISIONAL)
  const requestPermission = async () => {
    try {
      const authorizationStatus = await messaging().requestPermission();
      const granted =
        authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!granted) {
        console.log("FCM permission denied");
      }
      await notifee.requestPermission();
    } catch (error) {
      console.error("[App] Permission request error:", error);
    }
  };

  // Display notification (foreground) - Android uses Notifee channel; iOS uses system
  // NOTE: Do NOT open deeplink here - that would redirect on receive, not on tap.
  // Deeplink is opened only when user TAPS the notification (via onForegroundEvent below).
  const onDisplayNotification = async (remoteMessage) => {
    const payload = {
      title: remoteMessage?.notification?.title || "PayAiro",
      body: remoteMessage?.notification?.body || "",
      data: remoteMessage?.data || {},
    };

    if (Platform.OS === "android") {
      const channelId = await notifee.createChannel({
        id: "default",
        name: "PayAiro Channel",
        sound: "default",
        importance: AndroidImportance.HIGH,
        vibration: true,
      });
      await notifee.displayNotification({
        ...payload,
        android: {
          channelId,
          sound: remoteMessage?.notification?.android?.sound || "default",
          importance: AndroidImportance.HIGH,
        },
      });
    } else {
      await notifee.displayNotification({
        ...payload,
        ios: { sound: "default" },
      });
    }
  };

  // Set up FCM: permission, token, foreground listener (iOS + Android)
  useEffect(() => {
    requestPermission();
    // Create default channel with HIGH importance at startup so background FCM notifications show as heads-up (popup)
    if (Platform.OS === "android") {
      notifee.createChannel({
        id: "default",
        name: "PayAiro Channel",
        sound: "default",
        importance: AndroidImportance.HIGH,
        vibration: true,
      }).catch((err) => console.warn("[App] createChannel at startup:", err));
    }
    getFCMToken();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      try {
        setItem(STORAGE_KEYS.DEBUG_LAST_NOTIFICATION_AT, new Date().toISOString());
      } catch (_) {}
      onDisplayNotification(remoteMessage);
      // Refresh the right queries (balances/history/requests/feed) when a push lands.
      invalidateQueriesForNotification(remoteMessage?.data);
    });

    // When app is in foreground: open deeplink only when user TAPS the notification
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const url = resolveNotificationDeepLink(detail?.notification?.data);
        if (url) Linking.openURL(url);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeNotifee();
    };
  }, []);

  // Get FCM token for push notifications
  const getFCMToken = async () => {
    try {
      // Initialize FCM Service (handles token caching, device ID, etc.)
      const fcmService = FCMService.getInstance();
      const token = await fcmService.initialize({
        onTokenReceived: (newToken) => {
          console.log("[App] FCM Token received via service");
          useDispatchAction(setFcmToken(newToken));
        },
        onTokenRefresh: (newToken) => {
          console.log("[App] FCM Token refreshed via service");
          useDispatchAction(setFcmToken(newToken));
        },
        onError: (error) => {
          console.error("[App] FCM Service error:", error);
        },
      });

      console.log("FCM Token =>", token);

      if (token) {
        useDispatchAction(setFcmToken(token));
      }
    } catch (error) {
      console.error("[App] Error getting FCM token:", error);
      
      // Fallback to direct messaging call if service fails
      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        if (token) {
          useDispatchAction(setFcmToken(token));
        }
      } catch (fallbackError) {
        console.error("[App] Fallback FCM token fetch failed:", fallbackError);
      }
    }
  };

  // Handle notification when app opened from background/quit (iOS + Android)
  useEffect(() => {
    // Cold start: store deeplink and replay in NavigationContainer onReady (avoids "navigation not initialized")
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        const url = resolveNotificationDeepLink(remoteMessage?.data);
        if (url) {
          initialUrlRef.current = url;
        }
      });

    // Also capture direct deep link (e.g. from Safari) if not from notification
    Linking.getInitialURL().then((url) => {
      if (url && !initialUrlRef.current) {
        initialUrlRef.current = url;
      }
    });

    // Background: navigator already ready, safe to open URL directly
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("remoteMessage =>", JSON.stringify(remoteMessage,null,2))
      // Refresh the right queries, then route to the deep link.
      invalidateQueriesForNotification(remoteMessage?.data);
      const url = resolveNotificationDeepLink(remoteMessage?.data);
      if (url) {
        Linking.openURL(url);
      }
    });

    return unsubscribe;
  }, []);

  // -------------------- API Requests --------------------
  // Get merchant payment requests
  const getMerchentRequest = async (token) => {
    const data = await getMechentPay(token?.access);
    useDispatchAction(setPendingRequest(data?.data?.total_pending_requests));
  };

  // -------------------- Version Check --------------------
  // Check for app updates on mount and when app comes to foreground
  const {
    shouldUpdate,
    storeVersion,
    needsForceUpdate,
    startUpdate,
  } = useAppVersionCheck({
    checkOnMount: true,
    checkOnForeground: true,
    checkInterval: 3600000, // Check every hour (optional)
    autoUpdate: false, // Set to true for automatic flexible updates (dev only)
  });

  // State to control modal visibility (for optional updates that can be dismissed)
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  // Once the user dismisses an OPTIONAL update, don't re-nag on every foreground —
  // the version check re-runs on foreground and would otherwise reopen the modal.
  // Forced updates ignore this guard and always re-show. Resets on cold start.
  const optionalUpdateDismissedRef = useRef(false);

  // Show modal when update is available - with 10 second delay to let LockScreen work first
  useEffect(() => {
    let timeoutId = null;

    // Suppress optional updates already dismissed this session; forced updates always show.
    if (shouldUpdate && optionalUpdateDismissedRef.current && !needsForceUpdate) {
      return;
    }

    if (shouldUpdate) {
      console.log('[App] Update available - will show modal after 10 seconds. needsForceUpdate:', needsForceUpdate);
      
      // Delay showing the update modal by 10 seconds
      // This ensures LockScreen has priority and can open/close properly
      timeoutId = setTimeout(() => {
        console.log('[App] 10 seconds passed - showing update modal now');
        setShowUpdateModal(true);
      }, 10000); // 10 seconds delay
    }
    
    // Cleanup timeout if component unmounts or shouldUpdate changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldUpdate, needsForceUpdate]);

  // Handle update button press
  const handleUpdate = async () => {
    console.log('[App] Update button pressed - needsForceUpdate:', needsForceUpdate);
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      await startUpdate(needsForceUpdate || false);
      console.log('[App] Update process started successfully');
      // Don't set isUpdating to false here - let the update process handle it
      // The modal will close when update starts (or user dismisses if optional)
    } catch (error) {
      console.error("[App] Error starting update:", error);
      setIsUpdating(false);
      
      // Set user-friendly error message
      const errorMessage = error?.message || 
        'Unable to start update. Please try again or update manually from the app store.';
      setUpdateError(errorMessage);
    }
  };

  // Handle close modal (for optional updates only)
  const handleCloseUpdateModal = () => {
    console.log('[App] Update modal closed by user');
    // Remember the dismissal so foreground re-checks don't reopen it this session.
    optionalUpdateDismissedRef.current = true;
    setShowUpdateModal(false);
    setIsUpdating(false);
    setUpdateError(null);
  };

  // Debug log for version check (remove in production)
  if (__DEV__) {
    useEffect(() => {
      // console.log('[App] Version Check Status:', JSON.stringify({
      //   shouldUpdate,
      //   storeVersion,
      //   needsForceUpdate,
      //   showUpdateModal,
      //   testMode: EnvConfig.ENABLE_VERSION_TEST_MODE,
      //   testVersion: EnvConfig.TEST_VERSION_OVERRIDE,
      // }, null, 2));
    }, [shouldUpdate, storeVersion, needsForceUpdate, showUpdateModal]);
  }

  // -------------------- Splash State --------------------
  const [splashVisible, setSplashVisible] = useState(true);

  // -------------------- Render Logic --------------------
  return (
    // Outermost so it also catches failures in the providers themselves.
    <ErrorBoundary>
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <NewUIThemeProvider>
            <BottomSheetModalProvider>
              <GorhomBottomSheetProvider>
                <PersistQueryProvider>
                  <FCMTokenManager />
                  <UsersMeHydrator />
                  <AppLockProvider>
                    <View style={{ flex: 1 }}>
                      <NavigationContainer
                        ref={navigationRef}
                        linking={LinkingPath}
                        onReady={() => {
                          if (initialUrlRef.current) {
                            const url = initialUrlRef.current;
                            initialUrlRef.current = null;
                            Linking.openURL(url);
                          }
                        }}
                        onStateChange={(state) => {
                          // Helper function to get the focused route recursively (handles nested navigators)
                          const getFocusedRoute = (navState) => {
                            if (!navState) return null;
                            const route = navState.routes[navState.index];
                            if (!route) return null;

                            // If this route has nested state, get the focused route from it
                            if (route.state) {
                              const nestedRoute = getFocusedRoute(route.state);
                              if (nestedRoute) return nestedRoute;
                            }

                            return route;
                          };

                          const focusedRoute = getFocusedRoute(state);
                          const currentRouteName = focusedRoute?.name || null;

                          // Dispatch current route to Redux
                          dispatch(setCurrentRoute(currentRouteName));

                          // Existing logic for active tabs
                          const currentRoute = state.routes[state.index];
                          // console.log('Current Screen:', currentRoute.name);
                          let activeTabs = "1"; // Default to home (or whichever default)

                          switch (currentRoute.name) {
                            case NAVIGATION_SCREENS.NEW_DASHBOARD:
                              // isCrypto true = fiat (activeTab "1"), false = crypto (activeTab "7")
                              if (isCrypto) {
                                activeTabs = "1";
                              } else {
                                activeTabs = "7";
                              }
                              break;
                            case NAVIGATION_SCREENS.TRANSACTION:
                            case NAVIGATION_SCREENS.UNIFIED_TRANSACTION:
                              activeTabs = "2";
                              break;
                            case NAVIGATION_SCREENS.SCANS:
                              activeTabs = "3";
                              break;
                            case NAVIGATION_SCREENS.REWARDS:
                              activeTabs = "4";
                              break;
                            case NAVIGATION_SCREENS.SETTING_SCREEN:
                              activeTabs = "5";
                              break;
                            default:
                              activeTabs = "1"; // Default to home
                          }

                          // Dispatch to update Redux store
                          dispatch(setActiveTab(activeTabs));
                        }}
                      >
                        <UseNet />
                        {showLoader && <GlobalLoader />}
                        {!splashVisible && <AppLockScreen />}

                        {!isLogin ? (
                          <AuthStack
                            key={getAuthStackInitialRoute()}
                            initialRouteName={getAuthStackInitialRoute()}
                          />
                        ) : (
                          <AppStack />
                        )}
                      </NavigationContainer>
                      {/* Toast moved outside NavigationContainer for proper z-index on iOS */}
                      <Toast />

                      {/* Force Update Modal - MUST be outside NavigationContainer for iOS */}
                      <ForceUpdateModal
                        isVisible={showUpdateModal}
                        message={
                          needsForceUpdate
                            ? "This update is required to continue using PayAiro. Please update now."
                            : `A new version (${storeVersion || "latest"}) is available with new features and improvements.`
                        }
                        storeVersion={storeVersion}
                        onUpdate={handleUpdate}
                        onClose={handleCloseUpdateModal}
                        forceUpdate={needsForceUpdate}
                        isUpdating={isUpdating}
                        updateError={updateError}
                      />

                      <AppGateOverlay />
                      {splashVisible && (
                        <AnimatedBootSplashV3
                          onAnimationEnd={() => setSplashVisible(false)}
                        />
                      )}
                      {/* After the splash animation ends, keep the UI covered until the
                          session bootstrap resolves — prevents the Auth stack flashing
                          before `isLogin` flips true on a logged-in cold launch. The
                          `!isLogin && hasCompletedSession()` clause keeps the loader (never the
                          Auth stack) for a persisted-logged-in user even if `isFetching` was
                          already cleared by the 6s safety timeout on a slow/offline launch. */}
                      {!splashVisible &&
                        (isFetching || (!isLogin && hasCompletedSession())) && (
                          <BootHydrationOverlay />
                        )}
                    </View>
                  </AppLockProvider>
                </PersistQueryProvider>
              </GorhomBottomSheetProvider>
            </BottomSheetModalProvider>
          </NewUIThemeProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}

