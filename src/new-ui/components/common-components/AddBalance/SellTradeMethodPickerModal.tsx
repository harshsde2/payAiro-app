import React, { useCallback } from 'react';
import { Modal, Pressable, View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import { AppIcon } from 'new-ui/assets/svgs';

type SellTradeMethodPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectCash: () => void;
  onSelectDebit: () => void;
};

const SellTradeMethodPickerModal: React.FC<SellTradeMethodPickerModalProps> = ({
  visible,
  onClose,
  onSelectCash,
  onSelectDebit,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);

  const handleCash = useCallback(() => {
    onSelectCash();
    onClose();
  }, [onClose, onSelectCash]);

  const handleDebit = useCallback(() => {
    onSelectDebit();
    onClose();
  }, [onClose, onSelectDebit]);

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCloseRow}>
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
          </Pressable>
        </View>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <CustomText variant="h5" fontWeight="bold" align="center">
            How do you want to sell?
          </CustomText>

          <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}>
            <Pressable
              onPress={handleCash}
              style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.9 : 1 }]}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: theme.colors.greyLight2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomText variant="caption" fontWeight="semiBold">
                  $
                </CustomText>
              </View>
              <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                <CustomText variant="h4" size={16} fontWeight="semiBold" fontFamily="poppins">
                  Cash
                </CustomText>
                <CustomText
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ marginTop: 2 }}
                >
                  Pay with cash at a retail location
                </CustomText>
              </View>
              <AppIcon.ChevronRight width={24} height={24} color={theme.colors.primary} />
            </Pressable>

            <Pressable
              onPress={handleDebit}
              style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.9 : 1 }]}
            >
              <AppIcon.DebitCard width={24} height={24} color={theme.colors.primary} />
              <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                <CustomText variant="h4" size={16} fontWeight="semiBold" fontFamily="poppins">
                  Debit Card
                </CustomText>
                <CustomText
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ marginTop: 2 }}
                >
                  Sell to your debit card
                </CustomText>
              </View>
              <AppIcon.ChevronRight width={24} height={24} color={theme.colors.primary} />
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SellTradeMethodPickerModal;
