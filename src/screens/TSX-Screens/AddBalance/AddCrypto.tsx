import { useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  Platform,
  StyleSheet,
  ToastAndroid,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import { useDepositAddress } from "query/hooks/useCrypto";
import { SvgUri } from "react-native-svg";

const AddCrypto = () => {
  const { theme } = useTheme();
  const styles = { ...useGlobalStyles(), ...addCryptoStyles(theme) };
  const route = useRoute();
  const { item } = route.params as any;
  const { symbol, logo, network } = item;

  // Extract crypto name and network from symbol
  const getCryptoInfo = () => {
    // Handle symbol formats: "BTC", "USDC_SOL", "USDC_SOL-USD", etc.
    const parts = symbol.split("-")[0]; // Get part before "-USD" if exists
    const networkParts = parts.split("_");

    if (networkParts.length > 1) {
      return {
        cryptoName: networkParts[0],
        network: networkParts[1],
      };
    }
    return {
      cryptoName: parts,
      network: network || null,
    };
  };

  const { cryptoName, network: displayNetwork } = getCryptoInfo();

  const [depositAddress, setDepositAddress] = useState("");

  // Deposit address mutation hook
  const depositAddressMutation = useDepositAddress();

  // Fetch deposit address on mount
  useEffect(() => {
    handleGetDepositAddress();
  }, []);

  const handleGetDepositAddress = async () => {
    try {
      const response = await depositAddressMutation.mutateAsync({
        asset: symbol,
      });

      // API response structure: ApiResponse<DepositAddressResponse>
      // response.data is DepositAddressResponse which contains: status, message, asset, address
      const addressData = response?.data;

      // Check if the response indicates address is under review
      if (addressData?.status === false && !addressData?.address) {
        const message =
          addressData?.message ||
          response?.message ||
          "Your deposit address is under review. Please try again later.";
        Alert.alert("Address Under Review", message);
        return;
      }

      // Check if address is available
      if (addressData?.address) {
        setDepositAddress(addressData.address);
      } else {
        const errorMessage =
          addressData?.message ||
          response?.message ||
          "Unable to retrieve deposit address. Please try again.";
        Alert.alert("Error", errorMessage);
      }
    } catch (error: any) {
      console.log("Error fetching deposit address:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to get deposit address. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const copyToClipboard = (text: string, label: string = "Wallet Address") => {
    Clipboard.setString(text);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert(`${label} copied`);
    }
  };

  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.palette.green50}
      style={styles.safeArea}
    >
      <HeaderTitle leftIcon={"true"} title={"Crypto Wallet"} />
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
            {displayNetwork && (
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
            {displayNetwork && (
              <View style={styles.networkBadge}>
                <CustomText
                  size={12}
                  fontWeight="medium"
                  color={theme.colors.palette.grey700}
                >
                  {displayNetwork === "SOL" ? "Solana" : displayNetwork}
                </CustomText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.qrCard}>
          {depositAddressMutation.isPending || !depositAddress ? (
            <View style={styles.qrLoadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.palette.green700}
              />
            </View>
          ) : (
            <QRCode value={depositAddress} size={220} />
          )}
        </View>

        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: theme.spacing.spacing[4],
          }}
        >
          <View style={styles.qrInfoRow}>
            <CustomText size={14} fontWeight="semiBold">
              {cryptoName} Wallet Address:
            </CustomText>
            <CustomText
              fontWeight="semiBold"
              size={14}
              color={theme.colors.palette.green700}
              numberOfLines={1}
              style={styles.qrInfoValue}
            >
              {depositAddress}
            </CustomText>
            <SvgIcons.CopyOutlineBlack
              onPress={() => copyToClipboard(depositAddress, "Wallet Address")}
            />
          </View>
        </View>

        {depositAddress && (
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
};

export default AddCrypto;

const addCryptoStyles = (theme: Theme) =>
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
      backgroundColor: "rgba(137, 123, 83, 0.85)",
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

