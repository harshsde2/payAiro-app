import { createSlice } from "@reduxjs/toolkit";
import { SVGEthrum, SVGPolly } from "../../constants/images";
import { themes } from "styles";
import { useAnimatedStyle } from "react-native-reanimated";

const initialState = {
  isLogin: false,
  activeTab: "1",
  userData: null,
  tokens: null,
  walletData: null,
  pendingRequest: 0,
  networkLists: [],
  selectedCrypto: null,
  calculatedBalance: 0,
  isCrypto: true,
  errorMsg: null,
  successMsg: null,
  defaultValue: null,
  fcmToken: null,
  biometricAvailable: false,
  showAppLock: false,
  activeTabCrypto: "1",
  bankBalance: null,
  bankLists: [],
  guide: false,
  CardSwitchDetails: {
    balanceHeaderText: "PayAiro Balance",
    payAiroBalanceText: "0.00",
    securityBalancetext: "0.00",
    idHeaderText: "PayAiro ID",
    payAiroIdText: "0",
    cardBackgroundColor: themes.light.colors.palette.white,
    lottieArrowBackgroundColor: themes.light.colors.palette.green700,
    useSharedValueOfBgColor: 0,
    useAniamationStylesForCard: {},
  },
  mxExternalAccountDetails: [],
  showLoader: false,
  showRedeemReward: false,
  showGuide: false,
  totalDisbursable: 0.0,
  totalDisbursablePending: 0.0,
};

const authenticationSlice = createSlice({
  name: "authenticationSlice",
  initialState: {
    ...initialState,
  },

  reducers: {
    setLogin: (state, action) => {
      state.isLogin = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setBankLists: (state, action) => {
      state.bankLists = action.payload;
    },
    setActiveTabCrypto: (state, action) => {
      state.activeTabCrypto = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setTokens: (state, action) => {
      state.tokens = action.payload;
    },
    setWalletData: (state, action) => {
      state.walletData = action.payload;
    },
    setPendingRequest: (state, action) => {
      state.pendingRequest = action.payload;
    },
    setNetworkLists: (state, action) => {
      state.networkLists = action.payload;
    },
    setSeletedCrypto: (state, action) => {
      state.selectedCrypto = action.payload;
    },
    setCalculatedBalance: (state, action) => {
      state.calculatedBalance = action.payload;
    },
    setisCrypto: (state, action) => {
      state.isCrypto = action.payload;
    },
    setErrorMsg: (state, action) => {
      state.errorMsg = action.payload;
    },
    setSuccessMsg: (state, action) => {
      state.successMsg = action.payload;
    },
    setDefaultValue: (state, action) => {
      state.defaultValue = action.payload;
    },
    setFcmToken: (state, action) => {
      state.fcmToken = action.payload;
    },
    setBiometricAvailable: (state, action) => {
      state.biometricAvailable = action.payload;
    },
    setShowApplock: (state, action) => {
      state.showAppLock = action.payload;
    },
    setBankbalances: (state, action) => {
      state.bankBalance = action.payload;
    },
    setGuides: (state, action) => {
      state.guide = action.payload;
    },
    setCardSwitchDetails: (state, action) => {
      state.CardSwitchDetails = action.payload;
    },
    setMxExternalAccountDetails: (state, action) => {
      state.mxExternalAccountDetails = action.payload;
    },
    setShowLoader: (state, action) => {
      state.showLoader = action.payload;
    },
    setShowRedeemReward: (state, action) => {
      state.showRedeemReward = action.payload;
    },
    setShowGuide: (state, action) => {
      state.showGuide = action.payload;
    },
    setTotalDisbursablePending: (state, action) => {
      state.totalDisbursablePending = action.payload;
    },
    setTotalDisbursable: (state, action) => {
      state.totalDisbursable = action.payload;
    },
    resetState: () => initialState,
  },
});
export const {
  setLogin,
  setActiveTab,
  setUserData,
  setTokens,
  setWalletData,
  setPendingRequest,
  setNetworkLists,
  setSeletedCrypto,
  setCalculatedBalance,
  setisCrypto,
  setErrorMsg,
  setSuccessMsg,
  setDefaultValue,
  setFcmToken,
  setBiometricAvailable,
  setShowApplock,
  setActiveTabCrypto,
  setBankbalances,
  setBankLists,
  setGuides,
  setCardSwitchDetails,
  setMxExternalAccountDetails,
  setShowLoader,
  resetState,
  setShowGuide,
  setShowRedeemReward,
  setTotalDisbursable,
  setTotalDisbursablePending,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;
