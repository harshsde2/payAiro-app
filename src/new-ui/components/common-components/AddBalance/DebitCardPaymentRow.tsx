import React from 'react';
import { View, Pressable } from 'react-native';
import { AppIcon } from '@new-ui/assets/svgs';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';

type DebitCardPaymentRowProps = {
  title: string;
  maskedDetail: string;
  onPress?: () => void;
};

const DebitCardPaymentRow: React.FC<DebitCardPaymentRowProps> = ({
  title,
  maskedDetail,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.paymentRow, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.paymentIconCircle}>
        <AppIcon.Wallet width={24} height={24} color={theme.colors.primary} />
      </View>
      <View style={styles.paymentTextBlock}>
        <CustomText variant='h4' size={16} fontWeight='semiBold' fontFamily='poppins'>
          {title}
        </CustomText>
        <CustomText
          variant="body"
          fontWeight="medium"
          color={theme.colors.primary}
          style={{ marginTop: theme.spacing.xs }}
        >
          {maskedDetail}
        </CustomText>
      </View>
      <AppIcon.ChevronRight width={20} height={20} color={theme.colors.text} />
    </Pressable>
  );
};

export default DebitCardPaymentRow;
