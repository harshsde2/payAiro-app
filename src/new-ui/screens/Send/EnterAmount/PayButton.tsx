import React from 'react';
import { GestureResponderEvent, TouchableOpacity, View } from 'react-native';
import Button from '@new-ui/components/common-components/layout/Button';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { SvgIcons } from 'constants/svgs';

type PayButtonProps = {
  disabled?: boolean;
  onPress?: (event?: GestureResponderEvent) => void;
};

const PayButton: React.FC<PayButtonProps> = ({ disabled, onPress }) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.payButton, { opacity: disabled ? 0.5 : 1 }]}
    >
      <SvgIcons.RightArrow width={20} height={20} color={theme.colors.white} />
    </TouchableOpacity>
  );
};

export default PayButton;

