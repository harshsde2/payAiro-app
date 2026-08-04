import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import LimitBar from '@new-ui/components/common-components/LimitBar';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { transactionLimitMeterStyles } from '@new-ui/styles/components/transactionLimitMeterStyles';
import { formatUsd } from '@new-ui/screens/TransactionLimits/transactionLimits.utils';
import type { ITransactionLimitMeterProps } from './types';

/**
 * Daily-limit meter for the amount-entry screens (Add Balance, Withdraw, EnterAmount).
 * Identical on all three — callers pass `style` for placement only, so the meter
 * itself never carries screen-specific layout.
 */
const TransactionLimitMeter: React.FC<ITransactionLimitMeterProps> = ({
  limit,
  amountUsd,
  error,
  onUseMax,
  style,
}) => {
  const { theme } = useTheme();
  const styles = transactionLimitMeterStyles(theme);

  // Never show numbers we can't stand behind — a limits outage renders nothing
  // (and the matching validate() returns null, so nothing is blocked either).
  if (!limit.available) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <CustomText variant="bodySmall" color={theme.colors.greyDark}>
          Daily limit
        </CustomText>
        <CustomText
          variant="bodySmall"
          fontWeight="semiBold"
          color={error ? theme.colors.error : theme.colors.text}
        >
          {formatUsd(limit.dailyRemainingUsd)} left
        </CustomText>
      </View>

      <LimitBar
        usedUsd={limit.dailyUsedUsd}
        pendingUsd={amountUsd}
        limitUsd={limit.dailyLimitUsd}
        over={!!error}
      />

      <CustomText variant="caption" color={theme.colors.greyDark}>
        {formatUsd(limit.dailyUsedUsd)} of {formatUsd(limit.dailyLimitUsd)} used today
      </CustomText>

      {error ? (
        <View style={styles.errorRow}>
          <CustomText
            variant="caption"
            color={theme.colors.error}
            style={styles.errorText}
          >
            {error}
          </CustomText>
          {onUseMax && limit.effectiveMaxUsd > 0 ? (
            <TouchableOpacity
              style={styles.useMaxButton}
              onPress={onUseMax}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <CustomText
                variant="caption"
                fontWeight="semiBold"
                color={theme.colors.primary}
              >
                Use max
              </CustomText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default TransactionLimitMeter;
