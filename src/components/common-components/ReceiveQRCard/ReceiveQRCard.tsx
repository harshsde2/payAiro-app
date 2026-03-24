import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styles";
import { SvgIcons } from "constants/svgs";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import type { IReceiveQRCardProps, IReceiveQRCardRef } from "./types";
import CustomText from "new-ui/components/common-components/CustomText";
import { useTheme as useNewTheme } from "new-ui/styles/ThemeContext";
import { ITheme } from "new-ui/styles";
import { Button } from "new-ui/components/common-components/layout";

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
  const newTheme = useNewTheme();

  const viewShotRef = useRef<any>(null);
  const styles = getStyles(newTheme.theme);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stableBankDetails, setStableBankDetails] = useState<React.ReactNode>(null);
  const tagLabelText = tagLabel || "PayAiro Tag:";

  // console.log("payAiroTag ->", payAiroTag)

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

  const managePayAiroTagFontSize = useMemo(() => {
    if (payAiroTag.length > 16) {
      return 8;
    }
    return 12;
  }, [payAiroTag]);

  const managePayAiroTagFontWeight = useMemo(() => {
    if (payAiroTag.length > 16) {
      return "medium";
    }
    return "semiBold";
  }, [payAiroTag]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={{  }}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 0.9, result: "tmpfile" }}
          style={styles.viewShot}
        >
          {Boolean(title) && (
          <View style={styles.titleRow}>
            {titleIcon && <View style={styles.titleIcon}>{titleIcon}</View>}
            <CustomText variant="h3" fontWeight="bold" style={styles.title}>
              {title}
            </CustomText>
          </View>
          )}
          {Boolean(subtitle) && (
            <CustomText  style={styles.subtitle}>
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
              <SvgIcons.PayairoWhiteLogo style={{ marginLeft: 3 }} width={LOGO_ICON_SIZE} height={LOGO_ICON_SIZE} />
            </View>
          </View>
          {
            Platform.OS === 'ios' && (
              <View style={styles.tagRow}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <CustomText
                    variant='caption'
                    fontWeight={managePayAiroTagFontWeight}
                    size={managePayAiroTagFontSize}
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
                    <SvgIcons.CopyOutlineBlack width={15} height={15} />
                  </TouchableOpacity>
                </View>
              </View>
            )
          }

          {
            Platform.OS === 'ios' && bankDetails && (
              <View style={styles.bankDetailsRow}>
                {bankDetails}
              </View>
            )
          }

        </ViewShot>
        {
          Platform.OS === 'android' && (
            <View style={styles.tagRow}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <CustomText
                  variant='caption'
                  fontWeight={managePayAiroTagFontWeight}
                  size={managePayAiroTagFontSize}
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
                  <SvgIcons.CopyOutlineBlack width={15} height={15} />
                </TouchableOpacity>
              </View>
            </View>
          )
        }
        {
          Platform.OS === 'android' && bankDetails && (
            <View style={styles.bankDetailsRow}>
              {bankDetails}
            </View>
          )
        }
      </View>


      <View style={styles.buttonsRow}>
        {leftButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={leftButton.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonIcon}>

            {leftButton.icon}
            <CustomText variant='caption' size={16} fontWeight="semiBold" style={styles.actionText}>
              {leftButton.text}
            </CustomText>
            </View>
          </TouchableOpacity>
        )}
        {rightButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightButton.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonIcon}>

            {rightButton.icon}
            <CustomText variant='caption' size={16} fontWeight="semiBold" style={styles.actionText}>
              {rightButton.text}
            </CustomText>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default ReceiveQRCard;

const getStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      alignSelf: "center",
    },
    viewShot: {
      backgroundColor: theme.colors.white,
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
      color: theme.colors.black,
      textAlign: "center",
    },
    subtitle: {
      marginBottom: 20,
      textAlign: "center",
      color: theme.colors.primary,
    },
    qrWrapper: {
      width: QR_SIZE,
      height: QR_SIZE,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 16,
    },
    bankDetailsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginVertical: 10,
      // paddingHorizontal: 20,
    },
    bankDetailsText: {
      color: theme.colors.black,
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
      // padding:,
      // backgroundColor:'red',
    },
    tagRow: {
      // flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    tagLabel: {
      color: theme.colors.black,
    },
  tagValue: {
      flexShrink: 1,
      marginRight: 8,
      color: theme.colors.greyDark,
    },
    buttonsRow: {
      // flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
    },
    actionButtonIcon: {
      width:'100%',
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: '100%',
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    actionText: {
      color: theme.colors.white,
    },
  });
