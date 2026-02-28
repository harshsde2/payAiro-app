import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Login from "../screens/Authentications/Login";
import Name from "../screens/Authentications/Name";
import OTP from "../screens/Authentications/OTP";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import PDFViewer from "tsx-components/PDFViewer";
import CybridWebView from "screens/Authentications/CybridWebView";
import LandingPage from "screens/Authentications/LandingPage";
import Signup from "screens/Authentications/Signup";
import SelectStates from "tsx-components/modals/SelectStates";
import SupportScreen from "screens/TSX-Screens/Settings/SupportScreen";
import DebugTestScreen from "screens/TSX-Screens/DebugTestScreen";
// New UI (design v2) auth screens
import NewOnboardingScreen from "../new-ui/screens/Auth/Onboarding";
import NewLoginScreen from "../new-ui/screens/Auth/Login";
import NewCreateAccountScreen from "../new-ui/screens/Auth/CreateAccount";
import NewOTPVerificationScreen from "../new-ui/screens/Auth/OTPVerification";
import NewKYCScreen from "../new-ui/screens/Auth/KYC";
import NewForgotPasswordScreen from "../new-ui/screens/Auth/ForgotPassword";
import NewForgotPasswordVerificationScreen from "../new-ui/screens/Auth/ForgotPasswordVerification";
import CustomHeader from "../new-ui/components/common-components/CustomHeader";

const Stack = createNativeStackNavigator();

function AuthStackHeader(props: React.ComponentProps<typeof CustomHeader>) {
  const title =
    typeof props.options?.headerTitle === "string"
      ? props.options.headerTitle
      : undefined;
  return <CustomHeader {...props} title={title} />;
}

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName={NAVIGATION_SCREENS.NEW_ONBOARDING}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.LANDING_PAGE}
        component={LandingPage}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DEBUG_TEST}
        component={DebugTestScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.LOGIN}
        component={Login}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SIGNUP}
        component={Signup}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.OTP}
        component={OTP}
      />
   
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NAME}
        component={Name}
      />   
      <Stack.Screen
        options={{ 
          headerShown: false ,
          presentation: "modal",
          gestureEnabled: true,
          animationTypeForReplace: "push",
        }}
        name={NAVIGATION_SCREENS.PDF_VIEWER}
        component={PDFViewer as any}
      />
      <Stack.Screen
        options={{ 
          headerShown: false ,
          presentation: 'transparentModal',
          gestureEnabled: true,
          animation:'slide_from_bottom',
          animationTypeForReplace: "push",
        }}
        name={NAVIGATION_SCREENS.SELECT_STATES}
        component={SelectStates}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CYBRID_WEB_VIEW}
        component={CybridWebView}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SUPPORT_SCREEN}
        component={SupportScreen}
      />
      {/* New UI (design v2) auth flow */}
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_ONBOARDING}
        component={NewOnboardingScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AuthStackHeader,
        }}
        name={NAVIGATION_SCREENS.NEW_LOGIN}
        component={NewLoginScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AuthStackHeader,
        }}
        name={NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT}
        component={NewCreateAccountScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AuthStackHeader,
        }}
        name={NAVIGATION_SCREENS.NEW_OTP_VERIFICATION}
        component={NewOTPVerificationScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AuthStackHeader,
        }}
        name={NAVIGATION_SCREENS.NEW_KYC}
        component={NewKYCScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AuthStackHeader,
        }}
        name={NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD}
        component={NewForgotPasswordScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AuthStackHeader,
        }}
        name={NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD_VERIFICATION}
        component={NewForgotPasswordVerificationScreen}
      />
    </Stack.Navigator>
  );
}
