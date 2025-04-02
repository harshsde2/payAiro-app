import {combineReducers} from '@reduxjs/toolkit';
import authenticationSlice from './slices/authenticationSlice';

export default combineReducers({
  authenticationSlice,
});
