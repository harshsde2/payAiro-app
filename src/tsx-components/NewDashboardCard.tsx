import React, { useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions, Clipboard, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SvgIcons } from "constants/svgs";
import CustomText from "./CustomText";
import { useTheme } from "styles/ThemeContext";
import { INewDashboardCardProps } from "./NewDashboardCard/types";
import { showSuccess } from "../utils/toast";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(448, SCREEN_WIDTH - 32); // Responsive width with padding
const CARD_HEIGHT = 220;

// PayAiro Logo SVG Component (simplified P shape)
const PayAiroLogo: React.FC<{ size: number; opacity: number }> = ({
  size,
  opacity,
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        opacity,
        position: "absolute",
        top: 32,
        right: 10,
      }}
    >
      <SvgIcons.PayairoWhiteLogo width={size} height={size} />
    </View>
  );
};

// Crypto Icon Watermark
const CryptoIconWatermark: React.FC<{ size: number; opacity: number }> = ({
  size,
  opacity,
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        opacity,
        position: "absolute",
        top: 32,
        right: 32,
      }}
    >
      <SvgIcons.NewCryptoIcon width={size} height={size} />
    </View>
  );
};

// Chevron Icon Component
const ChevronIcon: React.FC<{ color: string }> = ({ color }) => {
  return (
    <View style={{ flexDirection: "column", marginLeft: 4 }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 3,
          borderRightWidth: 3,
          borderBottomWidth: 4,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
          marginBottom: 1,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 3,
          borderRightWidth: 3,
          borderTopWidth: 4,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: color,
        }}
      />
    </View>
  );
};

