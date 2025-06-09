import { View, Text } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "../screens/Dashboard/Dashboard";
import Transaction from "../screens/Authentications/Transaction";
import TransactionSuccess from "../screens/Authentications/TransactionSuccess";
import TransactionDetails from "../screens/Authentications/TransactionDetails";
import Scans from "../screens/Scans/Scans";
import ScanPay from "../screens/Scans/ScanPay";
import Send from "../screens/Dashboard/Send";
import Receive from "../screens/Dashboard/Receive";
import Rewards from "../screens/Rewards/Rewards";
import SettingScreen from "../screens/SettingScreen/SettingScreen";
import Notification from "../screens/SettingScreen/Notification";
import Personal from "../screens/SettingScreen/Personal";
import AddCard from "../screens/SettingScreen/AddCard";
import Widhdraw from "../screens/Authentications/Widhdraw";
import SuccesScreen from "../screens/Authentications/SuccesScreen";
import RequestMoney from "../screens/Authentications/RequestMoney";
import SendToken from "../screens/Dashboard/SendToken";
import SendReceipt from "../screens/Authentications/SendReceipt";
import ReceiveToken from "../screens/Authentications/ReceiveToken";
import Legal from "../screens/Authentications/Legal";
import DebitCard from "../screens/Authentications/DebitCard";
import Signature from "../screens/Authentications/Signature";
import IDProof from "../screens/Authentications/IDProof";
import Name from "../screens/Authentications/Name";
import Address from "../screens/Authentications/Address";
import Scratch from "../screens/Rewards/Scratch";
import ScratchCard from "../components/ScratchCard";
import AddContact from "../screens/Dashboard/AddContact";
import ContactScreen from "../screens/Dashboard/ContactScreen";
import Address2 from "../screens/Authentications/Address2";
import IDProof2 from "../screens/Authentications/IdProof2";
import Signature2 from "../screens/Authentications/Signature2";
import Security from "../screens/SettingScreen/Security";
import Dob2 from "../screens/Authentications/Dob2";
import ContactTx from "../screens/Dashboard/ContactTx";
import SelfieScreen from "../screens/Authentications/SelfieScreen";
import Settings2 from "../screens/Authentications/Settings2";
import TXViewDetails from "../screens/Dashboard/TXViewDetails";
import Statement from "../screens/Dashboard/Statement";
import StatementDetails from "../screens/Dashboard/StatementDetails";
import BankDetails from "../screens/Dashboard/BankDetails";
import ChangePinScreen from "../screens/SettingScreen/ChangePinScreen";
import AlertScreen from "../screens/SettingScreen/AlertScreen";
import ChatScreen from "../screens/SettingScreen/ChatScreen";
import AchScreen from "../screens/Dashboard/AchScreen";
import AddCreditCard from "../screens/Dashboard/AddCreditCard";
import DeviceManagement from "../screens/SettingScreen/DeviceManagement";
import ScratchDetails from "../components/ScratchDetails";
import VouchersScreens from "../screens/Dashboard/VouchersScreens";
import SelectBankScreen from "../screens/Dashboard/SelectBankScreen";
import CryptoDashboard from "../screens/Crypto/CryptoDashboard";
import CryptoScreen from "../screens/Crypto/CryptoScreen";
import StocksScreen from "../screens/Crypto/StocksScreen";
import HoldingsScreen from "../screens/Crypto/HoldingsScreen";
import Buy from "../screens/Crypto/Buy";
import Sell from "../screens/Crypto/Sell";
import DepositScreen from "../screens/Crypto/DepositScreen";
import InAppKYCBrowser from "../screens/Crypto/InAppKYCBrowser";
import DepositScreen2 from "../screens/Crypto/DepositScreen2";
import ChooseCurrency from "../screens/Crypto/ChooseCurrency";
import WithdrawScreen from "../screens/Crypto/WithdrawScreen";
import IntraAccountTransfer from "../screens/Dashboard/IntraAccountTransfer";
import DetailsCryptoScreen from "../screens/Crypto/DetailsCryptoScreen";
import DashboardRefactored from "../screens/Dashboard/DashboardRefactored";
import NewDashboard from "../screens/Dashboard/NewDashboard";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import ConnectWidgetTest from "screens/TSX-Screens/Fortess/ConnectWidgetTest";
import TrustedCircle from "screens/TSX-Screens/TrustedCircle";
import RWA from "screens/TSX-Screens/RWA/RWA";
import RealState from "screens/TSX-Screens/RWA/RealState";
import Stocks from "screens/TSX-Screens/RWA/Stocks";
import RealStateProfile from "screens/TSX-Screens/RWA/RealStateProfile";
import StocksProfile from "screens/TSX-Screens/RWA/StocksProfile";
import MyRWAAssets from "screens/TSX-Screens/RWA/MyRWAAssets";
import TransactionSuccessScreen from "screens/TSX-Screens/RWA/TransactionSuccessScreen";
import CommonAssetsScreen from "screens/TSX-Screens/RWA/CommonAssetsScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      headerMode="none"
      initialRouteName={NAVIGATION_SCREENS.NEW_DASHBOARD}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DASHBOARD}
        component={Dashboard}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_DASHBOARD}
        component={NewDashboard}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DASHBOARD_REFACTORED}
        component={DashboardRefactored}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.TRANSACTION}
        component={Transaction}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.TRANSACTION_SUCCESS}
        component={TransactionSuccess}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.TRANSACTION_DETAILS}
        component={TransactionDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SCANS}
        component={Scans}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SCAN_PAY}
        component={ScanPay}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SEND}
        component={Send}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.RECEIVE}
        component={Receive}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.REWARDS}
        component={Rewards}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SETTING_SCREEN}
        component={SettingScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NOTIFICATION}
        component={Notification}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.PERSONAL}
        component={Personal}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADD_CARD}
        component={AddCard}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.WITHDRAW}
        component={Widhdraw}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.REQUEST_MONEY}
        component={RequestMoney}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SEND_TOKEN}
        component={SendToken}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SEND_RECEIPT}
        component={SendReceipt}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.RECEIVE_TOKEN}
        component={ReceiveToken}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADDRESS2}
        component={Address2}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ID_PROOF2}
        component={IDProof2}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SCRATCH}
        component={Scratch}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SCRATCH_CARD}
        component={ScratchCard}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADD_CONTACT}
        component={AddContact}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CONTACT_SCREEN}
        component={ContactScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SIGNATURE2}
        component={Signature2}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DOB2}
        component={Dob2}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SECURITY}
        component={Security}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CONTACT_TX}
        component={ContactTx}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SETTINGS2}
        component={Settings2}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.TX_VIEW_DETAILS}
        component={TXViewDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.STATEMENT}
        component={Statement}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.STATEMENT_DETAILS}
        component={StatementDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.BANK_DETAILS}
        component={BankDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CHANGE_PIN_SCREEN}
        component={ChangePinScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ALERT_SCREEN}
        component={AlertScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CHAT_SCREEN}
        component={ChatScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ACH_SCREEN}
        component={AchScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADD_CREDIT_CARD}
        component={AddCreditCard}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DEVICE_MANAGEMENT}
        component={DeviceManagement}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SCRATCH_DETAILS}
        component={ScratchDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.VOUCHERS_SCREENS}
        component={VouchersScreens}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SELECT_BANK_SCREEN}
        component={SelectBankScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_DASHBOARD}
        component={CryptoDashboard}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_SCREEN}
        component={CryptoScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.STOCKS_SCREEN}
        component={StocksScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.HOLDINGS_SCREEN}
        component={HoldingsScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SELL}
        component={Sell}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DEPOSIT_SCREEN}
        component={DepositScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.IN_APP_KYC_BROWSER}
        component={InAppKYCBrowser}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DEPOSIT_SCREEN2}
        component={DepositScreen2}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CHOOSE_CURRENCY}
        component={ChooseCurrency}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.WITHDRAW_SCREEN}
        component={WithdrawScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.INTRA_ACCOUNT_TRANSFER}
        component={IntraAccountTransfer}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.BUY}
        component={Buy}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DETAILS_CRYPTO_SCREEN}
        component={DetailsCryptoScreen}
      />
      <Stack.Screen
        options={{ headerShown: false, headerTitle: "Link External Account" }}
        name={NAVIGATION_SCREENS.MX_CONNECT_WIDGET_SCREEN}
        component={ConnectWidgetTest}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.TRUSTED_CIRCLE}
        component={TrustedCircle}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.RWA}
        component={RWA}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.MY_RWA_ASSETS}
        component={MyRWAAssets}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.REAL_STATE}
        component={RealState}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.STOCKS}
        component={Stocks}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.REAL_STATE_PROFILE}
        component={RealStateProfile}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.STOCK_PROFILE}
        component={StocksProfile}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.TRANSACTION_SUCCESS_SCREEN}
        component={TransactionSuccessScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.COMMON_ASSETS_SCREEN}
        component={CommonAssetsScreen}
      />
    </Stack.Navigator>
  );
}
