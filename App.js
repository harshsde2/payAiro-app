import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import { AppState, Linking, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import useDispatchAction from "./src/hooks/useDispatchAction";
import AppStack from "./src/navigations/AppStack";
import AuthStack from "./src/navigations/AuthStack";
import { NAVIGATION_SCREENS } from "./src/navigations/navigationConstants";
import { PersistQueryProvider } from "./src/query/index";
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
import { getItem, setItem, STORAGE_KEYS } from "./src/storage/mmkv";
import { userApiClient } from "./src/api/userApiClient";
import { USER_AUTH } from "./src/api/endpoints";
import {
  hydrateUserFromMe,
  setAppAccessGranted,
} from "./src/redux/slices/newBackendAuthSlice";
import {
  clearAuthSession,
  readAuthSession,
  getAuthStackInitialRoute,
} from "./src/auth/authSession";
import { bootstrapMainAppSession } from "./src/auth/bootstrapMainAppSession";
import {
  bootstrapCoinmeRisk,
  scheduleOnUserLoggedIn,
} from "./src/services/coinmeRiskLifecycle";
import { ThemeProvider } from "./src/styles";
import { ThemeProvider as NewUIThemeProvider } from "./src/new-ui/styles/ThemeContext";
import GlobalLoader from "./src/tsx-components/GlobalLoader";
import { LinkingPath } from "./src/utils/linking";
import {
  initializeDeepLinking,
  setNavigationRef,
} from "./src/utils/deepLinkHandler";
import UseNet from "./src/utils/UseNet";
import KycWatchdog from "./src/components/common-components/KycWatchdog";
import KycBanner from "./src/components/common-components/KycBanner";
import AppLockScreen from "./src/components/common-components/AppLockScreen";
import AppGateOverlay from "./src/components/common-components/AppGateOverlay";
import Toast from "./src/components/common-components/Toast";
import ForceUpdateModal from "./src/components/common-components/ForceUpdateModal";
import { AppLockProvider } from "./src/contexts/AppLockContext";
// Import config for verification (remove after testing)
import { EnvConfig } from "./src/config/env.config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppVersionCheck } from "./src/hooks/useAppVersionCheck";
import FCMService from "./src/services/FCMService";
import FCMTokenManager from "./src/components/common-components/FCMTokenManager";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GorhomBottomSheetProvider } from "@new-ui/components/common-components/GorhomBottomSheet";

