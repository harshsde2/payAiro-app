import {store} from '../redux/store';

export default function useSelectorAction() {
  const {
    isLogin,
    activeTab,
    userData,
    tokens,
    walletData,
    pendingRequest,
    selectedCrypto,
    networkLists,
    isCrypto,
    calculatedBalance,
    errorMsg,
    successMsg,
    defaultValue,
    fcmToken,
    biometricAvailable,
    bankBalance,
    bankLists,
    kycStatus,
    allCryptoBalances,
  } = store.getState().authenticationSlice;

  return {
    isLogin,
    activeTab,
    userData,
    tokens,
    walletData,
    pendingRequest,
    selectedCrypto,
    networkLists,
    isCrypto,
    calculatedBalance,
    errorMsg,
    successMsg,
    defaultValue,
    fcmToken,
    biometricAvailable,
    bankBalance,
    bankLists,
    kycStatus,
    allCryptoBalances,
  };
}
