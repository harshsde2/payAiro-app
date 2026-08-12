import { createNativeStackNavigator, NativeStackHeaderProps } from "@react-navigation/native-stack";
import React from "react";
import BottomTabNavigator from "./BottomTabNavigator";
import SupportScreen from "screens/TSX-Screens/Settings/SupportScreen";
import FreshchatScreen from "screens/TSX-Screens/Settings/FreshchatScreen";
import AddContact from "../screens/Dashboard/AddContact";
import Receive from "@new-ui/screens/Receive/index";
import ChangePinScreen from "../screens/SettingScreen/ChangePinScreen";
import ForgotPinScreen from "../screens/SettingScreen/ForgotPinScreen/ForgotPinScreen";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import TransactionResult from "screens/TSX-Screens/Send/TransactionResult";
import CryptoReceive from "screens/TSX-Screens/CybridCrypto/CryptoReceive";
import PlaidLinkScreen from "screens/TSX-Screens/AddBalance/PlaidLinkScreen";
import PDFViewer from "tsx-components/PDFViewer";
import OTP from "screens/TSX-Screens/Modals/OTP";
import NewTransactionDetails from "screens/TSX-Screens/NewTransactionDetails/NewTransactionDetails";
import CyrptoDetails from "screens/TSX-Screens/CybridCrypto/CyrptoDetails";
import BlockchainNameServiceTerms from "screens/TSX-Screens/Modals/BlockchainNameServiceTerms";
import UserProfile from "screens/TSX-Screens/UserProfile/UserProfile";
import ProfileScreen from "new-ui/screens/Profile/ProfileScreen";
import Settings2 from "screens/Authentications/Settings2";
import NewSend from "@new-ui/screens/Send/Send/index";
import SelectPaymentMethod from "@new-ui/screens/Send/SelectPaymentMethod/SelectPaymentMethod";
import EnterAmount from "@new-ui/screens/Send/EnterAmount/EnterAmount";
import CryptoWithdraw from "@new-ui/screens/WithdrawCrypto/CryptoWithdraw";
import NewAddBalance from "@new-ui/screens/AddBalance";
import CustomHeader from "../new-ui/components/common-components/CustomHeader";
import { AppIcon } from "new-ui/assets/svgs";
import { useTheme as useNewTheme } from "@new-ui/styles/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import SettingsScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/SettingsScreen";
import PrivacyAndSecurityScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/PrivacyAndSecurityScreen";
import AppVersionScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/AppVersionScreen";
import NewChangePinScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/ChangePin";
import NewForgotPinScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/ForgotPin";
import PinActionOtpScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/PinActionOtpScreen";
import SetNewPinScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/SetNewPinScreen";
import CoinmeAgreementScreen from "new-ui/screens/KebabMenuScreens/SettingScreen/CoinmeAgreementScreen";
import DisclosureHistoryScreen from "new-ui/screens/KebabMenuScreens/DisclosureHistoryScreen/DisclosureHistoryScreen";
import EmailVerificationScreen from "new-ui/screens/Auth/EmailVerification/EmailVerificationScreen";
import NotificationScreen from "new-ui/screens/KebabMenuScreens/NotificationScreen/NotificationScreen";
import TransactionLimitsScreen from "@new-ui/screens/TransactionLimits";
import PaymentMethodsScreen from "@new-ui/screens/PaymentMethods";
import ContactsScreen from "@new-ui/screens/Contacts/ContactsScreen";
import AddContactScreen from "@new-ui/screens/Contacts/AddContactScreen";
import BankStatementScreen from "@new-ui/screens/KebabMenuScreens/BankStatementScreen/BankStatementScreen";
import ViewStatementScreen from "@new-ui/screens/KebabMenuScreens/BankStatementScreen/ViewStatementScreen";
import RewardsAndReferralsScreen from "@new-ui/screens/KebabMenuScreens/RewardsScreen/RewardsAndReferralsScreen";
import ScratchCardScreen from "@new-ui/screens/KebabMenuScreens/RewardsScreen/ScratchCardScreen";
import ActivityScreen from "new-ui/screens/Activity/ActivityScreen";
import CryptoRequestsListScreen from "new-ui/screens/CryptoRequest/CryptoRequestsListScreen";
import CryptoRequestDetailScreen from "new-ui/screens/CryptoRequest/CryptoRequestDetailScreen";
import {
  CashRampBarcodeScreen,
  LocationFinderScreen,
  SellCashRampLocationScreen,
} from "@new-ui/screens/CashRamp";
import {
  SellDailyLimitScreen,
  SellEnterAmountScreen,
  SellMonthlyLimitScreen,
  SellOtpPlaceholderScreen,
  SellReadyCodeWaitingScreen,
  SellSummaryScreen,
} from "@new-ui/screens/CashRamp/Sell";
import CommonErrorScreen from "@new-ui/screens/Auth/CommonError/CommonErrorScreen";
import StateComplianceAcknowledgmentScreen from "@new-ui/screens/Compliance/StateComplianceAcknowledgmentScreen";
import StateRestrictedScreen from "@new-ui/screens/Compliance/StateRestrictedScreen";
import PreTransactionDisclosureScreen from "@new-ui/screens/Compliance/PreTransactionDisclosureScreen";

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
    // ? { icon: <AppIcon.QrCode width={24} height={24} color={newTheme.colors.primary} onPress={() => { navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL) }}/> }
    // : 
    // isActivityScreen
    //   ? {
    //       icon: <AppIcon.Download width={24} height={24} color={newTheme.colors.primary} />,
    //       onPress: () => {},
    //     }
      // : 
      // undefined;

  return <CustomHeader 
  {...props}  
  title={title} 
  // rightButton={rightButton} 
  />;
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
        options={{ headerShown: true, header: AppStackHeader }}
        name={NAVIGATION_SCREENS.RECEIVE}
        component={Receive}
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
        name={NAVIGATION_SCREENS.SUPPORT_SCREEN}
        component={SupportScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.FRESHCHAT_SCREEN}
        component={FreshchatScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader }}
        name={NAVIGATION_SCREENS.CRYPTO_RECEIVE}
        component={CryptoReceive}
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
        options={{ headerShown: true, header: AppStackHeader }}
        name={NAVIGATION_SCREENS.CRYPTO_DETAILS}
        component={CyrptoDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.USER_PROFILE}
        component={UserProfile}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_PERSONAL}
        component={ProfileScreen}
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
        name={NAVIGATION_SCREENS.NEW_CASH_SELL_ENTER_AMOUNT}
        component={SellEnterAmountScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: "Review sale" }}
        name={NAVIGATION_SCREENS.NEW_CASH_SELL_SUMMARY}
        component={SellSummaryScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_CASH_SELL_OTP}
        component={SellOtpPlaceholderScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={NAVIGATION_SCREENS.NEW_CASH_SELL_READY_CODE_WAITING}
        component={SellReadyCodeWaitingScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: "" }}
        name={NAVIGATION_SCREENS.NEW_CASH_SELL_DAILY_LIMIT}
        component={SellDailyLimitScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: "" }}
        name={NAVIGATION_SCREENS.NEW_CASH_SELL_MONTHLY_LIMIT}
        component={SellMonthlyLimitScreen}
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
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Acknowledgment History' }}
        name={NAVIGATION_SCREENS.NEW_ACKNOWLEDGMENT_HISTORY_SCREEN}
        component={DisclosureHistoryScreen as any}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
        name={NAVIGATION_SCREENS.NEW_EMAIL_VERIFICATION}
        component={EmailVerificationScreen as any}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader,headerTitle: 'Notifications' }}
        name={NAVIGATION_SCREENS.NEW_NOTIFICATION_SCREEN}
        component={NotificationScreen as any}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AppStackHeader,
          headerTitle: 'Transaction Limits',
        }}
        name={NAVIGATION_SCREENS.TRANSACTION_LIMIT_SCREEN}
        component={TransactionLimitsScreen as any}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          header: AppStackHeader,
          headerTitle: 'Payment Methods',
        }}
        name={NAVIGATION_SCREENS.PAYMENT_METHODS_SCREEN}
        component={PaymentMethodsScreen as any}
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
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Privacy and Security' }}
        name={NAVIGATION_SCREENS.NEW_PRIVACY_SECURITY_SCREEN}
        component={PrivacyAndSecurityScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'App Version' }}
        name={NAVIGATION_SCREENS.NEW_APP_VERSION_SCREEN}
        component={AppVersionScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Change PIN' }}
        name={NAVIGATION_SCREENS.NEW_CHANGE_PIN_SCREEN}
        component={NewChangePinScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Forgot PIN' }}
        name={NAVIGATION_SCREENS.NEW_FORGOT_PIN_SCREEN}
        component={NewForgotPinScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Verify OTP' }}
        name={NAVIGATION_SCREENS.NEW_PIN_ACTION_OTP_SCREEN}
        component={PinActionOtpScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Set New PIN' }}
        name={NAVIGATION_SCREENS.NEW_SET_NEW_PIN_SCREEN}
        component={SetNewPinScreen}
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
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Requests' }}
        name={NAVIGATION_SCREENS.NEW_CRYPTO_REQUESTS}
        component={CryptoRequestsListScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, header: AppStackHeader, headerTitle: 'Request' }}
        name={NAVIGATION_SCREENS.NEW_CRYPTO_REQUEST_DETAIL}
        component={CryptoRequestDetailScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationTypeForReplace: 'push',
          gestureEnabled: false,
        }}
        name={NAVIGATION_SCREENS.STATE_COMPLIANCE_ACKNOWLEDGMENT}
        component={StateComplianceAcknowledgmentScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationTypeForReplace: 'push',
          gestureEnabled: false,
        }}
        name={NAVIGATION_SCREENS.STATE_RESTRICTED_BLOCK}
        component={StateRestrictedScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationTypeForReplace: 'push',
          gestureEnabled: true,
        }}
        name={NAVIGATION_SCREENS.STATE_COMPLIANCE_PRE_TRANSACTION}
        component={PreTransactionDisclosureScreen}
      />
    </Stack.Navigator>
  );
}
