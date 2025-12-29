import { useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import useSelectorAction from "hooks/useSelectorAction";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Clipboard,
  Platform,
  Pressable,
  StyleSheet,
  ToastAndroid,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import { useDepositAddress } from "query/hooks/useCrypto";
import { SvgUri } from "react-native-svg";

export default function Receive() {
  const route = useRoute();
  const { details } = route.params as any;
  const { walletData } = useSelectorAction() as any;
  const { symbol, buy_price, logo } = details;
  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...customStyles(theme) };

  // Extract crypto name and network from symbol
  const getCryptoInfo = () => {
    // Examples: "USDC_SOL-USD" -> crypto: "USDC", network: "SOL"
    //           "USDC-USD" -> crypto: "USDC", network: null
    //           "BTC-USD" -> crypto: "BTC", network: null
    const parts = symbol.split("-")[0]; // Get part before "-USD"
    const networkParts = parts.split("_");

    if (networkParts.length > 1) {
      return {
        cryptoName: networkParts[0],
        network: networkParts[1],
      };
    }
    return {
      cryptoName: parts,
      network: null,
    };
  };

  const { cryptoName, network } = getCryptoInfo();

  const viewShotRef = useRef<any>(null);
  const [isOnChain, setIsOnChain] = useState(false); // false = Off Chain, true = On Chain
  const [depositAddress, setDepositAddress] = useState("");

  // Deposit address mutation hook
  const depositAddressMutation = useDepositAddress();

  // Fetch deposit address when switching to On Chain
  useEffect(() => {
    if (isOnChain && !depositAddress) {
      handleGetDepositAddress();
    }
  }, [isOnChain]);

  const handleGetDepositAddress = async () => {
    try {
      const response = await depositAddressMutation.mutateAsync({
        asset: symbol,
      });

      // Check if the response indicates address is under review
      if (response?.data?.status === false && !response?.data?.address) {
        const message =
          response?.data?.message ||
          "Your deposit address is under review. Please try again later.";
        Alert.alert("Address Under Review", message);
        setIsOnChain(false); // Revert to off-chain
        return;
      }

      // Check if address is available
      if (response?.data?.address) {
        setDepositAddress(response.data.address);
      } else {
        Alert.alert(
          "Error",
          "Unable to retrieve deposit address. Please try again."
        );
        setIsOnChain(false); // Revert to off-chain
      }
    } catch (error) {
      console.log("Error fetching deposit address:", error);
      Alert.alert("Error", "Failed to get deposit address. Please try again.");
      setIsOnChain(false); // Revert to off-chain on error
    }
  };

  const handleToggleChainType = () => {
    setIsOnChain(!isOnChain);
  };

  // console.log("wallet data =>",walletData)

  const copyToClipboard = (text: string, label: string = "Text") => {
    Clipboard.setString(text);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert(`${label} copied`);
    }
  };

  // Get the QR code value based on chain type
  const getQRCodeValue = () => {
    if (isOnChain) {
      return depositAddress || "loading";
    }
    return `${walletData?.username}`;
  };

  // Get the display label based on chain type
  const getDisplayLabel = () => {
    if (isOnChain) {
      return `${cryptoName} Wallet Address:`;
    }
    return "PayAiro Tag:";
  };

  // Get the display value based on chain type
  const getDisplayValue = () => {
    if (isOnChain) {
      return depositAddress;
    }
    return walletData?.username;
  };
  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.palette.green50}
      style={styles.safeArea}
    >
      <HeaderTitle leftIcon={"true"} title={"Receive"} />
      <View style={styles.qrTypeSwitcherContainer}>
        <View style={styles.qrTypeChipsRow}>
          <Pressable
            style={[styles.qrTypeChip, !isOnChain && styles.qrTypeChipActive]}
            onPress={() => setIsOnChain(false)}
          >
            <CustomText
              size={13}
              fontWeight="semiBold"
              color={
                !isOnChain
                  ? theme.colors.palette.white
                  : theme.colors.palette.grey900
              }
            >
              PayAiro Tag
            </CustomText>
          </Pressable>
          <Pressable
            style={[styles.qrTypeChip, isOnChain && styles.qrTypeChipActive]}
            onPress={handleToggleChainType}
          >
            <CustomText
              size={13}
              fontWeight="semiBold"
              color={
                isOnChain
                  ? theme.colors.palette.white
                  : theme.colors.palette.grey900
              }
            >
              Wallet Address
            </CustomText>
          </Pressable>
        </View>
      </View>
      <View style={styles.container}>
        {/* Crypto Name and Network Display */}
        <View style={styles.cryptoInfoContainer}>
          <View style={styles.cryptoIconContainer}>
            {logo?.toLowerCase?.().endsWith(".svg") ? (
              <SvgUri uri={logo} width={30} height={30} />
            ) : (
              <Image
                source={{ uri: logo }}
                style={styles.cryptoIcon}
                resizeMode="contain"
              />
            )}
            {network && (
              <View style={styles.networkIconOverlay}>
                <SvgIcons.Solana width={16} height={16} />
              </View>
            )}
          </View>
          <View style={styles.cryptoTextContainer}>
            <CustomText
              size={20}
              fontWeight="bold"
              color={theme.colors.palette.grey900}
            >
              {cryptoName}
            </CustomText>
            {network && (
              <View style={styles.networkBadge}>
                <CustomText
                  size={12}
                  fontWeight="medium"
                  color={theme.colors.palette.grey700}
                >
                  {network === "SOL" ? "Solana" : network}
                </CustomText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.qrCard}>
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
            {depositAddressMutation.isPending ||
            (isOnChain && !depositAddress) ? (
              <View style={styles.qrLoadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.palette.green700}
                />
              </View>
            ) : (
              <QRCode value={getQRCodeValue()} size={220} />
            )}
          </ViewShot>
        </View>

        <View
          style={{
            width: "100%",
            // backgroundColor: "red",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: theme.spacing.spacing[4],

          }}
        >
          <View style={styles.qrInfoRow}>
            <CustomText size={14} fontWeight="semiBold">
              {getDisplayLabel()}
            </CustomText>
            <CustomText
              fontWeight="semiBold"
              size={14}
              color={theme.colors.palette.green700}
              numberOfLines={1}
              style={styles.qrInfoValue}
            >
              {getDisplayValue()}
            </CustomText>
            <SvgIcons.CopyOutlineBlack
              onPress={() =>
                copyToClipboard(
                  getDisplayValue(),
                  isOnChain ? "Wallet Address" : "PayAiro Tag"
                )
              }
            />
          </View>
        </View>

        {isOnChain && depositAddress && (
          <View style={styles.noticeContainer}>
            <View style={styles.noticeIconContainer}>
              <CustomText
                size={16}
                fontWeight="bold"
                color={theme.colors.palette.white}
              >
                i
              </CustomText>
            </View>
            <View style={styles.noticeTextContainer}>
              <CustomText
                size={13}
                color={theme.colors.palette.white}
                style={styles.noticeText}
              >
                Only send {symbol} assets to this address.
              </CustomText>
              <CustomText
                size={13}
                color={theme.colors.palette.white}
                style={styles.noticeText}
              >
                Other assets will be lost forever.
              </CustomText>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
    },
    title: {
      //   fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
    },

    row: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-start",
      marginVertical: 6,
      gap: 15,
    },
    label: {
      color: "#444",
      // fontSize: 15,
      marginVertical: 3,
    },
    labelBold: {
      fontWeight: "bold",
      color: "#000",
    },
    total: {
      fontWeight: "bold",
      color: "green",
    },
    totalInUSDContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: theme.colors.palette.green700,
      borderRadius: theme.spacing.spacing[4],
    },
    totalInUSDText: {
      width: "50%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.palette.green700,
      borderRadius: theme.spacing.spacing[4],
      paddingVertical: 5,
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
      backgroundColor: theme.colors.palette.green200,
      borderRadius: theme.spacing.spacing[3],
      padding: 4,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: theme.spacing.spacing[2],
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.palette.green700,
    },
    qrTypeSwitcherContainer: {
      width: "100%",
      marginBottom: theme.spacing.spacing[4],
      paddingHorizontal: theme.spacing.spacing[4],
    },
    qrTypeChipsRow: {
      flexDirection: "row",
      columnGap: 10,
      marginTop: theme.spacing.spacing[2],
    },
    qrTypeChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: theme.spacing.spacing[3],
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.palette.white,
    },
    qrTypeChipActive: {
      backgroundColor: theme.colors.palette.green700,
      borderColor: theme.colors.palette.green700,
    },
    cryptoInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.spacing[4],
      gap: theme.spacing.spacing[3],
    },
    cryptoIconContainer: {
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
      width: 30,
      height: 30,
    },
    cryptoIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    networkIconOverlay: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.palette.grey900,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: theme.colors.palette.white,
    },
    cryptoTextContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.spacing[2],
    },
    networkBadge: {
      paddingHorizontal: theme.spacing.spacing[2],
      paddingVertical: 4,
      borderRadius: theme.spacing.spacing[2],
      backgroundColor: theme.colors.palette.grey200,
    },
    qrCard: {
      marginTop: theme.spacing.spacing[2],
      alignItems: "center",
      justifyContent: "center",
    },
    qrLoadingContainer: {
      width: 220,
      height: 220,
      justifyContent: "center",
      alignItems: "center",
    },
    qrInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
      width: "80%",
    },
    qrInfoValue: {
      flex: 1,
    },
    noticeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.spacing[4],
      padding: theme.spacing.spacing[4],
      backgroundColor: "rgba(137, 123, 83, 0.85)", // Dark olive green with overlay transparency
      borderRadius: theme.spacing.spacing[3],
      columnGap: theme.spacing.spacing[3],
    },
    noticeIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.palette.yellow500,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
    },
    noticeTextContainer: {
      flex: 1,
      gap: 4,
    },
    noticeText: {
      lineHeight: 18,
    },
  });
