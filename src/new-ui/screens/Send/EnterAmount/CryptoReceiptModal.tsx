import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import InfoModal from '@new-ui/components/common-components/InfoModal';
import { AppIcon } from '@new-ui/assets/svgs';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';

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
  /** When set, an info (i) button appears on the fee row that opens this explanation. */
  feeInfoText?: string;
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
  feeInfoText,
  addFeeToTotal = false,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  const modalStyles = addBalanceStyles(theme);
  const insets = useSafeAreaInsets();
  const [feeInfoVisible, setFeeInfoVisible] = useState(false);
  // Sell/withdraw: Total = Amount + Fee (total charged). Buy/add-balance & plain P2P
  // send: Total = Amount − Fee (net; no fee → equals the amount). Clamped ≥ 0.
  const total = addFeeToTotal
    ? usdAmount + (expectedFee ?? 0)
    : Math.max(0, usdAmount - (expectedFee ?? 0));
  const isFiatOnly = variant === 'fiatOnly';

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modalStyles.modalKav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={[
            modalStyles.modalBackdrop,
            { paddingTop: insets.top + theme.spacing.sm, paddingBottom: Math.max(insets.bottom, theme.spacing.md) },
          ]}
          onPress={onClose}
        >
          <View style={modalStyles.modalCloseRow}>
            <Pressable onPress={onClose} style={modalStyles.modalCloseButton}>
              <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
            </Pressable>
          </View>

          <Pressable style={modalStyles.modalCard} onPress={(e) => e.stopPropagation()}>
          <CustomText variant="h5" fontWeight="bold" align="center" style={{ marginBottom: theme.spacing.sm }}>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                <CustomText variant="caption" fontWeight="light" style={styles.cryptoReceiptLabel}>
                  {feeLabel}
                </CustomText>
                {feeInfoText ? (
                  <TouchableOpacity
                    onPress={() => setFeeInfoVisible(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 6,
                    }}
                  >
                    <CustomText
                      size={11}
                      fontWeight="bold"
                      color={theme.colors.primary}
                      style={{ lineHeight: 14 }}
                    >
                      i
                    </CustomText>
                  </TouchableOpacity>
                ) : null}
              </View>
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

          <View style={{ marginTop: theme.spacing.lg }}>
            <Button onPress={onPayNow} height={46} loading={false}>
              Proceed
            </Button>
          </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>

      {feeInfoText ? (
        <InfoModal
          visible={feeInfoVisible}
          onClose={() => setFeeInfoVisible(false)}
          title="Privilege Discount"
          message={feeInfoText}
        />
      ) : null}
    </Modal>
  );
};

export default CryptoReceiptModal;
