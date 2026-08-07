import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import type { ITheme } from '@new-ui/styles/themes/themeTypes';
import { AppIcon } from '@new-ui/assets/svgs';

type InfoModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Confirm button label. */
  buttonLabel?: string;
  /** Show the green "i" badge at the top of the card. */
  showIcon?: boolean;
};

/**
 * Lightweight informational popup rendered in the app's own modal style (matches
 * AddDebitCardModal: centered ✕ close row above a bottom-anchored card) so info copy
 * matches the rest of the UI (e.g. the Privilege Discount explanation on the buy summary).
 */
const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonLabel = 'Got it',
  showIcon = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = addBalanceStyles(theme);
  const localStyles = makeStyles(theme);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalKav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={[
            styles.modalBackdrop,
            { paddingTop: insets.top + theme.spacing.sm, paddingBottom: Math.max(insets.bottom, theme.spacing.md) },
          ]}
          onPress={onClose}
        >
          <View style={styles.modalCloseRow}>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
            </Pressable>
          </View>

          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {showIcon ? (
              <View style={localStyles.iconBadge}>
                <CustomText size={20} fontWeight="bold" color={theme.colors.primary}>
                  i
                </CustomText>
              </View>
            ) : null}

            <CustomText variant="h5" fontWeight="bold" align="center">
              {title}
            </CustomText>

            <CustomText
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
              style={localStyles.message}
            >
              {message}
            </CustomText>

            <View style={localStyles.buttonWrap}>
              <Button onPress={onClose}>{buttonLabel}</Button>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    iconBadge: {
      alignSelf: 'center',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      marginTop: theme.spacing.sm,
      lineHeight: 22,
    },
    buttonWrap: {
      marginTop: theme.spacing.lg,
    },
  });

export default InfoModal;
