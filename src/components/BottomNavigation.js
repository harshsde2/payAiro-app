import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { SvgXml } from "react-native-svg";
import {
  SVGHomeActive,
  SVGHomeInctive,
  SVGOffer,
  SVGOfferInactive,
  SVGReward,
  SVGScan,
  SVGSetting,
  SVGSettingIncative,
  SVGTransaction,
  SVGTransactionInactive,
  SVGTrustedCircle,
} from "../constants/images";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { SCREENS } from "../constants/SCREENS";
import useSelectorAction from "../hooks/useSelectorAction";
import useDispatchAction from "../hooks/useDispatchAction";
import { setActiveTab, setisCrypto } from "../redux/slices/authenticationSlice";
import { useSelector } from "react-redux";
import Fonts from "../constants/Fonts";
import {
  askCameraPremission,
  checkCameraPremission,
} from "../helper/Permission";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { SvgIcons } from "constants/svgs";
import { setTheme } from "redux/slices/animationSlice";
import { useTheme } from "styles";
import { usePendingPaymentRequests } from "query/hooks";
import { CustomText } from "tsx-components";

export default function BottomNavigation({ isVer }) {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  const { activeTab, isCrypto } = useSelector(
    (state) => state.authenticationSlice
  );

  // Fetch pending payment requests using React Query hook
  const { data: pendingRequestsData, refetch } = usePendingPaymentRequests();

  // Refetch pending requests when screen is focused
  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  // Calculate total pending requests count (received only - these are requests waiting for user to pay)
  const pendingRequestCount = useMemo(() => {
    const receivedCount = pendingRequestsData?.data?.received_pending_requests?.length ?? 0;
    return receivedCount;
  }, [pendingRequestsData]);
  // console.log(activeTab);

  const handleTabSwitch = (name) => {
    // let activeTabs = 1;
    // switch (name) {
    //   case NAVIGATION_SCREENS.NEW_DASHBOARD:
    //     activeTabs = 1;
    //     break;
    //   case NAVIGATION_SCREENS.TRANSACTION:
    //     activeTabs = 2;
    //     break;
    //   case NAVIGATION_SCREENS.SCANS:
    //     activeTabs = 3;
    //     break;
    //   case NAVIGATION_SCREENS.REWARDS:
    //     activeTabs = 4;
    //     break;
    //   case NAVIGATION_SCREENS.SETTING_SCREEN:
    //     activeTabs = 5;
    //     break;
    // }
    // useDispatchAction(setActiveTab(activeTabs.toString()));

    if (name === NAVIGATION_SCREENS.SCANS) {
      checkCam(name);
      return;
    }
    if (route.name != name) {
      if (NAVIGATION_SCREENS.NEW_DASHBOARD == name) {
        navigation.reset({
          index: 0,
          routes: [{ name: name }], // or your screen name
        });
      } else {
        navigation.navigate(name);
      }
    }
  };
  const checkCam = (name) => {
    checkCameraPremission()
      .then((res) => {
        if (res) {
          navigation.navigate(name);
        } else {
          askCameraPremission()
            .then((res) => {
              console.log(res, "res");
              if (res) {
                navigation.navigate(name);
              }
            })
            .catch(() => {
              navigation.navigate(name);
            });
        }
      })
      .catch(() => {
        navigation.navigate(name);
      });
  };

  const handleSwitchCryptoView = () => {
    // Exact same theme values as DashboardCard handleSwitchCryptoView
    const newTheme = {
      backgroundColor: theme.colors.palette.white,
      inverseBackgroundColor: theme.colors.palette.green700,
      textColor: theme.colors.palette.white,
    };

    // Set absolute value - user confirmed line 108 (setisCrypto(false)) is correct
    // Match DashboardCard's dispatch order: isCrypto first, then theme
    useDispatchAction(setisCrypto(false));
    useDispatchAction(setTheme(newTheme));
    
    // Update activeTab for crypto view (activeTab "7")
    if (route.name === NAVIGATION_SCREENS.NEW_DASHBOARD) {
      useDispatchAction(setActiveTab("7"));
    }
  };

  const handleSwitchBankingView = () => {
    // Exact same theme values as DashboardCard handleSwitchBankingView
    const newTheme = {
      backgroundColor: theme.colors.palette.green700,
      inverseBackgroundColor: theme.colors.palette.white,
      textColor: theme.colors.palette.black,
    };

    // Set absolute value to ensure consistent state
    // Since crypto view uses isCrypto=false, banking view should use isCrypto=true to differentiate
    // Match DashboardCard's dispatch order: isCrypto first, then theme
    useDispatchAction(setisCrypto(true));
    useDispatchAction(setTheme(newTheme));
    
    // Update activeTab for banking view (activeTab "1")
    if (route.name === NAVIGATION_SCREENS.NEW_DASHBOARD) {
      useDispatchAction(setActiveTab("1"));
    }
  };


  return (
    <View
      style={
        !isVer
          ? {
              padding: 0,
              backgroundColor: "black",
              // borderRadius: 20,
              position: "absolute",
              bottom: 0,
              zIndex: 9999,
              width: "100%",
              alignSelf: "center",
            }
          : {}
      }
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {/* Dashboard Tab */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            handleSwitchBankingView();
            handleTabSwitch(NAVIGATION_SCREENS.NEW_DASHBOARD);
          }}
        >
          <SvgIcons.HomeIcon style={{ opacity: activeTab === "1" ? 1 : 0.6 }} />
          <CustomText 
            fontWeight='medium' 
            size={11} 
            style={[
              styles.tabLabel, 
              { color: theme.colors.palette.white, opacity: activeTab === "1" ? 1 : 0.6 }
            ]}
          >
            Home
          </CustomText>
        </TouchableOpacity>

        {/* Crypto Tab */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            handleSwitchCryptoView();
            handleTabSwitch(NAVIGATION_SCREENS.NEW_DASHBOARD);
          }}
        >
          <SvgIcons.BottomCryptoIcon color={'white'} width={22} height={22} style={{ opacity: activeTab === "7" ? 1 : 0.6 }} />
          <CustomText 
            fontWeight='medium' 
            size={11} 
            style={[
              styles.tabLabel, 
              { color: theme.colors.palette.white, opacity: activeTab === "7" ? 1 : 0.6 }
            ]}
          >
            Crypto
          </CustomText>
        </TouchableOpacity>

        {/* Scan Tab */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            handleTabSwitch(SCREENS.Scans);
          }}
        >
          <SvgIcons.NewScannerIcon style={{ opacity: activeTab === '3' ? 1 : 0.6 }} />
          <CustomText 
            fontWeight='medium' 
            size={11} 
            style={[
              styles.tabLabel, 
              { color: theme.colors.palette.white, opacity: activeTab === '3' ? 1 : 0.6 }
            ]}
          >
            Scan
          </CustomText>
        </TouchableOpacity>

        {/* Transaction Tab */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            handleTabSwitch(NAVIGATION_SCREENS.UNIFIED_TRANSACTION);
          }}
        >
          <View>
            <SvgIcons.TransactionIcon style={{ opacity: activeTab === "2" ? 1 : 0.6 }} />
            {pendingRequestCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {pendingRequestCount > 99 ? "99+" : pendingRequestCount}
                </Text>
              </View>
            )}
          </View>
          <CustomText 
            fontWeight='medium' 
            size={11} 
            style={[
              styles.tabLabel, 
              { color: theme.colors.palette.white, opacity: activeTab === "2" ? 1 : 0.6 }
            ]}
          >
            Activity
          </CustomText>
        </TouchableOpacity>

        {/* Setting Tab */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            handleTabSwitch(NAVIGATION_SCREENS.SETTING_SCREEN);
          }}
        >
          <SvgIcons.Person width={20} height={20} color={theme.colors.palette.white} style={{ opacity: activeTab === "5" ? 1 : 0.6 }} />
          <CustomText 
            fontWeight='medium' 
            size={11} 
            style={[
              styles.tabLabel, 
              { color: theme.colors.palette.white, opacity: activeTab === "5" ? 1 : 0.6 }
            ]}
          >
            Profile
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  iconContainer: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    marginTop: 2,
    textAlign: 'center',
  },
  badgeContainer: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    position: 'absolute',
    top: -6,
    right: -8,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
  },
});