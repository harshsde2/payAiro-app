import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../styles/ThemeContext';
import { CustomText } from '../utils/moduleAlias';
import { NAVIGATION_SCREENS } from '../navigations/navigationConstants';
import AddAndLinkAccountCard from './AddAndLinkAcountCard';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onPress?: () => void; // Custom onPress handler
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({
  onSuccess,
  onCancel,
  onPress,
  title = 'Connect Bank Account',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    // If custom onPress is provided, use it instead of default navigation
    if (onPress) {
      onPress();
      return;
    }

    navigation.navigate(NAVIGATION_SCREENS.PLAID_LINK_SCREEN as never, {
      onSuccess,
      onCancel,
    } as never);
  }, [navigation, onSuccess, onCancel, onPress, disabled, loading]);

  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push({
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.background.primary,
        });
        break;
      case 'secondary':
        baseStyle.push({
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.background.secondary,
        });
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderColor: theme.colors.border.default,
        });
        break;
    }

    if (disabled) {
      baseStyle.push({ opacity: 0.5 });
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle: any[] = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseTextStyle.push({ color: theme.colors.text.primary });
        break;
      case 'outline':
        baseTextStyle.push({ color: theme.colors.text.primary });
        break;
    }

    return baseTextStyle;
  };

  return (
     <AddAndLinkAccountCard 
     style={{height: 125}}
      title={"LINK ACCOUNT"}
      description={"Link your external account"}
      buttonText={"Link Account"}
      onAddPress={handlePress}
      disabled={disabled || loading}
     />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  small: {
    height: 36,
    paddingHorizontal: 16,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default PlaidLinkButton;
