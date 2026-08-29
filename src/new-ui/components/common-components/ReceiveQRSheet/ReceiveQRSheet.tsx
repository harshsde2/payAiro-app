import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Clipboard,
  ToastAndroid,
} from "react-native";
import { useSelector } from "react-redux";
import Share from "react-native-share";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import { useAppLock } from "hooks/useAppLock";
import { ReceiveQRCard } from "components/common-components/ReceiveQRCard";
import type { IReceiveQRCardRef } from "components/common-components/ReceiveQRCard";
import { SvgIcons } from "constants/svgs";
import { BottomSheet } from "@new-ui/components/common-components/BottomSheet";
import type { IBottomSheetRef } from "@new-ui/components/common-components/BottomSheet/types";

export interface IReceiveQRSheetRef {
  /** Open the receive QR bottom sheet. */
  open: () => void;
  /** Close the receive QR bottom sheet. */
  close: () => void;
}

/**
 * Reusable "Receive" QR bottom sheet: shows the user's PayAiro QR + tag with
 * copy/share/download actions. Reads the current user's tag from Redux itself,
 * so any screen can drop it in and drive it via its ref (open/close).
 */
export const ReceiveQRSheet = forwardRef<IReceiveQRSheetRef>((_props, ref) => {
  const { theme } = useTheme();
  const customTheme = styles(theme);
  const { userData, usersMe, walletData } = useSelector(
    (s: any) => s.authenticationSlice
  );
  const { setNativeModalVisible } = useAppLock();
  const qrCardRef = useRef<IReceiveQRCardRef>(null);
  const qrSheetRef = useRef<IBottomSheetRef>(null);
  const [visible, setVisible] = useState(false);

  // Same tag resolution as the Profile screen: /me user + profile → walletData.
  const username = useMemo(() => {
    const u = { ...(usersMe?.user || {}), ...(userData || {}) };
    return String(u.username ?? walletData?.username ?? "");
  }, [userData, usersMe, walletData]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }),
    []
  );

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => qrSheetRef.current?.open());
    }
  }, [visible]);

  const close = useCallback(() => setVisible(false), []);

  const copyTag = useCallback(() => {
    Clipboard.setString(username || "");
    if (Platform.OS === "android") {
      ToastAndroid.show("PayAiro Tag copied", ToastAndroid.SHORT);
    } else {
      Alert.alert("PayAiro Tag copied");
    }
  }, [username]);

  const handleShare = useCallback(
    async (uri: string) => {
      try {
        await Share.open({
          title: "PayAiro QR Code",
          subject: "PayAiro QR Code",
          url: uri,
          type: "image/png",
          filename: `PayAiro_QR_${username || "qr"}`,
          failOnCancel: false,
          message: `PayAiro Payment Details\n\n PayAiro Tag: ${username}`,
        });
      } catch (err: any) {
        if (err?.message !== "User did not share") {
          console.log("Error sharing QR:", err);
        }
      }
    },
    [username]
  );

  const handleDownload = useCallback(
    async (uri: string) => {
      try {
        await Share.open({
          title: "PayAiro QR Code",
          subject: "PayAiro QR Code",
          url: uri,
          type: "image/png",
          filename: `PayAiro_QR_${username || "qr"}`,
          failOnCancel: false,
          saveToFiles: true,
        });
      } catch (err: any) {
        if (err?.message !== "User did not share") {
          console.log("Error downloading QR:", err);
        }
      }
    },
    [username]
  );

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1 }}>
        <BottomSheet
          ref={qrSheetRef}
          snapPoints={["90%"]}
          initialSnapIndex={0}
          enableDrag
          enableBackdropPress
          onClose={close}
        >
          <ScrollView
            contentContainerStyle={customTheme.qrSheetContent}
            showsVerticalScrollIndicator={false}
          >
            <ReceiveQRCard
              ref={qrCardRef}
              title="PayAiro"
              subtitle="Scan this QR code to receive funds"
              qrValue={{
                type: "receive",
                username,
                tag: username,
              }}
              payAiroTag={username || "N/A"}
              onCopyTag={copyTag}
              leftButton={{
                text: "Download",
                icon: (
                  <SvgIcons.DownloadBlack width={20} height={20} color="white" />
                ),
                onPress: () => qrCardRef.current?.capture(handleDownload),
              }}
              rightButton={{
                text: "Share",
                icon: <SvgIcons.ShareIcon width={20} height={20} color="white" />,
                onPress: () => qrCardRef.current?.capture(handleShare),
              }}
              onBeforeCapture={() => setNativeModalVisible(true)}
              onAfterCapture={() => {
                setTimeout(() => setNativeModalVisible(false), 1000);
              }}
            />
          </ScrollView>
        </BottomSheet>
      </View>
    </Modal>
  );
});

ReceiveQRSheet.displayName = "ReceiveQRSheet";

const styles = (theme: ITheme) =>
  StyleSheet.create({
    qrSheetContent: {
      alignItems: "center",
      // Same pixel values as the legacy scale this used to read (8 / 24).
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
    },
  });

export default ReceiveQRSheet;
