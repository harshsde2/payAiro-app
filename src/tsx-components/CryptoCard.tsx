import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  LayoutChangeEvent,
  LayoutRectangle,
  Clipboard,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useTheme } from "../styles/ThemeContext";
import Card from "./Card";
import CustomText from "./CustomText";
import { colors, fontFamily, fontSize, fontWeight } from "styles";
import {
  PayAiro_Green_logo,
  PayAiro_White_logo,
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
} from "constants/images";
import { Text } from "react-native-gesture-handler";
import useDispatchAction from "hooks/useDispatchAction";
import Slide from "animations/animations-components/Slide";
import FadeWrapper from "animations/animations-components/FadeWrapper";
import FlipSlide from "animations/animations-components/FlipSlide";
import ExpandableComp, {
  ExpandableCompRef,
} from "animations/animations-components/ExpandableComp";
import {
  setCardSwitchDetails,
  setisCrypto,
} from "redux/slices/authenticationSlice";
import { useSelector } from "react-redux";
import GhostSlide from "animations/animations-components/GhostSlide";
import LottieView from "lottie-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";

// Animation Constants
export const ANIMATION_CONSTANTS = {
  DURATION: 2000,
};

// Account data constants
const ACCOUNTS = {
  PAYAIRO: {
    id: 1,
    headerName: "Payairo Account",
    balanceName: "Payairo Balance",
    currencyName: "USD",
    name: "Payairo Account.",
    balance: "$25,076.08",
    tabBackgroundColor: null,
    cardBackgroundColor: "#fff",
    addressName: "Payairo ID",
    walletAddress: "Frances_swann568@payairo.com",
  },
  CRYPTO: {
    id: 2,
    headerName: "Security Account",
    balanceName: "Holdings",
    currencyName: "USDT",
    name: "Crypto Wallet.",
    balance: "75,182.10",
    tabBackgroundColor: "#fff",
    walletAddress: "0x36572a65f3c8.........b15E5",
    addressName: "Wallet Address",
  },
};

interface CryptoCardProps {
  isCrypto: boolean;
  onSwitchView: () => void;
  payAirobalance?: string;
  headerTitle: string;
  // balance: any;
  currencySymbol?: string;
  currencyIcon?: string | null;
  identifierType?: string;
  identifier?: string;
  pendingAmount?: number;
  onCopy?: () => void;
  onWithdraw?: () => void;
  rightSideIcon?: React.ReactNode;
  logoSvg?: string;
  totalDisbursable?: number;
}

