import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import dashboardBalanceCardStyles from '@new-ui/styles/components/dashbaordBalanceCardStyles';
import { IDashboardBalanceCardProps } from './types';
import GlassyWrapper from '../GlassyWrapper';
import { AppIcon } from 'new-ui/assets/svgs';
import BalanceBreakdownModal from './BalanceBreakdownModal';
import DashboardActionButtons from './DashboardActionButtons';

const formatBalance = (amount: number): string =>
  Number(amount ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
  userId,
  bankBalance,
  aggregatedCryptoBalances,
  onToggleVisibility,
  onQRCodePress,
  onAccountDetailsPress,
  isBalanceVisible = false,
  onRefreshBalance,
  isRefreshing = false,
}) => {
  const { theme } = useTheme();
  const styles = dashboardBalanceCardStyles(theme);
  const [localBalanceVisible, setLocalBalanceVisible] = useState(isBalanceVisible);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isBalanceVisible !== undefined && isBalanceVisible !== localBalanceVisible) {
      setLocalBalanceVisible(isBalanceVisible);
    }
  }, [isBalanceVisible]);

  const payAiroBalance = useMemo(
    () =>
      Number(
        bankBalance?.platform_balance ??
          bankBalance?.platform_available ??
          bankBalance?.bank_account?.usd ??
          0
      ),
    [bankBalance]
  );

  const cryptoBalance = useMemo(
    () => Number(aggregatedCryptoBalances?.usd_value_available ?? 0),
    [aggregatedCryptoBalances]
  );

  const totalBalance = useMemo(
    () => payAiroBalance + cryptoBalance,
    [payAiroBalance, cryptoBalance]
  );

  const displayBalance = localBalanceVisible ? formatBalance(totalBalance) : '••••••';
  const { integer: integerPart, decimal: decimalPart } = splitBalanceForDisplay(displayBalance);

  const handleToggleVisibility = useCallback(async () => {
    if (!localBalanceVisible && onRefreshBalance) {
      try {
        await onRefreshBalance();
      } catch (e) {
        console.log('Error refreshing balance:', e);
      }
    }
    const next = !localBalanceVisible;
    setLocalBalanceVisible(next);
    onToggleVisibility?.();
  }, [localBalanceVisible, onRefreshBalance, onToggleVisibility]);

  const handleAccountDetailsPress = useCallback(() => {
    if (onAccountDetailsPress) {
      onAccountDetailsPress();
    } else if (onQRCodePress) {
      onQRCodePress();
    }
  }, [onAccountDetailsPress, onQRCodePress]);

  return (
    <View style={styles.container}>
      <GlassyWrapper
        style={styles.glassyWrapper}
        borderRadius={theme.radius.xl}
        blurAmount={25}
        blurType="light"
        overlayOpacity={0.12}
        borderWidth={1}
        borderColor={theme.colors.white}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <CustomText style={[styles.headerTitle, { color: theme.colors.greyDark }]}>
                PayAiro Balance
              </CustomText>
              <TouchableOpacity
                onPress={handleToggleVisibility}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.eyeIconButton}
              >
                {localBalanceVisible ? (
                  <AppIcon.EyeOn width={18} height={18} color={theme.colors.greyDark} />
                ) : (
                  <AppIcon.EyeOff width={18} height={18} color={theme.colors.greyDark} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.balanceRow}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.7}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <CustomText variant='h1' size={40} fontWeight="bold" style={[styles.currencySymbol, { color: theme.colors.black }]}>$</CustomText>
                <View style={styles.balanceAmountContainer}>
                  <CustomText
                    variant='h1'
                    fontWeight="bold"
                    size={40}
                    style={[styles.balanceInteger, { color: theme.colors.black }]}
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
                <View style={styles.chevronWrapper}>
                  <AppIcon.ChevronDown width={16} height={16} color={theme.colors.black} />
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountDetailsLink}
            onPress={handleAccountDetailsPress}
            activeOpacity={0.7}
          >
            <CustomText style={[styles.accountDetailsText, { color: theme.colors.primary }]}>
              Account Details
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <DashboardActionButtons />
        </View>
      </GlassyWrapper>

      <BalanceBreakdownModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalBalance={totalBalance}
        payAiroBalance={payAiroBalance}
        cryptoBalance={cryptoBalance}
        userId={userId}
        isBalanceVisible={localBalanceVisible}
        onToggleVisibility={handleToggleVisibility}
        isRefreshing={isRefreshing}
      />
    </View>
  );
};

export default DashboardBalanceCard;
