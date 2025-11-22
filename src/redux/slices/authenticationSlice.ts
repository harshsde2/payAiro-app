import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IUserData {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

interface IKycStatus {
  status: boolean;
  state: string;
  toast_message?: string;
}

interface IAuthState {
  isLogin: boolean;
  userData: IUserData | null;
  errorMsg: string | null;
  successMsg: string | null;
  kycStatus: IKycStatus | null;
}

const initialState: IAuthState = {
  isLogin: false,
  userData: null,
  errorMsg: null,
  successMsg: null,
  kycStatus: null,
};

const authenticationSlice = createSlice({
  name: "authenticationSlice",
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
    },
    setErrorMsg: (state, action: PayloadAction<string | null>) => {
      state.errorMsg = action.payload;
    },
    setSuccessMsg: (state, action: PayloadAction<string | null>) => {
      state.successMsg = action.payload;
    },
    setKycStatus: (state, action: PayloadAction<IKycStatus | null>) => {
      state.kycStatus = action.payload;
    },
  },
});

export const {
  setLogin,
  setErrorMsg,
  setSuccessMsg,
  setKycStatus,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;
