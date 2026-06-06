import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import FilterChip from '@new-ui/components/common-components/FilterChip';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { transactionLimitsStyles } from '@new-ui/styles/screens/transactionLimits/transactionLimitsStyles';
import { useCoinmeTransactionLimits } from 'query/hooks/useCoinmeTransactionLimits';
import type { TransactionLimitRow, TransactionLimitTab } from './types';
import {
  formatLimitLine,
  getActiveRowsForTab,
  mapLimitsForTab,
} from './transactionLimits.utils';

const LimitRow: React.FC<{
  row: TransactionLimitRow;
  isLast: boolean;
  styles: ReturnType<typeof transactionLimitsStyles>;
  monthlyColor: string;
}> = ({ row, isLast, styles, monthlyColor }) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <CustomText variant="h5" fontWeight="semiBold" style={styles.rowLabel}>
      {row.label}
    </CustomText>
    <View style={styles.amountsColumn}>
      <CustomText variant="body" fontWeight="semiBold">
        {formatLimitLine(row.dailyLimitUsd, 'day')}
      </CustomText>
      <CustomText
        variant="bodySmall"
        color={monthlyColor}
        style={styles.monthlyAmount}
      >
        {formatLimitLine(row.monthlyLimitUsd, 'month')}
      </CustomText>
    </View>
  </View>
);

const TransactionLimitsScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = transactionLimitsStyles(theme);
  const [activeTab, setActiveTab] = useState<TransactionLimitTab>('buy');

  const { data, isPending, isError, refetch } = useCoinmeTransactionLimits();

  const limitsData = data?.data;
  const enabled = limitsData?.enabled !== false;

  const tabRows = useMemo(
    () => mapLimitsForTab(limitsData, activeTab),
    [limitsData, activeTab]
  );

  const activeRows = useMemo(() => getActiveRowsForTab(tabRows), [tabRows]);

  const renderBody = () => {
    if (isError) {
      return (
        <View style={styles.centerMessage}>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.errorText}
          >
            Unable to load transaction limits. Please try again.
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void refetch()}
            activeOpacity={0.7}
          >
            <CustomText variant="body" fontWeight="semiBold" color={theme.colors.white}>
              Retry
            </CustomText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!enabled) {
      return (
        <View style={styles.centerMessage}>
          <CustomText variant="body" color={theme.colors.textSecondary}>
            Transaction limits are not available for your account right now.
          </CustomText>
        </View>
      );
    }

    if (activeRows.length === 0) {
      return (
        <View style={styles.centerMessage}>
          <CustomText variant="body" color={theme.colors.textSecondary}>
            No {activeTab === 'buy' ? 'buy' : 'sell'} limits are available.
          </CustomText>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        {activeRows.map((row, index) => (
          <LimitRow
            key={row.key}
            row={row}
            isLast={index === activeRows.length - 1}
            styles={styles}
            monthlyColor={theme.colors.textSecondary}
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      loading={isPending}
      contentStyle={{ flexGrow: 1, paddingBottom: theme.spacing['2xl'] }}
    >
      <View style={styles.content}>
        <View style={styles.tabRow}>
          <View style={styles.tabChip}>
            <FilterChip
              label="Buy"
              selected={activeTab === 'buy'}
              onPress={() => setActiveTab('buy')}
            />
          </View>
          <View style={styles.tabChip}>
            <FilterChip
              label="Sell"
              selected={activeTab === 'sell'}
              onPress={() => setActiveTab('sell')}
            />
          </View>
        </View>

        {renderBody()}
      </View>
    </ScreenWrapper>
  );
};

export default TransactionLimitsScreen;