export default function App() {
  
  // -------------------- Redux State --------------------
  const { isLogin, tokens, showLoader, isCrypto } =
    useSelector((state) => state.authenticationSlice);

  const dispatch = useDispatch();

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

  // -------------------- Local State --------------------
  const [appState, setAppState] = useState(AppState.currentState);
  const [isFetching, setisFetching] = useState(true);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(null);

  // -------------------- App Initialization --------------------
  // Fetch initial data when app loads
  useEffect(() => {
    getInitialData();
  }, []);

  // -------------------- Deep Link Initialization --------------------
  // Initialize deep linking for referral codes
  useEffect(() => {
    const cleanup = initializeDeepLinking();
    return cleanup;
  }, []);

  // Get all necessary data from storage and set in Redux
  const getInitialData = async () => {
    const session = readAuthSession();
    const guide = getItem(STORAGE_KEYS.GUIDE) || null;
    const selectedCurrency = getItem(STORAGE_KEYS.SELECTED_CURRENCY) || null;
    const totalDisbursable = getItem(STORAGE_KEYS.TOTAL_DISBURSABLE) || null;
    const cryptoData = getItem(STORAGE_KEYS.CRYPTO_DATA) || null;
    const allCryptoBalances = getItem(STORAGE_KEYS.ALL_CRYPTO_BALANCES) || null;

    const wallet = await getWalletDataAuth();

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

      try {
        const me = await userApiClient.get(USER_AUTH.USERS_ME);
        if (me?.ok && me?.data) {
          setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(me?.data?.user || {}));
          useDispatchAction(hydrateUserFromMe(me.data));
          const coinmeAccountId = me.data?.caas_onboarding?.caas_customer_id;
          if (coinmeAccountId != null) {
            scheduleOnUserLoggedIn(String(coinmeAccountId));
          }
        }
      } catch (e) {
        if (e?.response?.status === 401) {
          clearAuthSession();
          useDispatchAction(setTokens(null));
          useDispatchAction(setAppAccessGranted(false));
        } else {
          console.log("[App] Failed to fetch /users/me:", e?.message || e);
        }
      }

      const refreshed = readAuthSession();

      const applyLoggedInBootstrap = (tokensForMerchant) => {
        if (wallet) {
          useDispatchAction(setWalletData(wallet));
        }
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

      if (refreshed.tokens && refreshed.onboardingComplete) {
        applyLoggedInBootstrap(refreshed.tokens);
      } else if (
        refreshed.tokens &&
        !refreshed.onboardingComplete &&
        refreshed.onboardingStep === 1
      ) {
        const result = await bootstrapMainAppSession(dispatch);
        if (result.ok) {
          const afterBootstrap = readAuthSession();
          if (afterBootstrap.tokens) {
            applyLoggedInBootstrap(afterBootstrap.tokens);
          }
        }
      }
    }

    setisFetching(false);
  };



  // -------------------- Push Notifications (iOS + Android) --------------------
  // Request notification permissions (iOS: AUTHORIZED or PROVISIONAL)
  const requestPermission = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:requestPermission',message:'Requesting FCM permission',data:{platform: Platform.OS},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      const authorizationStatus = await messaging().requestPermission();
      const granted =
        authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:requestPermission',message:'FCM permission result',data:{authorizationStatus, granted, isDevMode: __DEV__},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      if (!granted) {
        console.log("FCM permission denied");
      }
      await notifee.requestPermission();
    } catch (error) {
      console.error("[App] Permission request error:", error);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:requestPermission',message:'Permission request ERROR',data:{error: error?.message || String(error)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:useEffect:FCMSetup',message:'Setting up FCM (permission + token + listener)',data:{platform: Platform.OS, isDevMode: __DEV__},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:onMessage',message:'Foreground message received!',data:{messageId: remoteMessage?.messageId, title: remoteMessage?.notification?.title, body: remoteMessage?.notification?.body},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      onDisplayNotification(remoteMessage);
    });

    // When app is in foreground: open deeplink only when user TAPS the notification
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail?.notification?.data?.deeplink) {
        Linking.openURL(detail.notification.data.deeplink);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeNotifee();
    };
  }, []);

  // Get FCM token for push notifications
  const getFCMToken = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:getFCMToken',message:'Starting FCM token retrieval',data:{platform: Platform.OS, isDevMode: __DEV__},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    try {
      // Initialize FCM Service (handles token caching, device ID, etc.)
      const fcmService = FCMService.getInstance();
      const token = await fcmService.initialize({
        onTokenReceived: (newToken) => {
          console.log("[App] FCM Token received via service");
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:onTokenReceived',message:'FCM Token received via service callback',data:{tokenLength: newToken?.length, tokenPrefix: newToken?.substring(0,20)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          useDispatchAction(setFcmToken(newToken));
        },
        onTokenRefresh: (newToken) => {
          console.log("[App] FCM Token refreshed via service");
          useDispatchAction(setFcmToken(newToken));
        },
        onError: (error) => {
          console.error("[App] FCM Service error:", error);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:onError',message:'FCM Service error callback',data:{error: error?.message || String(error)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
        },
      });

      console.log("FCM Token =>", token);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:getFCMToken',message:'FCM token result from service',data:{hasToken: !!token, tokenLength: token?.length, tokenPrefix: token?.substring(0,20)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion

      if (token) {
        useDispatchAction(setFcmToken(token));
      }
    } catch (error) {
      console.error("[App] Error getting FCM token:", error);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:getFCMToken',message:'FCM token retrieval FAILED',data:{error: error?.message || String(error)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      
      // Fallback to direct messaging call if service fails
      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        if (token) {
          useDispatchAction(setFcmToken(token));
        }
      } catch (fallbackError) {
        console.error("[App] Fallback FCM token fetch failed:", fallbackError);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/29f1b34d-8424-4516-a8dc-528eb6502b04',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:getFCMToken:fallback',message:'Fallback ALSO failed',data:{error: fallbackError?.message || String(fallbackError)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
      }
    }
  };

  // Handle notification when app opened from background/quit (iOS + Android)
  useEffect(() => {
    // Cold start: store deeplink and replay in NavigationContainer onReady (avoids "navigation not initialized")
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.deeplink) {
          initialUrlRef.current = remoteMessage.data.deeplink;
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
      if (remoteMessage?.data?.deeplink) {
        Linking.openURL(remoteMessage.data.deeplink);
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

  // Show modal when update is available - with 10 second delay to let LockScreen work first
  useEffect(() => {
    let timeoutId = null;
    
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
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <NewUIThemeProvider>
            <BottomSheetModalProvider>
              <GorhomBottomSheetProvider>
                <PersistQueryProvider>
                  <FCMTokenManager />
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
                        {isLogin && <KycWatchdog />}
                        {isLogin && <KycBanner />}
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
                    </View>
                  </AppLockProvider>
                </PersistQueryProvider>
              </GorhomBottomSheetProvider>
            </BottomSheetModalProvider>
          </NewUIThemeProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

