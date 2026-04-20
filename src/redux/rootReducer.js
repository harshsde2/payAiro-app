import { combineReducers } from "@reduxjs/toolkit";
import authenticationSlice from "./slices/newBackendAuthSlice";
import onboardingSlice from "./slices/newOnboardingSlice";
import animationSlice from "./slices/animationSlice";

export default combineReducers({
  authenticationSlice,
  onboardingSlice,
  animationSlice,
});
