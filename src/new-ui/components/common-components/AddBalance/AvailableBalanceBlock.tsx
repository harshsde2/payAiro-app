import React from 'react';
import { View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';

type AvailableBalanceBlockProps = {
  label: string;
  formattedAmount: string;
};

const AvailableBalanceBlock: React.FC<AvailableBalanceBlockProps> = ({
  label,
  formattedAmount,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);

  return (
    <View>
      <CustomText variant='h4' size={16}  fontWeight='semiBold' fontFamily='poppins' style={styles.sectionLabel}>
        {label}
      </CustomText>
      <CustomText
        variant="h4"
        fontWeight="semiBold"
        size={15}
        fontFamily='poppins'
        color={theme.colors.primary}
        style={styles.availableAmount}
      >
        {formattedAmount}
      </CustomText>
    </View>
  );
};

export default AvailableBalanceBlock;
