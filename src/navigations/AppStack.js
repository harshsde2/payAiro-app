import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ACHTransfer from "screens/TSX-Screens/AddBalance/ACHTransfer";
import AddBalance from "screens/TSX-Screens/AddBalance/AddBalance";
import DebitCardScreen from "screens/TSX-Screens/AddBalance/DebitCardScreen";
import ComingSoon from "screens/TSX-Screens/ComingSoon";
import ConnectWidgetTest from "screens/TSX-Screens/Fortess/ConnectWidgetTest";
import CommonAssetsScreen from "screens/TSX-Screens/RWA/CommonAssetsScreen";
import MyRWAAssets from "screens/TSX-Screens/RWA/MyRWAAssets";
import RWA from "screens/TSX-Screens/RWA/RWA";
import RealState from "screens/TSX-Screens/RWA/RealState";
import RealStateProfile from "screens/TSX-Screens/RWA/RealStateProfile";
import Stocks from "screens/TSX-Screens/RWA/Stocks";
import StocksProfile from "screens/TSX-Screens/RWA/StocksProfile";
import TransactionSuccessScreen from "screens/TSX-Screens/RWA/TransactionSuccessScreen";
import SupportScreen from "screens/TSX-Screens/Settings/SupportScreen";
import FreshchatScreen from "screens/TSX-Screens/Settings/FreshchatScreen";
import ReferralScreen from "screens/TSX-Screens/Settings/ReferralScreen";
import TrustedCircle from "screens/TSX-Screens/TrustedCircle";
import ScratchCard from "../components/ScratchCard";
import ScratchDetails from "../components/ScratchDetails";
import Address2 from "../screens/Authentications/Address2";
import Dob2 from "../screens/Authentications/Dob2";
import IDProof2 from "../screens/Authentications/IdProof2";
import ReceiveToken from "../screens/Authentications/ReceiveToken";
import RequestMoney from "../screens/Authentications/RequestMoney";
import SendReceipt from "../screens/Authentications/SendReceipt";
import Settings2 from "../screens/Authentications/Settings2";
import Signature2 from "../screens/Authentications/Signature2";
import Transaction from "../screens/Authentications/Transaction";
import TransactionDetails from "../screens/Authentications/TransactionDetails";
import TransactionSuccess from "../screens/Authentications/TransactionSuccess";
import Widhdraw from "../screens/Authentications/Widhdraw";
import Buy from "../screens/Crypto/Buy";
import ChooseCurrency from "../screens/Crypto/ChooseCurrency";
import CryptoDashboard from "../screens/Crypto/CryptoDashboard";
import CryptoScreen from "../screens/Crypto/CryptoScreen";
import DepositScreen from "../screens/Crypto/DepositScreen";
import DepositScreen2 from "../screens/Crypto/DepositScreen2";
import DetailsCryptoScreen from "../screens/Crypto/DetailsCryptoScreen";
import HoldingsScreen from "../screens/Crypto/HoldingsScreen";
import InAppKYCBrowser from "../screens/Crypto/InAppKYCBrowser";
import Sell from "../screens/Crypto/Sell";
import StocksScreen from "../screens/Crypto/StocksScreen";
import WithdrawScreen from "../screens/Crypto/WithdrawScreen";
import AchScreen from "../screens/Dashboard/AchScreen";
import AddContact from "../screens/Dashboard/AddContact";
import AddCreditCard from "../screens/Dashboard/AddCreditCard";
import BankDetails from "../screens/Dashboard/BankDetails";
import ContactScreen from "../screens/Dashboard/ContactScreen";
import ContactTx from "../screens/Dashboard/ContactTx";
import Dashboard from "../screens/Dashboard/Dashboard";
import DashboardRefactored from "../screens/Dashboard/DashboardRefactored";
import IntraAccountTransfer from "../screens/Dashboard/IntraAccountTransfer";
import NewDashboard from "../screens/Dashboard/NewDashboard";
import Receive from "../screens/Dashboard/Receive";
import SelectBankScreen from "../screens/Dashboard/SelectBankScreen";
import Send from "../screens/Dashboard/Send";
import SendToken from "../screens/Dashboard/SendToken";
import Statement from "../screens/Dashboard/Statement";
import StatementDetails from "../screens/Dashboard/StatementDetails";
import TXViewDetails from "../screens/Dashboard/TXViewDetails";
import VouchersScreens from "../screens/Dashboard/VouchersScreens";
import Rewards from "../screens/Rewards/Rewards";
import Scratch from "../screens/Rewards/Scratch";
import ScanPay from "../screens/Scans/ScanPay";
import Scans from "../screens/Scans/Scans";
import AddCard from "../screens/SettingScreen/AddCard";
import AlertScreen from "../screens/SettingScreen/AlertScreen";
import ChangePinScreen from "../screens/SettingScreen/ChangePinScreen";
import ChatScreen from "../screens/SettingScreen/ChatScreen";
import DeviceManagement from "../screens/SettingScreen/DeviceManagement";
import Notification from "../screens/SettingScreen/Notification";
import Personal from "../screens/SettingScreen/Personal";
import Security from "../screens/SettingScreen/Security";
import SettingScreen from "../screens/SettingScreen/SettingScreen";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import Result from "screens/TSX-Screens/Send/Result";
import TransactionResult from "screens/TSX-Screens/Send/TransactionResult";
import CryptoBuy from "screens/TSX-Screens/CybridCrypto/CryptoBuy";
import CryptoSell from "screens/TSX-Screens/CybridCrypto/CryptoSell";
import SendAndReceive from "screens/TSX-Screens/CybridCrypto/SendAndReceive";
import CryptoSend from "screens/TSX-Screens/CybridCrypto/CryptoSend";
import CryptoReceive from "screens/TSX-Screens/CybridCrypto/CryptoReceive";
import IRAHolding from "screens/TSX-Screens/IRA/IRAHolding";
import CryptoScreenFortess from "screens/Crypto/CryptoScreenFortess";
import TransactionDetailsModal from "screens/TSX-Screens/TransactionDetails/TransactionDetails";
import PlaidLinkScreen from "screens/TSX-Screens/AddBalance/PlaidLinkScreen";
import PDFViewer from "tsx-components/PDFViewer";
import OTP from "screens/TSX-Screens/Modals/OTP";
import CryptoList from "screens/TSX-Screens/CybridCrypto/CryptoList";
import BankSelection from "screens/TSX-Screens/AddBalance/BankSelection";
import QRScanner from "screens/TSX-Screens/Send/QRScanner";
import CybridWebView from "screens/Authentications/CybridWebView";
import WithdrawlBalance from "screens/TSX-Screens/AddBalance/WithdrawlBalance";
import CoinflowCheckoutWebView from "screens/TSX-Screens/AddBalance/CoinflowCheckoutWebView";
import NewTransactionDetails from "screens/TSX-Screens/NewTransactionDetails/NewTransactionDetails";
import UnifiedTransactionScreen from "screens/TSX-Screens/UnifiedTransactions/UnifiedTransactionScreen";
import CyrptoDetails from "screens/TSX-Screens/CybridCrypto/CyrptoDetails";
import HowToEarnPoints from "screens/TSX-Screens/Modals/HowToEarnPoints";
import BlockchainNameServiceTerms from "screens/TSX-Screens/Modals/BlockchainNameServiceTerms";

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
        name={NAVIGATION_SCREENS.UNIFIED_TRANSACTION}
        component={UnifiedTransactionScreen}
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
        name={NAVIGATION_SCREENS.CRYPTO_SCREEN_FORTRESS}
        component={CryptoScreenFortess}
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
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.COMING_SOON}
        component={ComingSoon}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADD_BALANCE}
        component={AddBalance}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.COINFLOW_CHECKOUT_WEBVIEW}
        component={CoinflowCheckoutWebView}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.WITHDRAW_BALANCE}
        component={WithdrawlBalance}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ACH_TRANSFER}
        component={ACHTransfer}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.DEBIT_CARD_SCREEN}
        component={DebitCardScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SUPPORT_SCREEN}
        component={SupportScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.FRESHCHAT_SCREEN}
        component={FreshchatScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.REFERRAL_SCREEN}
        component={ReferralScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.RESULT}
        component={Result}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_BUY}
        component={CryptoBuy}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_SELL}
        component={CryptoSell}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SEND_AND_RECEIVE}
        component={SendAndReceive}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_SEND}
        component={CryptoSend}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_RECEIVE}
        component={CryptoReceive}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.IRA_HOLDING}
        component={IRAHolding}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          animationTypeForReplace: "push",
          animation: "slide_from_bottom",
          gestureEnabled: false,
        }}
        name={NAVIGATION_SCREENS.TRANSACTION_RESULT}
        component={TransactionResult}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          animationTypeForReplace: "push",
          animation: "slide_from_bottom",
          gestureEnabled: true,
        }}
        name={NAVIGATION_SCREENS.TRANSACTION_DETAILS_MODAL}
        component={TransactionDetailsModal}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          animationTypeForReplace: "push",
          animation: "slide_from_bottom",
          gestureEnabled: true,
        }}
        name={NAVIGATION_SCREENS.NEW_TRANSACTION_DETAILS}
        component={NewTransactionDetails}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          animationTypeForReplace: "push",
          animation: "slide_from_bottom",
          gestureEnabled: true,
        }}
        name={NAVIGATION_SCREENS.PLAID_LINK_SCREEN}
        component={PlaidLinkScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          gestureEnabled: true,
          animationTypeForReplace: "push",
        }}
        name={NAVIGATION_SCREENS.PDF_VIEWER}
        component={PDFViewer}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          gestureEnabled: true,
          animationTypeForReplace: "push",
          animation: "slide_from_bottom",
        }}
        name={NAVIGATION_SCREENS.OTP_SCREEN}
        component={OTP}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'containedTransparentModal',
          gestureEnabled: true,
          animationTypeForReplace: 'push',
          animation: 'slide_from_bottom',
          animationMatchesGesture:true,
          gestureDirection:'vertical'
        }}
        name={NAVIGATION_SCREENS.CRYPTO_LIST}
        component={CryptoList}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'containedTransparentModal',
          gestureEnabled: true,
          animationTypeForReplace: 'push',
          animation: 'fade',
          animationMatchesGesture:true,
          gestureDirection:'vertical'
        }}
        name={NAVIGATION_SCREENS.HOW_TO_EARN_POINTS}
        component={HowToEarnPoints}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'containedTransparentModal',
          gestureEnabled: true,
          animationTypeForReplace: 'push',
          animation: 'fade',
          animationMatchesGesture:true,
          gestureDirection:'vertical'
        }}
        name={NAVIGATION_SCREENS.BLOCKCHAIN_NAME_SERVICE_TERMS}
        component={BlockchainNameServiceTerms}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'containedTransparentModal',
          gestureEnabled: true,
          animationTypeForReplace: 'push',
          animation: 'slide_from_bottom',
          animationMatchesGesture:true,
          gestureDirection:'vertical'
        }}
        name={NAVIGATION_SCREENS.BANK_SELECTION}
        component={BankSelection}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'containedTransparentModal',
          gestureEnabled: true,
          animationTypeForReplace: 'push',
          animation: 'slide_from_bottom',
          animationMatchesGesture:true,
          gestureDirection:'vertical'
        }}
        name={NAVIGATION_SCREENS.QR_SCANNER}
        component={QRScanner}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CYBRID_WEB_VIEW}
        component={CybridWebView}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_DETAILS}
        component={CyrptoDetails}
        
      />
    </Stack.Navigator>
  );
}
