import { createNativeStackNavigator, NativeStackHeaderProps } from "@react-navigation/native-stack";
import React from "react";
import BottomTabNavigator from "./BottomTabNavigator";
import ACHTransfer from "screens/TSX-Screens/AddBalance/ACHTransfer";
import AddBalance from "screens/TSX-Screens/AddBalance/AddBalance";
import ComingSoon from "screens/TSX-Screens/ComingSoon";
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
import CryptoScreen from "../screens/Crypto/CryptoScreen";
import AddContact from "../screens/Dashboard/AddContact";
import BankDetails from "../screens/Dashboard/BankDetails";
import ContactScreen from "../screens/Dashboard/ContactScreen";
import ContactTx from "../screens/Dashboard/ContactTx";
import NewDashboard from "../screens/Dashboard/NewDashboard";
import Receive from "@new-ui/screens/Receive/index";
import Send from "../screens/Dashboard/Send";
import Statement from "../screens/Dashboard/Statement";
import StatementDetails from "../screens/Dashboard/StatementDetails";
import Rewards from "../screens/Rewards/Rewards";
import Scratch from "../screens/Rewards/Scratch";
import ScanPay from "../screens/Scans/ScanPay";
import Scans from "../screens/Scans/Scans";
import ChangePinScreen from "../screens/SettingScreen/ChangePinScreen";
import ForgotPinScreen from "../screens/SettingScreen/ForgotPinScreen/ForgotPinScreen";
import Notification from "../screens/SettingScreen/Notification";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import Result from "screens/TSX-Screens/Send/Result";
import TransactionResult from "screens/TSX-Screens/Send/TransactionResult";
import CryptoBuy from "screens/TSX-Screens/CybridCrypto/CryptoBuy";
import CryptoSell from "screens/TSX-Screens/CybridCrypto/CryptoSell";
import SendAndReceive from "screens/TSX-Screens/CybridCrypto/SendAndReceive";
import CryptoSend from "screens/TSX-Screens/CybridCrypto/CryptoSend";
import CryptoReceive from "screens/TSX-Screens/CybridCrypto/CryptoReceive";
import IRAHolding from "screens/TSX-Screens/IRA/IRAHolding";
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
import AddCrypto from "screens/TSX-Screens/AddBalance/AddCrypto";
import TestWebView from "screens/TSX-Screens/TestWebView";
import UserProfile from "screens/TSX-Screens/UserProfile/UserProfile";
import NewPersonal from "screens/SettingScreen/NewPersonal";
import Settings2 from "screens/Authentications/Settings2";
import AddBalanceBankDetails from "screens/TSX-Screens/AddBalance/AddBalanceBankDetails";
import PaymentAppList from "screens/TSX-Screens/AddBalance/PaymentAppList";
import NewSend from "@new-ui/screens/Send/Send/index";
import SelectPaymentMethod from "@new-ui/screens/Send/SelectPaymentMethod/SelectPaymentMethod";
import EnterAmount from "@new-ui/screens/Send/EnterAmount/EnterAmount";
import CryptoWithdraw from "@new-ui/screens/WithdrawCrypto/CryptoWithdraw";
import NewAddBalance from "@new-ui/screens/AddBalance";
import CustomHeader from "../new-ui/components/common-components/CustomHeader";
import { AppIcon } from "new-ui/assets/svgs";
import theme from "styles/theme";
import { useTheme as useNewTheme } from "@new-ui/styles/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import SettingsScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/SettingsScreen";
import CoinmeAgreementScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/CoinmeAgreementScreen";
import NotificationScreen from "new-ui/screens/KebabMenuScreens/NotificationScreen/NotificationScreen";
import ContactsScreen from "@new-ui/screens/Contacts/ContactsScreen";
import AddContactScreen from "@new-ui/screens/Contacts/AddContactScreen";
import BankStatementScreen from "@new-ui/screens/KebabMenuScreens/BankStatementScreen/BankStatementScreen";
import ViewStatementScreen from "@new-ui/screens/KebabMenuScreens/BankStatementScreen/ViewStatementScreen";
import RewardsAndReferralsScreen from "@new-ui/screens/KebabMenuScreens/RewardsScreen/RewardsAndReferralsScreen";
import ScratchCardScreen from "@new-ui/screens/KebabMenuScreens/RewardsScreen/ScratchCardScreen";
import ActivityScreen from "new-ui/screens/Activity/ActivityScreen";
import {
  CashRampBarcodeScreen,
  LocationFinderScreen,
  SellCashRampLocationScreen,
} from "@new-ui/screens/CashRamp";
import CommonErrorScreen from "@new-ui/screens/Auth/CommonError/CommonErrorScreen";

const Stack = createNativeStackNavigator();

