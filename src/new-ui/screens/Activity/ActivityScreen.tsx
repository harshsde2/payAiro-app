import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { activityScreenStyles } from "@new-ui/styles/screens/activity/activityScreenStyles";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import FilterChip from "@new-ui/components/common-components/FilterChip";
import RecentActivityCard, {
  isTradeActivity,
  type RecentActivityItem,
} from "@new-ui/components/common-components/RecentActivityCard";
import { AppIcon } from "@new-ui/assets/svgs";
import {
  usePaymentTransactionHistory,
  useUserCryptoMarketList,
} from "query/hooks/useCrypto";
import { navigateFromRecentActivity } from "query/utils/navigateFromRecentActivity";

const FILTER_CHIPS = ["All", "Send", "Received", "Pending", "Completed"] as const;

function groupActivityItemsByDay(items: RecentActivityItem[]) {
  const sorted = [...items].sort(
    (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
  );
  const map = new Map<
    string,
    { sectionKey: string; label: string; items: RecentActivityItem[] }
  >();
  for (const it of sorted) {
    const m = moment(it.createdAt);
    const sectionKey = m.format("YYYY-MM-DD");
    let label: string;
    if (m.isSame(moment(), "day")) label = "Today";
    else if (m.isSame(moment().subtract(1, "day"), "day")) label = "Yesterday";
    else label = m.format("DD MMM YY");
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
  const [selectedChip, setSelectedChip] =
    useState<(typeof FILTER_CHIPS)[number]>("All");

  const { data: historyResponse, isLoading } = usePaymentTransactionHistory(
    "all",
    20
  );
  const { data: marketRows = [] } = useUserCryptoMarketList("USD");

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
      contentStyle={styles.scrollContent}
      backgroundColor={theme.colors.background}
    >
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <AppIcon.FilterIcon width={16} height={16} />
          <CustomText style={styles.filterButtonLabel}>Filter</CustomText>
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
              onPress={() => setSelectedChip(label)}
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
    </ScreenWrapper>
  );
};

export default ActivityScreen;
