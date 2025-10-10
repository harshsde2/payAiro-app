import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Address from "../screens/Authentications/Address";
import DebitCard from "../screens/Authentications/DebitCard";
import IDProof from "../screens/Authentications/IDProof";
import Invite from "../screens/Authentications/Invite";
import Legal from "../screens/Authentications/Legal";
import Login from "../screens/Authentications/Login";
import Name from "../screens/Authentications/Name";
import OTP from "../screens/Authentications/OTP";
import PayTag from "../screens/Authentications/PayTag";
import Pincode from "../screens/Authentications/Pincode";
import Signature from "../screens/Authentications/Signature";
import Dob from "../screens/Authentications/Dob";
import SuccesScreen from "../screens/Authentications/SuccesScreen";
import SelfieScreen from "../screens/Authentications/SelfieScreen";
import Biometcric from "../screens/Dashboard/Biometcric";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import PDFViewer from "tsx-components/PDFViewer";
import CybridWebView from "screens/Authentications/CybridWebView";
import LandingPage from "screens/Authentications/LandingPage";
import Signup from "screens/Authentications/Signup";
import SelectStates from "tsx-components/modals/SelectStates";

const Stack = createNativeStackNavigator();
export default function AuthStack() {
  return (
    <Stack.Navigator
      headerMode="none"
      initialRouteName={NAVIGATION_SCREENS.LANDING_PAGE}
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
        name={NAVIGATION_SCREENS.INVITE}
        component={Invite}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADDRESS}
        component={Address}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NAME}
        component={Name}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ID_PROOF}
        component={IDProof}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SIGNATURE}
        component={Signature}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DEBIT_CARD}
        component={DebitCard}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.LEGAL}
        component={Legal}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.PAY_TAG}
        component={PayTag}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.PINCODE}
        component={Pincode}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SUCCESS_SCREEN}
        component={SuccesScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SELFIE_SCREEN}
        component={SelfieScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.BIOMETRIC}
        component={Biometcric}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DOB}
        component={Dob}
      />
      <Stack.Screen
        options={{ 
          headerShown: false ,
          presentation: "modal",
          gestureEnabled: true,
          animationTypeForReplace: "push",
        }}
        name={NAVIGATION_SCREENS.PDF_VIEWER}
        component={PDFViewer}
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
    </Stack.Navigator>
  );
}
