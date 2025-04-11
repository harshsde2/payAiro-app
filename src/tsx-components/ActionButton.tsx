import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  backgroundColor?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  disabled = false,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        backgroundColor ? { backgroundColor } : null,
        disabled ? styles.disabled : null,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        <SvgXml xml={icon} width={24} height={24} />
      </View>
      <CustomText
        variant="caption"
        fontWeight="semiBold"
        color={disabled ? theme.colors.text.tertiary : theme.colors.text.primary}
        align="center"
      >
        {label}
      </CustomText>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.spacing.xs,
    borderRadius: 12,
    minWidth: 70,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.spacing.xxs,
  },
  disabled: {
    opacity: 0.5,
  },
});

// Use memo to prevent unnecessary re-renders
export default memo(ActionButton); 