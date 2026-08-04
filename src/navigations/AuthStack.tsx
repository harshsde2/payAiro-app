import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import PDFViewer from "tsx-components/PDFViewer";
import SupportScreen from "screens/TSX-Screens/Settings/SupportScreen";
// New UI (design v2) auth screens
import NewOnboardingScreen from "../new-ui/screens/Auth/Onboarding";
import NewLoginScreen from "../new-ui/screens/Auth/Login";
import NewCreateAccountScreen from "../new-ui/screens/Auth/CreateAccount";
import NewOTPVerificationScreen from "../new-ui/screens/Auth/OTPVerification";
import NewCoinmeMobileAuthScreen from "../new-ui/screens/Auth/CoinmeMobileAuth";
import NewCommonErrorScreen from "../new-ui/screens/Auth/CommonError";
import NewKYCScreen from "../new-ui/screens/Auth/KYC";
import NewKYCVerifyScreen from "../new-ui/screens/Auth/KYCVerify";
import NewAddressScreen from "../new-ui/screens/Auth/Address";
import NewForgotPasswordScreen from "../new-ui/screens/Auth/ForgotPassword";
import NewForgotPasswordVerificationScreen from "../new-ui/screens/Auth/ForgotPasswordVerification";
import CustomHeader from "../new-ui/components/common-components/CustomHeader";
import FreshchatScreen from "screens/TSX-Screens/Settings/FreshchatScreen";

const Stack = createNativeStackNavigator();

function AuthStackHeader(props: React.ComponentProps<typeof CustomHeader>) {
  const title =
    typeof props.options?.headerTitle === "string"
      ? props.options.headerTitle
      : undefined;
  return <CustomHeader {...props} title={title} />;
}

type AuthStackProps = {
  initialRouteName?: string;
};

export default function AuthStack({
  initialRouteName = NAVIGATION_SCREENS.NEW_ONBOARDING,
}: AuthStackProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          gestureEnabled: true,
          animationTypeForReplace: "push",
        }}
        name={NAVIGATION_SCREENS.PDF_VIEWER}
        component={PDFViewer as any}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SUPPORT_SCREEN}
        component={SupportScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.FRESHCHAT_SCREEN}
        component={FreshchatScreen}
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
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH}
        component={NewCoinmeMobileAuthScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          gestureEnabled: true,
          animationTypeForReplace: "push",
          animation: "slide_from_bottom",
        }}
        name={NAVIGATION_SCREENS.NEW_COMMON_ERROR}
        component={NewCommonErrorScreen}
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
           headerTitle: "KYC Verify"
        }}
        name={NAVIGATION_SCREENS.NEW_KYC_VERIFY}
        component={NewKYCVerifyScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AuthStackHeader,
        }}
        name={NAVIGATION_SCREENS.NEW_ADDRESS}
        component={NewAddressScreen}
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
