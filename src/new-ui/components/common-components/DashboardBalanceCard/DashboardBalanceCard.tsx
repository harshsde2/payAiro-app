import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import dashboardBalanceCardStyles from '@new-ui/styles/components/dashbaordBalanceCardStyles';
import { IDashboardBalanceCardProps } from './types';
import GlassyWrapper from '../GlassyWrapper';
import { AppIcon } from 'new-ui/assets/svgs';
import DashboardActionButtons from './DashboardActionButtons';
import { formatSpendableBalance } from 'utils/formatMoney';

const formatBalance = (amount: number): string => formatSpendableBalance(amount);

/** Split balance for display: integer part (bold, large) + decimal part (smaller, gray) */
const splitBalanceForDisplay = (formatted: string): { integer: string; decimal: string } => {
  if (formatted.startsWith('•')) {
    return { integer: '••••••', decimal: '' };
  }
  if (formatted.includes('.')) {
    const [integer, decimal] = formatted.split('.');
    return { integer: integer ?? formatted, decimal: decimal ?? '00' };
  }
  return { integer: formatted, decimal: '00' };
};

const DashboardBalanceCard: React.FC<IDashboardBalanceCardProps> = ({
  style,
  title,
  subtitle,
  balance,
  onRefreshBalance,
  isRefreshing = false,
  showActionButtons = true,
}) => {
  const { theme } = useTheme();
  const styles = dashboardBalanceCardStyles(theme);
  const [visible, setVisible] = useState(false);

  const displayBalance = visible ? formatBalance(balance) : '••••••';
  const { integer: integerPart, decimal: decimalPart } = splitBalanceForDisplay(displayBalance);

  const handleToggleVisibility = useCallback(async () => {
    if (!visible && onRefreshBalance) {
      try {
        await onRefreshBalance();
      } catch (e) {
        console.log('Error refreshing balance:', e);
      }
    }
    setVisible((v) => !v);
  }, [visible, onRefreshBalance]);

  return (
    <View style={[styles.container, !showActionButtons && styles.containerNoActions, style]}>
      <GlassyWrapper
        style={styles.glassyWrapper}
        borderRadius={theme.radius.xl}
        blurAmount={25}
        overlayOpacity={0.12}
        borderWidth={1}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <CustomText style={[styles.headerTitle, { color: theme.colors.text }]}>
                {title}
              </CustomText>
              <TouchableOpacity
                onPress={handleToggleVisibility}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.eyeIconButton}
              >
                {visible ? (
                  <AppIcon.EyeOn width={18} height={18} color={theme.colors.greyDark} />
                ) : (
                  <AppIcon.EyeOff width={18} height={18} color={theme.colors.greyDark} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          

          <View style={styles.balanceRow}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <CustomText variant='h1' size={40} fontWeight="bold" style={[styles.currencySymbol, { color: theme.colors.text }]}>$</CustomText>
                <View style={styles.balanceAmountContainer}>
                  <CustomText
                    variant='h1'
                    fontWeight="bold"
                    size={40}
                    style={[styles.balanceInteger, { color: theme.colors.text }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {integerPart}
                  </CustomText>
                  {decimalPart ? (
                    <CustomText
                      variant="h1"
                      size={30}
                      fontWeight="bold"
                      style={[styles.balanceDecimal, { color: theme.colors.greyDark }]}
                      numberOfLines={1}
                    >
                      .{decimalPart}
                    </CustomText>
                  ) : null}
                </View>
              </>
            )}
          </View>
          {subtitle ? (
            <CustomText style={[styles.subtitleText, { color: theme.colors.greyDark }]}>
              {subtitle}
            </CustomText>
          ) : null}
        </View>

        {showActionButtons ? (
          <View style={styles.footerContainer}>
            <DashboardActionButtons />
          </View>
        ) : null}
      </GlassyWrapper>
    </View>
  );
};

export default DashboardBalanceCard;
