import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@styles/ThemeContext';
import CustomText from '@components/common-components/CustomText';
import { IButtonProps } from './types';

const Button: React.FC<IButtonProps> = ({
  children,
  style,
  textStyle,
  color,
  loading = false,
  height = 46,
  width = '100%',
  borderRadius = 16,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const buttonColor = color || theme.colors.primary;
  const isDisabled = disabled || loading;

  const baseButtonStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: buttonColor,
    height,
    width,
    borderRadius,
    opacity: isDisabled ? 0.6 : 1,
  };

  const buttonStyle = [baseButtonStyle, style];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} size="small" />
      ) : (
        <CustomText
          style={[
            {
              color: theme.colors.white,
              fontFamily: theme.typography.fontFamily.semiBold,
            },
            textStyle,
          ]}
        >
          {children}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

export default Button;

