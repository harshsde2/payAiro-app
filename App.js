import notifee, { AndroidStyle } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import { AppState, Linking, Platform } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
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
  setBiometricAvailable,
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
import AppLockScreen from "./src/components/common-components/AppLockScreen";
import Toast from "./src/components/common-components/Toast";
import { AppLockProvider } from "./src/contexts/AppLockContext";
// Import config for verification (remove after testing)
import { EnvConfig } from "./src/config/env.config";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  // ========== ENVIRONMENT CONFIG VERIFICATION ==========
  // This log helps verify environment configuration is working
  // Remove or comment out after verification
  if (__DEV__) {
    console.log("=== ENVIRONMENT CONFIG TEST ===");
    console.log("ENV_NAME:", EnvConfig.ENV_NAME);
    console.log("ENV_TYPE:", EnvConfig.ENV_TYPE);
    console.log("API_BASE_URL:", EnvConfig.API_BASE_URL);
    console.log("APP_NAME:", EnvConfig.APP_NAME);
    console.log("=================================");
  }
  // ====================================================
  // -------------------- Redux State --------------------
  const { isLogin, tokens, biometricAvailable, showLoader, isCrypto } =
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

  // Initialize biometrics library
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

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
    // App Lock feature has been removed - always set biometric to false
    // This ensures users who had it enabled don't get stuck
    const biometric = false;

    if (token && wallet) {
      // Store token in MMKV for React Query
      // setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(token));]
      // console.log("Token:", token?.token);
      useDispatchAction(setTokens(JSON.parse(token)));
      useDispatchAction(setShowGuide(JSON.parse(guide)));
      useDispatchAction(setWalletData(wallet));
      getMerchentRequest(token);
      useDispatchAction(setLogin(true));
      useDispatchAction(setBiometricAvailable(biometric));

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

  // -------------------- Biometric Authentication --------------------
  // Handle biometric authentication when app comes to foreground
  useEffect(() => {
    if (isLogin && biometricAvailable) {
      const handleAppStateChange = (nextAppState) => {
        if (
          appState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App has come to the foreground
          if (lastBackgroundTime) {
            const timeElapsed = new Date().getTime() - lastBackgroundTime;
            // Show biometrics if app was in background for more than 1 minute
            if (timeElapsed > 60000) {
              authenticateWithBiometrics();
            }
          }
        }

        if (nextAppState.match(/inactive|background/)) {
          // App is going to the background
          setLastBackgroundTime(new Date().getTime());
        }

        setAppState(nextAppState);
      };

      // Trigger biometrics on app load/reload
      const currentTime = new Date().getTime();
      if (lastBackgroundTime) {
        const timeElapsed = currentTime - lastBackgroundTime;
        if (timeElapsed > 60000) {
          // If the app was inactive for more than 1 minute, trigger biometrics
          authenticateWithBiometrics();
        }
      } else {
        // If there's no `lastBackgroundTime` (fresh reload), trigger biometrics
        authenticateWithBiometrics();
      }

      // Add event listener for app state changes
      const subscription = AppState.addEventListener(
        "change",
        handleAppStateChange
      );

      return () => {
        // Cleanup the event listener
        subscription.remove();
      };
    }
  }, [appState, lastBackgroundTime, isLogin, biometricAvailable]);

  // Function to handle biometric authentication
  const authenticateWithBiometrics = async (val) => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: "Verify With PayAiro",
      });

      if (success) {
        // Biometric authentication successful
        let newVal = success;
        // onCfm(); // Uncomment if needed
        // Proceed with secure action after successful authentication
      } else {
        authenticateWithBiometrics();
      }
    } catch (error) {
      authenticateWithBiometrics();
    }
  };

  // Open device settings for biometric configuration
  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else if (Platform.OS === "android") {
      Linking.openSettings();
    } else {
      // setErrorMessage('Biometric settings not supported on this platform.');
    }
  };

  // -------------------- Push Notifications --------------------
  // Set up notification listener when component mounts
  useEffect(() => {
    if (Platform.OS == "android") {
      console.log("step 1");
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log("step 3");
        // Handle foreground messages
        console.log(
          "A new FCM message arrived!",
          JSON.stringify(remoteMessage, null, 2)
        );
        onDisplayNotification(remoteMessage);
      });

      requestPermission();

      return unsubscribe;
    }
  }, []);

  // console.log("step 1");
  // Request notification permissions and get FCM token
  React.useEffect(() => {
    if (Platform.OS == "android") {
      console.log("step 2");
      getFCMToken();

      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        onDisplayNotification(remoteMessage);
      });

      requestPermission();

      return unsubscribe;
    }
  }, []);

  // Request notification permissions
  const requestPermission = async () => {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      // console.log('FCM permission granted');
    } else {
      console.log("FCM permission denied");
    }
    await notifee.requestPermission();
  };

  // Display a notification
  const onDisplayNotification = async (remoteMessage) => {
    const channelId = await notifee.createChannel({
      id: "default",
      name: "PayAiro Channel",
      sound: "default",
    });

    if (remoteMessage?.data?.deeplink) {
      Linking.openURL(remoteMessage.data.deeplink);
    }
    console.log("remoteMessage =>", JSON.stringify(remoteMessage, null, 2));

    await notifee.displayNotification({
      title: remoteMessage?.notification?.title,
      body: remoteMessage?.notification?.body,
      data: remoteMessage?.data,
      android: {
        channelId,
        sound: remoteMessage?.notification?.android?.sound,
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: "https://gift.utribe.app/demo/images/avatar/GIFT-Icon.png",
        },
      },
    });
  };

  // Get FCM token for push notifications
  const getFCMToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();

    console.log("FCM Token =>", token);

    if (token) {
      useDispatchAction(setFcmToken(token));
    }
  };

  // -------------------- API Requests --------------------
  // Get merchant payment requests
  const getMerchentRequest = async (token) => {
    const data = await getMechentPay(token?.access);
    useDispatchAction(setPendingRequest(data?.data?.total_pending_requests));
  };

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
                <AppLockScreen />
                {!isLogin ? <AuthStack /> : <AppStack />}
              </NavigationContainer>
              {/* Toast moved outside NavigationContainer for proper z-index on iOS */}
              <Toast />
            </AppLockProvider>
          </PersistQueryProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
