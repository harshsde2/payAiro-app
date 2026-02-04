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

const Stack = createNativeStackNavigator();
export default function AuthStack() {
  return (
    <Stack.Navigator
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
    </Stack.Navigator>
  );
}
