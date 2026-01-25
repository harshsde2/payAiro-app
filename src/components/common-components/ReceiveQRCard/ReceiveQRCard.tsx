import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
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
import type { IReceiveQRCardProps, IReceiveQRCardRef } from "./types";

const QR_SIZE = 200;
const LOGO_OVERLAY_SIZE = 44;
const LOGO_ICON_SIZE = 26;

const ReceiveQRCard = forwardRef<IReceiveQRCardRef, IReceiveQRCardProps>(({
  title,
  titleIcon,
  subtitle,
  qrValue,
  payAiroTag,
  tagLabel,
  tagValueStyle,
  onCopyTag,
  containerStyle,
  leftButton,
  rightButton,
  onBeforeCapture,
  onAfterCapture,
  bankDetails,
  onCapturingChange,
}, ref) => {
  const { theme } = useTheme();
  const viewShotRef = useRef<any>(null);
  const styles = getStyles(theme);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stableBankDetails, setStableBankDetails] = useState<React.ReactNode>(null);
  const tagLabelText = tagLabel || "PayAiro Tag:";

  const qrString =
    typeof qrValue === "string" ? qrValue : JSON.stringify(qrValue);

  const captureAndRun = async (
    handler: (uri: string) => void | Promise<void>
  ) => {
    if (!viewShotRef.current) return;
    try {
      // Store current bankDetails before capture to prevent re-renders
      if (bankDetails) {
        setStableBankDetails(bankDetails);
      }
      setIsCapturing(true);
      onCapturingChange?.(true);
      await onBeforeCapture?.();
      
      // Small delay to ensure UI is stable before capture
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const uri = await viewShotRef.current.capture({
        format: "png",
        quality: 0.9,
        result: "tmpfile",
      });
      await handler(uri);
    } finally {
      setIsCapturing(false);
      onCapturingChange?.(false);
      await onAfterCapture?.();
      // Clear stable bankDetails after capture
      setTimeout(() => setStableBankDetails(null), 100);
    }
  };

  // Use stable bankDetails during capture, otherwise use current bankDetails
  const displayBankDetails = isCapturing && stableBankDetails ? stableBankDetails : bankDetails;

  useImperativeHandle(ref, () => ({
    capture: captureAndRun,
    isCapturing,
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 0.9, result: "tmpfile" }}
        style={styles.viewShot}
      >
        <View style={styles.titleRow}>
          {titleIcon && <View style={styles.titleIcon}>{titleIcon}</View>}
          <CustomText variant="h3" fontWeight="bold" style={styles.title}>
            {title}
          </CustomText>
        </View>
        {Boolean(subtitle) && (
          <CustomText variant="body2" style={styles.subtitle}>
            {subtitle}
          </CustomText>
        )}

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
          <CustomText variant="body2" fontWeight="medium" style={styles.tagLabel}>
            {tagLabelText}
          </CustomText>
          <CustomText
            variant="body2"
            fontWeight="semiBold"
            numberOfLines={1}
            ellipsizeMode="middle"
            style={[
              styles.tagValue,
              tagValueStyle,
            ]}
          >
            {payAiroTag}
          </CustomText>
          <TouchableOpacity onPress={onCopyTag} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <SvgIcons.CopyOutlineBlack width={20} height={20} />
          </TouchableOpacity>
        </View>
        {
          displayBankDetails && (
            <View style={styles.bankDetailsRow}>
              {displayBankDetails}
            </View>
          )
        }
      </ViewShot>

      <View style={styles.buttonsRow}>
        {leftButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={leftButton.onPress}
            activeOpacity={0.7}
          >
            {leftButton.icon}
            <CustomText variant="body2" fontWeight="medium" style={styles.actionText}>
              {leftButton.text}
            </CustomText>
          </TouchableOpacity>
        )}
        {rightButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightButton.onPress}
            activeOpacity={0.7}
          >
            {rightButton.icon}
            <CustomText variant="body2" fontWeight="medium" style={styles.actionText}>
              {rightButton.text}
            </CustomText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

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
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 8,
    },
    titleIcon: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: theme.colors.palette.black,
      textAlign: "center",
    },
    subtitle: {
      marginBottom: 20,
      textAlign: "center",
      color: theme.colors.palette.green700,
    },
    qrWrapper: {
      width: QR_SIZE,
      height: QR_SIZE,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    bankDetailsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginVertical: 10
    },
    bankDetailsText: {
      color: theme.colors.palette.black,
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
    tagLabel: {
      color: theme.colors.palette.black,
    },
    tagValue: {
      color: theme.colors.palette.black,
      flexShrink: 1,
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
