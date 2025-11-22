import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { BottomTabParamList, DashboardStackParamList, CryptoStackParamList, TransactionStackParamList, WalletStackParamList, SettingsStackParamList } from './types';
import { NAVIGATION_SCREENS } from './navigationConstants';
import DashboardScreen from '../screens/Dashboard';
import { Text, View, Platform, StyleSheet } from 'react-native';
import { AppIcon } from '../assets/svgs';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const CryptoSStack = createNativeStackNavigator<CryptoStackParamList>();
const TransactionStack = createNativeStackNavigator<TransactionStackParamList>();
const WalletStack = createNativeStackNavigator<WalletStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18 }}>{title}</Text>
  </View>
);

const DashboardStackNavigator: React.FC = () => {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Dashboard',
      }}
    >
      <DashboardStack.Screen
        name={NAVIGATION_SCREENS.DASHBOARD}
        component={DashboardScreen}
      />
    </DashboardStack.Navigator>
  );
};

const CryptoStackNavigator: React.FC = () => {
  return (
    <CryptoSStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Crypto',
      }}
    >
      <CryptoSStack.Screen
        name={NAVIGATION_SCREENS.CRYPTO_LIST}
        component={() => <PlaceholderScreen title="Crypto List" />}
      />
    </CryptoSStack.Navigator>
  );
};

const TransactionStackNavigator: React.FC = () => {
  return (
    <TransactionStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Transactions',
      }}
    >
      <TransactionStack.Screen
        name={NAVIGATION_SCREENS.TRANSACTION_HISTORY}
        component={() => <PlaceholderScreen title="Transaction History" />}
      />
    </TransactionStack.Navigator>
  );
};

const WalletStackNavigator: React.FC = () => {
  return (
    <WalletStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Wallet',
      }}
    >
      <WalletStack.Screen
        name={NAVIGATION_SCREENS.WALLET}
        component={() => <PlaceholderScreen title="Wallet" />}
      />
    </WalletStack.Navigator>
  );
};

const SettingsStackNavigator: React.FC = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Settings',
      }}
    >
      <SettingsStack.Screen
        name={NAVIGATION_SCREENS.SETTINGS}
        component={() => <PlaceholderScreen title="Settings" />}
      />
    </SettingsStack.Navigator>
  );
};

const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60;
  const bottomPadding = Math.max(insets.bottom, 5);

  const TabBarBackground: React.FC = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.8)"
        />
      );
    }
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(255, 255, 255, 0.85)' },
        ]}
      />
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#008143',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          paddingBottom: bottomPadding,
          paddingTop: 5,
          height: tabBarHeight + bottomPadding,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
      }}
      initialRouteName={NAVIGATION_SCREENS.DASHBOARD_TAB}
    >
      <Tab.Screen
        name={NAVIGATION_SCREENS.DASHBOARD_TAB}
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AppIcon.Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={NAVIGATION_SCREENS.CRYPTO_TAB}
        component={CryptoStackNavigator}
        options={{
          tabBarLabel: 'Crypto',
          tabBarIcon: ({ color, size }) => (
            <AppIcon.Crypto width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={NAVIGATION_SCREENS.TRANSACTIONS_TAB}
        component={TransactionStackNavigator}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <AppIcon.Scan
              width={90}
              height={90}
              style={{
                position: 'absolute',
                top: -15,
                shadowColor: '#10AA3C',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 1,
                shadowRadius: 15,
                elevation: 8,
              }}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name={NAVIGATION_SCREENS.WALLET_TAB}
        component={WalletStackNavigator}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <AppIcon.Transactions width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={NAVIGATION_SCREENS.SETTINGS_TAB}
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <AppIcon.Wallet width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

