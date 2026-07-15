import React, { useState } from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { rewardsAndReferralsScreenStyles } from '@new-ui/styles/screens/rewards/rewardsAndReferralsScreenStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';

interface IBreakdownRow {
  label: string;
  amount: string;
}

interface IRewardsBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  totalBalance: number;
  rows?: IBreakdownRow[];
}

const formatCurrency = (amount: number, visible: boolean) => {
  if (!visible) return { integer: '••••••', decimal: '' };
  const parts = amount.toFixed(2).split('.');
  return { integer: parts[0], decimal: parts[1] };
};

const DEFAULT_BREAKDOWN: IBreakdownRow[] = [
  { label: 'Rewards', amount: '$0.00' },
  { label: 'Referrals', amount: '$0.00' },
];

const RewardsBreakdownModal: React.FC<IRewardsBreakdownModalProps> = ({
  visible,
  onClose,
  totalBalance,
  rows,
}) => {
  const { theme } = useTheme();
  const styles = rewardsAndReferralsScreenStyles(theme);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const { integer, decimal } = formatCurrency(totalBalance, balanceVisible);
  const BREAKDOWN = rows && rows.length > 0 ? rows : DEFAULT_BREAKDOWN;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.white }]} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeaderRow}>
            <View style={styles.modalTitleRow}>
              <CustomText variant="h3" size={16} fontWeight="semiBold" color={theme.colors.text}>
                PayAiro Balance
              </CustomText>
              <TouchableOpacity
                onPress={() => setBalanceVisible(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 8 }}
              >
                {balanceVisible ? (
                  <AppIcon.EyeOn width={18} height={18} color={theme.colors.greyDark} />
                ) : (
                  <AppIcon.EyeOff width={18} height={18} color={theme.colors.greyDark} />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <AppIcon.Cancel width={18} height={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.modalBalanceRow} onPress={onClose} activeOpacity={0.7}>
            <CustomText variant="h1" size={34} fontFamily="poppins" fontWeight="bold" color={theme.colors.black}>
              $
            </CustomText>
            <View style={styles.modalBalanceParts}>
              <CustomText
                variant="h1"
                size={34}
                fontFamily="poppins"
                fontWeight="bold"
                color={theme.colors.black}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {integer}
              </CustomText>
              {decimal ? (
                <CustomText variant="h1" size={24} fontFamily="poppins" fontWeight="bold" color={theme.colors.greyDark}>
                  .{decimal}
                </CustomText>
              ) : null}
            </View>
            <View style={styles.modalCaret}>
              <AppIcon.ChevronDown width={14} height={14} color={theme.colors.black} />
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.modalBreakdownCard,
              { backgroundColor: theme.colors.white, borderColor: theme.colors.border },
            ]}
          >
            {BREAKDOWN.map((row, idx) => (
              <View
                key={row.label}
                style={[
                  styles.modalBreakdownRow,
                  idx < BREAKDOWN.length - 1 && {
                    marginBottom: 14,
                    paddingBottom: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.modalIconCircle}>
                  <AppIcon.RewardsIcon width={20} height={20} />
                </View>
                <View style={styles.modalBreakdownInfo}>
                  <CustomText
                    variant="body"
                    size={15}
                    fontFamily="poppins"
                    fontWeight="semiBold"
                    color={theme.colors.black}
                  >
                    {row.label}
                  </CustomText>
                </View>
                <CustomText
                  variant="body"
                  size={15}
                  fontFamily="poppins"
                  fontWeight="semiBold"
                  color={theme.colors.black}
                >
                  {balanceVisible ? row.amount : '••••'}
                </CustomText>
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RewardsBreakdownModal;
