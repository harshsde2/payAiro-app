import notifee from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import { AppState, Linking, Platform } from "react-native";
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
  setLogin,
  setPendingRequest,
  setSelectedCurrency,
  setShowGuide,
  setTokens,
  setTotalDisbursable,
  setWalletData,
} from "./src/redux/slices/authenticationSlice";
import SplashScreen from "./src/screens/Authentications/SplashScreen";
import { getWalletDataAuth } from "./src/services/Auth";
import { getMechentPay } from "./src/services/Services";
import { getItem, STORAGE_KEYS } from "./src/storage/mmkv";
import { ThemeProvider } from "./src/styles";
import GlobalLoader from "./src/tsx-components/GlobalLoader";
import { LinkingPath } from "./src/utils/linking";
import {
  initializeDeepLinking,
  setNavigationRef,
} from "./src/utils/deepLinkHandler";
import UseNet from "./src/utils/UseNet";
import KycWatchdog from "./src/components/common-components/KycWatchdog";
import KycBanner from "./src/components/common-components/KycBanner";
import LockScreen from "./src/components/common-components/LockScreen";
import Toast from "./src/components/common-components/Toast";
import ForceUpdateModal from "./src/components/common-components/ForceUpdateModal";
import { AppLockProvider } from "./src/contexts/AppLockContext";
// Import config for verification (remove after testing)
import { EnvConfig } from "./src/config/env.config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppVersionCheck } from "./src/hooks/useAppVersionCheck";
import FCMService from "./src/services/FCMService";
import FCMTokenManager from "./src/components/common-components/FCMTokenManager";

export default function App() {
  // ========== ENVIRONMENT CONFIG VERIFICATION ==========
  // This log helps verify environment configuration is working
  // Remove or comment out after verification
  // if (__DEV__) {
  //   console.log("=== ENVIRONMENT CONFIG TEST ===");
  //   console.log("ENV_NAME:", EnvConfig.ENV_NAME);
  //   console.log("ENV_TYPE:", EnvConfig.ENV_TYPE);
  //   console.log("API_BASE_URL:", EnvConfig.API_BASE_URL);
  //   console.log("APP_NAME:", EnvConfig.APP_NAME);
  //   console.log("=================================");
  // }
  // ====================================================
  // -------------------- Redux State --------------------
  const { isLogin, tokens, showLoader, isCrypto } =
    useSelector((state) => state.authenticationSlice);

  const dispatch = useDispatch();

  // -------------------- Navigation Ref --------------------
  // Create navigation ref for deep link navigation
  const navigationRef = useRef(null);

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
    const token = getItem(STORAGE_KEYS.AUTH_TOKENS) || null;
    const guide = getItem(STORAGE_KEYS.GUIDE) || null;
    const selectedCurrency = getItem(STORAGE_KEYS.SELECTED_CURRENCY) || null;
    const totalDisbursable = getItem(STORAGE_KEYS.TOTAL_DISBURSABLE) || null;
    const cryptoData = getItem(STORAGE_KEYS.CRYPTO_DATA) || null;
    const allCryptoBalances = getItem(STORAGE_KEYS.ALL_CRYPTO_BALANCES) || null;
    // setItem(STORAGE_KEYS.GUIDE, JSON.stringify(true));

    // const redeem = getItem(STORAGE_KEYS.REDEEM_REWARD);
    const wallet = await getWalletDataAuth();

    if (token && wallet) {
      // Store token in MMKV for React Query
      // setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(token));]
      // console.log("Token:", token?.token);
      useDispatchAction(setTokens(JSON.parse(token)));
      useDispatchAction(setShowGuide(JSON.parse(guide)));
      useDispatchAction(setWalletData(wallet));
      getMerchentRequest(token);
      useDispatchAction(setLogin(true));

      // Restore selectedCurrency, totalDisbursable, cryptoData, and allCryptoBalances from MMKV storage
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
        useDispatchAction(setAllCryptoBalances(JSON.parse(allCryptoBalances)));
      }
    }

    setisFetching(false);
  };



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
  const onDisplayNotification = async (remoteMessage) => {
    if (remoteMessage?.data?.deeplink) {
      Linking.openURL(remoteMessage.data.deeplink);
    }

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
      });
      await notifee.displayNotification({
        ...payload,
        android: {
          channelId,
          sound: remoteMessage?.notification?.android?.sound || "default",
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
    getFCMToken();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      onDisplayNotification(remoteMessage);
    });

    return unsubscribe;
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
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.deeplink) {
          Linking.openURL(remoteMessage.data.deeplink);
        }
      });

    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
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

  // -------------------- Render Logic --------------------
  // Show splash screen while initializing
  if (isFetching) {
    return <SplashScreen />;
  }

  // console.log("isLogin =>", isLogin);
  // Render main app navigation
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <PersistQueryProvider>
            <FCMTokenManager />
            <AppLockProvider>
              <NavigationContainer
                ref={navigationRef}
                linking={LinkingPath}
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
                <LockScreen />

                {!isLogin ? <AuthStack /> : <AppStack />}
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
            </AppLockProvider>
          </PersistQueryProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

