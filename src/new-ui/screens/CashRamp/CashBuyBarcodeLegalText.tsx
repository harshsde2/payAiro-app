import React from "react";
import { Linking, Text, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import {
  CASH_BUY_FRAUD_LINK,
  CASH_BUY_FRAUD_PREFIX,
  CASH_BUY_LEGAL_BODY_AFTER_PRICING,
  CASH_BUY_LEGAL_BODY_EXPIRY_BOLD,
  CASH_BUY_LEGAL_BODY_MID,
  CASH_BUY_LEGAL_BODY_PREFIX,
  CASH_BUY_LEGAL_BODY_SUFFIX,
  CASH_BUY_LEGAL_LINKS,
} from "./cashBuyBarcodeInstructionCopy";

const openUrl = (url: string) => {
  void Linking.openURL(url).catch(() => {});
};

const CashBuyBarcodeLegalText: React.FC = () => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);
  const linkColor = theme.colors.text;

  return (
    <>
      <View style={styles.legalBlock}>
        <CustomText variant="body" size={11} color={theme.colors.text} style={styles.legalText}>
          <Text>{CASH_BUY_LEGAL_BODY_PREFIX}</Text>
          <Text style={{ fontWeight: "700" }}>{CASH_BUY_LEGAL_BODY_EXPIRY_BOLD}</Text>
          <Text>{CASH_BUY_LEGAL_BODY_MID}</Text>
          <Text style={[styles.link, { color: linkColor }]} onPress={() => openUrl(CASH_BUY_LEGAL_LINKS.pricing)}>
            Pricing
          </Text>
          <Text>{CASH_BUY_LEGAL_BODY_AFTER_PRICING}</Text>
          <Text
            style={[styles.link, { color: linkColor }]}
            onPress={() => openUrl(CASH_BUY_LEGAL_LINKS.terms)}
          >
            Terms and Conditions
          </Text>
          <Text>{CASH_BUY_LEGAL_BODY_SUFFIX}</Text>
        </CustomText>
      </View>
      <CustomText variant="body" size={11} color={theme.colors.text} style={styles.legalText}>
        <Text>{CASH_BUY_FRAUD_PREFIX}</Text>
        <Text
          style={[styles.link, { color: linkColor, fontWeight: "600" }]}
          onPress={() => openUrl(CASH_BUY_LEGAL_LINKS.fraudLearnMore)}
        >
          {CASH_BUY_FRAUD_LINK}
        </Text>
      </CustomText>
    </>
  );
};

export default CashBuyBarcodeLegalText;
