import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { AppIcon } from 'new-ui/assets/svgs';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import type { StateCode } from '@new-ui/constants/compliance';
import {
  usePreTransactionDisclosure,
  useAcknowledgePreTransaction,
} from 'query/hooks/useComplianceDisclosure';
import { useCoinmeTradeQuote, type CoinmeFeeBreakdown } from 'query/hooks/useCrypto';
import { showError } from 'utils/toast';
import {
  markPreTxDisclosureAccepted,
  clearPreTxDisclosureFlow,
} from './preTxDisclosureFlow';

// ─── Pre-transaction disclosure content per state ────────────────────────────

type TradeType = 'buy' | 'sell';

interface PreTxContent {
  header: string;
  subheader: string;
  disclaimer: string;
  ackLabel: string;
  feeLabels: { buy: [string, string, string]; sell: [string, string, string] };
  confirmLabel: { buy: string; sell: string };
}

// Verbatim from the requirements PDF (sections 2A/2B) — used as fallback when the
// backend content request hasn't resolved/fails. API-served strings take precedence.
const PRE_TX_CONTENT: Partial<Record<StateCode, PreTxContent>> = {
  CT: {
    header: 'Attention:',
    subheader: 'Once executed, this transaction may not be undone.',
    disclaimer: '*Includes the difference between the current market price and sale price',
    ackLabel: 'I have reviewed and acknowledge receipt of all required disclosures for this transaction.',
    feeLabels: {
      buy: ['You Pay', 'Card Processing Fee', 'Transaction Fees*'],
      sell: ['You Sell', 'Instant Withdrawal Fee', 'Transaction Fees*'],
    },
    confirmLabel: {
      buy: 'Finalize Transaction',
      sell: 'Continue',
    },
  },
  // MN/CA: add only if a state requires a pre-transaction disclosure
};

const FEE_PLACEHOLDER = '--';

// Stat. 36a-613 Sec. 4(c): the pre-transaction terms/conditions disclosure (amount,
// fees, type/nature, irreversibility, market-vs-sale difference) must be shown in
// not less than 24-point sans-serif type.
const REG_DISCLOSURE_FONT_SIZE = 24;

type FeeRow = { label: string; value: string; emphasize?: boolean };

function formatUsdAmount(value: number): string {
  if (!Number.isFinite(value)) return FEE_PLACEHOLDER;
  return `$${value.toFixed(2)}`;
}

/**
 * USD amount being sold ("You Sell"). The quote's "You Pay" / `youPay` field reports
 * the crypto side as 0 for sells, so the entered USD amount is the source of truth
 * (mirrors the quote request's `amountValue`).
 */
function sellPrimaryUsdValue(usdAmount?: number): string {
  return usdAmount != null && Number.isFinite(usdAmount)
    ? formatUsdAmount(usdAmount)
    : FEE_PLACEHOLDER;
}

function buildFeeRows(
  tradeType: TradeType,
  feeBreakdown: CoinmeFeeBreakdown | undefined,
  localLabels: [string, string, string],
  usdAmount?: number,
): FeeRow[] {
  if (!feeBreakdown?.fields?.length) {
    return [
      { label: localLabels[0], value: FEE_PLACEHOLDER, emphasize: true },
      { label: localLabels[1], value: FEE_PLACEHOLDER },
      { label: localLabels[2], value: FEE_PLACEHOLDER },
    ];
  }

  return feeBreakdown.fields.map((f, i) => {
    const label = i < localLabels.length ? localLabels[i] : f.label;
    const value =
      tradeType === 'sell' && i === 0 ? sellPrimaryUsdValue(usdAmount) : f.value;
    return { label, value, emphasize: i === 0 };
  });
}

