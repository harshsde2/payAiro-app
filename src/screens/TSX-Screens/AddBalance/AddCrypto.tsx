import { useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import useSelectorAction from "hooks/useSelectorAction";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Button,
} from "react-native";
import Share from "react-native-share";
import { ReceiveQRCard } from "components/common-components/ReceiveQRCard";
import type { IReceiveQRCardRef } from "components/common-components/ReceiveQRCard";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import { useDepositAddress } from "query/hooks/useCrypto";
import { SvgUri } from "react-native-svg";
import GenericButton from "components/GenericButton";

const AddCrypto = () => {
  const { theme } = useTheme();
  const styles = { ...useGlobalStyles(), ...addCryptoStyles(theme) };
  const route = useRoute();
  const { item } = route.params as any;
  const { symbol, logo } = item;
  const { walletData } = useSelectorAction() as any;
  const qrCardRef = useRef<IReceiveQRCardRef | null>(null);

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
      network: null,
    };
  };

  const { cryptoName } = getCryptoInfo();

  const [depositAddress, setDepositAddress] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Deposit address mutation hook
  const depositAddressMutation = useDepositAddress();

  // Fetch deposit address on mount
  useEffect(() => {
    handleGetDepositAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetDepositAddress = async () => {
    setHasError(false);
    setErrorMessage("");
    setDepositAddress("");
    
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
        setHasError(true);
        setErrorMessage(message);
        return;
      }

      // Set disclaimer
      if (addressData?.disclaimer) {
        setDisclaimer(addressData?.disclaimer);
      } else {
        setDisclaimer(
          `Only send ${cryptoName} assets to this address. Other assets will be lost forever.`
        );
      }

      // Check if address is available
      if (addressData?.address) {
        setDepositAddress(addressData.address);
        setHasError(false);
      } else {
        const errorMsg =
          addressData?.message ||
          response?.message ||
          "Unable to retrieve deposit address. Please try again.";
        setHasError(true);
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.log("Error fetching deposit address:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to get deposit address. Please try again.";
      setHasError(true);
      setErrorMessage(errorMsg);
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

  const handleShareQR = async (uri: string) => {
    try {
      const shareOptions: any = {
        title: `${cryptoName} Wallet Address`,
        subject: `${cryptoName} Wallet Address`,
        url: uri,
        type: "image/png",
        filename: `PayAiro_${cryptoName}_WalletAddress`,
        failOnCancel: false,
        message: `PayAiro Payment Details\n\nWallet Address:\n${getQRCodeValue()}`,
      };

      await Share.open(shareOptions);
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error sharing wallet address:", err);
      }
    }
  };

  const handleDownloadQR = async (uri: string) => {
    try {
      const shareOptions: any = {
        title: `${cryptoName} Wallet Address`,
        subject: `${cryptoName} Wallet Address`,
        url: uri,
        type: "image/png",
        filename: `PayAiro_${cryptoName}_WalletAddress`,
        failOnCancel: false,
        saveToFiles: true,
      };

      await Share.open(shareOptions);
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error downloading wallet address:", err);
        Alert.alert("Failed to download wallet address");
      }
    }
  };

  const displayAddress = useMemo(() => {
    return `${depositAddress}`;
  }, [depositAddress]);

  const getQRCodeValue = () => depositAddress || "loading";
  const getTagLabel = () => `${cryptoName} Wallet Address:`;
  const getTagValue = () => displayAddress;
  const getCopyValue = () => depositAddress;
  const getCopyLabel = () => "Wallet Address";

  const resolvedDisclaimer = useMemo(() => {
    if (!disclaimer) {
      return `Only send ${cryptoName} assets to this address. Other assets will be lost forever.`;
    }
    return disclaimer.replace("{symbol}", cryptoName);
  }, [cryptoName, disclaimer]);

  const cryptoIcon = useMemo(() => {
    if (!logo) return null;
    if (logo?.toLowerCase?.().endsWith(".svg")) {
      return <SvgUri uri={logo} width={22} height={22} />;
    }
    return (
      <Image
        source={{ uri: logo }}
        style={styles.cryptoIcon}
        resizeMode="contain"
      />
    );
  }, [logo, styles.cryptoIcon]);



  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.palette.green50}
      style={styles.safeArea}
    >
      <HeaderTitle leftIcon={"true"} title={"Via Crypto"} />
      <View style={styles.container}>
        <View style={styles.qrCardContainer}>
          {depositAddressMutation.isPending || (!depositAddress && !hasError) ? (
            <View style={styles.qrLoadingCard}>
              <ActivityIndicator
                size="large"
                color={theme.colors.palette.green700}
              />
            </View>
          ) : hasError ? (
            <View style={styles.qrErrorCard}>
              <SvgIcons.AlertIcon width={48} height={48} />
              <CustomText
                size={14}
                color={theme.colors.palette.grey900}
                style={styles.errorText}
              >
                {errorMessage || "Failed to load wallet address"}
              </CustomText>
              <GenericButton
                title="Reload"
                onPress={handleGetDepositAddress}
                showLoader={true}
                isLoading={depositAddressMutation.isPending}
                cStyle={styles.reloadButton}
              />
            </View>
          ) : (
            <ReceiveQRCard
              ref={qrCardRef}
              title={cryptoName}
              titleIcon={cryptoIcon}
              subtitle=""
              qrValue={getQRCodeValue()}
              payAiroTag={getTagValue()}
              tagLabel={getTagLabel()}
              tagValueStyle={styles.qrTagValue}
              onCopyTag={() =>
                copyToClipboard(getCopyValue(), getCopyLabel())
              }
              leftButton={{
                text: "Download",
                icon: <SvgIcons.DownloadBlack width={20} height={20} />,
                onPress: () => qrCardRef.current?.capture(handleDownloadQR),
              }}
              rightButton={{
                text: "Share",
                icon: <SvgIcons.ShareIcon width={20} height={20} />,
                onPress: () => qrCardRef.current?.capture(handleShareQR),
              }}
            />
          )}
        </View>

        {depositAddress && (
          <View style={styles.noticeContainer}>
            <View style={styles.noticeIconContainer}>
              <SvgIcons.InfoNote width={18} height={18} />
            </View>
            <CustomText
              size={13}
              color={theme.colors.palette.green800}
              style={styles.noticeText}
            >
              {resolvedDisclaimer}
            </CustomText>
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
    cryptoIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
    },
    qrCardContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    qrTagValue: {
      color: theme.colors.palette.green700,
    },
    qrLoadingCard: {
      width: "100%",
      backgroundColor: theme.colors.palette.white,
      padding: theme.spacing.spacing[5],
      borderRadius: theme.spacing.spacing[3],
      alignItems: "center",
      justifyContent: "center",
      minHeight: 260,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
    },
    qrErrorCard: {
      width: "100%",
      backgroundColor: theme.colors.palette.white,
      padding: theme.spacing.spacing[5],
      borderRadius: theme.spacing.spacing[3],
      alignItems: "center",
      justifyContent: "center",
      minHeight: 260,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
      gap: theme.spacing.spacing[4],
    },
    errorText: {
      textAlign: "center",
      marginTop: theme.spacing.spacing[2],
    },
    reloadButton: {
      marginTop: theme.spacing.spacing[2],
      minWidth: 120,
    },
    noticeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.spacing[5],
      padding: theme.spacing.spacing[4],
      backgroundColor: theme.colors.palette.green100,
      borderRadius: theme.spacing.spacing[3],
      borderWidth: 1,
      borderColor: theme.colors.palette.green200,
      columnGap: theme.spacing.spacing[3],
    },
    noticeIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.palette.green200,
      justifyContent: "center",
      alignItems: "center",
    },
    noticeText: {
      flex: 1,
      lineHeight: 18,
    },
  });

