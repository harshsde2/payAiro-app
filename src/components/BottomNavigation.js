import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
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

export default function BottomNavigation({ isVer }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { activeTab, pendingRequest, isCrypto } = useSelector(
    (state) => state.authenticationSlice
  );
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
              padding: 10,
              backgroundColor: "black",
              borderRadius: 20,
              position: "absolute",
              bottom: 20,
              zIndex: 9999,
              width: "92%",
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
          onPress={() => {
            handleSwitchBankingView();
            handleTabSwitch(NAVIGATION_SCREENS.NEW_DASHBOARD);
          }}
        >
          <SvgIcons.HomeIcon style={{ opacity: activeTab === "1" ? 1 : 0.6 }} />
        </TouchableOpacity>

        {/* Crypto Tab */}
        <TouchableOpacity
          onPress={() => {
            handleSwitchCryptoView();
            handleTabSwitch(NAVIGATION_SCREENS.NEW_DASHBOARD);
          }}
        >
          <SvgIcons.CryptoIcon width={25} height={25} style={{ opacity: activeTab === "7" ? 1 : 0.6 }} />
        </TouchableOpacity>

        {/* Scan Tab */}
        <TouchableOpacity
          // disabled={true}
          onPress={() => {
            // handleSwitchBankingView();
            handleTabSwitch(SCREENS.Scans);
          }}
        >
          <SvgIcons.NewScannerIcon
          style={{opacity: activeTab === '3' ? 1 : 0.6}}
          />
        </TouchableOpacity>
        {/* Transaction Tab */}
        <TouchableOpacity
          // disabled={true}
          onPress={() => {
            // handleSwitchBankingView();
            handleTabSwitch(SCREENS.Transaction);
          }}
        >
          <SvgIcons.TransactionIcon
            style={{ opacity: activeTab === "2" ? 1 : 0.6 }}
          />
          {pendingRequest && pendingRequest > 0 ? (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 35,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                backgroundColor: "red",
                position: "absolute",
                bottom: 10,
                right: -10,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: Fonts.semibold,
                  textAlign: "center",
                  fontSize: 12,
                  // paddingBottom: 5,
                }}
              >
                {pendingRequest}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>



        {/* Offer Tab */}
        {/* <TouchableOpacity
          // disabled={true}
          onPress={() => handleTabSwitch(NAVIGATION_SCREENS.REWARDS)}
        >
          <SvgIcons.DiscountShape
            style={{ opacity: activeTab === "4" ? 1 : 0.6 }}
          />
        </TouchableOpacity> */}

        {/* Setting Tab */}
        <TouchableOpacity
          onPress={() => {
            // handleSwitchBankingView();
            handleTabSwitch(NAVIGATION_SCREENS.SETTING_SCREEN);
          }}
        >
          <SvgIcons.SettingIcon
            style={{ opacity: activeTab === "5" ? 1 : 0.6 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
