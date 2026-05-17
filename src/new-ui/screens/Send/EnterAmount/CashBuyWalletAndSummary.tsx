import React, { useCallback, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, TouchableOpacity, UIManager, View } from 'react-native';
import CopyableField from '@new-ui/components/common-components/CopyableField';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { AppIcon } from '@new-ui/assets/svgs';

function truncateMiddle(value: string, head = 10, tail = 8): string {
  const t = value.trim();
  if (t.length <= head + tail + 1) return t;
  return `${t.slice(0, head)}…${t.slice(-tail)}`;
}

export type CashBuyWalletAndSummaryProps = {
  walletAddress: string;
  assetSymbol: string;
  fiatCode: string;
  fiatAmount: number;
  estimatedCryptoAmount: number;
  oneLineRateLabel: string;
  feePercent: number;
};

const RETAIL_FEE_NOTE =
  'A retail service fee may apply at checkout. The cashier confirms your final total.';

const CashBuyWalletAndSummary: React.FC<CashBuyWalletAndSummaryProps> = ({
  walletAddress,
  assetSymbol,
  fiatCode,
  fiatAmount,
  estimatedCryptoAmount,
  oneLineRateLabel,
  feePercent,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  const [expanded, setExpanded] = useState(false);

  const trimmed = walletAddress.trim();
  const hasWallet = trimmed.length > 0;

  const estCryptoLabel = useMemo(() => {
    if (!Number.isFinite(estimatedCryptoAmount) || estimatedCryptoAmount <= 0) {
      return `— ${assetSymbol}`;
    }
    const frac = estimatedCryptoAmount >= 1 ? 4 : 8;
    const n = estimatedCryptoAmount.toFixed(frac).replace(/\.?0+$/, '');
    return `${n} ${assetSymbol}`;
  }, [assetSymbol, estimatedCryptoAmount]);

  const fiatLine = `${fiatCode} $${Number.isFinite(fiatAmount) ? fiatAmount.toFixed(2) : '0.00'}`;

  const toggle = useCallback(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  return (
    <View style={styles.cashBuyBlock}>
      {hasWallet ? (
        <CopyableField
          label="Receiving wallet"
          value={trimmed}
          displayValue={truncateMiddle(trimmed)}
        />
      ) : (
        <CustomText variant="bodySmall" color={theme.colors.secondary}>
          Wallet address unavailable. Go back to the asset screen and try again—you need a deposit
          address to continue with cash.
        </CustomText>
      )}

      <TouchableOpacity
        style={styles.cashBuySummaryCard}
        onPress={toggle}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.cashBuySummaryHeader}>
          <View style={{ flex: 1 }}>
            <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text}>
              Order summary
            </CustomText>
            <CustomText variant="caption" color={theme.colors.greyDark} style={styles.cashBuySummarySub}>
              {fiatLine} · Est. {estCryptoLabel}
            </CustomText>
          </View>
          <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
            <AppIcon.ChevronDown width={22} height={22} />
          </View>
        </View>

        {expanded ? (
          <View style={styles.cashBuySummaryDetail}>
            <View style={styles.cashBuySummaryRow}>
              <CustomText variant="bodySmall" color={theme.colors.greyDark}>
                You pay
              </CustomText>
              <CustomText variant="bodySmall" fontWeight="semiBold" color={theme.colors.text}>
                {fiatLine}
              </CustomText>
            </View>
            <View style={styles.cashBuySummaryRow}>
              <CustomText variant="bodySmall" color={theme.colors.greyDark}>
                Est. receive
              </CustomText>
              <CustomText variant="bodySmall" fontWeight="semiBold" color={theme.colors.text}>
                {estCryptoLabel}
              </CustomText>
            </View>
            {oneLineRateLabel ? (
              <View style={styles.cashBuySummaryRow}>
                <CustomText variant="bodySmall" color={theme.colors.greyDark}>
                  Rate
                </CustomText>
                <CustomText
                  variant="bodySmall"
                  fontWeight="medium"
                  color={theme.colors.text}
                  style={{ flex: 1, textAlign: 'right' }}
                >
                  {oneLineRateLabel}
                </CustomText>
              </View>
            ) : null}
            {feePercent > 0 ? (
              <View style={styles.cashBuySummaryRow}>
                <CustomText variant="bodySmall" color={theme.colors.greyDark}>
                  App fee
                </CustomText>
                <CustomText variant="bodySmall" fontWeight="semiBold" color={theme.colors.text}>
                  {feePercent}%
                </CustomText>
              </View>
            ) : null}
            <CustomText variant="caption" color={theme.colors.greyDark} style={styles.cashBuyRetailNote}>
              {RETAIL_FEE_NOTE}
            </CustomText>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

export default CashBuyWalletAndSummary;
