import React, { FC, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Clipboard,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Theme, useTheme } from "styles";
import Card from "./Card";
import CustomText from "./CustomText";
import FadeWrapper from "animations/animations-components/FadeWrapper";
import { SvgIcons } from "constants/svgs";
import useDispatchAction from "hooks/useDispatchAction";
import LottieView from "lottie-react-native";
import { setTheme } from "redux/slices/animationSlice";
import { setisCrypto, setActiveTab } from "redux/slices/authenticationSlice";
import { ANIMATION_CONSTANTS } from "./CryptoCard";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { SvgUri } from "react-native-svg";

const CONFIGS = {
  CARD_WIDTH: "100%",
  CARD_HEIGHT: 170,
};

const { width: screenWidth } = Dimensions.get("window");
const leftPosition = screenWidth * 0.68; // 70% of screen width

const DashboardCard: FC<{ refetchBankBalanceData: () => void }> = ({
  refetchBankBalanceData,
}) => {
  const { headerText, theme: themeApp } = useSelector(
    (s: any) => s.animationSlice
  );

  const navigation = useNavigation<any>();
  const isIOS = Platform.OS == "ios";

  const {
    isCrypto,
    bankBalance,
    cybridBankBalance,
    walletData,
    totalDisbursable,
    totalDisbursablePending,
    selectedCurrency,
    cryptoData,
  } = useSelector((s: any) => s.authenticationSlice);

  // console.log("cryptoData =>",JSON.stringify(cryptoData, null, 2))

  const { theme } = useTheme();
  const styles = customStyles(theme);
  const formatUsd = (value: unknown): string => {
    const num = Number(value ?? 0);
    if (!isFinite(num)) return "$0.00";
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  const [showBalance, setShowBalance] = React.useState(false); // PayAiro Balance visibility
  const [showPlatformBalance, setShowPlatformBalance] = React.useState(false); // Platform Balance visibility
  const [selectedTab, setSelectedTab] = useState<
    "Available" | "Pending" | "Total"
  >("Available");
  const [selectedCryptoTab, setSelectedCryptoTab] = useState<
    "Available" | "Pending" | "Total"
  >("Available");
  const [showCryptoBalance, setShowCryptoBalance] = React.useState(false);
  const [showPendingBalance, setShowPendingBalance] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDisable, setIsDisable] = React.useState(false);
  const [displayCryptobalance, setDisplayCryptobalance] = useState(
    cryptoData?.rounded_balance || ""
  );
  const hourGlassRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setDisplayCryptobalance(cryptoData?.rounded_balance || "");
  }, [cryptoData]);

  const renderCryptoCurrencySelector = () => (
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
      onPress={() => {
        navigation.navigate(NAVIGATION_SCREENS.CRYPTO_LIST);
      }}
    >
      {(() => {
        const logoUri = selectedCurrency?.logo as string | undefined;
        const isValidLogo =
          typeof logoUri === "string" && logoUri.trim().length > 0;
        const isSvgLogo =
          isValidLogo &&
          (logoUri!.toLowerCase().endsWith(".svg") ||
            logoUri!.toLowerCase().includes("svg+xml"));

        if (!isValidLogo) {
          return <SvgIcons.DollarIcon width={35} height={35} />;
        }

        return (
          <View style={{ width: 30, height: 30 }}>
            {isSvgLogo ? (
              <SvgUri uri={logoUri!} width={30} height={30} />
            ) : (
              <Image
                source={{ uri: logoUri! }}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
              />
            )}
          </View>
        );
      })()}
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
            { marginHorizontal: theme.spacing.spacing.xxs, maxWidth: 40 },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedCurrency?.symbol || "USD"}
        </CustomText>
        {!isCrypto && <SvgIcons.ChevronDown width={15} height={15} />}
      </View>
    </TouchableOpacity>
  );

  const renderAvailabelPendingTotalFiatTab = () => {
    const tabs = [
      {
        id: "Available",
        label: "Available",
        icon: SvgIcons.ToastChecked,
      },
      { id: "Pending", label: "Pending", icon: SvgIcons.PendingBalance },
      { id: "Total", label: "Total", icon: SvgIcons.DollarIcon },
    ];

    return (
      <View
        style={{
          flexDirection: "row",
          // backgroundColor: 'red', // Dark background for container
          borderTopRightRadius: 20,
          width: "100%",
          // padding: 4,
          marginBottom: 0,
          marginLeft:10,
          // marginLeft,
          marginTop: 0,
          // alignSelf: 'center',
          // justifyContent: "center",
          // borderWidth: 1,
          // borderBottomLeftRadius:0,
          // borderBottomRightRadius:0,
          // borderColor: theme.colors.palette.grey700,
        }}
      >
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedTab(tab.id as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                // backgroundColor: isSelected
                //   ? theme.colors.palette.green500
                //   : "transparent",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                // borderBottomLeftRadius:0,
              }}
            >
              <Icon
                width={16}
                height={16}
                color={theme.colors.palette.white}
                style={{ marginRight: 6 }}
              />
              <CustomText
                variant="caption"
                size={isSelected ? 10 : 8}
                color={theme.colors.palette.white}
                style={{ fontWeight: isSelected ? "700" : "400" }}
              >
                {tab.label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderAvailabelPendingTotalCryptoTab = () => {
    const tabs = [
      {
        id: "Available",
        label: "Available",
        icon: SvgIcons.DoneCrypto,
      },
      { id: "Pending", label: "Pending", icon: SvgIcons.PendingCrypto },
      { id: "Total", label: "Total", icon: SvgIcons.DollarIcon },
    ];

    return (
      <View
        style={{
          flexDirection: "row",
          borderTopRightRadius: 20,
          width: "100%",
          marginBottom: 0,
          marginLeft: 10,
          marginTop: 0,
        }}
      >
        {tabs.map((tab) => {
          const isSelected = selectedCryptoTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedCryptoTab(tab.id as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                // backgroundColor: isSelected
                //   ? theme.colors.palette.black
                //   : "transparent",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}
            >
              <Icon
                width={16}
                height={16}
                color={
                  isSelected
                    ? theme.colors.palette.green700
                    : theme.colors.palette.black
                }
                style={{ marginRight: 6 }}
              />
              <CustomText
                variant="caption"
                size={isSelected ? 10 : 8}
                color={
                  isSelected
                    ? theme.colors.palette.green700
                    : theme.colors.palette.black
                }
                style={{ fontWeight: isSelected ? "700" : "400" }}
              >
                {tab.label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderFiatCurrencySelector = () => (
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
      disabled={true}
    >
      <SvgIcons.DollarIcon width={35} height={35} />
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
        {!isCrypto && <SvgIcons.ChevronDown width={15} height={15} />}
      </View>
    </TouchableOpacity>
  );

  const handleSwitchCryptoView = () => {
    const newTheme = {
      backgroundColor: theme.colors.palette.white,
      inverseBackgroundColor: theme.colors.palette.green700,
      textColor: theme.colors.palette.white,
    };

    // isCrypto true = fiat, false = crypto
    // Switching to crypto view, so isCrypto becomes false, activeTab = "7"
    useDispatchAction(setisCrypto(!isCrypto));
    useDispatchAction(setActiveTab("1"));
    useDispatchAction(setTheme(newTheme));
  };

  const handleSwitchBankingView = () => {
    const newTheme = {
      backgroundColor: theme.colors.palette.green700,
      inverseBackgroundColor: theme.colors.palette.white,
      textColor: theme.colors.palette.black,
    };

    // isCrypto true = fiat, false = crypto
    // Switching to banking/fiat view, so isCrypto becomes true, activeTab = "1"
    useDispatchAction(setisCrypto(!isCrypto));
    useDispatchAction(setActiveTab("7"));
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
    // if (walletData?.fortress) {
    if (!isShowBalance) {
      setIsLoading(true);
      // await queryClient.invalidateQueries(bankKeys.balance());
      // await queryClient.refetchQueries(bankKeys.balance());
      refetchBankBalanceData();
      setShowBalance(!showBalance);
      setIsLoading(false);
    } else {
      setShowBalance(!showBalance);
    }
    // }
    // else {
    //   if (!isShowBalance) {
    //     setIsLoading(true);
    //     await queryClient.invalidateQueries(bankKeys.cybridBalance());
    //     await queryClient.refetchQueries(bankKeys.cybridBalance());
    //     setShowBalance(!showBalance);
    //     setIsLoading(false);
    //   } else {
    //     setShowBalance(!showBalance);
    //   }
    // }
  };

  const handleShowPlatformBalance = async (isShowPlatformBalance: boolean) => {
    // Platform balance is in fiat/banking view, so activeTab = "1"
    useDispatchAction(setActiveTab("1"));

    if (!isShowPlatformBalance) {
      setIsLoading(true);
      refetchBankBalanceData();
      setShowPlatformBalance(!showPlatformBalance);
      setIsLoading(false);
    } else {
      setShowPlatformBalance(!showPlatformBalance);
    }
  };

  const handleShowCryptoBalance = async (isShowCryptoBalance: boolean) => {
    // Crypto balance is in crypto view, so activeTab = "7"
    useDispatchAction(setActiveTab("7"));

    if (!isShowCryptoBalance) {
      setIsLoading(true);
      // Invalidate and refetch crypto balance queries
      // await queryClient.invalidateQueries(cryptoKeys.cryptoBalanceByAsset(selectedCurrency?.symbol) as any);
      // await queryClient.refetchQueries(cryptoKeys.cryptoBalanceByAsset(selectedCurrency?.symbol) as any);
      setShowCryptoBalance(!showCryptoBalance);
      setIsLoading(false);
    } else {
      setShowCryptoBalance(!showCryptoBalance);
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
            {renderAvailabelPendingTotalFiatTab()}
            <View style={{ flex: 1, flexDirection: "column" }}>
              <View
                style={{
                  // flex: 1,
                  // backgroundColor: "red",
                  paddingHorizontal: 20,
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <CustomText
                  color={theme.colors.palette.white}
                  variant={"body1"}
                >
                  {selectedTab === "Available"
                    ? "PayAiro Balance"
                    : selectedTab === "Total"
                    ? "Total Balance"
                    : "Pending Balance"}
                </CustomText>
                <View style={styles.balanceRow}>
                  <CustomText
                    numberOfLines={1}
                    color={theme.colors.palette.white}
                    variant={"h3"}
                    style={{
                      textAlign: "center",
                      textAlignVertical: "center",
                    }}
                  >
                    {(() => {
                      const isVisible =
                        selectedTab === "Total"
                          ? showPlatformBalance
                          : showBalance;
                      if (!isVisible) return "$*****";

                      if (selectedTab === "Available")
                        return formatUsd(bankBalance?.platform_available);
                      if (selectedTab === "Total")
                        return formatUsd(bankBalance?.platform_balance);
                      if (selectedTab === "Pending") {
                        const pending =
                          (Number(bankBalance?.platform_balance) || 0) -
                          (Number(bankBalance?.platform_available) || 0);
                        return formatUsd(pending);
                      }
                      return "$0.00";
                    })()}
                  </CustomText>
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.palette.white}
                    />
                  )}
                  {!isLoading && (
                    <TouchableOpacity style={{ zIndex: 11 }}>
                      {(() => {
                        const isVisible =
                          selectedTab === "Total"
                            ? showPlatformBalance
                            : showBalance;
                        const handlePress = () =>
                          selectedTab === "Total"
                            ? handleShowPlatformBalance(showPlatformBalance)
                            : handleShowBalance(showBalance);

                        return isVisible ? (
                          <SvgIcons.EyeOnOutlineWhite
                            onPress={handlePress}
                            color={theme.colors.palette.white}
                            width={20}
                            height={20}
                          />
                        ) : (
                          <SvgIcons.EyeOffOutlineWhite
                            onPress={handlePress}
                            color={theme.colors.palette.white}
                            width={20}
                            height={20}
                          />
                        );
                      })()}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: "column" }}>
              
              <View
                style={{
                  flex: 1,
                  // backgroundColor: "green",
                  paddingHorizontal: 20,
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <CustomText
                  color={theme.colors.palette.white}
                  variant={"body1"}
                >
                  {"PayAiro ID"}
                </CustomText>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <CustomText
                    color={theme.colors.palette.white}
                    variant={"caption"}
                  >
                    {walletData?.username}
                  </CustomText>
                  <TouchableOpacity
                    onPress={() => {
                      copyToClipboard(walletData?.username);
                      // onCopy();
                    }}
                  >
                    <SvgIcons.Copy width={18} height={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{}}>
          <SvgIcons.FiatPatterncard
            width={"100%"}
            height={170}
            style={{ position: "absolute", left: isIOS ? -55 : -60, top: 0 }}
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
              left: "68%",
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
          <SvgIcons.SecuritiesText
            width={70}
            height={70}
            style={{ position: "absolute", right: 20, top: -10 }}
          />
          <SvgIcons.SecurityFadeLogo
            width={70}
            height={70}
            style={{ position: "absolute", right: 5, top: 80 }}
          />
        </View>
      </View>
    );
  };

  // console.log("totalDisbursable =>", totalDisbursable);
  const CryptoCard = () => {
    return (
      <View
        style={{
          width: "100%",
          height: 170,
          backgroundColor: theme.colors.palette.green700,
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
            {renderAvailabelPendingTotalCryptoTab()}
            <View style={{ flex: 1, flexDirection: "column" }}>
              <View
                style={{
                  // flex: 1,
                  // backgroundColor: "red",
                  paddingHorizontal: 20,
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <CustomText color={theme.colors.palette.black} variant={"body1"}>
                  {selectedCryptoTab === "Available"
                    ? "Crypto Balance"
                    : selectedCryptoTab === "Total"
                    ? "Total Crypto Balance"
                    : "Pending Crypto Balance"}
                </CustomText>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <CustomText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    color={theme.colors.palette.black}
                    variant={"h3"}
                    // style={{ flex: 1 }}
                  >
                    {(() => {
                      if (!showCryptoBalance) return "*****";
                      
                      // Safely check if in USD mode
                      const isUsdMode = cryptoData?.usd_price != null && 
                        displayCryptobalance != null && 
                        Number(displayCryptobalance) === Number(cryptoData?.usd_price);
                      
                      // Safely convert to numbers with fallback to 0
                      const availableCrypto = Number(cryptoData?.platform_available) || 0;
                      const platformBalance = Number(cryptoData?.platform_balance) || 0;
                      const pendingCrypto = Math.abs(availableCrypto - platformBalance);
                      const totalCrypto = platformBalance;
                      const availableUsd = Number(cryptoData?.usd_price) || 0;
                      
                      // Calculate conversion rate: USD per crypto unit (with safety check)
                      const conversionRate = availableCrypto > 0 && availableUsd > 0
                        ? availableUsd / availableCrypto 
                        : 0;
                      
                      // Determine decimal places: 5 for ETH/BTC, 2 for others
                      const currencySymbol = selectedCurrency?.symbol?.toUpperCase() || "";
                      const isEthOrBtc = currencySymbol === "ETH" || currencySymbol === "BTC";
                      const cryptoDecimals = isEthOrBtc ? 5 : 2;
                      
                      if (selectedCryptoTab === "Available") {
                        // Handle null/undefined/empty string, but preserve 0 as valid value
                        return displayCryptobalance != null && displayCryptobalance !== "" 
                          ? String(displayCryptobalance) 
                          : "0.00";
                      }
                      if (selectedCryptoTab === "Total") {
                        if (isUsdMode) {
                          const totalUsd = availableUsd + (pendingCrypto * conversionRate);
                          return isNaN(totalUsd) ? "0.00" : totalUsd.toFixed(2);
                        } else {
                          return isNaN(totalCrypto) ? "0.00" : totalCrypto.toFixed(cryptoDecimals);
                        }
                      }
                      if (selectedCryptoTab === "Pending") {
                        if (isUsdMode) {
                          const pendingUsd = pendingCrypto * conversionRate;
                          return isNaN(pendingUsd) ? "0.00" : pendingUsd.toFixed(2);
                        } else {
                          return isNaN(pendingCrypto) ? "0.00" : pendingCrypto.toFixed(cryptoDecimals);
                        }
                      }
                      // Fallback: handle null/undefined/empty string, but preserve 0 as valid value
                      return displayCryptobalance != null && displayCryptobalance !== "" 
                        ? String(displayCryptobalance) 
                        : "0.00";
                    })()}
                  </CustomText>
                  {!isLoading && (
                    <TouchableOpacity style={{ zIndex: 11 }}>
                      {showCryptoBalance ? (
                        <SvgIcons.EyeOnGreenbg
                          onPress={() =>
                            handleShowCryptoBalance(showCryptoBalance)
                          }
                          color={theme.colors.palette.black}
                          width={20}
                          height={20}
                        />
                      ) : (
                        <SvgIcons.EyeOffGreenbg
                          onPress={() =>
                            handleShowCryptoBalance(showCryptoBalance)
                          }
                          color={theme.colors.palette.black}
                          width={20}
                          height={20}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.palette.black}
                    />
                  )}
                  <SvgIcons.CrytoToDollorConversion
                    onPress={() => {
                      setDisplayCryptobalance(
                        displayCryptobalance == cryptoData?.usd_price
                          ? cryptoData?.rounded_balance
                          : cryptoData?.usd_price
                      );
                    }}
                    width={30}
                    height={30}
                  />
                </View>
                {totalDisbursablePending > 0 && showCryptoBalance && selectedCryptoTab === "Available" && (
                  <CustomText
                    color={theme.colors.palette.red500}
                    size={12}
                    variant={"caption"}
                  >
                    {`(Pending ${(totalDisbursablePending || 0).toFixed(5)})`}
                  </CustomText>
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
                  {walletData?.username}
                </CustomText>
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(walletData?.username);
                    // onCopy();
                  }}
                >
                  <SvgIcons.Copy width={18} height={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={{}}>
          <SvgIcons.SecuritiesPatternCard
            // xml={SVGSecurityPatternCard}
            width={"100%"}
            height={170}
            style={{ position: "absolute", left: isIOS ? -55 : -60, top: 0 }}
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
              backgroundColor: "white",
              width: 30,
              height: 30,
              position: "absolute",
              top: 69,
              transform: [{ rotate: "270deg" }],
              left: "68%",
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
          <SvgIcons.PayairoText
            height={70}
            style={{ position: "absolute", right: 20, top: -10 }}
          />
          <SvgIcons.PayairoFadeLogo
            width={70}
            height={70}
            style={{ position: "absolute", right: 5, top: 80 }}
          />
        </View>
      </View>
    );
  };

  // console.log('isCrypto =>', isCrypto)
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
        {!isCrypto
          ? renderCryptoCurrencySelector()
          : renderFiatCurrencySelector()}
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
    balanceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 10,
    },
    platformBalanceContainer: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    platformBalanceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 10,
    },
  });
