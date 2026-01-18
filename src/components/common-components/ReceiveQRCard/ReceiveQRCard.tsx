import React, { FC, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import type { IReceiveQRCardProps } from "./types";

const QR_SIZE = 200;
const LOGO_OVERLAY_SIZE = 44;
const LOGO_ICON_SIZE = 26;

const ReceiveQRCard: FC<IReceiveQRCardProps> = ({
  title,
  subtitle,
  qrValue,
  payAiroTag,
  onCopyTag,
  onDownload,
  onShare,
  onBeforeCapture,
  onAfterCapture,
  showDownloadButton = !!onDownload,
  showShareButton = !!onShare,
  containerStyle,
  filenameBase = "PayAiro_QR",
}) => {
  const { theme } = useTheme();
  const viewShotRef = useRef<any>(null);
  const styles = getStyles(theme);

  const qrString =
    typeof qrValue === "string" ? qrValue : JSON.stringify(qrValue);

  const captureAndRun = async (
    handler?: (uri: string) => void | Promise<void>
  ) => {
    if (!handler || !viewShotRef.current) return;
    try {
      await onBeforeCapture?.();
      const uri = await viewShotRef.current.capture({
        format: "png",
        quality: 0.9,
        result: "tmpfile",
      });
      await handler(uri);
    } finally {
      await onAfterCapture?.();
    }
  };

  const handleDownload = () => captureAndRun(onDownload);
  const handleShare = () => captureAndRun(onShare);

  return (
    <View style={[styles.container, containerStyle]}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 0.9, result: "tmpfile" }}
        style={styles.viewShot}
      >
        <CustomText variant="h3" fontWeight="bold" style={styles.title}>
          {title}
        </CustomText>
        <CustomText
          variant="body2"
          style={[styles.subtitle, { color: theme.colors.palette.green700 }]}
        >
          {subtitle}
        </CustomText>

        <View style={styles.qrWrapper}>
          <QRCode value={qrString} size={QR_SIZE} />
          <View
            style={[
              styles.logoOverlay,
              { backgroundColor: theme.colors.palette.green700 },
            ]}
          >
            <SvgIcons.PayairoWhiteLogo width={LOGO_ICON_SIZE} height={LOGO_ICON_SIZE} />
          </View>
        </View>

        <View style={styles.tagRow}>
          <CustomText variant="body2" fontWeight="medium" style={styles.tagText}>
            PayAiro Tag: {payAiroTag}
          </CustomText>
          <TouchableOpacity onPress={onCopyTag} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <SvgIcons.CopyOutlineBlack width={20} height={20} />
          </TouchableOpacity>
        </View>
      </ViewShot>

      <View style={styles.buttonsRow}>
        {showDownloadButton && onDownload && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownload}
            activeOpacity={0.7}
          >
            <SvgIcons.DownloadIcon width={20} height={20} />
            <CustomText variant="body2" fontWeight="medium" style={styles.actionText}>
              Download
            </CustomText>
          </TouchableOpacity>
        )}
        {showShareButton && onShare && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <SvgIcons.ShareIcon width={20} height={20} />
            <CustomText variant="body2" fontWeight="medium" style={styles.actionText}>
              Share
            </CustomText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ReceiveQRCard;

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      alignSelf: "center",
    },
    viewShot: {
      backgroundColor: theme.colors.palette.white,
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
    },
    title: {
      color: theme.colors.palette.black,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      marginBottom: 20,
      textAlign: "center",
    },
    qrWrapper: {
      width: QR_SIZE,
      height: QR_SIZE,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
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
    tagRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    tagText: {
      color: theme.colors.palette.black,
    },
    buttonsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.palette.white,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    actionText: {
      color: theme.colors.palette.black,
    },
  });