const CryptoCard: React.FC<CryptoCardProps> = ({
  // isCrypto,
  onSwitchView,
  headerTitle,
  // balance,
  currencySymbol = "USD",
  currencyIcon,
  identifierType,
  identifier,
  pendingAmount,
  onCopy,
  onWithdraw,
  rightSideIcon,
  logoSvg,
  totalDisbursable,
  payAirobalance,
}) => {
  // Refs
  const expandableRef = useRef<ExpandableCompRef>(null);

  // redux
  const { isCrypto, CardSwitchDetails, walletData } = useSelector(
    (state: any) => state.authenticationSlice
  );
  const { balance, headerText } = useSelector(
    (state: any) => state.animationSlice
  );

  // console.log("CardSwitchDetails =>", headerText);
  // Theme
  const { theme } = useTheme();

  // State variables
  const [slideUpVisible, setSlideUpVisible] = useState(true);
  const [userDetails, setUserDetails] = useState(ACCOUNTS.PAYAIRO as any);

  // Styles
  const styles = createStyles(theme);

  // console.log("CardSwitchDetails =>", CardSwitchDetails?.balanceText)

  const formattedBalance = CardSwitchDetails?.balanceText
    ? Number(CardSwitchDetails.balanceText).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: isCrypto ? 2 : 5,
      })
    : "0.00";

  const [wholePart, decimalPart] = formattedBalance.split(".");

  const backgroundColorValue = useSharedValue(0); // 0 = color A, 1 = color B

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      backgroundColorValue.value,
      [0, 0.4, 0.6, 1],
      [
        theme.colors.palette.white,
        theme.colors.palette.white,
        theme.colors.palette.green700,
        theme.colors.palette.green700,
      ] // From Red to Green
    );

    return {
      backgroundColor,
    };
  });

  const changeColor = () => {
    backgroundColorValue.value = withTiming(
      backgroundColorValue.value === 0 ? 1 : 0,
      {
        duration: ANIMATION_CONSTANTS.DURATION,
        easing: Easing.inOut(Easing.ease),
      }
    );
  };
  // console.log("totalDisbursable =>", totalDisbursable)

  useEffect(() => {
    if (totalDisbursable || payAirobalance) {
      if (isCrypto) {
        useDispatchAction(
          setCardSwitchDetails({
            ...CardSwitchDetails,
            balanceText: payAirobalance,
            idText: walletData?.username,
          })
        );
      } else {
        useDispatchAction(
          setCardSwitchDetails({
            ...CardSwitchDetails,
            balanceText: totalDisbursable,
            idText: walletData?.username,
          })
        );
      }
    }
  }, [payAirobalance, walletData, totalDisbursable]);

  const copyToClipboard = (e: string) => {
    Clipboard.setString(e);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show("Wallet Address Copied", ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert("Text copied to clipboard!");
    }
  };

  const handleSwitchView = () => {
    let data = { ...CardSwitchDetails };
    if (isCrypto) {
      data = {
        balanceHeaderText: "Securities Balance",
        balanceText: totalDisbursable,
        idHeaderText: "Wallet Address",
        idText: walletData?.username,
        cardBackgroundColor: theme.colors.palette.green700,
        lottieArrowBackgroundColor: theme.colors.palette.white,
      };
    } else {
      data = {
        balanceHeaderText: "PayAiro Balance",
        idHeaderText: "PayAiro ID",
        balanceText: payAirobalance,
        idText: walletData?.username,
        cardBackgroundColor: theme.colors.palette.white,
        lottieArrowBackgroundColor: theme.colors.palette.green700,
      };
    }
    useDispatchAction(setisCrypto(!isCrypto));

    setTimeout(() => {
      changeColor();
      useDispatchAction(setCardSwitchDetails(data));
    }, ANIMATION_CONSTANTS.DURATION / 2);
  };

  // Render helpers
  const renderHeaderSection = () => (
    <View
      style={[
        styles.header,
        {
          paddingHorizontal: theme.spacing.spacing.md,
          marginVertical: theme.spacing.spacing.sm,
          justifyContent: "space-between",
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
        },
      ]}
    >
      <View style={{ flex: 1, justifyContent: "flex-start" }}>
        <FlipSlide
          visible={!slideUpVisible}
          topText={ACCOUNTS.PAYAIRO.headerName}
          bottomText={ACCOUNTS.CRYPTO.headerName}
          // flipDuration={ANIMATION_CONSTANTS.TEXT_FLIP.DURATION}
          // fastPortion={ANIMATION_CONSTANTS.TEXT_FLIP.FAST_PORTION}
          textStyle={{
            textAlign: "left",
            fontSize: 18,
            fontWeight: "bold",

            fontFamily: theme.typography.fontFamily.montserrat,
            textAlignVertical: "center",
          }}
          distance={100}
          style={{}}
          onAnimationComplete={() => {}}
        />
      </View>
      {renderCurrencySelector()}
    </View>
  );

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
      {currencyIcon && <SvgXml xml={currencyIcon} width={30} height={30} />}
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
          {userDetails.currencyName}
        </CustomText>
        {!isCrypto && <SvgXml width={15} height={15} xml={SVGDownArrow3} />}
      </View>
    </TouchableOpacity>
  );

  const renderBalanceInfo = () => (
    <View style={[styles.leftContent, { padding: theme.spacing.spacing.sm }]}>
      <CustomText
        variant="subtitle2"
        color={
          isCrypto ? theme.colors.palette.white : theme.colors.text.primary
        }
        style={[
          styles.balanceTitle,
          { marginBottom: theme.spacing.spacing[0] },
        ]}
        fontFamily={theme.typography.fontFamily.montserrat}
        fontWeight={"regular"}
      >
        {CardSwitchDetails?.balanceHeaderText}
      </CustomText>

      {renderCryptoBalance()}
      {!isCrypto && renderPendingAmount()}
      {renderIdentifierInfo()}
    </View>
  );

  const renderCryptoBalance = () => {
    // Determine font size based on number of digits in wholePart
    const digits = wholePart.replace(/,/g, "").length;
    const isManyDigits = digits > 6;

    // Calculate appropriate font sizes based on available TextVariant types
    const wholePartFontSize = isManyDigits ? "h3" : "h2";
    const decimalPartFontSize = isManyDigits ? "h4" : "h4";

    return (
      <View style={styles.balanceWrapper}>
        <View
          style={[
            styles.balanceContainer,
            { maxWidth: digits > 8 ? "60%" : "65%" },
          ]}
        >
          {/* Combined balance display to ensure no spacing issues */}
          <CustomText
            variant={wholePartFontSize}
            color={
              isCrypto ? theme.colors.palette.white : theme.colors.text.primary
            }
            style={[
              styles.balanceAmount,
              isManyDigits && { fontSize: digits > 9 ? 20 : 24 },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {isCrypto
              ? `$${wholePart}.${decimalPart}`
              : `${wholePart}.${decimalPart}`}
          </CustomText>
        </View>

        {/* <TouchableOpacity
          style={[
            styles.withdrawButton,
            isManyDigits && styles.withdrawButtonCompact
          ]}
          onPress={onWithdraw}
        >
          <CustomText style={[
            styles.withdrawText,
            isManyDigits && styles.withdrawTextCompact
          ]}>
            Withdraw
          </CustomText>
        </TouchableOpacity> */}
      </View>
    );
  };

  const renderPendingAmount = () => (
    <CustomText
      color={
        pendingAmount !== undefined && !isCrypto
          ? "red"
          : theme.colors.palette.white
      }
      variant="caption"
      style={[
        styles.pendingAmount,
        {
          marginBottom: theme.spacing.spacing.md,
          position: "absolute",
          top: 60,
          left: 10,
        },
      ]}
    >
      {`(Pending ${pendingAmount?.toFixed(5)})`}
    </CustomText>
  );

  const renderIdentifierInfo = () =>
    identifierType && (
      <>
        <CustomText
          color={theme.colors.palette.white}
          fontFamily={theme.typography.fontFamily.montserrat}
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontFamily: theme.typography.fontFamily.montserrat,
            fontWeight: "400",
          }}
        >
          {CardSwitchDetails?.idHeaderText}
        </CustomText>

        <View style={styles.identifierRow}>
          <CustomText
            // variant="body2"
            color={theme.colors.palette.white}
            numberOfLines={1}
            style={[
              styles.identifier,
              {
                fontSize: theme.typography.fontSize.xs,
                fontWeight: "300",
              },
            ]}
          >
            {CardSwitchDetails?.idText}
          </CustomText>

          {onCopy && (
            <TouchableOpacity
              onPress={() => {
                if (identifier) {
                  copyToClipboard(identifier);
                  // onCopy();
                }
              }}
            >
              <SvgXml
                xml={isCrypto ? SVGCopy3 : SVGCopy2}
                width={18}
                height={18}
              />
            </TouchableOpacity>
          )}
        </View>
      </>
    );

  // Main render
  return (
    <Card
      style={styles.container}
      padding={0}
      borderRadius={theme.spacing.spacing[10]}
    >
      {renderHeaderSection()}

      <Card
        // backgroundColor={}
        borderRadius={theme.spacing.spacing[10]}
        elevation={7}
        padding={0}
        style={styles.mainCard}
      >
        <Animated.View style={[{ flex: 1, padding: 10 }, animatedStyle]}>
          <FadeWrapper
            visible={!isCrypto} // Toggle this to fade between components
            duration={ANIMATION_CONSTANTS.DURATION}
            firstComponent={
              <SvgXml
                xml={SVGPayAiroPatternCard}
                width={"100%"}
                height={170}
                style={{ position: "absolute", left: -55, top: -10 }}
              />
            }
            secondComponent={
              <SvgXml
                xml={SVGSecurityPatternCard}
                width={"100%"}
                height={170}
                style={{ position: "absolute", left: -55, top: -10 }}
              />
            }
          />
          {/* <SvgXml
            xml={isCrypto ? SVGPayAiroPatternCard : SVGSecurityPatternCard}
            width={'100%'}
            height={170}
            style={{ position: 'absolute', left: -55, top: -10 }}
          /> */}

          <TouchableOpacity
            onPress={handleSwitchView}
            style={{
              flex: 1,
              backgroundColor: CardSwitchDetails?.lottieArrowBackgroundColor,
              width: 30,
              height: 30,
              position: "absolute",
              top: "46%",
              transform: [{ rotate: "270deg" }],
              right: 90,
              zIndex: 1000,
              borderRadius: 20,
            }}
            activeOpacity={1}
          >
            {isCrypto ? (
              <LottieView
                style={{ width: 40, height: 40, top: -5, right: 4 }}
                source={require("../lottie/lottie_arrows_white.json")}
                autoPlay
                loop
              />
            ) : (
              <LottieView
                style={{ width: 40, height: 40, top: -5, right: 4 }}
                source={require("../lottie/lottie_arrows_green.json")}
                autoPlay
                loop
              />
            )}
          </TouchableOpacity>

          <FadeWrapper
            visible={!isCrypto} // Toggle this to fade between components
            duration={ANIMATION_CONSTANTS.DURATION}
            firstComponent={
              <SvgXml
                xml={SVGScurityfadeLogo}
                width={70}
                height={70}
                style={{ position: "absolute", right: 5, top: 80 }}
              />
            }
            secondComponent={
              <SvgXml
                xml={SVGPayAirofadeLogo}
                width={70}
                height={70}
                style={{ position: "absolute", right: 5, top: 80 }}
              />
            }
          />
          <FadeWrapper
            visible={!isCrypto} // Toggle this to fade between components
            duration={ANIMATION_CONSTANTS.DURATION}
            firstComponent={
              <SvgXml
                xml={SVGSecurityAccountText}
                width={70}
                height={70}
                style={{ position: "absolute", right: 10, top: -15 }}
              />
            }
            secondComponent={
              <SvgXml
                xml={SVGPayairoAccountText}
                width={70}
                height={70}
                style={{ position: "absolute", right: 10, top: -15 }}
              />
            }
          />

          <View style={styles.cardContent}>
            <FadeWrapper
              visible={!isCrypto} // Toggle this to fade between components
              duration={ANIMATION_CONSTANTS.DURATION}
              style={[
                styles.leftContent,
                { padding: theme.spacing.spacing.sm, width: "100%" },
              ]}
              firstComponent={renderBalanceInfo()}
              secondComponent={renderBalanceInfo()}
            />
          </View>
        </Animated.View>
      </Card>
    </Card>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    // Layout containers
    container: {
      width: "100%",
      backgroundColor: colors.green100,
    },
    mainCard: {
      width: "100%",
    },
    cardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // paddingVertical: theme?.spacing?.spacing?.sm,
      width: "100%",
      marginLeft: -5,
      // backgroundColor:'red'
    },
    contentContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    leftContent: {
      width: "70%", // Reduced width to ensure space for logo
      height: 150,
    },

    // Header styles
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme?.spacing?.spacing.xxs,
    },

    // Currency selector styles
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

    // Balance styles
    balanceWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme?.spacing?.spacing[10],
      paddingRight: 10, // Ensure space from logo
      width: "100%", // Take full width
      // backgroundColor:'blue'
    },
    balanceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      maxWidth: "65%", // Limit width to prevent overflow
      flexShrink: 1, // Allow shrinking to fit available space
    },
    balanceAmount: {
      marginRight: 0,
      flexShrink: 1, // Allow shrinking to fit available space
      letterSpacing: -0.5, // Tighten character spacing
    },
    balanceDecimals: {
      marginTop: 0,
      marginLeft: -2, // Reduce space between the whole part and decimal
      flexShrink: 0, // Prevent the decimal part from shrinking
    },
    balanceTitle: {},
    pendingAmount: {},

    // Identifier styles
    identifierType: {},
    identifierRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    identifier: {
      // width: '80%',
      marginRight: 20,
    },

    // // Logo styles
    // logoContentContainer: {
    //   position: 'absolute',
    //   width: ANIMATION_CONSTANTS.EXPANDABLE_CARD.WIDTH,
    //   right: 8,
    //   top: -5,
    //   borderRadius: theme.spacing.spacing[6],
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   height: ANIMATION_CONSTANTS.EXPANDABLE_CARD.HEIGHT,
    //   zIndex: 15000,
    // },
    logoImage: {
      width: 50,
      height: 55,
      marginBottom: 10,
    },
    logoTextContainer: {
      position: "absolute",
      right: 5,
      bottom: 10,
      width: 70,
      height: 40,
      overflow: "hidden",
    },
    textAnimatedContainer: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    accountText: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#000",
      position: "absolute",
      right: 25,
      bottom: 10,
    },
    accountLabel: {
      fontSize: 10,
      color: "#000",
      textAlign: "right",
      position: "absolute",
      right: 10,
      bottom: 20,
    },

    // Button styles
    withdrawButton: {
      backgroundColor: theme.colors.palette.black,
      paddingHorizontal: theme?.spacing?.spacing?.sm,
      paddingVertical: theme?.spacing?.spacing?.xs,
      borderRadius: theme?.spacing?.spacing?.xxl,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0, // Prevent the button from shrinking
      marginLeft: 8, // Add consistent space between balance and button
    },
    withdrawButtonCompact: {
      paddingHorizontal: theme?.spacing?.spacing?.xs,
      paddingVertical: 4,
      borderRadius: theme?.spacing?.spacing?.lg,
    },
    withdrawText: {
      color: theme.colors.palette.white,
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.montserrat,
      fontWeight: "600",
    },
    withdrawTextCompact: {
      fontSize: 10,
    },
    contentText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

export default CryptoCard;
