import EncryptedStorage from "react-native-encrypted-storage";

export const setToken = async (token) => {
  await EncryptedStorage.setItem("guruPanda_token", JSON.stringify(token));
};

export const getGuide = async () => {
  const token = await EncryptedStorage.getItem("guide");
  if (!token) {
    return null;
  }
  return JSON.parse(token);
};

export const setGuide = async (token) => {
  await EncryptedStorage.setItem("guide", JSON.stringify(token));
};

export const getToken = async () => {
  const token = await EncryptedStorage.getItem("guruPanda_token");
  if (!token) {
    return null;
  }
  return JSON.parse(token);
};
export const setUser = async (data) => {
  await EncryptedStorage.setItem("user", JSON.stringify(data));
};
export const getUser = async () => {
  const data = await EncryptedStorage.getItem("user");
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};
export const setKYCAcceopted = async (data) => {
  await EncryptedStorage.setItem("kyc", JSON.stringify(data));
};
export const getKYCAccpted = async () => {
  const data = await EncryptedStorage.getItem("kyc");
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};
export const setPin = async (data) => {
  await EncryptedStorage.setItem("pin", JSON.stringify(data));
};
export const getPin = async () => {
  const data = await EncryptedStorage.getItem("pin");
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};
export const setWalletDataAuth = async (data) => {
  await EncryptedStorage.setItem("wallet", JSON.stringify(data));
};
export const getWalletDataAuth = async () => {
  const data = await EncryptedStorage.getItem("wallet");
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};
export const setKycStep = async (data) => {
  await EncryptedStorage.setItem("kyx", JSON.stringify(data));
};
export const getKyc = async () => {
  const data = await EncryptedStorage.getItem("kyx");
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};

export const setBiometric = async (data) => {
  await EncryptedStorage.setItem("biometric", JSON.stringify(data));
};
export const getBiometric = async () => {
  const data = await EncryptedStorage.getItem("biometric");
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};

/** Clear biometric preference (call on logout so next user starts with biometric disabled). */
export const clearBiometric = async () => {
  await EncryptedStorage.removeItem("biometric");
};
