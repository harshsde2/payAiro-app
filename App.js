import { View, Text, AppState, Linking, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigations/AuthStack';
import AppStack from './src/navigations/AppStack';
import {
  getBiometric,
  getGuide,
  getToken,
  getUser,
  getWalletDataAuth,
} from './src/services/Auth';
import useDispatchAction from './src/hooks/useDispatchAction';
import {
  setActiveTab,
  setBiometricAvailable,
  setFcmToken,
  setGuides,
  setLogin,
  setPendingRequest,
  setTokens,
  setUserData,
  setWalletData,
} from './src/redux/slices/authenticationSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getMechentPay, getWallet } from './src/services/Services';
import ErrorToast from './src/components/ErrorToast';
import SplashScreen from './src/screens/Authentications/SplashScreen';
import notifee, { AndroidStyle } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import ReactNativeBiometrics from 'react-native-biometrics';
import { QueryProvider } from './src/query/index';
import { setItem, STORAGE_KEYS } from './src/storage/mmkv';
import { ThemeProvider } from './src/styles';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NAVIGATION_SCREENS } from './src/navigations/navigationConstants';

export default function App() {
  // -------------------- Redux State --------------------
  const { isLogin, tokens, errorMsg, successMsg, biometricAvailable } =
    useSelector(state => state.authenticationSlice);

  const dispatch = useDispatch();

  // -------------------- Local State --------------------
  const [appState, setAppState] = useState(AppState.currentState);
  const [isFetching, setisFetching] = useState(true);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  // Initialize biometrics library
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  // -------------------- App Initialization --------------------
  // Fetch initial data when app loads
  useEffect(() => {
    getInitialData();
  }, []);

  // Get all necessary data from storage and set in Redux
  const getInitialData = async () => {
    const token = await getToken();
    const wallet = await getWalletDataAuth();
    const biometric = await getBiometric();

    if (token && wallet) {
      // Store token in MMKV for React Query
      setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(token));

      useDispatchAction(setTokens(token));
      useDispatchAction(setWalletData(wallet));
      getMerchentRequest(token);
      useDispatchAction(setLogin(true));
      useDispatchAction(setBiometricAvailable(biometric));
    }

    setisFetching(false);
  };

  // -------------------- Biometric Authentication --------------------
  // Handle biometric authentication when app comes to foreground
  useEffect(() => {
    if (isLogin && biometricAvailable) {
      const handleAppStateChange = nextAppState => {
        if (
          appState.match(/inactive|background/) &&
          nextAppState === 'active'
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
        'change',
        handleAppStateChange,
      );

      return () => {
        // Cleanup the event listener
        subscription.remove();
      };
    }
  }, [appState, lastBackgroundTime, isLogin, biometricAvailable]);

  // Function to handle biometric authentication
  const authenticateWithBiometrics = async val => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Verify With PayAiro',
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
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      // setErrorMessage('Biometric settings not supported on this platform.');
    }
  };

  // -------------------- Push Notifications --------------------
  // Set up notification listener when component mounts
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      onDisplayNotification(remoteMessage);
    });

    requestPermission();

    return unsubscribe;
  }, []);

  // Request notification permissions and get FCM token
  React.useEffect(() => {
    getFCMToken();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      onDisplayNotification(remoteMessage);
    });

    requestPermission();

    return unsubscribe;
  }, []);

  // Request notification permissions
  const requestPermission = async () => {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      // console.log('FCM permission granted');
    } else {
      console.log('FCM permission denied');
    }
    await notifee.requestPermission();
  };

  // Display a notification
  const onDisplayNotification = async remoteMessage => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'PayAiro Channel',
      sound: 'default',
    });

    await notifee.displayNotification({
      title: remoteMessage?.notification?.title,
      body: remoteMessage?.notification?.body,
      data: remoteMessage?.data,
      android: {
        channelId,
        sound: remoteMessage?.notification?.android?.sound,
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: 'https://gift.utribe.app/demo/images/avatar/GIFT-Icon.png',
        },
      },
    });
  };

  // Get FCM token for push notifications
  const getFCMToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();

    if (token) {
      useDispatchAction(setFcmToken(token));
    }
  };

  // -------------------- API Requests --------------------
  // Get merchant payment requests
  const getMerchentRequest = async token => {
    const data = await getMechentPay(token?.access);
    useDispatchAction(setPendingRequest(data?.data?.total_pending_requests));
  };

  // -------------------- Render Logic --------------------
  // Show splash screen while initializing
  if (isFetching) {
    return <SplashScreen />;
  }

  // console.log("isLogin =>", isLogin)
  // Render main app navigation
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <NavigationContainer
            onStateChange={(state) => {
              const currentRoute = state.routes[state.index];
              console.log('Current Screen:', currentRoute.name);
              let activeTabs = '1'; // Default to home (or whichever default)

              switch (currentRoute.name) {
                case NAVIGATION_SCREENS.NEW_DASHBOARD:
                  activeTabs = '1';
                  break;
                case NAVIGATION_SCREENS.TRANSACTION:
                  activeTabs = '2';
                  break;
                case NAVIGATION_SCREENS.SCANS:
                  activeTabs = '3';
                  break;
                case NAVIGATION_SCREENS.REWARDS:
                  activeTabs = '4';
                  break;
                case NAVIGATION_SCREENS.SETTING_SCREEN:
                  activeTabs = '5';
                  break;
                default:
                  activeTabs = '1'; // Default to home
              }

              // Dispatch to update Redux store
              dispatch(setActiveTab(activeTabs));
            }}
          >
            {errorMsg || successMsg ? <ErrorToast /> : null}
            {!isLogin ? <AuthStack /> : <AppStack />}
          </NavigationContainer>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