/** Normalize a fee/amount string (e.g. "$1,234.50") to a plain 2-decimal string ("1234.50"). */
function toAmountString(value: string | number | undefined | null): string {
  if (value == null) return '0.00';
  const n =
    typeof value === 'number'
      ? value
      : Number.parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

function getCoinmeTradeQuoteErrorMessage(error: unknown): string {
  const data = (error as { response?: { data?: { message?: string; error?: { message?: string } } } })
    ?.response?.data;
  return (
    data?.message ||
    data?.error?.message ||
    'Unable to load fee details.'
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

type RouteParams = {
  StateCompliancePreTransaction: {
    stateCode: StateCode;
    tradeType: TradeType;
    usdAmount: number;
    /**
     * Inputs for the Coinme trade-quote API — the disclosure fetches a live fee
     * breakdown (You Pay / fee / Transaction Fees) and shows the real amounts at
     * 24pt, then records them verbatim in the regulatory acknowledgment.
     */
    chain?: string;
    cryptoCurrencyCode?: string;
    fiatCurrencyCode?: string;
    amountValue?: string;
    amountCurrencyCode?: string;
  };
};

const PreTransactionDisclosureScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, typeof NAVIGATION_SCREENS.STATE_COMPLIANCE_PRE_TRANSACTION>>();
  const {
    stateCode,
    tradeType,
    usdAmount,
    chain,
    cryptoCurrencyCode,
    fiatCurrencyCode,
    amountValue,
    amountCurrencyCode,
  } = route.params;

  const [acknowledged, setAcknowledged] = useState(false);

  // Backend-served disclosure copy (GET {state}/pre-transaction/{type}/). Response
  // shape isn't documented in the Postman collection — strings are merged over the
  // verbatim PDF fallback, and the raw response is dev-logged so the types can be
  // pinned once observed against staging.
  const { data: apiContent } = usePreTransactionDisclosure(stateCode, tradeType);

  useEffect(() => {
    if (__DEV__ && apiContent) {
      console.log('[PreTxDisclosure] API content:', JSON.stringify(apiContent));
    }
  }, [apiContent]);

  const fallback = PRE_TX_CONTENT[stateCode];
  const content = useMemo(() => {
    if (!fallback) return null;
    const src = ((apiContent as any)?.disclosure ?? apiContent ?? {}) as Record<string, unknown>;
    const pick = (key: string, fb: string) =>
      typeof src[key] === 'string' && src[key] ? (src[key] as string) : fb;
    return {
      ...fallback,
      header: pick('header', fallback.header),
      subheader: pick('body', pick('subheader', fallback.subheader)),
      disclaimer: pick('disclaimer', fallback.disclaimer),
      ackLabel: pick('acknowledgment_text', fallback.ackLabel),
    };
  }, [apiContent, fallback]);

  // Live fee breakdown for the disclosure. Regulation requires showing real
  // amounts, so the quote must resolve before the user can finalize.
  const quoteEnabled = !!amountValue && !!cryptoCurrencyCode;
  const {
    data: quoteData,
    isLoading: isQuoteLoading,
    isError: isQuoteError,
    error: quoteError,
    refetch: refetchQuote,
  } = useCoinmeTradeQuote(
    {
      tradeType,
      chain: chain ?? '',
      cryptoCurrencyCode: cryptoCurrencyCode ?? '',
      fiatCurrencyCode: fiatCurrencyCode ?? 'USD',
      amountValue: amountValue ?? '',
      amountCurrencyCode: amountCurrencyCode ?? '',
    },
    quoteEnabled,
  );

  const feeBreakdown = quoteData?.feeBreakdown;
  const lastQuoteErrorToast = useRef<string | null>(null);

  const { mutateAsync: acknowledge, isPending: isSubmitting } =
    useAcknowledgePreTransaction(stateCode);

  useEffect(() => {
    if (!isQuoteError || !quoteError) {
      lastQuoteErrorToast.current = null;
      return;
    }
    const msg = getCoinmeTradeQuoteErrorMessage(quoteError);
    if (lastQuoteErrorToast.current === msg) return;
    lastQuoteErrorToast.current = msg;
    showError('Quote unavailable', msg);
  }, [isQuoteError, quoteError]);

  const handleConfirm = useCallback(async () => {
    if (!acknowledged || !content || !feeBreakdown || isSubmitting) return;

    // Fees actually shown to the user — recorded verbatim in the regulatory ack.
    const feeShown =
      tradeType === 'buy'
        ? Number(toAmountString(feeBreakdown.cardProcessingFee)) +
          Number(toAmountString(feeBreakdown.transactionFees))
        : Number(toAmountString(feeBreakdown.instantWithdrawalFee)) +
          Number(toAmountString(feeBreakdown.transactionFees));
    // Buy: USD paid (`youPay`). Sell: `youPay` is the 0-valued crypto side, so use
    // the entered USD sell amount (mirrors the quote request's amountValue).
    const purchaseShown =
      tradeType === 'sell'
        ? toAmountString(usdAmount)
        : toAmountString(feeBreakdown.youPay || usdAmount);

    try {
      // The ack records the regulatory timestamp — the trade must not proceed without it.
      await acknowledge({
        transaction_type: tradeType,
        acknowledged: true,
        fee_amount_shown: feeShown.toFixed(2),
        purchase_amount_shown: purchaseShown,
      });
      markPreTxDisclosureAccepted();
      navigation.goBack();
    } catch {
      showError('Something went wrong', 'Please try again.');
    }
  }, [acknowledged, acknowledge, content, feeBreakdown, isSubmitting, navigation, tradeType, usdAmount]);

  const handleCancel = useCallback(() => {
    clearPreTxDisclosureFlow();
    navigation.goBack();
  }, [navigation]);

  if (!content) return null;

  const styles = makeStyles(theme);
  const [amountLabel, feeLabel, txFeeLabel] = content.feeLabels[tradeType];

  // Use regulatory labels from PDF fallback; for sell, row 0 shows the USD sell amount.
  const feeRows = buildFeeRows(
    tradeType,
    feeBreakdown,
    [amountLabel, feeLabel, txFeeLabel],
    usdAmount,
  );

  const canConfirm = acknowledged && !!feeBreakdown && !isSubmitting;

  return (
    <ScreenWrapper
      safeAreaEdges={['bottom', 'left', 'right']}
      backgroundColor={theme.colors.background}
      statusBarStyle="dark-content"
      loading={isSubmitting}
      contentStyle={{ flex: 1 }}
    >
      <View style={styles.dragHandle} />

      <View style={styles.headerBar}>
        <AppIcon.ArrowLeft
            color={theme.colors.text}
          width={24}
          height={24}
          onPress={handleCancel}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Attention card ── */}
        <View style={styles.warningCard}>
          <CustomText style={styles.header}>{content.header}</CustomText>
          <CustomText style={styles.subheader}>{content.subheader}</CustomText>

          <View style={styles.divider} />

          {isQuoteLoading ? (
            <View style={styles.quoteStatus}>
              <ActivityIndicator color={theme.colors.primary} />
              <CustomText style={styles.quoteStatusText}>Calculating fees…</CustomText>
            </View>
          ) : isQuoteError || !feeBreakdown ? (
            <View style={styles.quoteStatus}>
              <CustomText style={styles.quoteStatusText}>
                Unable to load the fee details.
              </CustomText>
              <Pressable onPress={() => refetchQuote()} style={styles.retryBtn}>
                <CustomText style={styles.retryText}>Retry</CustomText>
              </Pressable>
            </View>
          ) : (
            feeRows.map((row, i) => (
              <FeeRow
                key={`${row.label}-${i}`}
                label={row.label}
                value={row.value}
                theme={theme}
                emphasize={row.emphasize}
              />
            ))
          )}

          <CustomText style={styles.disclaimer}>{content.disclaimer}</CustomText>
        </View>

        {/* ── Acknowledgment card ── */}
        <View style={styles.ackSection}>
          <CustomText style={styles.ackHeader}>ACKNOWLEDGMENT</CustomText>
          <View style={styles.ackCard}>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => setAcknowledged(v => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acknowledged }}
            >
              <View style={[styles.checkbox, acknowledged && styles.checkboxChecked]}>
                {acknowledged && <CustomText style={styles.checkmark}>✓</CustomText>}
              </View>
              <CustomText style={styles.checkboxLabel}>{content.ackLabel}</CustomText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky footer ── */}
      <View style={styles.footer}>
        <Button disabled={!canConfirm} onPress={handleConfirm}>
          {content.confirmLabel[tradeType]}
        </Button>
      </View>
    </ScreenWrapper>
  );
};

