import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from '../tsx-components/CustomText';
import { CryptoTransactionCardProps } from './types';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import useSelectorAction from 'hooks/useSelectorAction';

const CryptoTransactionCard: React.FC<CryptoTransactionCardProps> = ({
  item,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { walletData, isCrypto: isCryptoView } = useSelectorAction();


  const navigation = useNavigation<any>();

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get transaction type display text
  const getTransactionTypeText = () => {
    switch (item?.type) {
      case 'buy':
        return `${item.to_currency}`;
      case 'sell':
        return `${item.from_currency}`;
      case 'send':
        return `Send ${item.from_currency}`;
      case 'receive':
        return `Receive ${item.to_currency}`;
      case 'withdrawal':
        return `${item.from_currency}`;
      default:
        return item.type;
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (item?.status?.toLowerCase()) {
      case 'complete':
        return theme.colors.palette.green700
      case 'success':
        return theme.colors.palette.success;
      case 'pending':
        return theme.colors.palette.warning;
      case 'failed':
      case 'error':
        return theme.colors.palette.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  // Get amount colors based on transaction type
  const getAmountColors = () => {
    if (item.type === 'buy') {
      return {
        usdColor: theme.colors.palette.error, // Red for deduction
        cryptoColor: theme.colors.palette.success, // Green for increase
      };
    } else if (item.type === 'sell') {
      return {
        usdColor: theme.colors.palette.success, // Green for increase
        cryptoColor: theme.colors.palette.error, // Red for decrease
      };
    }
    return {
      usdColor: theme.colors.text.primary,
      cryptoColor: theme.colors.text.primary,
    };
  };

  const amountColors = getAmountColors();

  // Render crypto icon
  const renderCryptoIcon = () => {
    const iconUri = item.icon;
    const isValidIcon = typeof iconUri === "string" && iconUri.trim().length > 0;
    const isSvgIcon = isValidIcon && (
      iconUri.toLowerCase().endsWith(".svg") || 
      iconUri.toLowerCase().includes("svg+xml")
    );

    if (!isValidIcon) {
      return (
        <View style={styles.defaultIconContainer}>
          <CustomText variant="caption" fontWeight="bold" color={theme.colors.text.tertiary}>
            {item?.from_currency?.substring(0, 2)?.toUpperCase()}
          </CustomText>
        </View>
      );
    }

    return (
      <View style={styles.iconContainer}>
        {isSvgIcon ? (
          <SvgUri uri={iconUri} width={32} height={32} />
        ) : (
          <Image 
            source={{ uri: iconUri }} 
            style={styles.iconImage} 
            resizeMode="contain" 
          />
        )}
      </View>
    );
  };

  const handlePress = () => {
    // Navigate to the new TransactionDetails modal for both fiat and crypto transactions
    console.log("item =>",JSON.stringify(item,null,2))
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_DETAILS_MODAL, {
      transactionData: item,
      isCrypto: isCryptoView,
    });
  };

  // Format amount with proper decimal places
  const formatAmount = (amount: string, isUSD: boolean = false) => {
    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) return '0.00';
      
      if (isUSD) {
        return numAmount.toFixed(2);
      } else {
        // For crypto amounts, show more precision
        if (numAmount < 0.01) {
          return numAmount.toFixed(8);
        } else if (numAmount < 1) {
          return numAmount.toFixed(6);
        } else {
          return numAmount.toFixed(4);
        }
      }
    } catch (error) {
      return '0.00';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Crypto Icon */}
        {renderCryptoIcon()}

        {/* Transaction Details */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <CustomText variant="subtitle2" numberOfLines={1} fontWeight="semiBold" style={styles.title}>
              {getTransactionTypeText()}
            </CustomText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
              <CustomText 
                variant="caption" 
                fontWeight="medium"
                color={getStatusColor()}
                style={styles.statusText}
              >
                {item?.status?.toUpperCase()}
              </CustomText>
            </View>
          </View>

          <CustomText variant="caption" color={theme.colors.text.tertiary} style={styles.subtitle}>
            Trade ID: {item.trade_id?.substring(0, 8)}...
          </CustomText>

          <CustomText variant="caption" color={theme.colors.text.tertiary} style={styles.date}>
            {formatDate(item.created_at)}
          </CustomText>
        </View>

        {/* Amount Details */}
        <View style={styles.amountContainer}>
          {/* USD Amount */}
          <View style={styles.amountRow}>
            <CustomText 
              variant="caption" 
              color={theme.colors.text.tertiary}
              style={styles.amountLabel}
            >
              USD
            </CustomText>
            <CustomText 
              variant="subtitle2" 
              fontWeight="semiBold"
              color={amountColors.usdColor}
              style={styles.amountValue}
            >
              {item.type === 'buy' ? '-' : '+'}${formatAmount(item.usd_amount, true)}
            </CustomText>
          </View>

          {/* Crypto Amount */}
          <View style={styles.amountRow}>
            <CustomText 
              variant="caption" 
              color={theme.colors.text.tertiary}
              style={styles.amountLabel}
            >
              {item.type === 'buy' ? item.to_currency : item.from_currency}
            </CustomText>
            <CustomText 
              variant="subtitle2" 
              fontWeight="semiBold"
              color={amountColors.cryptoColor}
              style={styles.amountValue}
            >
            {formatAmount(item.final_amount)}
            </CustomText>
          </View>

          {/* Transaction Fee */}
          {item.Transaction_fee_persentage && item.Transaction_fee_persentage !== "0" && (
            <CustomText variant="caption" color={theme.colors.text.tertiary} style={styles.feeText}>
              Fee: {item.Transaction_fee_persentage}%
            </CustomText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card.background,
    borderRadius: 12,
    padding: theme.spacing.spacing.md,
    marginBottom: theme.spacing.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    shadowColor: theme.colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.spacing.md,
    overflow: 'hidden',
  },
  defaultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.spacing.md,
  },
  iconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginRight: theme.spacing.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: theme.spacing.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginBottom: 2,
  },
  date: {
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  amountLabel: {
    marginRight: 4,
    minWidth: 30,
  },
  amountValue: {
    textAlign: 'right',
    minWidth: 60,
  },
  feeText: {
    marginTop: 4,
    fontSize: 10,
  },
});

export default memo(CryptoTransactionCard);
