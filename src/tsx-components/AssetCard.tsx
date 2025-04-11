import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

interface AssetCardProps {
  symbol: string;
  name: string;
  amount: number;
  icon: string;
  price?: number;
  change?: number;
  color?: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  symbol,
  name,
  amount,
  icon,
  price = 0,
  change = 0,
  color
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const formattedAmount = amount.toFixed(5);
  const formattedPrice = (amount * price).toFixed(2);
  const formattedChange = change.toFixed(2);
  const isPositive = change >= 0;

  return (
    <View style={[styles.container, color ? { backgroundColor: color } : null]}>
      <View style={styles.iconContainer}>
        <SvgXml xml={icon} width={24} height={24} />
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.nameContainer}>
          <CustomText variant="subtitle2" fontWeight="semiBold" color={theme.colors.palette.white}>
            {symbol}
          </CustomText>
          <CustomText variant="caption" color={theme.colors.palette.grey400}>
            {name}
          </CustomText>
        </View>
        
        <View style={styles.priceContainer}>
          <CustomText variant="subtitle2" fontWeight="semiBold" color={theme.colors.palette.white}>
            {formattedAmount}
          </CustomText>
          <CustomText variant="caption" color={theme.colors.palette.grey400}>
            ${formattedPrice}
          </CustomText>
        </View>
        
        {change !== undefined && (
          <View style={styles.changeContainer}>
            <CustomText 
              variant="caption" 
              color={isPositive ? theme.colors.palette.success : theme.colors.palette.error}
            >
              {isPositive ? '+' : ''}{formattedChange}%
            </CustomText>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: theme.spacing.spacing.sm,
    marginBottom: theme.spacing.spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.spacing.sm,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 2,
  },
  priceContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  changeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  }
});

export default memo(AssetCard); 