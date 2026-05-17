import React, { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import GlassyWrapper from "@new-ui/components/common-components/GlassyWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashRampBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashRampBarcodeStyles";
import {
  ATM_REFERENCE_CAPTION,
  cashRampDetailRowLabelSell,
  cashRampDisclaimerSell,
  cashRampFeeLabel,
  cashRampLoadErrorLine,
  cashRampTitle,
  FOOTER_DONE,
} from "./cashRampBarcodeCopy";

type SessionStatus = "loading" | "success" | "error";

export type CashRampBarcodeSellViewProps = {
  sessionStatus: SessionStatus;
  title: string;
  subtitleText: string;
  disclaimerText: string;
  primaryAmountLabel: string;
  feeLabel: string;
  feeValueLabel: string;
  quoteNoteText: string;
  partnerTransactionId: string;
  cryptoCode: string;
  addressMeta: string | null;
  onRetry: () => void;
  onDone: () => void;
};

const CashRampBarcodeSellView: React.FC<CashRampBarcodeSellViewProps> = ({
  sessionStatus,
  subtitleText,
  disclaimerText,
  primaryAmountLabel,
  feeLabel,
  feeValueLabel,
  quoteNoteText,
  partnerTransactionId,
  cryptoCode,
  addressMeta,
  onRetry,
  onDone,
}) => {
  const { theme } = useTheme();
  const styles = cashRampBarcodeStyles(theme);
  const title = useMemo(() => cashRampTitle(true), []);

  const renderGlass = () => {
    if (sessionStatus === "loading") {
      return (
        <View style={styles.qrWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    if (sessionStatus === "error") {
      return (
        <View style={styles.qrWrap}>
          <CustomText variant="body" color={theme.colors.text} style={styles.sessionError}>
            {cashRampLoadErrorLine(true)}
          </CustomText>
          <Button style={{ width: 200 }} onPress={onRetry}>
            Retry
          </Button>
        </View>
      );
    }
    return (
      <View style={styles.barcodeGlassyInner}>
        <CustomText variant="caption" color={theme.colors.text} style={styles.sellCodeCaption}>
          {ATM_REFERENCE_CAPTION}
        </CustomText>
        <CustomText
          variant="body"
          fontWeight="medium"
          color={theme.colors.text}
          style={styles.sellCodeText}
          selectable
        >
          {partnerTransactionId || "—"}
        </CustomText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomText variant="h3" fontWeight="semiBold" color={theme.colors.text} style={styles.title}>
        {title}
      </CustomText>
      <CustomText variant="body" color={theme.colors.text} style={styles.subtitle}>
        {subtitleText}
      </CustomText>

      <GlassyWrapper
        style={[styles.glassyBarcode, { minHeight: 120 }]}
        borderRadius={theme.radius.xl}
        blurAmount={25}
        blurType="regular"
        overlayOpacity={0.12}
        borderWidth={1}
        borderColor={theme.colors.white}
        padding={theme.spacing.lg}
      >
        {renderGlass()}
      </GlassyWrapper>

      <CustomText variant="body" size={10} color={theme.colors.text} style={styles.disclaimer}>
        {disclaimerText}
      </CustomText>

      <View style={styles.detailBlock}>
        <View style={styles.detailRow}>
          <CustomText variant="body" color={theme.colors.text} style={styles.detailLabel}>
            {cashRampDetailRowLabelSell(cryptoCode)}
          </CustomText>
          <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text} style={styles.detailValue}>
            {primaryAmountLabel}
          </CustomText>
        </View>
        <View style={styles.detailRow}>
          <CustomText variant="body" color={theme.colors.text} style={styles.detailLabel}>
            {feeLabel}
          </CustomText>
          <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text} style={styles.detailValue}>
            {feeValueLabel}
          </CustomText>
        </View>
      </View>

      <CustomText variant="body" size={10} color={theme.colors.text} style={styles.quoteNote}>
        {quoteNoteText}
      </CustomText>

      {addressMeta ? (
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.metaText}>
          {addressMeta}
        </CustomText>
      ) : null}

      <View style={styles.footer}>
        <Button onPress={onDone}>{FOOTER_DONE}</Button>
      </View>
    </View>
  );
};

export default CashRampBarcodeSellView;
