import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import { useTheme, Theme } from "styles";
import { useUnifiedTransactions, useFormattedTradesHistory } from "query/hooks";
import useDispatchAction from "hooks/useDispatchAction";
import { setActiveTab } from "redux/slices/authenticationSlice";
import HeaderTitle from "components/HeaderTitle";
import BottomNavigation from "components/BottomNavigation";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import DashboardSection from "tsx-components/DashboardSection";
import CustomText from "tsx-components/CustomText";
import CustomPieChart from "components/CustomPieChart";
import CommonModal from "tsx-components/modals/CommonModal";
import TransactionFilter from "tsx-components/modals/TransactionFilter";
import UnifiedTransactionCard from "./UnifiedTransactionCard";
import {
  IUnifiedTransaction,
  IUnifiedTransactionScreenProps,
  ICategoryPercentages,
} from "./types";

// Filter keys
const TRANSACTION_FILTERS_KEYS = {
  categories: "categories",
  time_range: "time_range",
  filter_type: "filter_type",
  start_date: "start_date",
  end_date: "end_date",
};

interface TimeRangeOption {
  id: number;
  title: string;
  isSelected: boolean;
  value: "today" | "week" | "1month" | "6month" | "1year" | "custom_range";
}

interface CategoryOption {
  id: number;
  title: string;
  isSelected: boolean;
  key:
    | "family_friends"
    | "self_transfer"
    | "merchant"
    | "miscellaneous"
    | "receive"
    | "debit";
}

interface DateRangeOption {
  id: number;
  title: string;
  isSelected: boolean;
  key: "start_date" | "end_date";
  value: string;
}

interface FilteredTransactions {
  timeRange: TimeRangeOption[];
  categories: CategoryOption[];
  filter_type: CategoryOption[];
  start_date: DateRangeOption;
  end_date: DateRangeOption;
}

