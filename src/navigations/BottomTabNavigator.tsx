import React, { useMemo, useCallback, useEffect, memo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "@react-native-community/blur";
import { useTheme } from "styles";
import { AppIcon } from "../new-ui/assets/svgs";
import { NAVIGATION_SCREENS } from "./navigationConstants";

// Type assertion for payAiro-app screen keys (avoids conflicts with other project types)
const NAV = NAVIGATION_SCREENS as Record<string, string>;
import NewDashboard from "screens/Dashboard/NewDashboard";
import Scans from "screens/Scans/Scans";
import NewPersonal from "screens/SettingScreen/NewPersonal";
import useDispatchAction from "hooks/useDispatchAction";
import { setisCrypto } from "redux/slices/authenticationSlice";
import { setTheme } from "redux/slices/animationSlice";
import { usePendingPaymentRequests } from "query/hooks";
import { useCryptoRequestHistory } from "query/hooks/useCryptoRequest";
import { useComplianceGate } from "hooks/useComplianceGate";
import { useSelector, useDispatch } from "react-redux";
import NewCrypto from "new-ui/screens/Crypto/NewCrypto";
import ActivityScreen from "new-ui/screens/Activity/ActivityScreen";
import { AppStackHeader } from "./AppStack";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();

// ============================================
// MEMOIZED TAB ICON COMPONENTS (AppIcon style - matches image 1)
// ============================================

interface TabIconProps {
  focused: boolean;
  color?: string;
  size?: number;
}

const ACTIVE_GREEN = "#008143";
const INACTIVE_GREY = "#8E8E93";

const HomeIcon = memo(({ focused, color }: TabIconProps) => (
  <AppIcon.Home
    width={24}
    height={24}
    color={color || (focused ? ACTIVE_GREEN : INACTIVE_GREY)}
  />
));

const CryptoIcon = memo(({ focused, color }: TabIconProps) => (
  <AppIcon.Crypto
    width={24}
    height={24}
    color={color || (focused ? ACTIVE_GREEN : INACTIVE_GREY)}
  />
));

const ScanIcon = memo(() => (
  <View style={styles.scanButtonWrapper}>
    <AppIcon.Scan
      width={90}
      height={90}
      color="white"
    />
  </View>
));

interface ActivityIconProps extends TabIconProps {
  pendingCount: number;
}

const ActivityIcon = memo(
  ({ focused, pendingCount, color }: ActivityIconProps) => (
    <View>
      <AppIcon.Transactions
        width={24}
        height={24}
        color={color || (focused ? ACTIVE_GREEN : INACTIVE_GREY)}
      />
      {pendingCount > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {pendingCount > 99 ? "99+" : pendingCount}
          </Text>
        </View>
      )}
    </View>
  ));

const ProfileIcon = memo(({ focused, color }: TabIconProps) => {
  const iconColor = color || (focused ? ACTIVE_GREEN : INACTIVE_GREY);
  return (
    <AppIcon.Person
      width={24}
      height={24}
      color={iconColor}
      fill={iconColor}
    />
  );
});

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
// BLUR TAB BAR BACKGROUND - Light frosted glass (no black overlay)
// Shows background content through with blur effect
// ============================================
const TabBarBackground = memo(() => {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.75)"
      />
    );
  }
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(255, 255, 255, 0.85)" },
      ]}
    />
  );
});