// ─── Fee row ─────────────────────────────────────────────────────────────────

interface FeeRowProps {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>['theme'];
  emphasize?: boolean;
}

const FeeRow: React.FC<FeeRowProps> = ({ label, value, theme, emphasize }) => {
  const styles = makeStyles(theme);
  return (
    <View style={styles.feeRow}>
      <CustomText style={styles.feeLabel}>{label}</CustomText>
      <CustomText style={[styles.feeValue, emphasize && styles.feeValueEmphasize]}>
        {value}
      </CustomText>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    dragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.lg,
    },

    // Attention card
    warningCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius['2xl'],
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    header: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 28,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subheader: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: REG_DISCLOSURE_FONT_SIZE,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 32,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.lg,
    },
    feeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.base,
    },
    feeLabel: {
      flex: 1,
      marginRight: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: REG_DISCLOSURE_FONT_SIZE,
      color: theme.colors.text,
    },
    feeValue: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: REG_DISCLOSURE_FONT_SIZE,
      color: theme.colors.text,
      textAlign: 'right',
    },
    feeValueEmphasize: {
      fontFamily: theme.typography.fontFamily.bold,
    },
    quoteStatus: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
    },
    quoteStatusText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    retryBtn: {
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.base,
    },
    retryText: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 16,
      color: theme.colors.primary,
    },
    disclaimer: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: REG_DISCLOSURE_FONT_SIZE,
      color: theme.colors.textSecondary,
      lineHeight: 32,
      marginTop: theme.spacing.base,
    },

    // Acknowledgment section
    ackSection: {
      marginBottom: theme.spacing.sm,
    },
    ackHeader: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 13,
      color: theme.colors.primary,
      letterSpacing: 0.8,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    ackCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius['2xl'],
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.radius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      fontSize: 14,
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.fontFamily.bold,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },

    // Footer
    footer: {
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
    },
  });

export default PreTransactionDisclosureScreen;
