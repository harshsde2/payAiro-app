import {
  View,
  ToastAndroid,
  Alert,
  Clipboard,
  Pressable,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useMemo, useRef, useState } from "react";
import GenericButton from '../../../components/GenericButton';
import { useNavigation } from "@react-navigation/native";
import useSelectorAction from '../../../hooks/useSelectorAction';
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { CustomText } from "tsx-components";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { ITheme } from "@new-ui/styles/themes/themeTypes";
import { SvgIcons } from "constants/svgs";
import CommonModal from "tsx-components/modals/CommonModal";
import { ReceiveQRCard } from "components/common-components/ReceiveQRCard";
import type { IReceiveQRCardRef } from "components/common-components/ReceiveQRCard";
import { BankDetailsDisplay, CapturingProvider, useCapturing } from "components/common-components/BankDetailsDisplay";
import QRCode from "react-native-qrcode-svg";
import ScreenWrapper from "new-ui/components/common-components/ScreenWrapper";

const QR_SIZE = 200;
const LOGO_OVERLAY_SIZE = 44;
const LOGO_ICON_SIZE = 26;

const ReceiveContent = () => {
  const navigation = useNavigation<any>();
  const { walletData, bankLists } = useSelectorAction() as any;

  const payairoBank = useMemo(() => {
    if (!bankLists || !Array.isArray(bankLists) || bankLists.length === 0) {
      return null;
    }
    return bankLists.find((item: any) => {
      const bankName = item?.bank_name;
      return bankName && bankName.toLowerCase().trim() === "payairo bank";
    }) || null;
  }, [bankLists]);

  console.log("payairoBank ->", JSON.stringify(payairoBank, null, 2))


  const { theme } = useTheme();
  const { setIsCapturing } = useCapturing();

  const styles = customStyles(theme);
  const qrCardRef = useRef<IReceiveQRCardRef>(null);
  const shareCardRef = useRef<any>(null);
  const [showShareDetailsModal, setShowShareDetailsModal] = useState(false);
  const [qrUri, setQrUri] = useState("");
  const [checkedBoxArray, setcheckedBoxArray] = useState([
    {
      id: 0,
      name: "Qr Code",
      isChecked: false,
    },
    {
      id: 1,
      name: "PayAiro Tag",
      isChecked: false,
    },
    {
      id: 2,
      name: "Bank Details",
      isChecked: false,
    },
  ]);

  const handleShare = async () => {
    try {
      const selectedItems = checkedBoxArray.filter((item) => item.isChecked);

      if (selectedItems.length === 0) {
        Alert.alert("Please select at least one detail to share.");
        return;
      }

      let message = "PayAiro Payment Details\n\n";

      selectedItems.forEach(({ name }) => {
        switch (name) {
          case "Qr Code":
            message += "Scan the QR code to send money\n\n";
            break;
          case "PayAiro Tag":
            message += `PayAiro Tag: ${walletData?.username}\n\n`;
            break;
          case "Bank Details":
            const bankData = payairoBank;
            if (bankData) {
              message += `Bank Details:\n`;
              message += `   Account Holder: ${walletData?.name || "N/A"}\n`;
              message += `   Routing Number: ${bankData.ref_code || "N/A"}\n`;
              message += `   Account Number: ${bankData.account_number || "N/A"}\n\n`;
            }
            break;
        }
      });

      const isQrSelected = selectedItems.some((item) => item.name === "Qr Code");

      // When QR or any visual is selected: capture from shareCardRef so the image
      // shows only what's checked (QR, PayAiro Tag, Bank Details).
      if (isQrSelected && shareCardRef.current) {
        const uri = await shareCardRef.current.capture({
          format: "png",
          quality: 0.9,
          result: "tmpfile",
        });

        const shareOptions: any = {
          title: "PayAiro Payment Details",
          subject: "PayAiro Payment Details",
          url: uri,
          type: "image/png",
          filename: `PayAiro_Payment_${walletData?.username || "details"}`,
          failOnCancel: false,
        };

        if (Platform.OS === "android") {
          shareOptions.message = message.trim();
        }

        await Share.open(shareOptions);
      } else {
        // No QR selected: share only text (PayAiro Tag and/or Bank Details)
        const shareOptions = {
          title: "PayAiro Payment Details",
          subject: "PayAiro Payment Details",
          message: message.trim(),
          failOnCancel: false,
        };

        await Share.open(shareOptions);
      }
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error sharing:", err);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show("PayAiro Tag copied", ToastAndroid.SHORT);
    } else {
      Alert.alert("PayAiro Tag copied");
    }
  };

  const onShareClick = (uri: any) => {
    setShowShareDetailsModal(true);
    setQrUri(uri);
    handleShare();
  }


  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      padding={16}
      scrollable
      contentStyle={{ flex: 1 }}
    >
      {showShareDetailsModal && (
        <CommonModal
          isVisible={showShareDetailsModal}
          onClose={() => {
            setShowShareDetailsModal(false);
          }}
          containerStyle={{ justifyContent: "flex-end", alignItems: "center" }}
        >
          <Pressable
            style={[styles.whiteSheetContainerForShare, { flex: 2 / 5, width: "100%" }]}
            onPress={(e) => e.stopPropagation()}
          >
            <CustomText style={styles.title} variant="h3">
              Share Details
            </CustomText>
            <CustomText style={styles.title} variant="caption">
              Select the option you want to share with others.
            </CustomText>
            {checkedBoxArray.map((item, index) => {
              const { isChecked, id, name } = item;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    const updated = checkedBoxArray.map((item) =>
                      item.id === index
                        ? { ...item, isChecked: !isChecked }
                        : item
                    );
                    setcheckedBoxArray(updated);
                  }}
                  style={[styles.row]}
                >
                  {!isChecked ? (
                    <SvgIcons.UnCheckbox
                      style={{
                        borderWidth: 1,
                        borderColor: "black",
                        borderRadius: 5,
                      }}
                    />
                  ) : (
                    <SvgIcons.Checkedbox
                      style={{
                        borderWidth: 1,
                        borderColor: "black",
                        borderRadius: 5,
                      }}
                    />
                  )}
                  <CustomText
                    fontWeight="semiBold"
                    size={17}
                    variant={"caption"}
                    style={styles.label}
                  >
                    {name}
                  </CustomText>
                </TouchableOpacity>
              );
            })}

            <View style={{ marginVertical: 20, gap: 10 }}>
              <GenericButton
                title={"Share"}
                onPress={() => {
                  handleShare();
                }}
              />
            </View>
          </Pressable>
        </CommonModal>
      )}
      <View style={[styles.whiteSheetContainer]}>
        <View >
          <ReceiveQRCard
            ref={qrCardRef}
            // title="PayAiro"
            // subtitle="Scan to receive payment"
            qrValue={{
              type: "send",
              username: walletData?.username,
              tag: walletData?.username,
            }}
            payAiroTag={walletData?.username || "N/A"}
            onCopyTag={() => copyToClipboard(walletData?.username || "")}
            bankDetails={<BankDetailsDisplay />}
            onCapturingChange={(capturing: boolean) => setIsCapturing(capturing)}
            leftButton={{
              text: "Share Details",
              icon: <SvgIcons.ShareIcon width={20} height={20} color={'white'} />,
              onPress: () => setShowShareDetailsModal(true),
            }}
            rightButton={{
              text: "Request",
              icon: <SvgIcons.PaymentRequest width={20} height={20} color={'white'} />,
              onPress: () =>
                navigation.navigate(NAVIGATION_SCREENS.NEW_SEND, {
                  requested: true,
                  type: "request",
                }),
            }}
          />
        </View>
        <View style={styles.infotextContainer}>
          <CustomText variant='caption' size={10} fontWeight="regular" style={styles.infotext}>
          This QR or Bank Details can only be used to receive compatible currency/tokens.
          </CustomText>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: -1000,
          left: 0,
          right: 0,
          opacity: 0,
          width: 350,
          alignSelf: "center",
        }}
        pointerEvents="none"
      >
        <ViewShot
          ref={shareCardRef}
          options={{
            format: "png",
            quality: 0.9,
            result: "tmpfile",
          }}
          style={{
            // Fixed, not themed — see whiteSheetContainerForShare below.
            backgroundColor: "#FFFFFF",
            padding: 20,
            borderRadius: 15,
            width: 350,
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", alignItems: "center" }}>
            {checkedBoxArray.some((item) => item.name === "Qr Code" && item.isChecked) && (
              <>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 15,
                    alignItems: "center",
                  }}
                >
                  <View style={styles.qrWrapper}>
                    <QRCode
                      value={JSON.stringify({
                        type: "receive",
                        username: walletData?.username,
                        tag: walletData?.username,
                      })}
                      size={QR_SIZE}
                      backgroundColor="white"
                      color="black"
                    />
                    <View
                      style={[
                        styles.logoOverlay,
                        { backgroundColor: "#00793F" },
                      ]}
                    >
                      <SvgIcons.PayairoWhiteLogo width={LOGO_ICON_SIZE} height={LOGO_ICON_SIZE} />
                    </View>
                  </View>
                </View>
              </>
            )}
            {checkedBoxArray.some((item) => item.name === "PayAiro Tag" && item.isChecked) && (
              <CustomText
                color={"#000000"}
                size={14}
                style={{ marginBottom: 10, textAlign: "center" }}
              >
                PayAiro Tag: {walletData?.username}
              </CustomText>
            )}
            {checkedBoxArray.some((item) => item.name === "Bank Details" && item.isChecked) &&
              payairoBank && (
                <View style={{ width: "100%", marginTop: 10 }}>
                  <CustomText
                    color={"#000000"}
                    size={14}
                    fontWeight="bold"
                    style={{ marginBottom: 10, textAlign: "center" }}
                  >
                    Bank Details:
                  </CustomText>
                  <CustomText
                    color={"#374151"}
                    size={13}
                    style={{ marginBottom: 5, textAlign: "center" }}
                  >
                    Account Holder: {walletData?.name || "N/A"}
                  </CustomText>
                  <CustomText
                    color={"#374151"}
                    size={13}
                    style={{ marginBottom: 5, textAlign: "center" }}
                  >
                    Routing Number: {payairoBank.ref_code || "N/A"}
                  </CustomText>
                  <CustomText
                    color={"#374151"}
                    size={13}
                    style={{ marginBottom: 10, textAlign: "center" }}
                  >
                    Account Number: {payairoBank.account_number || "N/A"}
                  </CustomText>
                </View>
              )}
          </View>
        </ViewShot>
      </View>
    </ScreenWrapper>
  );
};

