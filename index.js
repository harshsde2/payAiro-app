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
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
const rootApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => rootApp);
