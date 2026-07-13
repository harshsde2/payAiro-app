/**
 * @format
 */
// #region agent log
// [DEBUG] Console suppression temporarily disabled for push notification debugging
// Original code suppressed all console output in release mode
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}
// #endregion
import 'react-native-gesture-handler';



import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import {setItem, STORAGE_KEYS} from './src/storage/mmkv';

// Background/quit push handler (headless JS). There is no live QueryClient here,
// so we must NOT touch the in-memory or persisted cache. Instead we stamp a flag
// that App.js consumes on next foreground to refresh the relevant queries.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  try {
    setItem(
      STORAGE_KEYS.PENDING_PUSH_REFRESH,
      JSON.stringify({
        at: Date.now(),
        eventType:
          remoteMessage?.data?.eventType ??
          remoteMessage?.data?.event_type ??
          null,
        category: remoteMessage?.data?.category ?? null,
      }),
    );
  } catch (_) {}
});
const rootApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => rootApp);
