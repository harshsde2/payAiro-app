import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { NAVIGATION_SCREENS } from './navigationConstants';
import OnboardingScreen from '@screens/Auth/Onboarding';
import LoginScreen from '@screens/Auth/Login';
import CreateAccountScreen from '@screens/Auth/CreateAccount';
import OTPVerificationScreen from '@screens/Auth/OTPVerification';
import ForgotPasswordScreen from '@screens/Auth/ForgotPassword';
import ForgotPasswordVerificationScreen from '@screens/Auth/ForgotPasswordVerification';
import CustomHeader from '@components/common-components/CustomHeader';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <CustomHeader {...props} />,
        animation: 'slide_from_right',
      }}
      initialRouteName={NAVIGATION_SCREENS.ONBOARDING}
    >
      <Stack.Screen
        name={NAVIGATION_SCREENS.ONBOARDING}
        component={OnboardingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={NAVIGATION_SCREENS.LOGIN}
        component={LoginScreen}
      />
      <Stack.Screen
        name={NAVIGATION_SCREENS.CREATE_ACCOUNT}
        component={CreateAccountScreen}
      />
      <Stack.Screen
        name={NAVIGATION_SCREENS.OTP_VERIFICATION}
        component={OTPVerificationScreen}
      />
      <Stack.Screen
        name={NAVIGATION_SCREENS.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name={NAVIGATION_SCREENS.FORGOT_PASSWORD_VERIFICATION}
        component={ForgotPasswordVerificationScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;

