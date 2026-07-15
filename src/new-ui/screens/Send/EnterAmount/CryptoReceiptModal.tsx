import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
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
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  // No transaction fee on the frontend — total is just the amount.
  const total = usdAmount;
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

          <View style={styles.cryptoReceiptRowTotal}>
            <CustomText variant="subtitle2" size={14} fontWeight="light" style={styles.cryptoReceiptLabel}>
              Total
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
