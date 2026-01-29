import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import { useTheme, Theme } from "styles";
import {
  useUnifiedTransactionsPaginated,
  useFormattedTradesHistoryPaginated,
  usePendingPaymentRequests,
} from "query/hooks";
import HeaderTitle from "components/HeaderTitle";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import DashboardSection from "tsx-components/DashboardSection";
import CustomText from "tsx-components/CustomText";
import CommonModal from "tsx-components/modals/CommonModal";
import TransactionFilter from "tsx-components/modals/TransactionFilter";
import PaymentRequestsList from "tsx-components/PaymentRequestsList";
import UnifiedTransactionCard from "./UnifiedTransactionCard";
import {
  IUnifiedTransaction,
  IUnifiedTransactionScreenProps,
  ICategoryPercentages,
} from "./types";
import { DonutChartContainer } from "tsx-components/donut-chart";

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

  const { 
    data: pendingRequestsData, 
    isLoading: isLoadingPendingPaymentRequests, 
    refetch: refetchPendingPaymentRequests 
  } = usePendingPaymentRequests();


  console.log("pendingRequestsData =>", JSON.stringify(pendingRequestsData, null, 2));

  // Get isCrypto from Redux
  const { isCrypto } = useSelector((state: any) => state.authenticationSlice);

  // State
  const [filterQueryString, setFilterQueryString] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isCustomRangeSelected, setIsCustomRangeSelected] = useState(false);
  const [date, setDate] = useState("");
  const [date2, setDate2] = useState("");
  const PAGE_SIZE = 5;

  // API hooks - conditionally use based on isCrypto
  // Use paginated hook for fiat transactions
  const {
    data: transactionsPaginatedResponse,
    isLoading: isLoadingFiat,
    isFetching: isFetchingFiat,
    isFetchingNextPage: isFetchingNextPageFiat,
    fetchNextPage: fetchNextPageFiat,
    hasNextPage: hasNextPageFiat,
    refetch: refetchFiat,
  } = useUnifiedTransactionsPaginated(filterQueryString, PAGE_SIZE, isCrypto);


  console.log("transactionsPaginatedResponse ->", JSON.stringify(transactionsPaginatedResponse,null,2))

  const {
    data: formattedTradesPaginatedResponse,
    isLoading: isLoadingCrypto,
    isFetching: isFetchingCrypto,
    isFetchingNextPage: isFetchingNextPageCrypto,
    fetchNextPage: fetchNextPageCrypto,
    hasNextPage: hasNextPageCrypto,
    refetch: refetchCrypto,
  } = useFormattedTradesHistoryPaginated(PAGE_SIZE, !isCrypto);

  const formattedTradesResponse = useMemo(() => {
    if (isCrypto || !formattedTradesPaginatedResponse) {
      return null;
    }

    const allTransactions = formattedTradesPaginatedResponse.pages.flatMap(
      (page) => page?.data ?? []
    );

    return { data: allTransactions };
  }, [formattedTradesPaginatedResponse, isCrypto]);

  // Flatten paginated transactions
  const transactionsResponse = useMemo(() => {
    if (!isCrypto || !transactionsPaginatedResponse) return null;
    
    const allTransactions = transactionsPaginatedResponse.pages.flatMap(
      (page) => page?.data?.transactions ?? []
    );
    
    // Get category percentages and other metadata from the first page
    const firstPage = transactionsPaginatedResponse.pages[0];
    
    return {
      data: {
        transactions: allTransactions,
        total_count: firstPage?.data?.total_count ?? 0,
        category_percentages: firstPage?.data?.category_percentages,
        total_transactions: firstPage?.data?.total_transactions ?? 0,
        merchant_count: firstPage?.data?.merchant_count ?? 0,
        family_friends_count: firstPage?.data?.family_friends_count ?? 0,
        miscellaneous_count: firstPage?.data?.miscellaneous_count ?? 0,
        self_transfer_count: firstPage?.data?.self_transfer_count ?? 0,
        merchant_amount_total: firstPage?.data?.merchant_amount_total ?? 0,
        family_friends_amount_total: firstPage?.data?.family_friends_amount_total ?? 0,
        miscellaneous_amount_total: firstPage?.data?.miscellaneous_amount_total ?? 0,
        self_transfer_amount_total: firstPage?.data?.self_transfer_amount_total ?? 0,
        total_amount: firstPage?.data?.total_amount ?? 0,
      },
    };
  }, [transactionsPaginatedResponse, isCrypto]);

  // Determine which data to use
  const isLoading = isCrypto ? isLoadingFiat : isLoadingCrypto;
  const isFetching = isCrypto ? isFetchingFiat : isFetchingCrypto;
  const isFetchingNextPage = isCrypto
    ? isFetchingNextPageFiat
    : isFetchingNextPageCrypto;
  const hasNextPage = isCrypto ? hasNextPageFiat : hasNextPageCrypto;
  const fetchNextPage = isCrypto ? fetchNextPageFiat : fetchNextPageCrypto;
  const refetch = isCrypto ? refetchFiat : refetchCrypto;

  // Active tab is now handled automatically by App.js navigation listener

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


  // console.log("formattedPieChartData =>", JSON.stringify(formattedPieChartData, null, 2));

  // Transform formattedPieChartData for DonutChart
  const donutChartData = useMemo(() => {
    if (!formattedPieChartData || formattedPieChartData.length === 0) {
      return null;
    }

    // Filter out segments with 0% or negative percentages
    const validSegments = formattedPieChartData.filter((item) => item.percentage > 0);

    if (validSegments.length === 0) {
      return null;
    }

    return {
      data: {
        asset_classes: validSegments.map((item) => ({
          label: item.assetType,
          percentage: item.percentage,
        })),
        total_portfolio_value: totalTransactions || 0,
      },
    };
  }, [formattedPieChartData, totalTransactions]);

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
    refetchPendingPaymentRequests();
  }, [refetch, refetchPendingPaymentRequests]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refetch all transaction data when screen is focused
      refetchFiat();
      refetchCrypto();
      refetchPendingPaymentRequests();
    }, [refetchFiat, refetchCrypto, refetchPendingPaymentRequests])
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const transactionsListHeader = useMemo(
    () => (
      <>
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
              style={styles.searchInput}
              placeholderTextColor={theme.colors.palette.green700}
              onChangeText={setSearchText}
              value={searchText}
              numberOfLines={1}
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

        <View style={styles.contentContainer}>
          {isCrypto && donutChartData && (
            <DashboardSection
              titleStyle={styles.donutTitle}
              style={styles.donutContainer}
              title="Transaction Summary"
            >
              <DonutChartContainer
                portfolioBreakdownData={donutChartData}
                index={0}
                n={0}
              />
            </DashboardSection>
          )}

          {isCrypto &&
            [
              pendingRequestsData?.data?.received_pending_requests,
              pendingRequestsData?.data?.sent_pending_requests,
            ]
              .flat()
              .length > 0 && (
              <DashboardSection title="Payment Requests">
                <PaymentRequestsList
                  data={pendingRequestsData?.data}
                  isLoading={isLoadingPendingPaymentRequests}
                />
              </DashboardSection>
            )}

          <View style={styles.transactionsSection}>
            <DashboardSection
              title={isCrypto ? "Recent Transactions" : "Crypto Transactions"}
            />
          </View>
        </View>
      </>
    ),
    [
      donutChartData,
      isCrypto,
      isLoadingPendingPaymentRequests,
      pendingRequestsData?.data,
      searchText,
      setSearchText,
      styles.contentContainer,
      styles.donutContainer,
      styles.donutTitle,
      styles.filterIcon,
      styles.searchContainer,
      styles.searchInput,
      styles.searchInputWrapper,
      styles.transactionsSection,
      theme.colors.palette.green700,
    ]
  );

  const transactionsListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color={theme.colors.palette.green700} />
          <CustomText
            variant="caption"
            color={theme.colors.text.secondary}
            style={styles.loadMoreText}
          >
            Loading more...
          </CustomText>
        </View>
      );
    }

    if (!hasNextPage && displayedTransactions.length > 0) {
      return (
        <View style={styles.loadMoreContainer}>
          <CustomText variant="caption" color={theme.colors.text.secondary}>
            No more transactions
          </CustomText>
        </View>
      );
    }
    return <View style={styles.listFooterSpacing} />;
  }, [
    displayedTransactions.length,
    hasNextPage,
    isFetchingNextPage,
    styles.listFooterSpacing,
    styles.loadMoreContainer,
    styles.loadMoreText,
    theme.colors.palette.green700,
    theme.colors.text.secondary,
  ]);

  const renderTransactionItem = useCallback(
    ({ item }: { item: IUnifiedTransaction }) => (
      <View style={styles.transactionItemWrapper}>
        <UnifiedTransactionCard transaction={item} />
      </View>
    ),
    [styles.transactionItemWrapper]
  );

  // console.log("formattedPieChartData =>", JSON.stringify(formattedPieChartData, null, 2));

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.background.primary}>

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
        <FlatList
          data={displayedTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item, index) =>
            `${item.transaction_id}-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={transactionsListHeader}
          ListFooterComponent={transactionsListFooter}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.emptyContainer}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>
                  Loading transactions...
                </CustomText>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>
                  No transactions found
                </CustomText>
              </View>
            )
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={onRefresh}
              tintColor={theme.colors.palette.green700}
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={false}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 40,
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
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.palette.green900,
      
      fontFamily: theme.typography.fontFamily.montserrat,
    },
    filterIcon: {
      justifyContent: "center",
      alignItems: "center",
      marginRight: 5,
    },
    contentContainer: {
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: 20,
      marginTop: 20,
    },
    transactionsSection: {
      paddingBottom: 10,
    },
    transactionItemWrapper: {
      backgroundColor: theme.colors.palette.white,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    listFooterSpacing: {
      height: 140,
      backgroundColor: theme.colors.palette.white,
      borderBottomEndRadius: 32,
      borderBottomStartRadius: 32,
      paddingHorizontal: 20,
    },
    loadMoreContainer: {
      backgroundColor: theme.colors.palette.white,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    loadMoreText: {
      marginTop: 8,
    },
    donutContainer: {
      backgroundColor: theme.colors.card.background,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 10,
    },
    donutTitle: {
      color: theme.colors.text.primary,
    },
  });

export default UnifiedTransactionScreen;