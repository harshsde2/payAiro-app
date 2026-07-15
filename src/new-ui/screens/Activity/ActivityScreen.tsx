import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  parseServerDate,
  getDayGroupKey,
  getDayGroupLabel,
} from "utils/dateUtils";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { activityScreenStyles } from "@new-ui/styles/screens/activity/activityScreenStyles";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import FilterChip from "@new-ui/components/common-components/FilterChip";
import CryptoRequestBanner from "@new-ui/components/common-components/CryptoRequestBanner";
import RecentActivityCard, {
  isTradeActivity,
  type RecentActivityItem,
} from "@new-ui/components/common-components/RecentActivityCard";
import { AppIcon } from "@new-ui/assets/svgs";
import {
  usePaymentTransactionHistory,
  useUserCryptoMarketList,
  type PaymentTransactionHistoryFilters,
} from "query/hooks/useCrypto";
import { navigateFromRecentActivity } from "query/utils/navigateFromRecentActivity";
import { cryptoRequestKeys } from "query/hooks/useCryptoRequest";
import ActivityFilterModal from "./ActivityFilterModal";

const FILTER_CHIPS = ["All", "Send", "Trade", "Request", "Receive"] as const;

// Quick-filter shortcut → same API params the Filter modal uses. Tapping a chip
// REPLACES the active filters (single quick-filter at a time), same as picking
// one option in the modal and applying it.
//
// These are ACTIVITY shortcuts only. Status-based chips (e.g. "Pending"/"Completed")
// can't work here: the API scopes each status filter to one activity bucket, trades
// have no status filter at all, and the vocab differs per bucket (SUCCESS vs COMPLETED
// vs FULFILLED) — so a cross-type status chip would silently let rows leak through.
// Status filtering lives in the Filter modal, where it's activity-aware.
const CHIP_FILTERS: Record<(typeof FILTER_CHIPS)[number], PaymentTransactionHistoryFilters> = {
  All: {},
  Send: { activity: "send" },
  Trade: { activity: "trade" },
  Request: { activity: "request" },
  Receive: { activity: "receive" },
};

function groupActivityItemsByDay(items: RecentActivityItem[]) {
  const sorted = [...items].sort(
    (a, b) =>
      parseServerDate(b.createdAt).valueOf() -
      parseServerDate(a.createdAt).valueOf()
  );
  const map = new Map<
    string,
    { sectionKey: string; label: string; items: RecentActivityItem[] }
  >();
  for (const it of sorted) {
    const sectionKey = getDayGroupKey(it.createdAt);
    const label = getDayGroupLabel(it.createdAt);
    if (!map.has(sectionKey)) map.set(sectionKey, { sectionKey, label, items: [] });
    map.get(sectionKey)!.items.push(it);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([, v]) => v);
}

function usdPriceForRow(
  item: RecentActivityItem,
  priceByCurrency: Map<string, number>
): number | undefined {
  if (isTradeActivity(item)) {
    const isSell =
      item.activity === "TRADE_SELL" || item.tradeType === "sell";
    if (isSell) {
      const k = (item.cryptoCurrencyCode ?? "").toUpperCase();
      return k ? priceByCurrency.get(k) : undefined;
    }
    const spendCode = (item.amountCurrencyCode ?? "").toUpperCase();
    const fiat = (item.fiatCurrencyCode ?? "USD").toUpperCase();
    if (spendCode && spendCode !== fiat && spendCode !== "USD") {
      return priceByCurrency.get(spendCode);
    }
    return undefined;
  }
  // For send/receive rows, keep the API amount as-is (no USD conversion).
  return undefined;
}

const ActivityScreen = () => {
  const { theme } = useTheme();
  const styles = activityScreenStyles(theme);
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PaymentTransactionHistoryFilters>({});
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "all"
  );

  // Derive the chip highlight from the applied filters (rather than separate state) so
  // the row stays in sync when the Filter modal changes the activity.
  const selectedChip =
    FILTER_CHIPS.find((chip) => {
      const chipActivity = CHIP_FILTERS[chip].activity;
      const current = filters.activity === "all" ? undefined : filters.activity;
      return chipActivity === current;
    }) ?? "All";

  // Refresh the pending-request banner/badge whenever Activity gains focus —
  // the bottom-tab badge observer never remounts, so a focus-driven
  // invalidation keeps both fresh when navigating here.
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: cryptoRequestKeys.all });
    }, [queryClient])
  );

  const {
    data: historyResponse,
    isLoading,
    isRefetching: isHistoryRefetching,
    refetch: refetchHistory,
  } = usePaymentTransactionHistory(filters);
  const {
    data: marketRows = [],
    isRefetching: isMarketRefetching,
    refetch: refetchMarket,
  } = useUserCryptoMarketList("USD");

  const handleRefresh = useCallback(() => {
    return Promise.allSettled([refetchHistory(), refetchMarket()]);
  }, [refetchHistory, refetchMarket]);

  const priceByCurrency = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of marketRows) {
      const key = (row.asset ?? "").toUpperCase();
      const price = row.usd_price;
      if (key && typeof price === "number" && Number.isFinite(price)) {
        map.set(key, price);
      }
    }
    return map;
  }, [marketRows]);

  const items = historyResponse?.data?.items ?? [];
  const grouped = useMemo(() => groupActivityItemsByDay(items), [items]);

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      scrollable
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={isHistoryRefetching || isMarketRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.tertiary}
          />
        ),
      }}
      contentStyle={styles.scrollContent}
      backgroundColor={theme.colors.background}
    >
      <CryptoRequestBanner />

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <AppIcon.FilterIcon
            width={16}
            height={16}
            color={hasActiveFilters ? theme.colors.white : undefined}
          />
          <CustomText
            style={[
              styles.filterButtonLabel,
              hasActiveFilters && { color: theme.colors.white },
            ]}
          >
            Filter
          </CustomText>
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {FILTER_CHIPS.map((label) => (
            <FilterChip
              key={label}
              label={label}
              selected={selectedChip === label}
              onPress={() => setFilters(CHIP_FILTERS[label])}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.tertiary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyBox}>
          <CustomText style={styles.emptyText}>
            No activity yet. Transactions will appear here.
          </CustomText>
        </View>
      ) : (
        grouped.map((section) => (
          <View key={section.sectionKey} style={styles.sectionBlock}>
            <CustomText style={styles.sectionTitle}>{section.label}</CustomText>
            <View style={styles.sectionList}>
              {section.items.map((item) => (
                <RecentActivityCard
                  key={`${item.id}-${item.createdAt}`}
                  item={item}
                  usdPrice={usdPriceForRow(item, priceByCurrency)}
                  onPress={(selected) => {
                    navigateFromRecentActivity(selected, navigation);
                  }}
                />
              ))}
            </View>
          </View>
        ))
      )}

      <ActivityFilterModal
        visible={filterModalVisible}
        initialFilters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApply={(next) => {
          setFilters(next);
          setFilterModalVisible(false);
        }}
      />
    </ScreenWrapper>
  );
};

export default ActivityScreen;
