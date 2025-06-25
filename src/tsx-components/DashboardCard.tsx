import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Platform,
  ToastAndroid,
  Alert,
  ActivityIndicator,
} from "react-native";
import React from "react";
import Card from "./Card";
import { Theme, useTheme } from "styles";
import { useSelector } from "react-redux";
import CustomText from "./CustomText";
import Svg, { SvgXml } from "react-native-svg";

import {
  PayAiro_Green_logo,
  PayAiro_White_logo,
  SVG_eye_off,
  SVG_eye_off_white,
  SVG_eye_on_white,
  SVGCopy2,
  SVGCopy3,
  SVGDoubleChevronGreen,
  SVGDoubleChevronWhite,
  SVGDownArrow3,
  SVGLogo2,
  SVGLogo3,
  SVGPayairoAccountText,
  SVGPayAirofadeLogo,
  SVGPayAiroPatternCard,
  SVGScurityfadeLogo,
  SVGSecurityAccountText,
  SVGSecurityPatternCard,
  SVGUSD,
} from "constants/images";
import LottieView from "lottie-react-native";
import { ANIMATION_CONSTANTS } from "./CryptoCard";
import FadeWrapper from "animations/animations-components/FadeWrapper";
import useDispatchAction from "hooks/useDispatchAction";
import { setisCrypto } from "redux/slices/authenticationSlice";
import { setHeaderText, setTheme } from "redux/slices/animationSlice";
import { queryClient } from "query/queryClient";
import { userContactKeys } from "query/queryKeys";
import { bankKeys } from "query/hooks";

const CONFIGS = {
  CARD_WIDTH: "100%",
  CARD_HEIGHT: 170,
};

