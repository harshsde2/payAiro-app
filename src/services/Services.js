import {getReq2, patchReq2, postReq2} from './Api';

export const sendOTP = async payload =>
  postReq2('auth/send-otp/', payload, null);
export const verify = async (payload, token) =>
  postReq2('auth/verify/', payload, null);
export const patchUser = async (payload, token) =>
  patchReq2('auth/update-account/', payload, token, true);
export const patchKyc = async (payload, token, isFormData) =>
  patchReq2('kyc/kyc-submition', payload, token, isFormData);

export const getWallet = async token => getReq2('wallet/details/', token);
export const getWalletBalance = async token =>
  getReq2('wallet/get_wallet_balance/', token);
export const getPayAeroTx = async token =>
  getReq2('wallet/alltransaction', token);
export const getKYC = async token => getReq2('kyc/kyc-submition', token);
export const getContacts = async token => getReq2('auth/contact-get/', token);
export const getContactListsForAll = async (
  identifierType,
  identifierValue,
  token,
) =>
  getReq2(
    `chat/contact-chat/?identifier_type=${identifierType}&identifier_value=${identifierValue}`,
    token,
  );
export const sendPayAero = async (payload, token, isFormData) =>
  postReq2(
    'auth/fortreetrust-bankaccount-transfer/',
    payload,
    token,
    isFormData,
  );

export const getMechentPay = async token =>
  getReq2('merchant/get-requests/', token);
export const confirmPayment = async (payload, token) =>
  postReq2('merchant/confirm-payment/', payload, token, true);
export const confirmPaymentQR = async (payload, token) =>
  postReq2('merchant/Qr-confirm-payment/', payload, token, true);
export const paymentRequested = async (payload, token) =>
  postReq2('wallet/payment-request/', payload, token, true);
export const getContactPay = async token =>
  getReq2('wallet/payment-request/pending/', token);
export const getPayRequest = async token =>
  getReq2('wallet/user-all-paymentrequest/', token);

export const payUserContact = async (id, token) =>
  postReq2(`wallet/payment-request/pay/${id}/`, {}, token, false);
export const getCryptoTx = async token =>
  getReq2('auth/trades-history/', token);
export const getMerchentTx = async token =>
  getReq2('merchant/transactions/', token);
export const getCryptoPrice = async token =>
  getReq2('auth/Crypto-price-list/', token);

export const addContact = async (payload, token) =>
  postReq2('auth/contact-adding/', payload, token, false);

export const checkUser = async (payload, token) =>
  postReq2('auth/verify-user/', payload, token, true);

export const cancelMerchent = async (payload, token) =>
  postReq2('merchant/cancel-payment/', payload, token, true);

export const cancelUser = async (id, token) =>
  postReq2(`wallet/cancel-payment-request/pay/${id}/`, {}, token, false);

export const sendCrypto = async (payload, token) =>
  postReq2(`wallet/sendcrypto/`, payload, token, true);

export const addFcm = async (payload, token) =>
  postReq2(`auth/store-token/`, payload, token, true);

export const logoutCall = async token => postReq2(`auth/logout/`, {}, token);

export const createPin = async (payload, token) =>
  postReq2(`auth/create-pin/`, payload, token, true);

export const patchPin = async (payload, token) =>
  patchReq2(`auth/change-pin/`, payload, token, true);

export const getPinFromSev = async token => getReq2('auth/get-pin/', token);

export const getStatementsTX = async (filters, token) =>
  getReq2(`wallet/filtered-transactions/?${filters}`, token);

export const getBankDetails = async token =>
  postReq2(`kyc/plaid-get-balance`, {}, token, false);

export const addBank = async token =>
  postReq2(`auth/fortreetrust-bankaccount/`, {}, token, false);
export const addBank2 = async token =>
  postReq2(`auth/fortreetrust-TraditionalIraAccount/`, {}, token, false);
export const getBanks = async token => getReq2('auth/my-bank-accounts/', token);
export const getBanksAllAccount = async token =>
  getReq2('auth/all-bank-accounts/', token);
export const addbankAccountRoth = async token =>
  postReq2(`auth/fortreetrust-RothIraAccount/`, {}, token, false);

export const selfTransfer = async (payload, token) =>
  postReq2(`auth/self-transfer/`, payload, token, false);
export const getBalance = async token =>
  getReq2('auth/all-bankaccount-balance/', token);
export const getNotification = async token =>
  getReq2('auth/notifications/', token);
export const getBlockchain = async token =>
  getReq2('auth/blockchain-data1/', token);

export const getBlockchains = async token =>
  getReq2('auth/blockchain-data2/', token);

export const buy = async (payload, token) =>
  postReq2(`auth/fortress/crypto/buy/`, payload, token, false);
export const sell = async (payload, token) =>
  postReq2(`auth/fortress/crypto/sell/`, payload, token, false);
export const getBalanceCrypto = async token =>
  getReq2('auth/bankaccount-crypto-balance/', token);

export const depositAddress = async (payload, token) =>
  postReq2(`auth/crypto-adress/`, payload, token, false);

export const uploadKYC = async token =>
  postReq2(`auth/upload-document-link/`, {}, token, false);
export const sendMessage = async (payload, token) =>
  postReq2(`chat/send-message/`, payload, token, false);

export const calculateQuantity = async (payload, token) =>
  postReq2(`auth/crypto-purchase-quantity/`, payload, token, false);

export const calculateAmount = async (payload, token) =>
  postReq2(`auth/crypto-sell-quantity/`, payload, token, false);

export const cryptoTransfer = async (payload, token) =>
  postReq2(`auth/crypto-transfer/`, payload, token, false);

export const assetsBalance = async (payload, token) =>
  postReq2(`auth/all-chain-bankaccount-balance/`, payload, token, false);

export const getAllReward = async token => getReq2('auth/my-rewards/', token);

export const redeemReward = async (payload, value, token) =>
  patchReq2(`auth/reward-redeem/${value}/`, payload, token);
