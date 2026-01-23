import React, { useMemo, useCallback, useEffect, memo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styles";
import { SvgIcons } from "constants/svgs";
import { NAVIGATION_SCREENS } from "./navigationConstants";
import NewDashboard from "screens/Dashboard/NewDashboard";
import Scans from "screens/Scans/Scans";
import UnifiedTransactionScreen from "screens/TSX-Screens/UnifiedTransactions/UnifiedTransactionScreen";
import SettingScreen from "screens/SettingScreen/SettingScreen";
import useDispatchAction from "hooks/useDispatchAction";
import { setisCrypto } from "redux/slices/authenticationSlice";
import { setTheme } from "redux/slices/animationSlice";
import { usePendingPaymentRequests } from "query/hooks";
import { useSelector, useDispatch } from "react-redux";

const Tab = createBottomTabNavigator();

// ============================================
// MEMOIZED TAB ICON COMPONENTS
// These prevent re-renders when switching tabs
// ============================================

interface TabIconProps {
  focused: boolean;
}

const HomeIcon = memo(({ focused }: TabIconProps) => (
  <SvgIcons.HomeIcon style={{ opacity: focused ? 1 : 0.6 }} />
));

const CryptoIcon = memo(({ focused }: TabIconProps) => (
  <SvgIcons.BottomCryptoIcon
    color="white"
    width={22}
    height={22}
    style={{ opacity: focused ? 1 : 0.6 }}
  />
));

const ScanIcon = memo(({ focused }: TabIconProps) => (
  <SvgIcons.NewScannerIcon style={{ opacity: focused ? 1 : 0.6 }} />
));

interface ActivityIconProps extends TabIconProps {
  pendingCount: number;
}

const ActivityIcon = memo(({ focused, pendingCount }: ActivityIconProps) => (
  <View>
    <SvgIcons.TransactionIcon style={{ opacity: focused ? 1 : 0.6 }} />
    {pendingCount > 0 && (
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>
          {pendingCount > 99 ? "99+" : pendingCount}
        </Text>
      </View>
    )}
  </View>
));

const ProfileIcon = memo(({ focused }: TabIconProps) => (
  <SvgIcons.Person
    width={20}
    height={20}
    color="white"
    style={{ opacity: focused ? 1 : 0.6 }}
  />
));

// ============================================
// STATIC SCREEN OPTIONS (never change)
// ============================================
const STATIC_SCREEN_OPTIONS = {
  headerShown: false,
  lazy: true,
  tabBarHideOnKeyboard: true,
  freezeOnBlur: true,
};

// ============================================
// MAIN NAVIGATOR COMPONENT
// ============================================
const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { isCrypto } = useSelector((state: any) => state.authenticationSlice);

  // Use staleTime to avoid refetching on every render
  const { data: pendingRequestsData } = usePendingPaymentRequests();

  const pendingRequestCount = useMemo(() => {
    return pendingRequestsData?.data?.received_pending_requests?.length ?? 0;
  }, [pendingRequestsData]);

  // Memoized theme dispatchers - only recreate if theme colors change
  const handleHomeTabFocus = () => {
    const newTheme = {
      backgroundColor: theme.colors.palette.green700,
      inverseBackgroundColor: theme.colors.palette.white,
      textColor: theme.colors.palette.black,
    };
    dispatch(setTheme(newTheme));
  };

  const handleCryptoTabFocus = () => {
    const newTheme = {
      backgroundColor: theme.colors.palette.white,
      inverseBackgroundColor: theme.colors.palette.green700,
      textColor: theme.colors.palette.white,
    };
    dispatch(setTheme(newTheme));
  };

  // Effect to update theme when isCrypto changes
  useEffect(() => {
    if (isCrypto) {
      handleHomeTabFocus();
    } else {
      handleCryptoTabFocus();
    }
  }, [isCrypto]);


  // Memoize ONLY the dynamic parts of screen options
  const tabBarStyle = useMemo(() => ({
    backgroundColor: "black",
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: Math.max(insets.bottom, 10),
    height: Platform.OS === "ios" ? 70 + insets.bottom : 70,
    elevation: 0,
    shadowOpacity: 0,
  }), [insets.bottom]);

  const tabBarLabelStyle = useMemo(() => ({
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.montserratMedium,
  }), [theme.typography.fontFamily.montserratMedium]);

  // Combine static and dynamic options
  const screenOptions = useMemo(() => ({
    ...STATIC_SCREEN_OPTIONS,
    tabBarStyle,
    tabBarActiveTintColor: "white",
    tabBarInactiveTintColor: "white",
    tabBarLabelStyle,
  }), [tabBarStyle, tabBarLabelStyle]);

  // Memoized icon render functions - these return the memoized components
  const renderHomeIcon = useCallback(
    ({ focused }: { focused: boolean }) => <HomeIcon focused={focused} />,
    []
  );

  const renderCryptoIcon = useCallback(
    ({ focused }: { focused: boolean }) => <CryptoIcon focused={focused} />,
    []
  );

  const renderScanIcon = useCallback(
    ({ focused }: { focused: boolean }) => <ScanIcon focused={focused} />,
    []
  );

  const renderActivityIcon = useCallback(
    ({ focused }: { focused: boolean }) => (
      <ActivityIcon focused={focused} pendingCount={pendingRequestCount} />
    ),
    [pendingRequestCount]
  );

  const renderProfileIcon = useCallback(
    ({ focused }: { focused: boolean }) => <ProfileIcon focused={focused} />,
    []
  );

  // Memoized listeners objects to prevent recreating on each render
  const homeListeners = () => ({ focus: () => dispatch(setisCrypto(true)) });
  const cryptoListeners = () => ({ focus: () => dispatch(setisCrypto(false)) });

  // Memoized options objects
  const homeOptions = useMemo(() => ({
    tabBarLabel: "Home",
    tabBarIcon: renderHomeIcon,
  }), [renderHomeIcon]);

  const cryptoOptions = useMemo(() => ({
    tabBarLabel: "Crypto",
    tabBarIcon: renderCryptoIcon,
  }), [renderCryptoIcon]);

  const scanOptions = useMemo(() => ({
    tabBarLabel: "Scan",
    tabBarIcon: renderScanIcon,
  }), [renderScanIcon]);

  const activityOptions = useMemo(() => ({
    tabBarLabel: "Activity",
    tabBarIcon: renderActivityIcon,
  }), [renderActivityIcon]);

  const profileOptions = useMemo(() => ({
    tabBarLabel: "Profile",
    tabBarIcon: renderProfileIcon,
  }), [renderProfileIcon]);

  return (
    <Tab.Navigator
      screenOptions={screenOptions}
      initialRouteName={NAVIGATION_SCREENS.NEW_DASHBOARD}
      detachInactiveScreens={false}
      backBehavior="history"
    >
      <Tab.Screen
        name={NAVIGATION_SCREENS.NEW_DASHBOARD}
        component={NewDashboard}
        options={homeOptions}
        listeners={homeListeners}
      />
      <Tab.Screen
        name="CryptoTab"
        component={NewDashboard}
        options={cryptoOptions}
        listeners={cryptoListeners}
      />
      <Tab.Screen
        name={NAVIGATION_SCREENS.SCANS}
        component={Scans}
        options={scanOptions}
      />
      <Tab.Screen
        name={NAVIGATION_SCREENS.UNIFIED_TRANSACTION}
        component={UnifiedTransactionScreen}
        options={activityOptions}
      />
      <Tab.Screen
        name={NAVIGATION_SCREENS.SETTING_SCREEN}
        component={SettingScreen}
        options={profileOptions}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    position: "absolute",
    top: -6,
    right: -8,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#000",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 12,
  },
});

export default memo(BottomTabNavigator);
