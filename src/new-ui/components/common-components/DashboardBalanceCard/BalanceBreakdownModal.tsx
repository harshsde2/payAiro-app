import React from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
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

  const totalFormatted = isBalanceVisible ? `$${formatBalance(totalBalance)}` : '$••••••';
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
        <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.white }]} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.headerRow}>
            <CustomText variant="body" style={[styles.title, { color: theme.colors.greyDark }]}>
              PayAiro Balance
            </CustomText>
            <View style={styles.headerIcons}>
              {onToggleVisibility && (
                <TouchableOpacity onPress={onToggleVisibility} style={styles.iconButton}>
                  {isBalanceVisible ? (
                    <AppIcon.EyeOn width={18} height={18} color={theme.colors.greyDark} />
                  ) : (
                    <AppIcon.EyeOff width={18} height={18} color={theme.colors.greyDark} />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.chevronButton}>
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                  <AppIcon.ChevronDown width={20} height={20} color={theme.colors.black} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Balance */}
          <View style={styles.totalRow}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <CustomText variant="h2" fontWeight="bold" style={{ color: theme.colors.black }}>
                {totalFormatted}
              </CustomText>
            )}
          </View>

          {/* PayAiro Account */}
          <View style={[styles.breakdownCard, { backgroundColor: theme.colors.greyLight }]}>
            <View style={styles.breakdownRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.border }]}>
                <AppIcon.Send width={24} height={24} color={theme.colors.black} />
              </View>
              <View style={styles.breakdownInfo}>
                <CustomText variant="subtitle2" fontWeight="semiBold">
                  PayAiro Account
                </CustomText>
                <View style={styles.subtitleRow}>
                  <CustomText variant="caption" style={{ color: theme.colors.grey }}>
                    {userId ? maskUserId(userId) : '—'}
                  </CustomText>
                  <TouchableOpacity onPress={() => handleCopy(userId, 'PayAiro Tag')} style={styles.copyButton}>
                    <View style={[styles.copyIcon, { backgroundColor: theme.colors.primary }]} />
                  </TouchableOpacity>
                </View>
              </View>
              <CustomText variant="subtitle2" fontWeight="semiBold">
                {payAiroFormatted}
              </CustomText>
            </View>
          </View>

          {/* Crypto Assets */}
          <View style={[styles.breakdownCard, { backgroundColor: theme.colors.greyLight }]}>
            <View style={styles.breakdownRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.border }]}>
                <AppIcon.Crypto width={24} height={24} color={theme.colors.black} />
              </View>
              <View style={styles.breakdownInfo}>
                <CustomText variant="subtitle2" fontWeight="semiBold">
                  Crypto Assets
                </CustomText>
                <View style={styles.subtitleRow}>
                  <CustomText variant="caption" style={{ color: theme.colors.grey }}>
                    {userId ? maskUserId(userId) : 'S5********N0x1'}
                  </CustomText>
                  <TouchableOpacity onPress={() => handleCopy(userId || '', 'Wallet')} style={styles.copyButton}>
                    <View style={[styles.copyIcon, { backgroundColor: theme.colors.primary }]} />
                  </TouchableOpacity>
                </View>
              </View>
              <CustomText variant="subtitle2" fontWeight="semiBold">
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
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Inter-Regular',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  chevronButton: {
    padding: 4,
  },
  totalRow: {
    marginBottom: 16,
    minHeight: 40,
    justifyContent: 'center',
  },
  breakdownCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  copyIcon: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});

export default BalanceBreakdownModal;
