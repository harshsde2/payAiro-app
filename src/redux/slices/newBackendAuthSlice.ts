import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UsersMePayload {
  user?: Record<string, any>;
  legal_identity?: Record<string, any>;
  caas_onboarding?: Record<string, any>;
  kyc?: Record<string, any>;
  onboarding_step_count?: number;
  profile?: Record<string, any>;
}

export interface NewBackendAuthState {
  isAuthenticated: boolean;
  isLogin: boolean;
  showLoader: boolean;
  tokens: { access?: string; refresh?: string } | null;
  userData: Record<string, any> | null;
  usersMe: UsersMePayload | null;
  walletData: Record<string, any> | null;
  kycStatus: Record<string, any> | null;
  errorMsg: string | null;
  successMsg: string | null;
}

const initialState: NewBackendAuthState = {
  isAuthenticated: false,
  isLogin: false,
  showLoader: false,
  tokens: null,
  userData: null,
  usersMe: null,
  walletData: null,
  kycStatus: null,
  errorMsg: null,
  successMsg: null,
};

const newBackendAuthSlice = createSlice({
  name: "authenticationSlice",
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
      state.isAuthenticated = action.payload;
    },
    setShowLoader: (state, action: PayloadAction<boolean>) => {
      state.showLoader = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ access?: string; refresh?: string } | null>
    ) => {
      state.tokens = action.payload;
    },
    setUserData: (state, action: PayloadAction<Record<string, any> | null>) => {
      state.userData = action.payload;
    },
    setWalletData: (
      state,
      action: PayloadAction<Record<string, any> | null>
    ) => {
      state.walletData = action.payload;
    },
    setKycStatus: (
      state,
      action: PayloadAction<Record<string, any> | null>
    ) => {
      state.kycStatus = action.payload;
    },
    setErrorMsg: (state, action: PayloadAction<string | null>) => {
      state.errorMsg = action.payload;
    },
    setSuccessMsg: (state, action: PayloadAction<string | null>) => {
      state.successMsg = action.payload;
    },
    setAuthBootstrapFromUserMe: (
      state,
      action: PayloadAction<UsersMePayload | null>
    ) => {
      state.usersMe = action.payload;
      state.userData = action.payload?.user || null;
      state.isLogin = true;
      state.isAuthenticated = true;
    },
    resetState: () => initialState,
  },
});

export const {
  setLogin,
  setShowLoader,
  setTokens,
  setUserData,
  setWalletData,
  setKycStatus,
  setErrorMsg,
  setSuccessMsg,
  setAuthBootstrapFromUserMe,
  resetState,
} = newBackendAuthSlice.actions;

export default newBackendAuthSlice.reducer;