const DashboardCard = () => {
  const { headerText, theme: themeApp } = useSelector(
    (s: any) => s.animationSlice
  );

  const {
    isCrypto,
    bankBalance,
    walletData,
    totalDisbursable,
    totalDisbursablePending,
  } = useSelector((s: any) => s.authenticationSlice);

  const { theme } = useTheme();
  const styles = customStyles(theme);
  const [showBalance, setShowBalance] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDisable, setIsDisable] = React.useState(false);
  const renderCurrencySelector = () => (
    <TouchableOpacity
      style={[
        styles.currencySelector,
        {
          backgroundColor: theme.colors.palette.green100,
          padding: theme.spacing.spacing.xs,
          borderRadius: theme.spacing.spacing[10],
          borderWidth: 1 / 2,
          // borderColor: theme.colors.palette.grey300,
          width: 110,
          shadowColor: theme.colors.palette.black,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 2,
        },
      ]}
    >
      <SvgXml xml={SVGUSD} width={30} height={30} />
      <View
        style={[
          styles.currencyTextContainer,
          { marginLeft: theme.spacing.spacing.xxs },
        ]}
      >
        <CustomText
          variant="button"
          color={theme.colors.text.primary}
          style={[
            styles.currencyText,
            { marginHorizontal: theme.spacing.spacing.xxs },
          ]}
        >
          {"USD"}
        </CustomText>
        {!isCrypto && <SvgXml width={15} height={15} xml={SVGDownArrow3} />}
      </View>
    </TouchableOpacity>
  );

  const handleSwitchCryptoView = () => {
    const newTheme = {
      backgroundColor: theme.colors.palette.white,
      inverseBackgroundColor: theme.colors.palette.green700,
      textColor: theme.colors.palette.white,
    };

    useDispatchAction(setisCrypto(!isCrypto));
    useDispatchAction(setTheme(newTheme));
  };

  const handleSwitchBankingView = () => {
    const newTheme = {
      backgroundColor: theme.colors.palette.green700,
      inverseBackgroundColor: theme.colors.palette.white,
      textColor: theme.colors.palette.black,
    };

    useDispatchAction(setisCrypto(!isCrypto));
    useDispatchAction(setTheme(newTheme));
  };

  const copyToClipboard = (e: string) => {
    Clipboard.setString(e);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show("Wallet Address Copied", ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert("Text copied to clipboard!");
    }
  };

  const handleShowBalance = async (isShowBalance: boolean) => {
    if (!isShowBalance) {
      setIsLoading(true);
      await queryClient.invalidateQueries(bankKeys.balance());
      await queryClient.refetchQueries(bankKeys.balance());
      setShowBalance(!showBalance);
      setIsLoading(false);
    } else {
      setShowBalance(!showBalance);
    }
  };

  const BankingCard = () => {
    return (
      <View
        style={{
          width: "100%",
          height: 170,
          backgroundColor: themeApp.backgroundColor,
        }}
      >
        <View
          style={{
            position: "absolute",
            zIndex: 1,
            width: "100%",
            height: 170,
          }}
        >
          <View
            style={{
              //   backgroundColor: "green",
              width: "70%",
              height: 170,
            }}
          >
            <View
              style={{
                flex: 1,
                // backgroundColor: "red",
                paddingHorizontal: 20,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <CustomText color={theme.colors.palette.white} variant={"body1"}>
                {"PayAiro Balance"}
              </CustomText>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                  // backgroundColor: "red",
                  justifyContent: "center",
                }}
              >
                <CustomText
                  numberOfLines={1}
                  color={theme.colors.palette.white}
                  variant={"h3"}
                  style={{ textAlign: "center", textAlignVertical: "center" }}
                >
                  {showBalance
                    ? `$${bankBalance?.bank_account?.usd}`
                    : "$*****"}
                </CustomText>
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.palette.white}
                  />
                )}
                {!isLoading && (
                  <>
                    {showBalance ? (
                      <SvgXml
                        onPress={() => handleShowBalance(showBalance)}
                        xml={SVG_eye_on_white}
                        color={theme.colors.palette.white}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <SvgXml
                        onPress={() => handleShowBalance(showBalance)}
                        xml={SVG_eye_off_white}
                        color={theme.colors.palette.white}
                        width={20}
                        height={20}
                      />
                    )}
                  </>
                )}
              </View>
            </View>
            <View
              style={{
                flex: 1,
                // backgroundColor: "red",
                paddingHorizontal: 20,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <CustomText color={theme.colors.palette.white} variant={"body1"}>
                {"PayAiro ID"}
              </CustomText>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <CustomText
                  color={theme.colors.palette.white}
                  variant={"caption"}
                >
                  {walletData.username}
                </CustomText>
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(walletData.username);
                    // onCopy();
                  }}
                >
                  <SvgXml xml={SVGCopy3} width={18} height={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={{}}>
          <SvgXml
            xml={SVGPayAiroPatternCard}
            width={"100%"}
            height={170}
            style={{ position: "absolute", left: -55, top: 0 }}
          />
          <TouchableOpacity
            onPress={() => {
              setIsDisable(true);
              setTimeout(() => {
                setIsDisable(false);
              }, ANIMATION_CONSTANTS.DURATION);
              handleSwitchBankingView();
            }}
            style={{
              flex: 1,
              backgroundColor: themeApp.inverseBackgroundColor,
              width: 30,
              height: 30,
              position: "absolute",
              top: 69,
              transform: [{ rotate: "270deg" }],
              right: 95,
              zIndex: 1000,
              borderRadius: 20,
            }}
            activeOpacity={1}
            disabled={isDisable}
          >
            <LottieView
              style={{ width: 40, height: 40, top: -5, right: 4 }}
              source={require("../lottie/lottie_arrows_white.json")}
              autoPlay
              loop
            />
          </TouchableOpacity>
          <SvgXml
            xml={SVGSecurityAccountText}
            width={70}
            height={70}
            style={{ position: "absolute", right: 20, top: -10 }}
          />
          <SvgXml
            xml={SVGScurityfadeLogo}
            width={70}
            height={70}
            style={{ position: "absolute", right: 5, top: 80 }}
          />
        </View>
      </View>
    );
  };

  const CryptoCard = () => {
    return (
      <View
        style={{
          width: "100%",
          height: 170,
          backgroundColor: themeApp.backgroundColor,
        }}
      >
        <View
          style={{
            position: "absolute",
            zIndex: 1,
            width: "100%",
            height: 170,
          }}
        >
          <View
            style={{
              //   backgroundColor: "green",
              width: "70%",
              height: 170,
            }}
          >
            <View
              style={{
                flex: 1,
                // backgroundColor: "red",
                paddingHorizontal: 20,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <CustomText color={theme.colors.palette.black} variant={"body1"}>
                {"Crypto Balance"}
              </CustomText>
              <CustomText color={theme.colors.palette.black} variant={"h3"}>
                {totalDisbursable}
              </CustomText>
              {totalDisbursablePending > 0 && (
                <CustomText
                  color={theme.colors.palette.red500}
                  size={12}
                  variant={"caption"}
                >
                  {`(Pending ${totalDisbursablePending?.toFixed(5)})`}
                </CustomText>
              )}
            </View>
            <View
              style={{
                flex: 1,
                // backgroundColor: "red",
                paddingHorizontal: 20,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <CustomText color={theme.colors.palette.white} variant={"body1"}>
                {"PayAiro ID"}
              </CustomText>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <CustomText
                  color={theme.colors.palette.white}
                  variant={"caption"}
                >
                  {walletData.username}
                </CustomText>
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(walletData.username);
                    // onCopy();
                  }}
                >
                  <SvgXml xml={SVGCopy2} width={18} height={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={{}}>
          <SvgXml
            xml={SVGSecurityPatternCard}
            width={"100%"}
            height={170}
            style={{ position: "absolute", left: -55, top: 0 }}
          />
          <TouchableOpacity
            onPress={() => {
              setIsDisable(true);
              setTimeout(() => {
                setIsDisable(false);
              }, ANIMATION_CONSTANTS.DURATION);
              handleSwitchCryptoView();
            }}
            style={{
              flex: 1,
              backgroundColor: themeApp.inverseBackgroundColor,
              width: 30,
              height: 30,
              position: "absolute",
              top: 69,
              transform: [{ rotate: "270deg" }],
              right: 95,
              zIndex: 1000,
              borderRadius: 20,
            }}
            activeOpacity={1}
            disabled={isDisable}
          >
            <LottieView
              style={{ width: 40, height: 40, top: -5, right: 4 }}
              source={require("../lottie/lottie_arrows_green.json")}
              autoPlay
              loop
            />
          </TouchableOpacity>
          <SvgXml
            xml={SVGPayairoAccountText}
            width={70}
            height={70}
            style={{ position: "absolute", right: 20, top: -10 }}
          />
          <SvgXml
            xml={SVGPayAirofadeLogo}
            width={70}
            height={70}
            style={{ position: "absolute", right: 5, top: 80 }}
          />
        </View>
      </View>
    );
  };
  return (
    <Card
      padding={0}
      style={[styles.container]}
      borderRadius={theme.spacing.spacing[10]}
    >
      <View
        style={[
          {
            flex: 1,
            width: "100%",
            height: 70,
            flexDirection: "row",
            paddingHorizontal: 15,
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <CustomText
          style={{ backgroundColor: "" }}
          color=""
          variant="body1"
          size={18}
        >
          {"PayAiro Account"}
        </CustomText>
        {renderCurrencySelector()}
      </View>
      <Card
        borderRadius={theme.spacing.spacing[10]}
        elevation={7}
        padding={0}
        style={styles.mainCard}
      >
        <FadeWrapper
          visible={!isCrypto}
          duration={ANIMATION_CONSTANTS.DURATION}
          firstComponent={BankingCard()}
          secondComponent={CryptoCard()}
        />
      </Card>
    </Card>
  );
};

export default DashboardCard;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.green150,
      marginHorizontal: 10,
    },
    mainCard: {
      width: "100%",
      height: 170,
    },
    currencySelector: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "transparent",
    },
    currencyTextContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    currencyText: {},
  });