const NewDashboardCard: React.FC<Partial<INewDashboardCardProps>> = ({
  balance,
  userId = "",
  onToggleVisibility,
  onQRCodePress,
  isBalanceVisible = false, // Default to hidden for security
  onRefreshBalance,
  isRefreshing = false,
}) => {
  const { walletData, isCrypto, bankBalance, cryptoData, allCryptoBalances, aggregatedCryptoBalances } =
    useSelector((state: any) => state.authenticationSlice);

  // console.log(JSON.stringify(allCryptoBalances,null,2), "allCryptoBalances");
  // console.log(JSON.stringify(aggregatedCryptoBalances,null,2), "aggregatedCryptoBalances");
  const { theme } = useTheme();
  const [localBalanceVisible, setLocalBalanceVisible] =
    useState(isBalanceVisible);
  
  // State for balance type selection (Available, Pending, Total)
  const [selectedBalanceType, setSelectedBalanceType] = useState<
    "Available" | "Pending" | "Total"
  >("Available");

  // Animation value for smooth transitions
  const themeTransition = useSharedValue(!isCrypto ? 1 : 0);
  const balanceAnimation = useSharedValue(0);

  // Handle badge click - cycle through Available -> Pending -> Total -> Available
  const handleBadgeClick = () => {
    setSelectedBalanceType((prev) => {
      if (prev === "Available") return "Pending";
      if (prev === "Pending") return "Total";
      return "Available";
    });
    
    // Animate balance change
    balanceAnimation.value = withTiming(1, { duration: 200 }, () => {
      balanceAnimation.value = 0;
    });
  };

  // Get balance based on selected type and mode
  const currentBalance = useMemo(() => {
    if (balance !== undefined) {
      return balance;
    }

    // Payairo mode (isCrypto = true)
    if (isCrypto) {
      switch (selectedBalanceType) {
        case "Available":
          return Number(
            bankBalance?.platform_available ||
              bankBalance?.bank_account?.usd ||
              0
          );
        case "Pending":
          // Calculate pending: platform_balance - platform_available
          const platformBalance = Number(
            bankBalance?.platform_balance || bankBalance?.bank_account?.usd || 0
          );
          const platformAvailable = Number(
            bankBalance?.platform_available || 0
          );
          return Math.max(0, platformBalance - platformAvailable);
        case "Total":
          return Number(
            bankBalance?.platform_balance ||
              bankBalance?.bank_account?.usd ||
              0
          );
        default:
          return Number(bankBalance?.platform_available || 0);
      }
    }
    // Crypto mode (isCrypto = false)
    else {
      // console.log("aggregatedCryptoBalances =>", JSON.stringify(aggregatedCryptoBalances, null, 2));
      const cryptoBalanceData =  aggregatedCryptoBalances || {};
      switch (selectedBalanceType) {
        case "Available":
          return Number(cryptoBalanceData?.usd_value_available || 0);
        case "Pending":
          return Number(cryptoBalanceData?.usd_value_pending || 0);
        case "Total":
          return Number(
            cryptoBalanceData?.usd_value_total ||
              cryptoBalanceData?.rounded_balance ||
              cryptoBalanceData?.platform_total_balance ||
              0
          );
        default:
          return Number(cryptoBalanceData?.usd_value_available || 0);
      }
    }
  }, [
    balance,
    isCrypto,
    bankBalance,
    cryptoData,
    allCryptoBalances,
    aggregatedCryptoBalances,
    selectedBalanceType,
  ]);

  // Format balance with smooth animation
  const formattedBalance = useMemo(() => {
    const num = Number(currentBalance ?? 0);
    if (!isFinite(num)) return "0.00";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [currentBalance]);

  // Animated style for balance text with smooth transition
  const animatedBalanceStyle = useAnimatedStyle(() => {
    const opacity = balanceAnimation.value === 0 ? 1 : 0.6;
    const scale = balanceAnimation.value === 0 ? 1 : 0.98;
    
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const displayBalance = localBalanceVisible ? formattedBalance : "••••••";

  // Get user ID from walletData if not provided
  const displayUserId = userId || walletData?.username || "Bond007";

  // Animation for smooth theme transitions
  React.useEffect(() => {
    themeTransition.value = withTiming(!isCrypto ? 1 : 0, { duration: 300 });
  }, [isCrypto, themeTransition]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: 1,
    };
  });

  // Determine current theme colors
  const isPayairoView = isCrypto;
  const currentTheme = isPayairoView
    ? {
        gradient: ["#2C6A3F", "#1E5032", "#153D26", "#1D1D1D"],
        border: "rgba(74, 222, 128, 0.1)",
        blobStart: "rgba(74, 222, 128, 0.15)",
        blobEnd: "rgba(37, 111, 64, 0.075)",
        badgeBg: "rgba(255, 208, 112, 0.12)",
        badgeBorder: "rgba(255, 208, 112, 0.23)",
        accent: "#FFD070",
        footerBorder: "rgba(255, 215, 0, 0.2)",
        footerGradient: ["rgba(0, 0, 0, 0.3)", "rgba(29, 29, 29, 0.95)"],
        title: "PayAiro Balance",
        idLabel: "PayAiro Tag:",
      }
    : {
        gradient: ["#1A1A2E", "#16213E", "#0F1624", "#0D0D0D"],
        border: "rgba(138, 180, 248, 0.1)",
        blobStart: "rgba(138, 180, 248, 0.15)",
        blobEnd: "rgba(68, 97, 158, 0.075)",
        badgeBg: "rgba(138, 180, 248, 0.12)",
        badgeBorder: "rgba(138, 180, 248, 0.23)",
        accent: "#00D9FF",
        footerBorder: "rgba(138, 180, 248, 0.2)",
        footerGradient: ["rgba(0, 0, 0, 0.3)", "rgba(13, 13, 13, 0.95)"],
        title: "Crypto Balance",
        idLabel: "PayAiro Tag:",
      };

  const handleToggleVisibility = async () => {
    // If currently hidden and about to show, refresh the balance data first
    if (!localBalanceVisible && onRefreshBalance) {
      try {
        await onRefreshBalance();
      } catch (error) {
        console.log("Error refreshing balance:", error);
      }
    }
    
    // Toggle balance visibility
    const newVisibility = !localBalanceVisible;
    setLocalBalanceVisible(newVisibility);
    onToggleVisibility?.();
  };

  // Effect to sync with external visibility changes
  React.useEffect(() => {
    if (isBalanceVisible !== undefined && isBalanceVisible !== localBalanceVisible) {
      setLocalBalanceVisible(isBalanceVisible);
    }
  }, [isBalanceVisible]);

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    // Show success toast with simple message
    showSuccess("Copied!", "PayAiro Tag copied to clipboard");
  };

  const handleCopyPress = () => {
    if (displayUserId) {
      copyToClipboard(displayUserId);
      // Delay navigation if onQRCodePress is provided, to allow toast to show
      if (onQRCodePress) {
        setTimeout(() => {
          onQRCodePress();
        }, 500);
      }
    } else {
      // If no userId, just call onQRCodePress immediately
      onQRCodePress?.();
    }
  };

  const styles = createStyles(currentTheme);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        {/* Main Gradient Background */}
        <LinearGradient
          colors={currentTheme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
          useAngle={true}
          angle={150.837}
        >
          {/* Logo Watermark */}
          {isPayairoView ? (
            <PayAiroLogo size={128} opacity={0.06} />
          ) : (
            <CryptoIconWatermark size={128} opacity={0.06} />
          )}

          {/* Content Container */}
          <View style={styles.contentContainer}>
            <TouchableOpacity
              style={styles.availableBadgeContainer}
              onPress={handleBadgeClick}
              activeOpacity={0.7}
            >
              <View style={styles.availableBadge}>
                <CustomText
                  style={styles.availableBadgeText}
                  color="#FFFFFF"
                  size={12}
                  fontFamily={theme.typography.fontFamily.bold}
                >
                  {selectedBalanceType.toUpperCase()}
                </CustomText>
                <ChevronIcon color={currentTheme.accent} />
              </View>
            </TouchableOpacity>

            {/* Header Section */}
            <View style={styles.headerSection}>
              <CustomText
                style={styles.titleText}
                color="#FFFFFF"
                size={16}
                fontFamily={theme.typography.fontFamily.regular}
              >
                {currentTheme.title}
              </CustomText>
              <TouchableOpacity
                onPress={handleToggleVisibility}
                style={styles.eyeIconButton}
                activeOpacity={0.7}
              >
                {localBalanceVisible ? (
                  <SvgIcons.EyeOnOutlineWhite
                    width={16}
                    height={16}
                    style={styles.eyeIcon}
                  />
                ) : (
                  <SvgIcons.EyeOffOutlineWhite
                    width={16}
                    height={16}
                    style={styles.eyeIcon}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Available Badge */}

            {/* Balance Display */}
            <Animated.View style={[styles.balanceContainer, animatedBalanceStyle]}>
              {isRefreshing ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : (
                <>
                  <CustomText
                    color="#FFFFFF"
                    size={42}
                    variant="h1"
                    style={{ lineHeight: 49, textAlignVertical: "center" }}
                  >
                    $
                  </CustomText>
                  <CustomText
                    color="#FFFFFF"
                    variant="h1"
                    size={42}
                    style={{ lineHeight: 49, textAlignVertical: "center" }}
                  >
                    {displayBalance}
                  </CustomText>
                </>
              )}
            </Animated.View>

            {/* Bottom Footer Section */}
            <View style={styles.footerContainer}>
              <LinearGradient
                colors={currentTheme.footerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.footerGradient}
              >
                <View style={styles.footerBorder} />
                <View style={styles.footerContent}>
                  <View style={styles.footerLeft}>
                    <CustomText
                      style={styles.footerLabel}
                      color="rgba(255, 255, 255, 0.6)"
                      size={12}
                      fontFamily={theme.typography.fontFamily.regular}
                    >
                      {currentTheme.idLabel}
                    </CustomText>
                    <CustomText
                      style={styles.footerId}
                      color="#FFFFFF"
                      size={14}
                      fontFamily={theme.typography.fontFamily.regular}
                    >
                      {displayUserId}
                    </CustomText>
                  </View>
                  <TouchableOpacity
                    onPress={handleCopyPress}
                    style={styles.qrButton}
                    activeOpacity={0.7}
                  >
                    <View style={styles.qrIconContainer}>
                      <SvgIcons.Copy
                        width={20}
                        height={20}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      maxWidth: SCREEN_WIDTH - 32,
      alignSelf: "center",
      marginVertical: 16,
    },
    cardContainer: {
      width: "100%",
      height: "100%",
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#2C6A3F",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    },
    gradientBackground: {
      width: "100%",
      height: "100%",
      position: "relative",
    },
    glassmorphicBorder: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
    radialBlobContainer: {
      position: "absolute",
      right: -80,
      top: -80,
      width: 256,
      height: 256,
      borderRadius: 128,
      overflow: "hidden",
    },
    radialBlob: {
      width: "100%",
      height: "100%",
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 0,
    },
    headerSection: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    titleText: {
      letterSpacing: 0.35,
      lineHeight: 20,
    },
    eyeIconButton: {
      marginLeft: 8,
      padding: 4,
    },
    eyeIcon: {
      shadowColor: "#FFFFFF",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    availableBadgeContainer: {
      marginTop: 8,
      marginBottom: 12,
    },
    availableBadge: {
      width: 123,
      height: 28,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
      position: "relative",
      backgroundColor: theme.badgeBg,
      borderWidth: 1,
      borderColor: theme.badgeBorder,
      shadowColor: theme.accent,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      // elevation: 4,
    },
    availableBadgeBorder: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 8,
    },
    availableBadgeText: {
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    balanceContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginTop: 4,
      marginBottom: 8,
      minHeight: 49,
    },
    loaderContainer: {
      height: 49,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    dollarSign: {
      letterSpacing: -1,
      marginRight: 2,
      lineHeight: 42,
    },

    footerContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 59,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: "hidden",
    },
    footerGradient: {
      width: "100%",
      height: "100%",
    },
    footerBorder: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: theme.footerBorder,
    },
    footerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
      paddingHorizontal: 15,
      paddingTop: 12,
      paddingBottom: 16,
    },
    footerLeft: {
      flex: 1,
      justifyContent: "flex-start",
    },
    footerLabel: {
      letterSpacing: 0.35,
      marginBottom: 4,
    },
    footerId: {
      letterSpacing: 0.35,
    },
    qrButton: {
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 4,
    },
    qrIconContainer: {
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default NewDashboardCard;