const Receive = () => {
  return (
    <CapturingProvider>
      <ReceiveContent />
    </CapturingProvider>
  );
};

export default Receive;

const customStyles = (theme: ITheme) =>
  StyleSheet.create({
    title: {
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
    },
    infotextContainer: {
      width: "100%",
      alignItems: "center",
      marginTop: 10,
      // backgroundColor: 'red',
    },
    infotext: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      width: '80%',
    },
    whiteSheetContainer: {
      flex: 1,
      backgroundColor: theme.colors.surfaceElevated,
      borderTopEndRadius: theme.spacing['2xl'],
      borderTopStartRadius: theme.spacing['2xl'],
      // marginTop: theme.spacing.lg,
      // padding: theme.spacing.lg,
    },
    whiteSheetContainerForShare: {
      flex: 1,
      // Fixed, not themed: this sheet is captured by ViewShot and shared as an image
      // outside the app, so it must look the same whatever theme the sender is using.
      backgroundColor: "#FFFFFF",
      borderTopEndRadius: theme.spacing['2xl'],
      borderTopStartRadius: theme.spacing['2xl'],
      marginTop: theme.spacing.lg,
      padding: theme.spacing.lg,
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
      marginVertical: 3,
    },
    logoOverlay: {
      position: "absolute",
      left: (QR_SIZE - LOGO_OVERLAY_SIZE) / 2,
      top: (QR_SIZE - LOGO_OVERLAY_SIZE) / 2,
      width: LOGO_OVERLAY_SIZE,
      height: LOGO_OVERLAY_SIZE,
      borderRadius: LOGO_OVERLAY_SIZE / 2,
      justifyContent: "center",
      alignItems: "center",
    },
    qrWrapper: {
      width: QR_SIZE,
      height: QR_SIZE,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
  });
