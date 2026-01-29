import { useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import { ReceiveQRCard } from "components/common-components/ReceiveQRCard";
import type { IReceiveQRCardRef } from "components/common-components/ReceiveQRCard";
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
} from "react-native";
import Share from "react-native-share";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import { useDepositAddress } from "query/hooks/useCrypto";
import { SvgUri } from "react-native-svg";

export default function CryptoReceive() {
  const route = useRoute();
  const { details } = route.params as any;
  const { walletData } = useSelectorAction() as any;
  const { symbol, logo } = details;
  const { theme } = useTheme();
  const styles = { ...useGlobalStyles(), ...cryptoReceiveStyles(theme) };
  const qrCardRef = useRef<IReceiveQRCardRef | null>(null);

  /** false = PayAiro Tag, true = Wallet Address (same as AddCrypto) */
  const [isOnChain, setIsOnChain] = useState(true);
  const [depositAddress, setDepositAddress] = useState("");
  const [disclaimer, setDisclaimer] = useState("");

  const depositAddressMutation = useDepositAddress();

  const getCryptoInfo = () => {
    const parts = symbol.split("-")[0];
    const networkParts = parts.split("_");
    if (networkParts.length > 1) {
      return { cryptoName: networkParts[0], network: networkParts[1] };
    }
    return { cryptoName: parts, network: null as string | null };
  };

  const { cryptoName, network } = getCryptoInfo();

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
      const addressData = response?.data;

      if (addressData?.status === false && !addressData?.address) {
        const message =
          addressData?.message ||
          response?.message ||
          "Your deposit address is under review. Please try again later.";
        Alert.alert("Address Under Review", message);
        setIsOnChain(false);
        return;
      }

      if (addressData?.disclaimer) {
        setDisclaimer(addressData.disclaimer);
      } else {
        setDisclaimer(
          `Only send ${cryptoName} assets to this address. Other assets will be lost forever.`
        );
      }

      if (addressData?.address) {
        setDepositAddress(addressData.address);
      } else {
        Alert.alert(
          "Error",
          addressData?.message ||
            response?.message ||
            "Unable to retrieve deposit address. Please try again."
        );
        setIsOnChain(false);
      }
    } catch (error: any) {
      console.log("Error fetching deposit address:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to get deposit address. Please try again."
      );
      setIsOnChain(false);
    }
  };

  const copyToClipboard = (text: string, label: string = "Text") => {
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert(`${label} copied`);
    }
  };

  const handleShareQR = async (uri: string) => {
    try {
      await Share.open({
        title: `${cryptoName} Wallet Address`,
        subject: `${cryptoName} Wallet Address`,
        url: uri,
        type: "image/png",
        filename: `PayAiro_${cryptoName}_WalletAddress`,
        failOnCancel: false,
        message: `PayAiro Payment Details\n\n Scan the QR code to send money\n\n PayAiro Tag: ${ isOnChain ? depositAddress : walletData?.username || "N/A"}`,
      });
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error sharing wallet address:", err);
      }
    }
  };

  const handleDownloadQR = async (uri: string) => {
    try {
      await Share.open({
        title: `${cryptoName} Wallet Address`,
        subject: `${cryptoName} Wallet Address`,
        url: uri,
        type: "image/png",
        filename: `PayAiro_${cryptoName}_WalletAddress`,
        failOnCancel: false,
        saveToFiles: true,
        message: `PayAiro Payment Details\n\n Scan the QR code to send money\n\n PayAiro Tag: ${ isOnChain ? depositAddress : walletData?.username || "N/A"}`,
      });
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

  const getQRCodeValue = () =>
    isOnChain ? depositAddress || "loading" : (walletData?.username ?? "");
  const getTagLabel = () =>
    isOnChain ? `${cryptoName} Wallet Address:` : "PayAiro Tag:";
  const getTagValue = () =>
    isOnChain ? displayAddress : (walletData?.username ?? "");
  const getCopyValue = () =>
    isOnChain ? depositAddress : (walletData?.username ?? "");
  const getCopyLabel = () =>
    isOnChain ? "Wallet Address" : "PayAiro Tag";

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

  const subtitle = network
    ? network === "SOL"
      ? "Solana"
      : network
    : "";

  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.palette.green50}
      style={styles.safeArea}
    >
      <HeaderTitle leftIcon={"true"} title={"Receive"} />
      <View style={styles.container}>
        <View style={styles.qrTypeSwitcherContainer}>
          <View style={styles.qrTypeChipsRow}>
          <Pressable
              style={[styles.qrTypeChip, isOnChain && styles.qrTypeChipActive]}
              onPress={() => setIsOnChain(true)}
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

          </View>
        </View>

        <View style={styles.qrCardContainer}>
          {isOnChain &&
          (depositAddressMutation.isPending || !depositAddress) ? (
            <View style={styles.qrLoadingCard}>
              <ActivityIndicator
                size="large"
                color={theme.colors.palette.green700}
              />
            </View>
          ) : (
            <ReceiveQRCard
              ref={qrCardRef}
              title={cryptoName}
              titleIcon={cryptoIcon}
              subtitle={subtitle}
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

        {isOnChain && depositAddress && (
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
}

const cryptoReceiveStyles = (theme: Theme) =>
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
    qrTypeSwitcherContainer: {
      width: "100%",
      marginBottom: theme.spacing.spacing[4],
    },
    qrTypeChipsRow: {
      flexDirection: "row",
      columnGap: 10,
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