// ============================================
// MAIN NAVIGATOR COMPONENT
// ============================================
const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { isCrypto } = useSelector((state: any) => state.authenticationSlice);

  // State regulatory compliance: presents the blocking one-time disclosure at launch when required.
  useComplianceGate();

  // Use staleTime to avoid refetching on every render
  const { data: pendingRequestsData } = usePendingPaymentRequests(false);
  // Pending crypto (P2P) requests in either direction — sent or received.
  // Gentle poll keeps the badge fresh without a push (deduped with the banner).
  const { data: cryptoRequestsData } = useCryptoRequestHistory("all", "PENDING", 50, {
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const pendingRequestCount = useMemo(() => {
    const fiat = pendingRequestsData?.data?.received_pending_requests?.length ?? 0;
    const crypto = cryptoRequestsData?.data?.items?.length ?? 0;
    return fiat + crypto;
  }, [pendingRequestsData, cryptoRequestsData]);

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

  const bottomPadding = Math.max(insets.bottom, 10);
  const tabBarHeight = 60;

  // Memoize ONLY the dynamic parts of screen options - blur UI with transparent bg
  const tabBarStyle = useMemo(
    () => ({
      borderTopWidth: 0,
      backgroundColor: "transparent",
      paddingTop: 10,
      paddingBottom: bottomPadding,
      height: tabBarHeight + bottomPadding,
      elevation: 0,
      shadowOpacity: 0,
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
    }),
    [bottomPadding]
  );

  const tabBarLabelStyle = useMemo(
    () => ({
      fontSize: 11,
      fontFamily: theme.typography.fontFamily.montserratMedium,
    }),
    [theme.typography.fontFamily.montserratMedium]
  );

  // Combine static and dynamic options - light blur, green/grey colors
  const screenOptions = useMemo(
    () => ({
      ...STATIC_SCREEN_OPTIONS,
      tabBarStyle,
      tabBarActiveTintColor: ACTIVE_GREEN,
      tabBarInactiveTintColor: INACTIVE_GREY,
      tabBarLabelStyle,
      tabBarBackground: () => <TabBarBackground />,
    }),
    [tabBarStyle, tabBarLabelStyle]
  );

  // Memoized icon render functions - these return the memoized components
  const renderHomeIcon = useCallback(
    ({ focused, color }: { focused: boolean; color: string }) => (
      <HomeIcon focused={focused} color={color} />
    ),
    []
  );

  const renderCryptoIcon = useCallback(
    ({ focused, color }: { focused: boolean; color: string }) => (
      <CryptoIcon focused={focused} color={color} />
    ),
    []
  );

  const renderScanIcon = useCallback(() => <ScanIcon />, []);

  const renderActivityIcon = useCallback(
    ({ focused, color }: { focused: boolean; color: string }) => (
      <ActivityIcon
        focused={focused}
        color={color}
        pendingCount={pendingRequestCount}
      />
    ),
    [pendingRequestCount]
  );

  const renderProfileIcon = useCallback(
    ({ focused, color }: { focused: boolean; color: string }) => (
      <ProfileIcon focused={focused} color={color} />
    ),
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

  const scanOptions = useMemo(
    () => ({
      tabBarLabel: "",
      tabBarIcon: renderScanIcon,
    }),
    [renderScanIcon]
  );

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
      initialRouteName={NAV.NEW_DASHBOARD}
      detachInactiveScreens={false}
      backBehavior="history"
    >
      <Tab.Screen
        name={NAV.NEW_DASHBOARD}
        component={NewDashboard}
        options={homeOptions}
        listeners={homeListeners}
      />
      <Tab.Screen
        name="CryptoTab"
        component={NewCrypto}
        options={cryptoOptions}
        listeners={cryptoListeners}
      />
      <Tab.Screen
        name={NAV.SCANS}
        component={Scans}
        options={scanOptions}
      />
      <Tab.Screen
        name={NAV.NEW_ACTIVITY_SCREEN}
        component={ActivityScreen}
        options={{
          ...activityOptions,
          headerShown: true,
          header: (props) => (
            <AppStackHeader {...(props as unknown as NativeStackHeaderProps)} />
          ),
          headerTitle: "Recent Activity",
        }}
      />
      <Tab.Screen
        name={NAV.SETTING_SCREEN}
        component={NewPersonal}
        options={profileOptions}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  scanButtonWrapper: {
    position: "absolute",
    top: -20,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#008143",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#10AA3C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
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
    borderColor: "rgba(255, 255, 255, 0.9)",
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
