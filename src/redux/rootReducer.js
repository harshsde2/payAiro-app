import { combineReducers } from "@reduxjs/toolkit";
import authenticationSlice from "./slices/authenticationSlice";
import animationSlice from "./slices/animationSlice";

export default combineReducers({
  authenticationSlice,
  animationSlice,
});