export function AppStackHeader(props: NativeStackHeaderProps) {
  const navigation = useNavigation<any>();
  const { theme: newTheme } = useNewTheme();
  const title =
    typeof props.options?.headerTitle === "string"
      ? props.options.headerTitle
      : undefined;

  const isNewSendScreen = props.route?.name === NAVIGATION_SCREENS.NEW_SEND;
  const isActivityScreen = props.route?.name === NAVIGATION_SCREENS.NEW_ACTIVITY_SCREEN;
  const rightButton = isNewSendScreen
    ? { icon: <AppIcon.QrCode width={24} height={24} color={newTheme.colors.primary} onPress={() => { navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL) }}/> }
    : isActivityScreen
      ? {
          icon: <AppIcon.Download width={24} height={24} color={newTheme.colors.primary} />,
          onPress: () => {},
        }
      : undefined;

  return <CustomHeader {...props}  title={title} rightButton={rightButton} />;
}

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="MainTabs"
        component={BottomTabNavigator}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SCAN_PAY}
        component={ScanPay}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SEND}
        component={Send as any}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader }}
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
        name={NAVIGATION_SCREENS.NOTIFICATION}
        component={Notification}
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
        name={NAVIGATION_SCREENS.SETTINGS2}
        component={Settings2}
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
        name={NAVIGATION_SCREENS.CONTACT_TX}
        component={ContactTx}
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
        name={NAVIGATION_SCREENS.FORGOT_PIN_SCREEN}
        component={ForgotPinScreen}
      />


      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.SCRATCH_DETAILS}
        component={ScratchDetails}
      />

      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_SCREEN}
        component={CryptoScreen}
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
        component={ComingSoon as any}
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
        component={Result as any}
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
        options={{ headerShown: true, header: AppStackHeader }}
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
          headerShown: true,
          header: AppStackHeader,
          headerTitle: "Transaction Details",
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
        component={PDFViewer as any}
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
          animation: 'slide_from_right',

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
        options={{ headerShown: true, header: AppStackHeader }}
        name={NAVIGATION_SCREENS.CRYPTO_DETAILS}
        component={CyrptoDetails}
        
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADD_CRYPTO}
        component={AddCrypto}
        
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.TEST_WEBVIEW}
        component={TestWebView}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.USER_PROFILE}
        component={UserProfile}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader }}
        name={NAVIGATION_SCREENS.NEW_PERSONAL}
        component={NewPersonal}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ADD_BALANCE_BANK_DETAILS}
        component={AddBalanceBankDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.PAYMENT_APP_LIST}
        component={PaymentAppList}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader }}
        name={NAVIGATION_SCREENS.NEW_SEND}
        component={NewSend as any}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader }}
        name={NAVIGATION_SCREENS.NEW_ADD_BALANCE}
        component={NewAddBalance as any}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_CASH_RAMP_LOCATION_FINDER}
        component={LocationFinderScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_CASH_RAMP_SELL_LOCATION_FINDER}
        component={SellCashRampLocationScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_COMMON_ERROR}
        component={CommonErrorScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AppStackHeader,
          headerTitle: "Barcode",
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
        }}
        name={NAVIGATION_SCREENS.NEW_CASH_RAMP_BARCODE}
        component={CashRampBarcodeScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader,headerTitle: 'Settings' }}
        name={NAVIGATION_SCREENS.NEW_SETTINGS_SCREEN}
        component={SettingsScreen as any}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Coinme Legal' }}
        name={NAVIGATION_SCREENS.NEW_COINME_AGREEMENT_SCREEN}
        component={CoinmeAgreementScreen as any}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader,headerTitle: 'Notifications' }}
        name={NAVIGATION_SCREENS.NEW_NOTIFICATION_SCREEN}
        component={NotificationScreen as any}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader }}
        name="SelectPaymentMethod"
        component={SelectPaymentMethod as any}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.ENTER_AMOUNT}
        component={EnterAmount as any}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.CRYPTO_WITHDRAW}
        component={CryptoWithdraw as any}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Contacts' }}
        name={NAVIGATION_SCREENS.NEW_CONTACTS_SCREEN}
        component={ContactsScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Contacts' }}
        name={NAVIGATION_SCREENS.NEW_ADD_CONTACT_SCREEN}
        component={AddContactScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Bank Statement' }}
        name={NAVIGATION_SCREENS.NEW_BANK_STATEMENT_SCREEN}
        component={BankStatementScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Details' }}
        name={NAVIGATION_SCREENS.NEW_VIEW_STATEMENT_SCREEN}
        component={ViewStatementScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Rewards and Referrals' }}
        name={NAVIGATION_SCREENS.NEW_REWARDS_AND_REFERRALS_SCREEN}
        component={RewardsAndReferralsScreen}
      />
      <Stack.Screen
          options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Scratch Card' }}
          name={NAVIGATION_SCREENS.NEW_SCRATCH_CARD_SCREEN}
          component={ScratchCardScreen}
        />
        <Stack.Screen
          options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Activity' }}
          name={NAVIGATION_SCREENS.NEW_ACTIVITY_SCREEN}
          component={ActivityScreen}
        />
    </Stack.Navigator>
  );
}
