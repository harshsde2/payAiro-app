import React from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';

type CryptoReceiptVariant = 'full' | 'fiatOnly';

type CryptoReceiptModalProps = {
  visible: boolean;
  onClose: () => void;
  onPayNow: () => void;
  usdAmount: number;
  variant?: CryptoReceiptVariant;
  /** Required when variant is `full` (default). */
  tokenSymbol?: string;
  tokenAmount?: number;
  priceUSD?: number;
  /** All-in expected fee (USD) from the trade quote. Row hidden when null & not loading. */
  expectedFee?: number | null;
  expectedFeeLoading?: boolean;
  /** Row labels — vary per flow (buy vs sell/withdraw). */
  feeLabel?: string;
  totalLabel?: string;
  /** Sell/withdraw: Total = Amount + Fee (charged). Buy/add-balance (default): Amount − Fee. */
  addFeeToTotal?: boolean;
};

const CryptoReceiptModal: React.FC<CryptoReceiptModalProps> = ({
  visible,
  onClose,
  onPayNow,
  tokenSymbol = '',
  tokenAmount = 0,
  priceUSD = 0,
  usdAmount,
  variant = 'full',
  expectedFee = null,
  expectedFeeLoading = false,
  feeLabel = 'Expected Fee',
  totalLabel = 'Total',
  addFeeToTotal = false,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  // Sell/withdraw: Total = Amount + Fee (total charged). Buy/add-balance & plain P2P
  // send: Total = Amount − Fee (net; no fee → equals the amount). Clamped ≥ 0.
  const total = addFeeToTotal
    ? usdAmount + (expectedFee ?? 0)
    : Math.max(0, usdAmount - (expectedFee ?? 0));
  const isFiatOnly = variant === 'fiatOnly';

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.cryptoReceiptBackdrop}>
        <View style={[styles.cryptoReceiptSheet, { backgroundColor: theme.colors.white }]}>
          <CustomText variant="h3" fontWeight="bold" style={styles.cryptoReceiptTitle}>
            Summary
          </CustomText>

          {!isFiatOnly ? (
            <>
              <View style={styles.cryptoReceiptRow}>
                <CustomText variant="caption" fontWeight="light" style={styles.cryptoReceiptLabel}>
                  Token
                </CustomText>
                <CustomText>{tokenSymbol}</CustomText>
              </View>

              <View style={styles.cryptoReceiptRow}>
                <CustomText variant="caption" fontWeight="light" style={styles.cryptoReceiptLabel}>
                  Amount
                </CustomText>
                <CustomText>
                  {tokenAmount > 0 ? tokenAmount.toFixed(8).replace(/\.?0+$/, '') : '0.00'}{' '}
                  {tokenSymbol}
                </CustomText>
              </View>

              <View style={styles.cryptoReceiptRow}>
                <CustomText variant="caption" fontWeight="light" style={styles.cryptoReceiptLabel}>
                  Price per {tokenSymbol}
                </CustomText>
                <CustomText>${priceUSD.toFixed(2)}</CustomText>
              </View>
            </>
          ) : null}

          <View style={styles.cryptoReceiptRow}>
            <CustomText variant="caption" fontWeight="light" style={styles.cryptoReceiptLabel}>
              {isFiatOnly ? 'Amount' : 'Subtotal'}
            </CustomText>
            <CustomText>${usdAmount.toFixed(2)}</CustomText>
          </View>

          {expectedFeeLoading || expectedFee != null ? (
            <View style={styles.cryptoReceiptRow}>
              <CustomText variant="caption" fontWeight="light" style={styles.cryptoReceiptLabel}>
                {feeLabel}
              </CustomText>
              {expectedFeeLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <CustomText>${(expectedFee ?? 0).toFixed(2)}</CustomText>
              )}
            </View>
          ) : null}

          <View style={styles.cryptoReceiptRowTotal}>
            <CustomText variant="subtitle2" size={14} fontWeight="light" style={styles.cryptoReceiptLabel}>
              {totalLabel}
            </CustomText>
            <CustomText size={14} variant="subtitle2" style={styles.cryptoReceiptTotal}>
              ${total.toFixed(2)}
            </CustomText>
          </View>

          <View style={styles.cryptoReceiptButtonArea}>
            <Button onPress={onPayNow} height={46} loading={false}>
              Proceed
            </Button>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.9}
              style={styles.cryptoReceiptCancelButton}
            >
              <CustomText
                style={{
                  color: theme.colors.white,
                  fontFamily: theme.typography.fontFamily.semiBold,
                }}
              >
                Cancel
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CryptoReceiptModal;
