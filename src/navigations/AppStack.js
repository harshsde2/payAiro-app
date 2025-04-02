import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard/Dashboard';
import Transaction from '../screens/Authentications/Transaction';
import TransactionSuccess from '../screens/Authentications/TransactionSuccess';
import TransactionDetails from '../screens/Authentications/TransactionDetails';
import Scans from '../screens/Scans/Scans';
import ScanPay from '../screens/Scans/ScanPay';
import Send from '../screens/Dashboard/Send';
import Receive from '../screens/Dashboard/Receive';
import Rewards from '../screens/Rewards/Rewards';
import SettingScreen from '../screens/SettingScreen/SettingScreen';
import Notification from '../screens/SettingScreen/Notification';
import Personal from '../screens/SettingScreen/Personal';
import AddCard from '../screens/SettingScreen/AddCard';
import Widhdraw from '../screens/Authentications/Widhdraw';
import SuccesScreen from '../screens/Authentications/SuccesScreen';
import RequestMoney from '../screens/Authentications/RequestMoney';
import SendToken from '../screens/Dashboard/SendToken';
import SendReceipt from '../screens/Authentications/SendReceipt';
import ReceiveToken from '../screens/Authentications/ReceiveToken';
import Legal from '../screens/Authentications/Legal';
import DebitCard from '../screens/Authentications/DebitCard';
import Signature from '../screens/Authentications/Signature';
import IDProof from '../screens/Authentications/IDProof';
import Name from '../screens/Authentications/Name';
import Address from '../screens/Authentications/Address';
import Scratch from '../screens/Rewards/Scratch';
import ScratchCard from '../components/ScratchCard';
import AddContact from '../screens/Dashboard/AddContact';
import ContactScreen from '../screens/Dashboard/ContactScreen';
import Address2 from '../screens/Authentications/Address2';
import IDProof2 from '../screens/Authentications/IdProof2';
import Signature2 from '../screens/Authentications/Signature2';
import Security from '../screens/SettingScreen/Security';
import Dob2 from '../screens/Authentications/Dob2';
import ContactTx from '../screens/Dashboard/ContactTx';
import SelfieScreen from '../screens/Authentications/SelfieScreen';
import Settings2 from '../screens/Authentications/Settings2';
import TXViewDetails from '../screens/Dashboard/TXViewDetails';
import Statement from '../screens/Dashboard/Statement';
import StatementDetails from '../screens/Dashboard/StatementDetails';
import BankDetails from '../screens/Dashboard/BankDetails';
import ChangePinScreen from '../screens/SettingScreen/ChangePinScreen';
import AlertScreen from '../screens/SettingScreen/AlertScreen';
import ChatScreen from '../screens/SettingScreen/ChatScreen';
import AchScreen from '../screens/Dashboard/AchScreen';
import AddCreditCard from '../screens/Dashboard/AddCreditCard';
import DeviceManagement from '../screens/SettingScreen/DeviceManagement';
import ScratchDetails from '../components/ScratchDetails';
import VouchersScreens from '../screens/Dashboard/VouchersScreens';
import SelectBankScreen from '../screens/Dashboard/SelectBankScreen';
import CryptoDashboard from '../screens/Crypto/CryptoDashboard';
import CryptoScreen from '../screens/Crypto/CryptoScreen';
import StocksScreen from '../screens/Crypto/StocksScreen';
import HoldingsScreen from '../screens/Crypto/HoldingsScreen';
import Buy from '../screens/Crypto/Buy';
import Sell from '../screens/Crypto/Sell';
import DepositScreen from '../screens/Crypto/DepositScreen';
import InAppKYCBrowser from '../screens/Crypto/InAppKYCBrowser';
import DepositScreen2 from '../screens/Crypto/DepositScreen2';
import ChooseCurrency from '../screens/Crypto/ChooseCurrency';
import WithdrawScreen from '../screens/Crypto/WithdrawScreen';
import IntraAccountTransfer from '../screens/Dashboard/IntraAccountTransfer';
import DetailsCryptoScreen from '../screens/Crypto/DetailsCryptoScreen';
const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      headerMode="none"
      initialRouteName="Dashboard"
      // lazy={true}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        options={{headerShown: false}}
        name="Dashboard"
        component={Dashboard}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Transaction"
        component={Transaction}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="TransactionSuccess"
        component={TransactionSuccess}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="TransactionDetails"
        component={TransactionDetails}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Scans"
        component={Scans}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ScanPay"
        component={ScanPay}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Send"
        component={Send}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Receive"
        component={Receive}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Rewards"
        component={Rewards}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="SettingScreen"
        component={SettingScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Notification"
        component={Notification}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Personal"
        component={Personal}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="AddCard"
        component={AddCard}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Widhdraw"
        component={Widhdraw}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="RequestMoney"
        component={RequestMoney}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="SendToken"
        component={SendToken}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="SendReceipt"
        component={SendReceipt}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ReceiveToken"
        component={ReceiveToken}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Address2"
        component={Address2}
      />

      <Stack.Screen
        options={{headerShown: false}}
        name="IDProof2"
        component={IDProof2}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Scratch"
        component={Scratch}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ScratchCard"
        component={ScratchCard}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="AddContact"
        component={AddContact}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ContactScreen"
        component={ContactScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Signature2"
        component={Signature2}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Dob2"
        component={Dob2}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Security"
        component={Security}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ContactTx"
        component={ContactTx}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Settings2"
        component={Settings2}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="TXViewDetails"
        component={TXViewDetails}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Statement"
        component={Statement}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="StatementDetails"
        component={StatementDetails}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="BankDetails"
        component={BankDetails}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ChangePinScreen"
        component={ChangePinScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="AlertScreen"
        component={AlertScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ChatScreen"
        component={ChatScreen}
      />

      <Stack.Screen
        options={{headerShown: false}}
        name="AchScreen"
        component={AchScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="AddCreditCard"
        component={AddCreditCard}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="DeviceManagement"
        component={DeviceManagement}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ScratchDetails"
        component={ScratchDetails}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="VouchersScreens"
        component={VouchersScreens}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="SelectBankScreen"
        component={SelectBankScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="CryptoDashboard"
        component={CryptoDashboard}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="CryptoScreen"
        component={CryptoScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="StocksScreen"
        component={StocksScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="HoldingsScreen"
        component={HoldingsScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Sell"
        component={Sell}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="DepositScreen"
        component={DepositScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="InAppKYCBrowser"
        component={InAppKYCBrowser}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="DepositScreen2"
        component={DepositScreen2}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ChooseCurrency"
        component={ChooseCurrency}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="WithdrawScreen"
        component={WithdrawScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="IntraAccountTransfer"
        component={IntraAccountTransfer}
      />
      <Stack.Screen options={{headerShown: false}} name="Buy" component={Buy} />
      <Stack.Screen
        options={{headerShown: false}}
        name="DetailsCryptoScreen"
        component={DetailsCryptoScreen}
      />
    </Stack.Navigator>
  );
}
