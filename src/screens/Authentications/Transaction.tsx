import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import {
  useCryptoTrades,
  useFilteredTransactions,
  usePendingRequests,
  useTransactions,
  useUserPaymentRequests,
} from "query/hooks";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Theme, useTheme } from "styles";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import DashboardSection from "tsx-components/DashboardSection";
import CommonModal from "tsx-components/modals/CommonModal";
import TransactionFilter from "tsx-components/modals/TransactionFilter";
import BottomNavigation from "../../components/BottomNavigation";
import CustomPieChart from "../../components/CustomPieChart";
import HeaderTitle from "../../components/HeaderTitle";
import RequestPayCard from "../../components/RequestPayCard";
import TransactionCard from "../../components/TransactionCard";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import {
  setActiveTab,
  setErrorMsg,
  setPendingRequest,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";
import { cancelMerchent, cancelUser } from "../../services/Services";

// Define the categories, filter types, date ranges, and time ranges
// These can be used to filter transactions based on user preferences
// They are defined for only API filter name and remembering
const categories = [
  "family_friends",
  "self_transfer",
  "merchant",
  "miscellaneous",
];
const filterType = ["recieve", "debit"];
const daterange = ["start_data", "end_date"];
const timeRange = ["1month", "6month", "1year", "week"];

export const TRANSACTION_FILTERS_KEYS = {
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

export interface FilteredTransactions {
  timeRange: TimeRangeOption[];
  categories: CategoryOption[];
  filter_type: CategoryOption[];
  start_date: DateRangeOption;
  end_date: DateRangeOption;
}

export default function Transaction() {
  const { walletData, tokens, isCrypto } = useSelectorAction();
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const {
    data: AllTransactions,
    isLoading: isLoadingAllTransactions,
    error: allTransactionsError,
    isSuccess: AllTransactionsSuccess,
    refetch: refetchAllTransactions,
    isFetched: isFetchedAllTransactions,
  } = useTransactions();

  const {
    data: AllTradesHistory,
    isLoading: isLoadingAllTradesHistorys,
    error: AllTradesHistoryError,
    isSuccess: AllTradesHistorySuccess,
    refetch: refetchAllTradesHistory,
    isFetched: isFetchedAllTradesHistory,
  } = useCryptoTrades();

  const {
    data: AllUserPaymentRequests,
    isLoading: isLoadingAllUserPaymentRequests,
    error: AllUserPaymentRequestsError,
    isSuccess: AllUserPaymentRequestsSuccess,
    refetch: refetchAllUserPaymentRequests,
    isFetched: isFetchedAllUserPaymentRequests,
  } = useUserPaymentRequests();

  const {
    data: AllPendingRequests,
    isLoading: isLoadingAllPendingRequests,
    error: AllPendingRequestsError,
    isSuccess: AllPendingRequestsSuccess,
    refetch: refetchAllPendingRequests,
    isFetched: isFetchedAllPendingRequests,
  } = usePendingRequests();

  const [URLString, setURLString] = useState("");

  const {
    isError: isErrorFilteredTransactions,
    isFetching: isFetchingFilteredTransactions,
    isFetched: isFetchedFilteredTransactions,
    isLoading: isLoadingFilteredTransactions,
    isPending: isPendingFilteredTransactions,
    refetch: refetchFilteredTransactions,
    data: filteredTransactionsData,
  } = useFilteredTransactions(URLString);

  const { filteredTxData } = filteredTransactionsData?.data?.transactions;

  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // Type definitions
  interface TransactionItem {
    status?: string;
    created_at?: string;
    order_id?: string;
    [key: string]: any;
  }

  interface CryptoTxItem {
    created_at?: string;
    timestamp?: string;
    [key: string]: any;
  }

  interface CategoryPercentages {
    [key: string]: {
      percentage?: number;
      color?: string;
    };
  }

  interface MerchantTransaction {
    type?: string;
    [key: string]: any;
  }

  interface UserToUserRequest {
    type?: string;
    [key: string]: any;
  }

  interface AllTransactionsData {
    category_percentages?: CategoryPercentages;
    total_transaction_amount?: number;
    merchantTransactions?: TransactionItem[];
    userToUserTransactions?: TransactionItem[];
  }

  interface AllTradesHistoryData {
    nft_transactions?: CryptoTxItem[];
    trades?: CryptoTxItem[];
  }

  interface AllUserPaymentRequestsData {
    merchant_transactions?: {
      transactions?: MerchantTransaction[];
    };
    user_to_user_requests?: {
      received_pending_requests?: UserToUserRequest[];
      sent_pending_requests?: UserToUserRequest[];
    };
  }

  interface AllPendingRequestsData {
    received_pending_requests?: UserToUserRequest[];
  }

  type TabType = "1" | "2";

  const [txLists, setTxLists] = useState<TransactionItem[] | any>([]);
  const [merchentLists, setMerchentLists] = useState<MerchantTransaction[]>([]);
  const [contactsLists, setContactsLists] = useState<UserToUserRequest[]>([]);
  const [requestLists, setRequestLists] = useState<any[]>([]);
  const [activeTab, setActiveTabState] = useState<TabType>("1");
  const [activeTab2, setActiveTab2State] = useState<TabType>("1");
  const [web3TxLists, setweb3TxLists] = useState<CryptoTxItem[]>([]);
  const [txListsWeb3, settxListsWeb3] = useState<
    CryptoTxItem[] | TransactionItem[] | any
  >([]);
  const [formattedDataTx, setformattedDataTx] = useState<
    CategoryPercentages | undefined
  >(undefined);
  const [totalAmount, settotalAmount] = useState<any>(0);
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFilterType, setSelectedFilterType] = useState<string | null>(
    null
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Dispatch action when screen is focused
  useEffect(() => {
    if (isFocused) {
      useDispatchAction(setActiveTab("2"));
    }
  }, [isFocused]);

  useEffect(() => {
    if (AllTransactionsSuccess && isFetchedAllTransactions) {
      getTxLists(AllTransactions.data);
    }
    // if (filteredTxData && isFetchedFilteredTransactions) {
    //   getTxLists(filteredTxData);
    // }
    if (AllTradesHistorySuccess && isFetchedAllTradesHistory) {
      getCryptoTxs(AllTradesHistory.data);
    }
    if (AllUserPaymentRequests && isFetchedAllUserPaymentRequests) {
      getMerchentRequest(AllUserPaymentRequests?.data);
    }
    if (AllPendingRequestsSuccess && isFetchedAllPendingRequests) {
      getContactRequests(AllPendingRequests?.data);
    }
  }, [
    AllTransactions,
    AllTradesHistory,
    AllTransactionsSuccess,
    AllTradesHistorySuccess,
    AllUserPaymentRequestsSuccess,
    AllUserPaymentRequests,
    AllPendingRequests,
    isFetchedAllPendingRequests,
    isFetchedFilteredTransactions,
  ]);

  // console.log(isCrypto);
  // Handle tab switching
  useEffect(() => {
    if (activeTab === "1") {
      setRequestLists(merchentLists);
    } else if (activeTab === "2") {
      setRequestLists(contactsLists);
    }
  }, [activeTab, merchentLists, contactsLists]);

  useEffect(() => {
    if (activeTab2 === "1") {
      settxListsWeb3(txLists);
    } else if (activeTab2 === "2") {
      settxListsWeb3(web3TxLists);
    }
  }, [activeTab2, txLists, web3TxLists]);

  const getTxLists = async (data: AllTransactionsData) => {
    setformattedDataTx(data?.category_percentages ?? {});
    settotalAmount(data?.total_transaction_amount ?? 0);
    setTxLists(
      [
        ...(data?.merchantTransactions ?? []),
        ...(data?.userToUserTransactions ?? []),
      ].filter((i) => i?.status === "success" || i?.status === "completed")
    );
  };

  const getCryptoTxs = async (data: AllTradesHistoryData | any) => {
    setweb3TxLists([
      ...(data?.nft_transactions ?? []),
      ...(data?.trades ?? []),
    ]);
  };

  const getMerchentRequest = async (data: AllUserPaymentRequestsData | any) => {
    const merchant_transactions =
      data?.merchant_transactions?.transactions?.map(
        (i: MerchantTransaction) => {
          return { ...i, type: "merchant_transactions" };
        }
      ) ?? [];

    const received_pending_requests =
      data?.user_to_user_requests?.received_pending_requests?.map(
        (i: UserToUserRequest) => {
          return { ...i, type: "received_pending_requests" };
        }
      ) ?? [];

    const sent_pending_requests =
      data?.user_to_user_requests?.sent_pending_requests?.map(
        (i: UserToUserRequest) => {
          return { ...i, type: "sent_pending_requests" };
        }
      ) ?? [];

    setMerchentLists([
      ...merchant_transactions,
      ...received_pending_requests,
      ...sent_pending_requests,
    ]);
    useDispatchAction(
      setPendingRequest(
        merchant_transactions.length + received_pending_requests.length
      )
    );
  };

  const getContactRequests = async (data: AllPendingRequestsData | any) => {
    setContactsLists(data?.received_pending_requests ?? []);
  };

  const handleTabSwitch = (tab: TabType) => {
    setActiveTabState(tab);
  };
  const handleTabSwitch2 = (tab: TabType) => {
    setActiveTab2State(tab);
  };

  const formattedData = (e: CategoryPercentages | undefined) => {
    if (!e || typeof e !== "object") return [];

    return Object.keys(e).map((key) => {
      const item = e[key] || {};
      return {
        assetType: key.replace(/_/g, " "),
        percentage: item.percentage ?? 0,
        color: item.color ?? "#000000",
      };
    });
  };

  const handleCancel = async (item: any) => {
    let data;
    const formData = new FormData();
    if (item?.project_name) {
      formData.append("order_id", item?.order_id);
      data = await cancelMerchent(formData, (tokens as any)?.access);
      // console.log(data, "cancelPayment");
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg(data?.data?.message));
        if (AllUserPaymentRequests)
          getMerchentRequest(
            AllUserPaymentRequests as AllUserPaymentRequestsData
          );
      } else {
        useDispatchAction(setErrorMsg("Failed to cancel a payment"));
      }
    } else {
      data = await cancelUser(
        item?.request_details?.request_id,
        (tokens as any)?.access
      );
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg("Payment request has been cancelled."));
        if (AllUserPaymentRequests)
          getMerchentRequest(
            AllUserPaymentRequests as AllUserPaymentRequestsData
          );
      } else {
        useDispatchAction(setErrorMsg("Failed to cancel a payment"));
      }
    }
  };
  // console.log(
  //   "formattedDataTx =>",
  //   JSON.stringify(formattedData(formattedDataTx), null, 2)
  // );

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

  const [isCustomRangeSelected, setIsCustomRangeSelected] = useState(false);
  const [date, setdate] = useState("");
  const [date2, setdate2] = useState("");

  useEffect(() => {
    if (URLString) {
      refetchFilteredTransactions();
    }
  }, [URLString]);

  const onFilterClick = (type: string, item: any, index: number) => {
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
        console.log("index =>", index);
        setFilteredTransactions((prev) => {
          const updatedFilterType = prev.filter_type.map((filter, i) =>
            i === index ? { ...filter, isSelected: !filter.isSelected } : filter
          );
          return { ...prev, filter_type: updatedFilterType };
        });
        break;
      case TRANSACTION_FILTERS_KEYS.start_date:
        setFilteredTransactions((prev) => {
          const updatedStartDate = { ...prev.start_date, ...item };
          return { ...prev, start_date: updatedStartDate };
        });
        break;
      case TRANSACTION_FILTERS_KEYS.end_date:
        setFilteredTransactions((prev) => {
          const updatedEndDate = { ...prev.end_date, ...item };
          return { ...prev, end_date: updatedEndDate };
        });
        break;
      default:
        break;
    }
  };

  const handleApplyFilters = () => {
    let queryParams = [];

    // if (selectedCategories.length > 0) {
    //   queryParams.push(`categories=${selectedCategories.join(",")}`);
    // }

    // if (selectedFilterType) {
    //   queryParams.push(`filter_type=${selectedFilterType}`);
    // }

    // if (startDate && endDate) {
    //   queryParams.push(`start_date=${startDate}`);
    //   queryParams.push(`end_date=${endDate}`);
    // }

    // const finalQuery =
    //   queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

    // setURLString(finalQuery);
    // refetchFilteredTransactions(); // force fetch with new filters
    if (
      filteredTransactions.start_date.isSelected &&
      filteredTransactions.end_date.isSelected
    ) {
      queryParams = [];
      const startDate = filteredTransactions.start_date.value;
      const endDate = filteredTransactions.end_date.value;

      if (startDate && endDate) {
        queryParams.push(`${TRANSACTION_FILTERS_KEYS.start_date}=${startDate}`);
        queryParams.push(`${TRANSACTION_FILTERS_KEYS.end_date}=${endDate}`);
      }
    } else {
      queryParams = [];
      const selectedCategories = filteredTransactions.categories
        .filter((category) => category.isSelected === true)
        .map((category) => category.key)
        .join(",");

      queryParams.push(
        `${TRANSACTION_FILTERS_KEYS.categories}=${selectedCategories}`
      );

      const selectedTimeRange = filteredTransactions.timeRange
        .filter((time) => time.isSelected === true)
        .map((time) => time.value)
        .join(",");

      queryParams.push(
        `${TRANSACTION_FILTERS_KEYS.time_range}=${selectedTimeRange}`
      );

      const selectedFilterType = filteredTransactions.filter_type
        .filter((filter) => filter.isSelected === true)
        .map((filter) => filter.key)
        .join(",");

      queryParams.push(
        `${TRANSACTION_FILTERS_KEYS.filter_type}=${selectedFilterType}`
      );
    }
    const finalQuery =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

    setURLString(finalQuery);
    refetchFilteredTransactions(); // force fetch with new filters
    setShowFilter(false);

    // console.log("finalQuery =>", JSON.stringify(finalQuery, null, 2));
  };

  console.log(
    "filteredTransactionsData =>",
    JSON.stringify(filteredTransactionsData?.data.transactions, null, 2)
  );
  console.log("txLists =>", JSON.stringify(txLists, null, 2));

  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.background.primary}
    >
      <BottomNavigation isVer={undefined} />
      <CommonModal
        isVisible={showFilter}
        onClose={() => {
          setShowFilter(false);
        }}
      >
        <TransactionFilter
          filteredTransactions={filteredTransactions}
          setIsCustomRangeSelected={setIsCustomRangeSelected}
          isCustomRangeSelected={isCustomRangeSelected}
          isFetching={isFetchingFilteredTransactions}
          date={date}
          setdate={setdate}
          date2={date2}
          setdate2={setdate2}
          setFilteredTransactions={setFilteredTransactions}
          onFilterClick={onFilterClick}
          onApplyFilter={() => {
            handleApplyFilters();
          }}
          onCancel={() => {
            setShowFilter(false);
          }}
        />
      </CommonModal>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <HeaderTitle title={"Transactions"} />
          <View style={[styles.textInputAndFilterContainer]}>
            <View style={[styles.testInputContainer]}>
              <CustomSearchTextInput
                placeholder="Search Name or PayAiro tag..."
                placeholderTextColor={theme.colors.palette.green700}
                onChangeText={(e) => {
                  setSearchText(e);
                }}
                value={searchText}
              />
            </View>
            <SvgIcons.FilterIcon
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginRight: 5,
              }}
              width={45}
              height={45}
              onPress={() => {
                setShowFilter(true);
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}
          >
            {isCrypto && (
              <DashboardSection title="Transaction Summary">
                {/* @ts-ignore */}
                <CustomPieChart
                  isTx={true}
                  amount={totalAmount}
                  alloCationLists={formattedData(formattedDataTx) ?? []}
                />
              </DashboardSection>
            )}
            {isCrypto && merchentLists?.length > 0 && (
              <DashboardSection
                style={{ marginTop: "auto" }}
                title="Payment Requests"
              >
                {isCrypto &&
                  merchentLists?.length > 0 &&
                  merchentLists?.map((i, k) => (
                    <RequestPayCard
                      item={i}
                      key={k}
                      amount={i?.request_details?.amount}
                      reqId={i?.request_uuid}
                      isSentRequest={i?.recipient_details}
                      onPress={() =>
                        navigation.navigate(SCREENS.ScanPay, {
                          type: "request",
                          sender: i,
                        })
                      }
                      onCancel={() => handleCancel(i)}
                    />
                  ))}
              </DashboardSection>
            )}

            {/* Recent Transactions */}
            <DashboardSection
              title="Recent Transactions"
              style={{ paddingBottom: 160 }}
            >
              {/* {isCrypto &&
                txLists &&
                txLists.length > 0 &&
                txLists
                  ?.sort((a: any, b: any) => {
                    const dateA = a.created_at
                      ? new Date(a.created_at).getTime()
                      : 0;
                    const dateB = b.created_at
                      ? new Date(b.created_at).getTime()
                      : 0;
                    return dateB - dateA;
                  })
                  .map((item: any, key: any) => (
                    <View key={key}>
                      <TransactionCard
                        item={item}
                        isMerchent={item?.order_id ? true : false}
                        isCrypto={item?.order_id ? true : false}
                      />
                    </View>
                  ))}
              {!isCrypto && web3TxLists.length > 0 ? (
                web3TxLists
                  ?.sort((a, b) => {
                    const dateA =
                      a?.created_at || a?.timestamp
                        ? new Date(
                            a?.created_at || (a?.timestamp as string)
                          ).getTime()
                        : 0;
                    const dateB =
                      b?.created_at || b?.timestamp
                        ? new Date(
                            b?.created_at || (b?.timestamp as string)
                          ).getTime()
                        : 0;
                    return dateB - dateA;
                  })
                  ?.map((i, k) => (
                    <TransactionCard
                      isCrypto={true}
                      isMerchent={false}
                      item={i}
                      key={k}
                    />
                  ))
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    color: "#fff",
                    textAlign: "center",
                    marginTop: 100,
                  }}
                >
                  No Transaction Found
                </Text>
              )} */}
              {filteredTransactionsData?.data?.transactions?.length > 0 ? (
                filteredTransactionsData.data.transactions.map(
                  (item: any, key: any) => (
                    <TransactionCard
                      item={item}
                      key={key}
                      isMerchent={item?.order_id}
                      isCrypto={isCrypto}
                    />
                  )
                )
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    color: "#fff",
                    textAlign: "center",
                    marginTop: 100,
                  }}
                >
                  No Transaction Found
                </Text>
              )}
            </DashboardSection>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    textInputAndFilterContainer: {
      width: "100%",
      flex: 1,
      maxHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    testInputContainer: {
      flex: 1,
      marginRight: 10,
    },
  });
