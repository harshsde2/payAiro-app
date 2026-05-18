import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { sellCashRampStyles } from "@new-ui/styles/screens/cashRamp/sellCashRampStyles";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  SELL_ACK_CHECKBOX,
  SELL_CONFIRM,
  SELL_SUMMARY_ATM_FEE,
  SELL_SUMMARY_AVAILABILITY,
  SELL_SUMMARY_AVAILABILITY_VALUE,
  SELL_SUMMARY_CASH_PICKUP,
  SELL_SUMMARY_EXCHANGE_FEE,
  SELL_SUMMARY_METHOD,
  SELL_SUMMARY_TOTAL_SALE,
} from "./sellFlowCopy";
import type { SellCashRampSession } from "./sellFlow.types";
import {
  cryptoAmountFromUsd,
  estimateSellFees,
  formatUsd,
} from "./sellFlow.utils";
import { showError } from "utils/toast";
import { ERR_MISSING_CHAIN, ERR_MISSING_LOCATION, ERR_MISSING_WALLET } from "../cashRampBarcodeCopy";

const QUOTE_REFRESH_MS = 30_000;

const SellSummaryScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = sellCashRampStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, { session: SellCashRampSession }>, string>>();
  const session = route.params?.session;

  const [acknowledged, setAcknowledged] = useState(false);
  const [unitPrice, setUnitPrice] = useState(session?.usdUnitPrice ?? 0);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => {
      setUnitPrice((p) => p);
    }, QUOTE_REFRESH_MS);
    return () => clearInterval(id);
  }, [session]);

  const amountUsd = session?.amountUsd ?? 0;
  const cryptoCode = (session?.cryptoCurrencyCode ?? "BTC").toUpperCase();
  const cryptoAmt = cryptoAmountFromUsd(amountUsd, unitPrice);
  const fees = useMemo(() => estimateSellFees(amountUsd), [amountUsd]);

  const onConfirm = useCallback(() => {
    if (!session || !acknowledged) return;
    if (!String(session.sourceWalletAddress ?? "").trim()) {
      showError(ERR_MISSING_WALLET);
      return;
    }
    if (!String(session.location?.locationReference ?? "").trim()) {
      showError(ERR_MISSING_LOCATION);
      return;
    }
    if (!String(session.chain ?? "").trim()) {
      showError(ERR_MISSING_CHAIN);
      return;
    }
    navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_SELL_OTP as never, { session } as never);
  }, [acknowledged, navigation, session]);

  if (!session) {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.white}>
        <View style={styles.screen}>
          <CustomText variant="body" color={theme.colors.text}>
            Missing transaction details.
          </CustomText>
        </View>
      </ScreenWrapper>
    );
  }

  const atmLabel = session.location.description ?? "ATM";

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      backgroundColor={theme.colors.white}
      contentStyle={{ flex: 1 }}
      scrollable
      contentContainerStyle={styles.screen}
    >
        <CustomText variant="h2" fontWeight="bold" color={theme.colors.text} style={styles.headlineCenter}>
          Sell {formatUsd(amountUsd)}
        </CustomText>
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.sublineCenter}>
          {cryptoAmt.toFixed(6)} {cryptoCode}
        </CustomText>

        <View style={styles.feeCard}>
          <FeeRow label={SELL_SUMMARY_METHOD} value="ATM" styles={styles} theme={theme} />
          <FeeRow
            label={SELL_SUMMARY_AVAILABILITY}
            value={SELL_SUMMARY_AVAILABILITY_VALUE}
            styles={styles}
            theme={theme}
          />
          <FeeRow label={`${cryptoCode} Price`} value={formatUsd(unitPrice)} styles={styles} theme={theme} />
          <FeeRow
            label={SELL_SUMMARY_EXCHANGE_FEE}
            value={formatUsd(fees.exchangeFee)}
            styles={styles}
            theme={theme}
          />
          <FeeRow label={SELL_SUMMARY_ATM_FEE} value={formatUsd(fees.atmFee)} styles={styles} theme={theme} />
          <FeeRow
            label={SELL_SUMMARY_TOTAL_SALE}
            value={formatUsd(fees.totalSale)}
            styles={styles}
            theme={theme}
          />
          <FeeRow
            label={SELL_SUMMARY_CASH_PICKUP}
            value={formatUsd(amountUsd)}
            styles={styles}
            theme={theme}
            bold
          />
        </View>

        <CustomText variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 8 }}>
          {atmLabel}
        </CustomText>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setAcknowledged((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acknowledged }}
        >
          <View style={[styles.checkbox, acknowledged && styles.checkboxChecked]}>
            {acknowledged ? (
              <CustomText variant="caption" color={theme.colors.white}>
                ✓
              </CustomText>
            ) : null}
          </View>
          <CustomText variant="body" color={theme.colors.text} style={{ flex: 1 }}>
            {SELL_ACK_CHECKBOX}
          </CustomText>
        </Pressable>

        <View style={styles.footer}>
          <Button onPress={onConfirm} disabled={!acknowledged}>
            {SELL_CONFIRM}
          </Button>
        </View>
    </ScreenWrapper>
  );
};

function FeeRow({
  label,
  value,
  styles,
  theme,
  bold,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof sellCashRampStyles>;
  theme: ITheme;
  bold?: boolean;
}) {
  return (
    <View style={styles.feeRow}>
      <CustomText variant="body" color={theme.colors.text}>
        {label}
      </CustomText>
      <CustomText variant="body" fontWeight={bold ? "bold" : "regular"} color={theme.colors.text}>
        {value}
      </CustomText>
    </View>
  );
}

export default SellSummaryScreen;
