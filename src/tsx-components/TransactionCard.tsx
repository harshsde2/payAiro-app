import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

interface TransactionCardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  amount: string;
  isPositive?: boolean;
  date?: string;
  onPress?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  icon,
  title,
  subtitle,
  amount,
  isPositive = false,
  date,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {icon ? <SvgXml xml={icon} width={24} height={24} /> : null}
        </View>
        <View style={styles.textContainer}>
          <CustomText variant="subtitle2" fontWeight="semiBold" style={styles.title}>
            {title}
          </CustomText>
          {subtitle ? (
            <CustomText variant="caption" color={theme.colors.text.tertiary} style={styles.subtitle}>
              {subtitle}
            </CustomText>
          ) : null}
        </View>
        <View style={styles.amountContainer}>
          <CustomText 
            variant="subtitle2" 
            fontWeight="semiBold"
            color={isPositive ? theme.colors.palette.success : theme.colors.text.primary}
          >
            {isPositive ? '+' : ''}{amount}
          </CustomText>
          {date ? (
            <CustomText variant="caption" color={theme.colors.text.tertiary}>
              {date}
            </CustomText>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card.background,
    borderRadius: 12,
    padding: theme.spacing.spacing.sm,
    marginBottom: theme.spacing.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    shadowColor: theme.colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.spacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
});

// Use React.memo to prevent unnecessary re-renders
export default memo(TransactionCard); 