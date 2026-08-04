import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { AppIcon } from '@new-ui/assets/svgs';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import type { PaymentMethodItem } from 'query/hooks/usePaymentMethods';
import { paymentMethodsStyles } from '@new-ui/styles/screens/paymentMethods/paymentMethodsStyles';
import { formatCardLabel, formatExpiry } from './paymentMethods.utils';

type PaymentMethodCardRowProps = {
  item: PaymentMethodItem;
  isDeleting: boolean;
  deleteDisabled: boolean;
  showDivider?: boolean;
  isDefault?: boolean;
  onSetDefault?: (item: PaymentMethodItem) => void;
  onDelete: (item: PaymentMethodItem) => void;
};

const PaymentMethodCardRow: React.FC<PaymentMethodCardRowProps> = ({
  item,
  isDeleting,
  deleteDisabled,
  showDivider = true,
  isDefault = false,
  onSetDefault,
  onDelete,
}) => {
  const { theme } = useTheme();
  const styles = paymentMethodsStyles(theme);
  const expiry = formatExpiry(item);

  return (
    <View style={[styles.cardRow, showDivider && styles.rowDivider]}>
      <View style={styles.cardIconCircle}>
        <AppIcon.DebitCard width={22} height={22} color={theme.colors.primary} />
      </View>
      <View style={styles.cardTextBlock}>
        <View style={styles.cardLabelRow}>
          <CustomText
            variant="body"
            fontWeight="semiBold"
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {formatCardLabel(item)}
          </CustomText>
          {isDefault ? (
            <View style={styles.defaultBadge}>
              <CustomText
                variant="caption"
                fontWeight="semiBold"
                color={theme.colors.white}
                style={styles.defaultBadgeText}
              >
                Default
              </CustomText>
            </View>
          ) : null}
        </View>
        {expiry ? (
          <CustomText
            variant="bodySmall"
            color={theme.colors.textSecondary}
            style={{ marginTop: theme.spacing.xs }}
          >
            Expires {expiry}
          </CustomText>
        ) : null}
        {!isDefault && onSetDefault ? (
          <Pressable onPress={() => onSetDefault(item)} hitSlop={6} style={{ marginTop: theme.spacing.xs }}>
            <CustomText
              variant="bodySmall"
              fontWeight="semiBold"
              color={theme.colors.primary}
            >
              Set as default
            </CustomText>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={() => onDelete(item)}
        disabled={deleteDisabled}
        style={[
          styles.cardRowDelete,
          deleteDisabled && !isDeleting ? { opacity: 0.5 } : null,
        ]}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={theme.colors.error} />
        ) : (
          <CustomText
            variant="bodySmall"
            fontWeight="semiBold"
            style={styles.cardRowDeleteText}
          >
            Delete
          </CustomText>
        )}
      </Pressable>
    </View>
  );
};

export default PaymentMethodCardRow;
