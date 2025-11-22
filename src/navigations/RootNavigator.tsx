import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootStackParamList } from './types';
import { NAVIGATION_SCREENS } from './navigationConstants';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { RootState } from '../redux/store';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const isLogin = useSelector((state: RootState) => state.authenticationSlice.isLogin);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isLogin ? (
          <Stack.Screen
            name={NAVIGATION_SCREENS.AUTH_STACK}
            component={AuthStack}
          />
        ) : (
          <Stack.Screen
            name={NAVIGATION_SCREENS.APP_STACK}
            component={AppStack}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

