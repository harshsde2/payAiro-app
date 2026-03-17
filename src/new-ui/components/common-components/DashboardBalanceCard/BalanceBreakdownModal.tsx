import React from 'react';
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { AppIcon } from 'new-ui/assets/svgs';
import CustomText from '@new-ui/components/common-components/CustomText';
import { showSuccess } from 'utils/toast';

const maskUserId = (userId: string): string => {
  if (!userId || userId.length < 10) return userId || '—';
  const start = userId.slice(0, 3);
  const end = userId.slice(-4);
  return `${start}...${end}`;
};

const formatBalance = (amount: number): string =>
  Number(amount ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const splitBalanceForDisplay = (formatted: string): { integer: string; decimal: string } => {
  if (formatted.includes('.')) {
    const [integer, decimal] = formatted.split('.');
    return { integer: integer ?? formatted, decimal: decimal ?? '00' };
  }
  return { integer: formatted, decimal: '00' };
};

export interface IBalanceBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  totalBalance: number;
  payAiroBalance: number;
  cryptoBalance: number;
  userId: string;
  isBalanceVisible: boolean;
  onToggleVisibility?: () => void;
  isRefreshing?: boolean;
}

const BalanceBreakdownModal: React.FC<IBalanceBreakdownModalProps> = ({
  visible,
  onClose,
  totalBalance,
  payAiroBalance,
  cryptoBalance,
  userId,
  isBalanceVisible,
  onToggleVisibility,
  isRefreshing = false,
}) => {
  const { theme } = useTheme();

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    showSuccess('Copied!', `${label} copied to clipboard`);
  };

  const totalFormattedRaw = isBalanceVisible ? formatBalance(totalBalance) : '••••••';
  const { integer: totalInteger, decimal: totalDecimal } = splitBalanceForDisplay(totalFormattedRaw);
  const payAiroFormatted = isBalanceVisible ? `$${formatBalance(payAiroBalance)}` : '$••••••';
  const cryptoFormatted = isBalanceVisible ? `$${formatBalance(cryptoBalance)}` : '$••••••';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: theme.colors.white }]}
          onPress={(e: any) => e?.stopPropagation?.()}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <CustomText
                variant="body"
                fontFamily="inter"
                fontWeight="regular"
                style={[styles.title, { color: theme.colors.greyDark }]}
              >
                PayAiro Balance
              </CustomText>
              {onToggleVisibility && (
                <TouchableOpacity
                  onPress={onToggleVisibility}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.iconButton}
                >
                  {isBalanceVisible ? (
                    <AppIcon.EyeOn width={18} height={18} color={theme.colors.greyDark} />
                  ) : (
                    <AppIcon.EyeOff width={18} height={18} color={theme.colors.greyDark} />
                  )}
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.chevronButton}
            >
              <View style={{ transform: [{ rotate: '180deg' }] }}>
                <AppIcon.ChevronDown width={18} height={18} color={theme.colors.black} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Total Balance */}
          <View style={styles.totalRow}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <View style={styles.totalAmountRow}>
                <CustomText
                  variant="h1"
                  size={40}
                  fontFamily="poppins"
                  fontWeight="bold"
                  style={{ color: theme.colors.black }}
                >
                  $
                </CustomText>
                <View style={styles.totalAmountParts}>
                  <CustomText
                    variant="h1"
                    size={40}
                    fontFamily="poppins"
                    fontWeight="bold"
                    style={{ color: theme.colors.black }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {totalInteger}
                  </CustomText>
                  {totalDecimal ? (
                    <CustomText
                      variant="h1"
                      size={30}
                      fontFamily="poppins"
                      fontWeight="bold"
                      style={{ color: theme.colors.greyDark }}
                      numberOfLines={1}
                    >
                      .{totalDecimal}
                    </CustomText>
                  ) : null}
                </View>
                <View style={styles.totalCaret}>
                  <AppIcon.ChevronDown width={16} height={16} color={theme.colors.black} />
                </View>
              </View>
            )}
          </View>

          {/* PayAiro Account */}
          <View
            style={[
              styles.breakdownCard,
              { backgroundColor: theme.colors.white, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.breakdownRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.white }]}>
                <AppIcon.PayairoLogoBlack width={26} height={26} />
              </View>
              <View style={styles.breakdownInfo}>
                <CustomText variant="body" fontFamily="poppins" fontWeight="semiBold" style={{ color: theme.colors.black }}>
                  PayAiro Account
                </CustomText>
                <View style={styles.subtitleRow}>
                  <CustomText variant="caption" fontFamily="inter" fontWeight="regular" style={{ color: theme.colors.grey }}>
                    {userId ? maskUserId(userId) : '—'}
                  </CustomText>
                  <TouchableOpacity
                    onPress={() => handleCopy(userId, 'PayAiro Tag')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.copyButton}
                  >
                    <AppIcon.Copygreen width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
              <CustomText variant="body" fontFamily="poppins" fontWeight="semiBold" style={{ color: theme.colors.black }}>
                {payAiroFormatted}
              </CustomText>
            </View>
          </View>

          {/* Crypto Assets */}
          <View
            style={[
              styles.breakdownCard,
              { backgroundColor: theme.colors.white, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.breakdownRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.white }]}>
                <AppIcon.AllCryptos width={30} height={30} />
              </View>
              <View style={styles.breakdownInfo}>
                <CustomText variant="body" fontFamily="poppins" fontWeight="semiBold" style={{ color: theme.colors.black }}>
                  Crypto Assets
                </CustomText>
                <View style={styles.subtitleRow}>
                  <CustomText variant="caption" fontFamily="inter" fontWeight="regular" style={{ color: theme.colors.grey }}>
                    {userId ? maskUserId(userId) : 'S5********N0x1'}
                  </CustomText>
                  <TouchableOpacity
                    onPress={() => handleCopy(userId || '', 'Wallet')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.copyButton}
                  >
                    <AppIcon.Copygreen width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
              <CustomText variant="body" fontFamily="poppins" fontWeight="semiBold" style={{ color: theme.colors.black }}>
                {cryptoFormatted}
              </CustomText>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 18, // offsets right chevron button to keep title visually centered
  },
  title: {
    fontSize: 14,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  chevronButton: {
    padding: 4,
  },
  totalRow: {
    marginBottom: 16,
    minHeight: 40,
    justifyContent: 'center',
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  totalAmountParts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    maxWidth: '72%',
    flexShrink: 1,
  },
  totalCaret: {
    marginLeft: 6,
    alignSelf: 'center',
  },
  breakdownCard: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breakdownInfo: {
    flex: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  copyButton: {
    padding: 2,
  },
});

export default BalanceBreakdownModal;
