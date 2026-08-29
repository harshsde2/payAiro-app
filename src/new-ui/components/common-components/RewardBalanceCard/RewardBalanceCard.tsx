import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { rewardBalanceCardStyles } from '@new-ui/styles/components/rewardBalanceCardStyles';
import GlassyWrapper from '@new-ui/components/common-components/GlassyWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { IRewardBalanceCardProps } from './types';

const formatBalance = (amount: number): string =>
  Number(amount ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const splitBalance = (formatted: string) => {
  if (formatted.startsWith('•')) return { integer: '••••••', decimal: '' };
  const [integer, decimal] = formatted.split('.');
  return { integer: integer ?? formatted, decimal: decimal ?? '00' };
};

const RewardBalanceCard: React.FC<IRewardBalanceCardProps> = ({
  title,
  balance,
  subtitle,
  subtitleColor,
  onSubtitlePress,
  onChevronPress,
  showChevron = false,
  style,
}) => {
  const { theme } = useTheme();
  const styles = rewardBalanceCardStyles(theme);
  const [visible, setVisible] = useState(false);

  const display = visible ? formatBalance(balance) : '••••••';
  const { integer, decimal } = splitBalance(display);

  const toggleVisibility = useCallback(() => setVisible(v => !v), []);

  return (
    <GlassyWrapper
      style={[styles.glassyWrapper, style]}
      borderRadius={theme.radius.xl}
      blurAmount={25}
      overlayOpacity={0.12}
      borderWidth={1}
    >
      <View style={styles.headerRow}>
        <CustomText variant="body" fontFamily="inter" fontWeight="regular" style={styles.titleText}>
          {title}
        </CustomText>
        <TouchableOpacity onPress={toggleVisibility} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {visible ? (
            <AppIcon.EyeOn width={18} height={18} color={theme.colors.greyDark} />
          ) : (
            <AppIcon.EyeOff width={18} height={18} color={theme.colors.greyDark} />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.balanceRow}
        onPress={showChevron ? onChevronPress : undefined}
        activeOpacity={showChevron ? 0.7 : 1}
        disabled={!showChevron}
      >
        <CustomText variant="h1" size={40} fontFamily="poppins" fontWeight="bold" style={{ color: theme.colors.text }}>
          $
        </CustomText>
        <View style={styles.balanceAmountParts}>
          <CustomText
            variant="h1"
            size={40}
            fontFamily="poppins"
            fontWeight="bold"
            style={{ color: theme.colors.text }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {integer}
          </CustomText>
          {decimal ? (
            <CustomText
              variant="h1"
              size={30}
              fontFamily="poppins"
              fontWeight="bold"
              style={{ color: theme.colors.greyDark }}
              numberOfLines={1}
            >
              .{decimal}
            </CustomText>
          ) : null}
        </View>
        {showChevron && (
          <View style={styles.chevronWrapper}>
            <AppIcon.ChevronDown width={16} height={16} color={theme.colors.text} />
          </View>
        )}
      </TouchableOpacity>

      {subtitle && (
        <TouchableOpacity
          style={styles.subtitleLink}
          onPress={onSubtitlePress}
          disabled={!onSubtitlePress}
          activeOpacity={onSubtitlePress ? 0.7 : 1}
        >
          <CustomText
            variant="caption"
            fontFamily="inter"
            fontWeight="medium"
            color={subtitleColor ?? theme.colors.primary}
            style={{ textDecorationLine: onSubtitlePress ? 'underline' : 'none' }}
          >
            {subtitle}
          </CustomText>
        </TouchableOpacity>
      )}
    </GlassyWrapper>
  );
};

export default RewardBalanceCard;