const UnifiedTransactionScreen: React.FC<IUnifiedTransactionScreenProps> = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const isFocused = useIsFocused();

  // Get isCrypto from Redux
  const { isCrypto } = useSelector((state: any) => state.authenticationSlice);

  // State
  const [filterQueryString, setFilterQueryString] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isCustomRangeSelected, setIsCustomRangeSelected] = useState(false);
  const [date, setDate] = useState("");
  const [date2, setDate2] = useState("");

  // API hooks - conditionally use based on isCrypto
  const {
    data: transactionsResponse,
    isLoading: isLoadingFiat,
    isFetching: isFetchingFiat,
    refetch: refetchFiat,
  } = useUnifiedTransactions(filterQueryString);

  const {
    data: formattedTradesResponse,
    isLoading: isLoadingCrypto,
    isFetching: isFetchingCrypto,
    refetch: refetchCrypto,
  } = useFormattedTradesHistory();

  // Determine which data to use
  const isLoading = isCrypto ? isLoadingFiat : isLoadingCrypto;
  const isFetching = isCrypto ? isFetchingFiat : isFetchingCrypto;
  const refetch = isCrypto ? refetchFiat : refetchCrypto;

  // Set active tab when focused
  useEffect(() => {
    if (isFocused) {
      useDispatchAction(setActiveTab("2"));
    }
  }, [isFocused]);

  // Filter state
  const [filteredTransactions, setFilteredTransactions] =
    useState<FilteredTransactions>({
      timeRange: [
        { id: 0, title: "Today", isSelected: false, value: "today" },
        { id: 1, title: "This Week", isSelected: false, value: "week" },
        { id: 2, title: "This Month", isSelected: false, value: "1month" },
        { id: 3, title: "Last 6 Month", isSelected: false, value: "6month" },
        { id: 4, title: "This Year", isSelected: false, value: "1year" },
      ],
      categories: [
        {
          id: 0,
          title: "Family & Friends",
          isSelected: false,
          key: "family_friends",
        },
        {
          id: 1,
          title: "Self Transfer",
          isSelected: false,
          key: "self_transfer",
        },
        { id: 2, title: "Merchant", isSelected: false, key: "merchant" },
        {
          id: 3,
          title: "Miscellaneous",
          isSelected: false,
          key: "miscellaneous",
        },
      ],
      filter_type: [
        { id: 1, title: "Receive", isSelected: false, key: "receive" },
        { id: 2, title: "Debit", isSelected: false, key: "debit" },
      ],
      start_date: {
        id: 0,
        title: "Start Date",
        isSelected: false,
        key: "start_date",
        value: "",
      },
      end_date: {
        id: 1,
        title: "End Date",
        isSelected: false,
        key: "end_date",
        value: "",
      },
    });

  // Search filter
  const normalizedSearch = useMemo(
    () => searchText.trim().toLowerCase(),
    [searchText]
  );

  // Filtered transactions based on search - handle both fiat and crypto
  const displayedTransactions = useMemo(() => {
    if (isCrypto) {
      // Fiat transactions from unified API
      const transactions = transactionsResponse?.data?.transactions ?? [];
      if (!normalizedSearch) return transactions;

      return transactions.filter((item: IUnifiedTransaction) => {
        const searchFields = [
          item.display_party?.username,
          item.display_party?.identifier,
          item.sender?.username,
          item.sender?.email,
          item.recipient?.username,
          item.recipient?.email,
          item.merchant_details?.project_name,
          item.category,
          item.note,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());

        return searchFields.some((v) => v.includes(normalizedSearch));
      });
    } else {
      // Crypto transactions from formatted-trades-history API
      // Response is already an array of IUnifiedTransaction
      const transactions = formattedTradesResponse?.data ?? [];
      if (!normalizedSearch) return transactions;

      return transactions.filter((item: IUnifiedTransaction) => {
        const searchFields = [
          item.display_party?.username,
          item.display_party?.identifier,
          item.crypto_details?.token,
          item.crypto_details?.from_currency,
          item.crypto_details?.to_currency,
          item.sender?.username,
          item.sender?.email,
          item.recipient?.username,
          item.recipient?.email,
          item.category,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());

        return searchFields.some((v) => v.includes(normalizedSearch));
      });
    }
  }, [
    isCrypto,
    transactionsResponse,
    formattedTradesResponse,
    normalizedSearch,
  ]);

  // Category percentages for pie chart (only for fiat)
  const categoryPercentages = isCrypto
    ? transactionsResponse?.data?.category_percentages
    : null;
  const totalTransactions = isCrypto
    ? transactionsResponse?.data?.total_transactions
    : formattedTradesResponse?.data?.length ?? 0;

  // Format category data for pie chart
  const formattedPieChartData = useMemo(() => {
    if (!categoryPercentages) return [];

    return Object.keys(categoryPercentages).map((key) => {
      const item = categoryPercentages[key as keyof ICategoryPercentages];
      return {
        assetType: key.replace(/_/g, " "),
        percentage: item?.percentage ?? 0,
        color: item?.color ?? "#000000",
      };
    });
  }, [categoryPercentages]);

  // Handle filter click
  const onFilterClick = useCallback(
    (type: string, item: any, index: number) => {
      switch (type) {
        case TRANSACTION_FILTERS_KEYS.categories:
          setFilteredTransactions((prev) => {
            const updatedCategories = prev.categories.map((cat, i) =>
              i === index ? { ...cat, isSelected: !cat.isSelected } : cat
            );
            return { ...prev, categories: updatedCategories };
          });
          break;
        case TRANSACTION_FILTERS_KEYS.time_range:
          setFilteredTransactions((prev) => {
            const updatedTimeRange = prev.timeRange.map((range, i) =>
              i === index
                ? { ...range, isSelected: true }
                : { ...range, isSelected: false }
            );
            return { ...prev, timeRange: updatedTimeRange };
          });
          break;
        case TRANSACTION_FILTERS_KEYS.filter_type:
          setFilteredTransactions((prev) => {
            const updatedFilterType = prev.filter_type.map((filter, i) =>
              i === index
                ? { ...filter, isSelected: !filter.isSelected }
                : filter
            );
            return { ...prev, filter_type: updatedFilterType };
          });
          break;
        case TRANSACTION_FILTERS_KEYS.start_date:
          setFilteredTransactions((prev) => ({
            ...prev,
            start_date: { ...prev.start_date, ...item },
          }));
          break;
        case TRANSACTION_FILTERS_KEYS.end_date:
          setFilteredTransactions((prev) => ({
            ...prev,
            end_date: { ...prev.end_date, ...item },
          }));
          break;
      }
    },
    []
  );

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    let queryParams: string[] = [];

    if (
      filteredTransactions.start_date.isSelected &&
      filteredTransactions.end_date.isSelected
    ) {
      const startDate = filteredTransactions.start_date.value;
      const endDate = filteredTransactions.end_date.value;

      if (startDate && endDate) {
        queryParams.push(`${TRANSACTION_FILTERS_KEYS.start_date}=${startDate}`);
        queryParams.push(`${TRANSACTION_FILTERS_KEYS.end_date}=${endDate}`);
      }
    } else {
      const selectedCategories = filteredTransactions.categories
        .filter((category) => category.isSelected)
        .map((category) => category.key)
        .join(",");

      if (selectedCategories) {
        queryParams.push(
          `${TRANSACTION_FILTERS_KEYS.categories}=${selectedCategories}`
        );
      }

      const selectedTimeRange = filteredTransactions.timeRange
        .filter((time) => time.isSelected)
        .map((time) => time.value)
        .join(",");

      if (selectedTimeRange) {
        queryParams.push(
          `${TRANSACTION_FILTERS_KEYS.time_range}=${selectedTimeRange}`
        );
      }

      const selectedFilterType = filteredTransactions.filter_type
        .filter((filter) => filter.isSelected)
        .map((filter) => filter.key)
        .join(",");

      if (selectedFilterType) {
        queryParams.push(
          `${TRANSACTION_FILTERS_KEYS.filter_type}=${selectedFilterType}`
        );
      }
    }

    const finalQuery =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    setFilterQueryString(finalQuery);
    setShowFilter(false);
  }, [filteredTransactions]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilteredTransactions({
      timeRange: filteredTransactions.timeRange.map((item) => ({
        ...item,
        isSelected: false,
      })),
      categories: filteredTransactions.categories.map((item) => ({
        ...item,
        isSelected: false,
      })),
      filter_type: filteredTransactions.filter_type.map((item) => ({
        ...item,
        isSelected: false,
      })),
      start_date: {
        ...filteredTransactions.start_date,
        isSelected: false,
        value: "",
      },
      end_date: {
        ...filteredTransactions.end_date,
        isSelected: false,
        value: "",
      },
    });
    setFilterQueryString("");
    setShowFilter(false);
  }, [filteredTransactions]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.background.primary}>
      <BottomNavigation isVer={undefined} />

      {/* Filter Modal */}
      <CommonModal isVisible={showFilter} onClose={() => setShowFilter(false)}>
        <TransactionFilter
          filteredTransactions={filteredTransactions}
          setIsCustomRangeSelected={setIsCustomRangeSelected}
          isCustomRangeSelected={isCustomRangeSelected}
          isFetching={isFetching}
          date={date}
          setdate={setDate}
          date2={date2}
          setdate2={setDate2}
          setFilteredTransactions={setFilteredTransactions}
          onFilterClick={onFilterClick}
          onApplyFilter={handleApplyFilters}
          onCancel={handleResetFilters}
        />
      </CommonModal>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={onRefresh}
              tintColor={theme.colors.palette.green700}
            />
          }
        >
          <HeaderTitle title="Transactions" />

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <CustomSearchTextInput
                placeholder={
                  isCrypto
                    ? "Search Name or PayAiro tag..."
                    : "Search crypto transactions..."
                }
                placeholderTextColor={theme.colors.palette.green700}
                onChangeText={setSearchText}
                value={searchText}
              />
            </View>
            {/* Only show filter for fiat (isCrypto === true) */}
            {isCrypto && (
              <SvgIcons.FilterIcon
                style={styles.filterIcon}
                width={45}
                height={45}
                onPress={() => setShowFilter(true)}
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Transaction Summary - Only show for fiat (isCrypto === true) */}
            {isCrypto && (
              <DashboardSection title="Transaction Summary">
                {/* @ts-ignore */}
                <CustomPieChart
                  isTx={true}
                  amount={totalTransactions}
                  alloCationLists={formattedPieChartData}
                />
              </DashboardSection>
            )}

            {/* Recent Transactions */}
            <DashboardSection
              title={isCrypto ? "Recent Transactions" : "Crypto Transactions"}
              style={styles.transactionsSection}
            >
              {isLoading ? (
                <View style={styles.emptyContainer}>
                  <CustomText
                    variant="body1"
                    color={theme.colors.text.secondary}
                  >
                    Loading transactions...
                  </CustomText>
                </View>
              ) : displayedTransactions.length > 0 ? (
                displayedTransactions.map(
                  (transaction: IUnifiedTransaction) => (
                    <UnifiedTransactionCard
                      key={transaction.transaction_id}
                      transaction={transaction}
                    />
                  )
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <CustomText
                    variant="body1"
                    color={theme.colors.text.secondary}
                  >
                    No transactions found
                  </CustomText>
                </View>
              )}
            </DashboardSection>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    searchContainer: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      maxHeight: 70,
    },
    searchInputWrapper: {
      flex: 1,
      marginRight: 10,
    },
    filterIcon: {
      justifyContent: "center",
      alignItems: "center",
      marginRight: 5,
    },
    contentContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: 20,
      marginTop: 20,
    },
    transactionsSection: {
      paddingBottom: 160,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
  });

export default UnifiedTransactionScreen;

