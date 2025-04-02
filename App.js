import {View, Text, AppState, Linking, Platform, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './src/navigations/AuthStack';
import {
  getBiometric,
  getGuide,
  getToken,
  getUser,
  getWalletDataAuth,
} from './src/services/Auth';
import useDispatchAction from './src/hooks/useDispatchAction';
import {
  setBiometricAvailable,
  setFcmToken,
  setGuides,
  setLogin,
  setPendingRequest,
  setTokens,
  setUserData,
  setWalletData,
} from './src/redux/slices/authenticationSlice';
import {useSelector} from 'react-redux';
import AppStack from './src/navigations/AppStack';
import {getMechentPay, getWallet} from './src/services/Services';
import ErrorToast from './src/components/ErrorToast';
import SplashScreen from './src/screens/Authentications/SplashScreen';
import notifee, {AndroidStyle} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import ReactNativeBiometrics from 'react-native-biometrics';
export default function App() {
  const {isLogin, tokens, errorMsg, successMsg, biometricAvailable} =
    useSelector(state => state.authenticationSlice);
  const [appState, setAppState] = useState(AppState.currentState);
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });
  const [isFetching, setisFetching] = useState(true);
  useEffect(() => {
    getInitialData();
  }, []);

  const [lastBackgroundTime, setLastBackgroundTime] = useState(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const authenticateWithBiometrics = async val => {
    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: 'Verify With PayAiro',
      });

      if (success) {
        // console.log('Biometric authentication successful', typeof success);
        let newVal = success;
        // onCfm();
        // Proceed with secure action after successful authentication
      } else {
        authenticateWithBiometrics();
      }
    } catch (error) {
      authenticateWithBiometrics();
    }
  };
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      // setErrorMessage('Biometric settings not supported on this platform.');
    }
  };
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
            if (timeElapsed > 60000) {
              // Show biometrics if app was in background for more than 1 minute
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

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      onDisplayNotification(remoteMessage);
    });
    requestPermission();
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    getFCMToken();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // console.log('Foreground message received:', remoteMessage);
      onDisplayNotification(remoteMessage);
    });

    requestPermission();

    return unsubscribe;
  }, []);

  const requestPermission = async () => {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      console.log('FCM permission granted');
    } else {
      console.log('FCM permission denied');
    }
    await notifee.requestPermission();
  };

  const onDisplayNotification = async remoteMessage => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'PayAiro Channel',
      sound: 'default',
    });

    // console.log(channelId, 'chanellId');

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

  const getFCMToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    // console.log('FCM Token:', token);
    if (token) {
      useDispatchAction(setFcmToken(token));
    }
  };

  const getMerchentRequest = async token => {
    const data = await getMechentPay(token?.access);
    useDispatchAction(setPendingRequest(data?.data?.total_pending_requests));
  };

  const getInitialData = async () => {
    const token = await getToken();
    const wallet = await getWalletDataAuth();
    const biometric = await getBiometric();
    if (token && wallet) {
      useDispatchAction(setTokens(token));
      useDispatchAction(setWalletData(wallet));
      getMerchentRequest(token);
      useDispatchAction(setLogin(true));
      useDispatchAction(setBiometricAvailable(biometric));
    }
    setisFetching(false);
  };
  if (isFetching) {
    return <SplashScreen />;
  }
  return (
    <NavigationContainer>
      {errorMsg || successMsg ? <ErrorToast /> : null}
      {!isLogin ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
}
