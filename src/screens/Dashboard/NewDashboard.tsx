import React, {
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
// Import from the module alias utility
import { useIsFocused, useNavigation } from "@react-navigation/native";
import axios from "axios";
import BalanceModal from "components/BalanceModal";
import BottomNavigation from "components/BottomNavigation";
import GenericButton from "components/GenericButton";
import GuideModal from "components/GuideModal";
import Rewards from "components/Rewards";
import StoryLists from "components/StoryLists";
import TransactionCard from "components/TransactionCard";
import Fonts from "constants/Fonts";
import { SCREENS } from "constants/SCREENS";
import { BASE_URL } from "constants/mockData";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  bankKeys,
  useAllBankAccounts,
  useBankBalances,
  useCryptoBalance,
  useCryptoTrades,
  useGetReward,
  useRecentContacts,
  useRedeemReward,
  useTransactions,
  useWalletDetails,
} from "query/hooks";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { getPin, setPin } from "services/Auth";
import {
  addbankAccountRoth,
  getBanksAllAccount,
  getCryptoTx,
  getPinFromSev,
  uploadKYC,
} from "services/Services";
import { STORAGE_KEYS, setItem } from "storage/mmkv";
import CryptoCardSkeleton from "tsx-components/CryptoCardSkeleton";
import DashboardSection from "tsx-components/DashboardSection";
import FiatGraphSection from "tsx-components/FiatGraphSection";
import IconTextComponent from "tsx-components/IconTextComponent";
import {
  renderFinanceIcons,
  renderUtilitiesIcons,
  size,
} from "tsx-components/components.configs";
import PinScreen from "tsx-components/modals/PinScreen";
import RewardModal from "tsx-components/modals/RewardModal";
import { ScreenContainer } from "../../HOC";
import {
  SVGAdd,
  SVGBamkAdd,
  SVGBit,
  SVGDebitAdd,
  SVGDebitCardAdd,
  SVGHolding,
  SVGKYC2,
  SVGLinkDebitCard,
  SVGLoggo,
  SVGNewBank,
  SVGReceive,
  SVGRef,
  SVGSecurities,
  SVGSend,
  SVGSliders,
  SVGUSD,
  SVGVoucher,
  SVG_eye_off,
  SVG_eye_on,
} from "../../constants/images";
import {
  setBankLists,
  setBankbalances,
  setCardSwitchDetails,
  setErrorMsg,
  setShowGuide,
  setShowLoader,
  setShowRedeemReward,
  setSuccessMsg,
  setTotalDisbursable,
  setTotalDisbursablePending,
  setWalletData,
} from "../../redux/slices/authenticationSlice";
import { useTheme } from "../../styles/ThemeContext";
import {
  Card,
  CryptoCard,
  CustomText,
  DashboardHeader,
} from "../../utils/moduleAlias";
import LoaderComponent from "tsx-components/LoaderComponent";
import RealStateComponent from "tsx-components/RealStateComponent";
import {
  useGetAllRWA,
  useGetRWACategory,
  useGetRWAList,
  useGetUserHoldings,
} from "query/hooks/useRWA";
import { defaultImage } from "utils/configs";
import { VIEW_TYPE } from "screens/TSX-Screens/RWA/RWA";
import { queryClient } from "query/queryClient";
import { userContactKeys } from "query/queryKeys";
import DashboardCard from "tsx-components/DashboardCard";
import AddAndLinkAcountCard from "tsx-components/AddAndLinkAcountCard";
import CommonModal from "tsx-components/modals/CommonModal";
import ConfirmationModalComponent from "tsx-components/ConfirmationModalComponent";

// Lazy load non-critical components
const LazyBankModal = lazy(() => import("components/BankModal"));
const LazyBankModal2 = lazy(() => import("components/BankModal2"));
const LazySelectionModal = lazy(() => import("components/SelectionModal"));
const LazySelectionModal2 = lazy(() => import("components/SelectionModal2"));

const categories = {
  Commodities: "Commodities",
  Crypto: "Crypto",
  Bonds: "Bonds",
  EFTS: "EFTS",
  Metal: "Metal",
  Stocks: "Stocks",
  RealEstate: "Real Estate",
};

// Variables
const BANK_TYPE = "FDIC Insured";

// API call utility with automatic retries, caching, and error handling
export const useApiCall = <T,>(
  apiFunction: (token: string) => Promise<any>,
  options = { retries: 1, cacheTime: 5 * 60 * 1000 }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{ data: T | null; timestamp: number }>({
    data: null,
    timestamp: 0,
  });

  const execute = useCallback(
    async (token: string, forceRefresh = false) => {
      // Use cached data if available and not expired
      const now = Date.now();
      if (
        !forceRefresh &&
        cacheRef.current.data &&
        now - cacheRef.current.timestamp < options.cacheTime
      ) {
        setData(cacheRef.current.data);
        return cacheRef.current.data;
      }

      setLoading(true);
      setError(null);

      let attempts = 0;
      let result = null;

      while (attempts <= options.retries) {
        try {
          const response = await apiFunction(token);
          result = response?.data;

          // Update cache
          cacheRef.current = {
            data: result,
            timestamp: Date.now(),
          };

          setData(result);
          setLoading(false);
          return result;
        } catch (err) {
          attempts++;

          // If we've exhausted retries, set the error
          if (attempts > options.retries) {
            const error =
              err instanceof Error ? err : new Error("Unknown error occurred");
            setError(error);
            setLoading(false);
            console.error(
              `API call failed after ${options.retries} retries:`,
              error
            );
            return null;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
          );
        }
      }

      return null;
    },
    [apiFunction, options.cacheTime, options.retries]
  );

  return {
    data,
    loading,
    error,
    execute,
    clearCache: () => {
      cacheRef.current = { data: null, timestamp: 0 };
    },
  };
};

// Loading fallback component
const LoadingFallback = () => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.colors.palette.green700} />
    </View>
  );
};

// Skeleton components for loading states
const SkeletonCard = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: "rgba(247, 247, 247, 1)",
        padding: 10,
        width: 300,
        borderRadius: 15,
        marginRight: 10,
        height: 120,
      }}
    >
      <View
        style={{
          width: "70%",
          height: 20,
          backgroundColor: theme.colors.palette.grey200,
          borderRadius: 4,
          marginBottom: 10,
        }}
      />
      <View
        style={{
          width: "90%",
          height: 12,
          backgroundColor: theme.colors.palette.grey200,
          borderRadius: 4,
          marginBottom: 15,
        }}
      />
      <View
        style={{
          width: "50%",
          height: 12,
          backgroundColor: theme.colors.palette.grey200,
          borderRadius: 4,
          marginBottom: 15,
        }}
      />
      <View
        style={{
          width: "40%",
          height: 20,
          backgroundColor: theme.colors.palette.grey200,
          borderRadius: 4,
        }}
      />
    </View>
  );
};

const SkeletonTransactionCard = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.palette.grey200,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.palette.grey200,
            marginRight: 10,
          }}
        />
        <View>
          <View
            style={{
              width: 120,
              height: 16,
              backgroundColor: theme.colors.palette.grey200,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              width: 80,
              height: 12,
              backgroundColor: theme.colors.palette.grey200,
              borderRadius: 4,
            }}
          />
        </View>
      </View>
      <View
        style={{
          width: 70,
          height: 20,
          backgroundColor: theme.colors.palette.grey200,
          borderRadius: 4,
        }}
      />
    </View>
  );
};

// Memoized components for better performance
const MemoizedStoryLists = React.memo(StoryLists);
const MemoizedTransactionCard = React.memo(TransactionCard);
const MemoizedRewards = React.memo(Rewards);
const MemoizedDashboardSection = React.memo(DashboardSection);
const MemoizedRWASection = React.memo(DashboardSection);

// Separate crypto view components to improve re-rendering
interface CryptoFinanceSectionProps {
  navigation: any;
}

const CryptoFinanceSection = React.memo(
  ({ navigation }: CryptoFinanceSectionProps) => {
    const { theme } = useTheme();

    return (
      <View>
        {/* <MemoizedDashboardSection
          title="Finance"
          actionText="see all"
          onActionPress={() => {}}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{}}
            style={{ marginVertical: 10 }}
          >
            {renderFinanceIcons.map((item, index) => (
              <IconTextComponent label={item?.label} key={index}>
                <SvgXml
                  xml={item?.IconName}
                  width={item?.width}
                  height={item?.height}
                  disabled={item?.navigationScreenName == ""}
                  onPress={() =>
                    navigation.navigate(item?.navigationScreenName)
                  }
                  // style={{ marginRight: 10 }}
                />
              </IconTextComponent>
            ))}
          </ScrollView>
        </MemoizedDashboardSection> */}
        <MemoizedDashboardSection
          title="Utilities"
          actionText="see all"
          onActionPress={() => {}}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{}}
            style={{ marginVertical: 10 }}
          >
            {renderUtilitiesIcons.map((item, index) => (
              <IconTextComponent label={item?.label} key={index}>
                <SvgXml
                  xml={item?.IconName}
                  width={item?.width}
                  height={item?.height}
                  disabled={item?.navigationScreenName == ""}
                  onPress={() =>
                    navigation.navigate(item?.navigationScreenName, {
                      title: item?.label,
                    })
                  }
                  // style={{ marginRight: 10 }}
                />
              </IconTextComponent>
            ))}
          </ScrollView>
        </MemoizedDashboardSection>
      </View>
    );
  }
);

// No props needed for this component
const CryptoRewardsSection = React.memo(() => {
  const navigation = useNavigation<any>();
  return (
    <MemoizedDashboardSection
      title="Offer & Rewards"
      actionText="see all"
      onActionPress={() => {
        navigation.navigate(NAVIGATION_SCREENS.REWARDS);
      }}
    >
      <View style={[]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <MemoizedRewards item={{}} />
          <MemoizedRewards
            item={{
              name: "Vouchers",
              icon: SVGVoucher,
              route: "VouchersScreens",
              bgColor: "#f1edfe",
            }}
          />
          <MemoizedRewards
            item={{
              name: "Referrals",
              icon: SVGRef,
              route: "VouchersScreens",
              bgColor: "rgba(95, 255, 0, 0.09)",
            }}
          />
        </View>
      </View>
    </MemoizedDashboardSection>
  );
});
// No props needed for this component
const CryptoRWASection = React.memo(({ data, navigation }: any) => {
  const onPress = (item: any) => {
    const name = item?.name?.toLowerCase();

    switch (name) {
      case categories.RealEstate.toLowerCase():
        navigation.navigate(NAVIGATION_SCREENS.REAL_STATE, {
          type: VIEW_TYPE.rwa,
          dataType: "Realestate",
        });
        break;

      case categories.Stocks.toLowerCase():
        navigation.navigate(NAVIGATION_SCREENS.STOCKS, {
          type: VIEW_TYPE.rwa,
          dataType: "Stocks",
        });
        break;

      case categories.Crypto.toLowerCase():
        navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN);
        break;

      default:
        navigation.navigate(NAVIGATION_SCREENS.COMMON_ASSETS_SCREEN, {
          type: VIEW_TYPE.rwa,
          dataType: name,
        });
        break;
    }
  };

  return (
    <MemoizedDashboardSection
      title="RWA Category"
      actionText="see all"
      onActionPress={() => {
        navigation.navigate(NAVIGATION_SCREENS.RWA, {});
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{}}
        style={{ marginVertical: 10 }}
      >
        {data?.map((item: any, index: number) => (
          <IconTextComponent
            onPress={() => {
              onPress(item);
            }}
            label={item?.name}
            key={index}
          >
            <Image
              style={{ width: size.width, height: size.height }}
              source={{ uri: item.logos }}
            />
          </IconTextComponent>
        ))}
      </ScrollView>
    </MemoizedDashboardSection>
  );
});

interface CryptoOtherServicesSectionProps {
  handleRothBank: () => Promise<void>;
  setisCardModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: any;
}

const CryptoOtherServicesSection = React.memo(
  ({
    handleRothBank,
    setisCardModalVisible,
    navigation,
  }: CryptoOtherServicesSectionProps) => (
    <MemoizedDashboardSection title="Others Services">
      <View style={{ marginBottom: 130, marginRight: 20 }}>
        {/* <SvgXml
          xml={SVGBamkAdd}
          style={{ marginVertical: 10 }}
          onPress={() => handleRothBank()}
        /> */}
        <TouchableOpacity
          style={{
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "flex-start",
            gap: 10,
          }}
        >
          <SvgXml
            xml={SVGLinkDebitCard}
            onPress={() => setisCardModalVisible(true)}
          />
          <CustomText size={13} variant="button">
            Link Debit Card
          </CustomText>
        </TouchableOpacity>
        {/* <Pressable
          onPress={() => navigation.navigate("IntraAccountTransfer")}
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <SvgXml xml={SVGDebitAdd} />
          <Text
            style={{
              color: "black",
              fontFamily: Fonts.semibold,
              marginLeft: 10,
            }}
          >
            Intra account transfer
          </Text>
        </Pressable> */}
      </View>
    </MemoizedDashboardSection>
  )
);

const NewDashboard = () => {
  // Get data from Redux store
  const {
    isCrypto,
    selectedCrypto,
    bankBalance,
    walletData,
    tokens,
    bankLists,
    CardSwitchDetails,
    mxExternalAccountDetails,
    showRedeemReward,
    showGuide,
    showLoader,
  } = useSelector((state: any) => state.authenticationSlice);

  const dispatch = useDispatch();

  // Example custom theme handling
  const { theme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  const navigation = useNavigation<any>();
  const pinScreenRef = useRef<any>(null);

  const [userName, setUserName] = useState("");
  const [ghostSlideVisible, setGhostSlideVisible] = useState(false);
  const [isVisible, setisVisible] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [contactLists, setcontactLists] = useState<any[]>([]);
  const [txLists, settxLists] = useState<any[]>([]);
  const [web3TxLists, setweb3TxLists] = useState<any[]>([]);
  const [isCardModalVisible, setisCardModalVisible] = useState(false);
  const [showPin, setshowPin] = useState(false);
  const [isBankModalVisible, setisBankModalVisible] = useState(false);
  const [isVisible2, setisVisible2] = useState(false);
  const [isShowWeeks, setisShowWeeks] = useState(false);
  const [timeframe, settimeframe] = useState("Week");
  const [isShowKYC, setisShowKYC] = useState(false);
  const [alloCationLists, setalloCationLists] = useState([]);
  const [totalDisbursable, settotalDisbursable] = useState(0);
  const [totalDisbursablePending, settotalDisbursablePending] = useState(0);
  const [showAddAccountConfirmation, setShowAddAccountConfirmation] =
    useState(false);
  const [hiddenBalances, setHiddenBalances] = useState<Record<string, boolean>>(
    {}
  );

  const [refreshing, setRefreshing] = useState(false);
  const [souceAccount, setsouceAccount] = useState("");

  const focus = useIsFocused();

  // Get the bank accounts from the API with cache stoage and store them in Redux
  const {
    data: AllBankAccounts,
    isLoading: isLoadingAllBankAccounts,
    error: allBankAccountsError,
    refetch: refetchAllBankAccounts,
  } = useAllBankAccounts();

  const { mutate: redeemReward } = useRedeemReward();
  const { data: getRewardData, isError, isSuccess } = useGetReward();
  const {
    data: getRWACategory,
    isError: isErrorRWACategory,
    isSuccess: isSuccessRWACategory,
  } = useGetRWACategory();

  const {
    data: getGetAllRWA,
    isError: isErrorGetAllRWA,
    isSuccess: isSuccessGetAllRWA,
  } = useGetAllRWA();

  const {
    data: getRWAList,
    isError: isErrorRWAListA,
    isSuccess: isSuccessRWAList,
  } = useGetUserHoldings();

  const filteredMyRWA =
    getRWAList?.data.filter((item: any) => item.asset_type == "Realestate") ??
    [];

  // console.log("dataaaa =>", JSON.stringify(filteredMyRWA, null, 2));
  console.log("token =>", tokens.access);

  const {
    data: bankBalanceData,
    isLoading: isLoadingBankBalanceData,
    error: bankBalanceDataError,
    refetch: refetchBankBalanceData,
  } = useBankBalances();

  const {
    data: AllContacts,
    isLoading: isLoadingAllContacts,
    error: allContactsError,
    refetch: refetchAllContacts,
  } = useRecentContacts();

  const {
    data: AllTransactions,
    isLoading: isLoadingAllTransactions,
    error: allTransactionsError,
    isSuccess: AllTransactionsSuccess,
    refetch: refetchAllTransactions,
  } = useTransactions();

  const {
    data: AllTradesHistory,
    isLoading: isLoadingAllTradesHistorys,
    error: AllTradesHistoryError,
    isSuccess: AllTradesHistorySuccess,
    refetch: refetchAllTradesHistory,
  } = useCryptoTrades();

  const {
    data: CryptoBalance,
    isLoading: isLoadingCryptoBalances,
    error: CryptoBalanceError,
    isSuccess: CryptoBalanceSuccess,
    refetch: refetchCryptoBalance,
  } = useCryptoBalance();

  // console.log("CryptoBalance =>", JSON.stringify(CryptoBalance, null, 2));

  const {
    data: WalletDetailsData,
    isLoading: isPendingWalletDetails,
    isSuccess: isSuccessWalletDetails,
    isError: isErrorWalletDetails,
    refetch: refetchWalletDetails,
  } = useWalletDetails();

  const {
    data: RecentContactsData,
    isLoading: isPendingRecentContacts,
    isSuccess: isSuccessRecentContacts,
    isError: isErrorRecentContacts,
    refetch: refetchRecentContacts,
  } = useRecentContacts();

  // console.log(
  //   "RecentContactsData =>",
  //   JSON.stringify(RecentContactsData?.recentContacts, null, 2)
  // );

  // useEffect(() => {
  //   // console.log("Focus screeen", focus);
  //   if (focus) {
  //     refetchAllBankAccounts();
  //   }
  // }, [focus]);

  useEffect(() => {
    if (AllTransactionsSuccess) {
      settxLists(
        [
          ...AllTransactions.data?.merchantTransactions,
          ...AllTransactions.data?.userToUserTransactions,
        ].filter((i) => i?.status === "success" || i?.status === "completed") ??
          []
      );
    }

    if (CryptoBalance) {
      const cryptoAssets = (CryptoBalance as any)?.data?.data;

      if (!cryptoAssets) return;

      // console.log("cryptoAssets =>", cryptoAssets);

      // Filter non-USD assets in one pass
      const nonUsdAssets = cryptoAssets.filter(
        (asset: CryptoAsset) => asset?.assetType !== "usd"
      );

      setalloCationLists(nonUsdAssets as any);

      // Calculate totals in a single reduce operation for better performance
      const totals = nonUsdAssets.reduce(
        (acc: { disbursable: number; pending: number }, asset: CryptoAsset) => {
          return {
            disbursable: acc.disbursable + (asset?.disbursable || 0),
            pending: acc.pending + (asset?.pending || 0),
          };
        },
        { disbursable: 0, pending: 0 }
      );

      dispatch(setTotalDisbursable(totals.disbursable));
      dispatch(setTotalDisbursablePending(totals.pending));
      settotalDisbursable(Number(totals.disbursable));
      settotalDisbursablePending(Number(totals.pending));
    }

    if (WalletDetailsData) {
      dispatch(setWalletData(WalletDetailsData?.data));
    }
  }, [
    AllTransactionsSuccess,
    AllTransactions,
    CryptoBalanceSuccess,
    isSuccessWalletDetails,
  ]);

  useEffect(() => {
    if (AllTradesHistorySuccess) {
      setweb3TxLists([
        ...AllTradesHistory?.data?.nft_transactions,
        ...AllTradesHistory?.data?.trades,
      ]);
    }

    if (RecentContactsData) {
      handleContacts(RecentContactsData?.allContacts);
    }
  }, [AllTradesHistorySuccess, AllTradesHistory, isSuccessRecentContacts]);

  // console.log(
  //   JSON.stringify(walletData?.TransactionFees_persentage, null, 2),
  //   "AllTradesHistory"
  // );

  // console.log(JSON.stringify(tokens?.access, null, 2), "token");

  useEffect(() => {
    if (totalDisbursable || bankBalance) {
      dispatch(
        setCardSwitchDetails({
          ...CardSwitchDetails,
          balanceText: bankBalance?.bank_account?.usd,
          idText: walletData?.username,
        })
      );
    }
  }, [bankBalance, walletData]);

  // console.log("token =>", JSON.stringify(walletData, null, 2));

  // Dispatched all the data into Redux store
  useEffect(() => {
    if (AllBankAccounts && AllBankAccounts.length > 0) {
      dispatch(setBankLists(AllBankAccounts));
    }
    if (bankBalanceData && Object.keys(bankBalanceData).length > 0) {
      dispatch(setBankbalances(bankBalanceData));
    }
  }, [AllBankAccounts, bankBalanceData]);

  const [selectedGraph, setselectedGraph] = useState("Assets");

  // Create API hooks with automatic retries and caching
  const kycApi = useApiCall(uploadKYC);

  // Add this near other hooks at the top level of your NewDashboard component
  const memoizedAllocationLists = useMemo(
    () => alloCationLists,
    [alloCationLists]
  );

  // useEffect(() => {
  //   // Group all data fetch operations
  //   const fetchInitialData = async () => {
  //     if (!tokens && !tokens?.access) {
  //       // console.error("No access token available");
  //       return;
  //     }

  //     try {
  //       // console.log("Fetching initial dashboard data");

  //       // Create an array of promises with descriptive catch handlers
  //       const promises = [
  //         fetchKycStatus().catch((err) =>
  //           console.error("KYC status fetch failed:", err)
  //         ),
  //       ];

  //       // Execute all promises in parallel
  //       await Promise.allSettled(promises);
  //       // console.log("All initial data fetch operations completed");
  //     } catch (error) {
  //       console.error("Error loading dashboard data:", error);
  //     }
  //   };

  //   fetchInitialData();
  //   handlePin();
  // }, [tokens?.access]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        console.log("Back button pressed");
        return false; // Let it behave normally
      }
    );

    return () => backHandler.remove();
  }, []);

  // Separate effect for Plaid token which changes independently
  useEffect(() => {
    const fetchLinkToken = async () => {
      if (!tokens?.access) return;

      try {
        const response = await fetch(`${BASE_URL}kyc/link-token/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens?.access}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setLinkToken(data?.data?.link_token);
      } catch (err) {
        console.error("Error fetching link token:", err);
      }
    };

    fetchLinkToken();
  }, [tokens?.access]);

  // Initialize all balances as hidden on first load
  useEffect(() => {
    if (bankLists && bankLists.length > 0) {
      const initialHiddenState: Record<string, boolean> = {};

      bankLists.forEach((item: any) => {
        const accountId = item?.account_number ?? item?.account_id;
        if (accountId) {
          initialHiddenState[accountId] = true;
        }
      });

      setHiddenBalances(initialHiddenState);
    }
  }, [bankLists]);

  // Add refresh function to reload all data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      refetchAllBankAccounts();
      refetchBankBalanceData();
      refetchAllContacts();
      refetchAllTransactions();
      refetchAllTradesHistory();
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [tokens?.access]);

  // Define interfaces for better type safety
  interface CryptoAsset {
    assetType: string;
    disbursable: number;
    pending: number;
    name?: string;
    symbol?: string;
  }

  const handleReward = async (data: any) => {
    dispatch(setShowRedeemReward(false));
    redeemReward(
      {
        payload: { redeem: true },
        value: data?.data[0]?.id,
      },
      {
        onSuccess: async (data: any) => {
          setItem(STORAGE_KEYS.REDEEM_REWARD, JSON.stringify(false));
          refetchBankBalanceData();
          await queryClient.invalidateQueries(bankKeys.balance());
          await queryClient.refetchQueries(bankKeys.balance());
        },
        onError: (error: any) => {
          console.log("error =>", JSON.stringify(error.response, null, 2));
        },
      }
    );
  };

  const fetchKycStatus = async () => {
    try {
      const data = await kycApi.execute(tokens?.access);
      // console.log("data =>", data)
      if (data?.status === 400 || !data?.status) {
        // console.log("fetchKycStatus if")
        if (data?.title) {
          setisShowKYC(data?.title === "Identity suspended");
        } else {
          setisShowKYC(true);
        }
      } else {
        // console.log("fetchKycStatus esle")

        setisShowKYC(true);
      }
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setisShowKYC(false);
    }
  };

  const kycHandleUrl = async () => {
    dispatch(setShowLoader(true));
    try {
      const data = await uploadKYC(tokens?.access);
      // console.log(data, 'kycHandle');
      if (data?.data?.status === 400) {
        if (data?.data?.title === "Identity suspended") {
          dispatch(
            setErrorMsg(
              "Operation is forbidden. Custodial account is suspended"
            )
          );
        }
      } else {
        navigation.navigate(NAVIGATION_SCREENS.IN_APP_KYC_BROWSER, {
          url: data?.data?.url,
        });
      }
    } catch (error) {
      console.error("Error handling KYC URL:", error);
      dispatch(setErrorMsg("Failed to handle KYC URL"));
    } finally {
      dispatch(setShowLoader(false));
    }
  };

  const handleContacts = async (contactsData: any) => {
    try {
      if (!contactsData || !Array.isArray(contactsData)) {
        console.error("Could not find valid contacts data in response:");
        return;
      }

      const sampleContact = contactsData[0];

      const pendingRequestsField = sampleContact?.pending_requests
        ? "pending_requests"
        : sampleContact?.pendingRequests
        ? "pendingRequests"
        : null;

      if (!pendingRequestsField) {
        console.warn(
          "Could not determine pending requests field, using data as is"
        );
        setcontactLists(contactsData);
        return;
      }

      // Function to get earliest timestamp - adapted to work with variable field names
      const getEarliestTimestamp = (contact: any) => {
        const requests = contact[pendingRequestsField];
        if (!requests || !Array.isArray(requests) || requests.length === 0)
          return null;

        // Check if timestamp or created_at is used
        const timestampField = requests[0]?.timestamp
          ? "timestamp"
          : requests[0]?.created_at
          ? "created_at"
          : null;

        if (!timestampField) return null;

        try {
          return new Date(
            Math.min(
              ...requests.map((request) =>
                new Date(request[timestampField]).getTime()
              )
            )
          );
        } catch (err) {
          console.error("Error processing timestamps:", err);
          return null;
        }
      };

      // Sort contacts by timestamp
      const sortedContacts = [...contactsData].sort((a, b) => {
        const timestampA = getEarliestTimestamp(a);
        const timestampB = getEarliestTimestamp(b);

        if (timestampA === null && timestampB === null) return 0;
        if (timestampA === null) return 1;
        if (timestampB === null) return -1;
        return timestampA.getTime() - timestampB.getTime();
      });

      // console.log("Final sorted contacts:", sortedContacts);
      setcontactLists(sortedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleRothBank = async () => {
    try {
      dispatch(setShowLoader(true));
      const data = await addbankAccountRoth(
        { account_type: souceAccount.toLowerCase() },
        tokens?.access
      );
      // console.log(data?.data, 'royjir');
      if (data && data?.data && !data?.data?.error) {
        dispatch(setSuccessMsg("Bank Account Created Successfully"));
        dispatch(setShowLoader(false));
        setsouceAccount("");
        await queryClient.invalidateQueries(bankKeys.allAccounts());
        await queryClient.refetchQueries(bankKeys.allAccounts());
        // fetchBankAccounts();
      } else {
        dispatch(setErrorMsg(data?.data?.error ?? "Something went wrong"));
      }
    } catch (error) {
      console.log("error =>", error);
    } finally {
      dispatch(setShowLoader(false));
    }
  };

  const hasKey = (bank: any, key: any) => bank.some((obj: any) => key in obj);

  const handleOpenLink = useCallback(async () => {
    console.log(
      "!hasKey(bankLists, bank_type) =>",
      !hasKey(bankLists, "bank_type")
    );
    if (!hasKey(bankLists, "bank_type")) {
      try {
        dispatch(setShowLoader(true));
        const resp = await axios.get(`${BASE_URL}auth/url-external-account`, {
          headers: {
            Authorization: `Bearer ${tokens?.access}`, // ✅ this is the correct way to send auth header
          },
        });
        const { status, data } = resp?.data;
        if (status && data) {
          navigation.navigate(NAVIGATION_SCREENS.MX_CONNECT_WIDGET_SCREEN, {
            URL: data?.fortress_response.widgetUrl,
          });
        }
        // console.log("handleOpenLink =>", JSON.stringify(resp.data,null,2)); // Use .data to access response body
      } catch (e) {
        console.error("Error fetching external account URL:", e);
      } finally {
        dispatch(setShowLoader(false));
      }
    } else {
      // console.log("mxExternalAccountDetails =>", mxExternalAccountDetails)
      dispatch(setErrorMsg("External account aleardy found"));
    }
  }, [bankLists]);

  // Memoize contact see all navigation
  const onContactSeeALl = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.CONTACT_SCREEN, {
      isVisble3: isCrypto,
    });
  }, [navigation, isCrypto]);

  // Memoize expensive calculations and derived state
  const sortedTxLists = useMemo(() => {
    if (!txLists) return [];
    return [...txLists]
      .sort(
        (a, b) =>
          (new Date(b.created_at) as any) - (new Date(a.created_at) as any)
      )
      .slice(0, 5);
  }, [txLists]);

  const sortedWeb3TxLists = useMemo(() => {
    if (!web3TxLists) return [];
    return [...web3TxLists]
      .sort(
        (a, b) =>
          (new Date(b.timestamp) as any) - (new Date(a.timestamp) as any)
      )
      .slice(0, 5);
  }, [web3TxLists]);

  // Memoize banking data processing
  const processedBankAccounts = useMemo(() => {
    if (!bankLists) return [];

    return bankLists.map((item: any) => ({
      ...item,
      displayName: item?.bank_name ?? item?.name,
      accountType: item?.account_type ?? "Personal",
      address: item?.bank_address ?? item?.official_name,
      accountNumber: item?.account_number ?? item?.account_id,
      balance: item?.balances?.available
        ? item?.balances?.available
        : item?.account_type === "rothIra"
        ? bankBalance?.roth_ira_account?.usd
        : item?.account_type === "traditionalIra"
        ? bankBalance?.traditional_ira_account?.usd
        : bankBalance?.bank_account?.usd,
    }));
  }, [bankLists, bankBalance]);

  console.log("souceAccount =>", JSON.stringify(souceAccount, null, 2));

  const handleEyeClick = (account_id: string) => {
    if (pinScreenRef.current) {
      pinScreenRef.current.toggleBalanceVisibility(account_id);
    }
  };

  // Handle pin if it is not set then it will set in local stroage
  const handlePin = async () => {
    if (!tokens?.access) return;
    try {
      // First check if pins are available locally
      const pins = await getPin();

      if (pins) {
        // If pins are available locally, use them
        setshowPin(false);
        return;
      }

      // If pins are not available locally, fetch from server
      const data = await getPinFromSev(tokens?.access);

      if (data && data?.status) {
        await setPin(data?.data?.tpin);
        setshowPin(false);
      } else {
        console.log("No valid pin data received from server");
        setshowPin(true);
      }
    } catch (error) {
      console.error("Error retrieving pin:", error);
      setshowPin(true);
    }
  };

  return (
    <ScreenContainer
      style={{
        paddingHorizontal: 0,
      }}
    >
      {/* Modal container with high z-index */}
      <View
        style={{
          position: "absolute",
          zIndex: 9999,
          elevation: 9999,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isCardModalVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isCardModalVisible}
            onRequestClose={() => setisCardModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LazyBankModal
                isVisible={isCardModalVisible}
                onClose={() => setisCardModalVisible(false)}
                onCancel={() => {}}
              />
            </View>
          </Modal>
        )}
        {showAddAccountConfirmation && (
          <CommonModal
            isVisible={showAddAccountConfirmation}
            onClose={() => {
              setShowAddAccountConfirmation(false);
            }}
            containerStyle={{ justifyContent: "center", alignItems: "center" }}
          >
            {showAddAccountConfirmation && (
              <ConfirmationModalComponent
                onCancelPress={() => {
                  setShowAddAccountConfirmation(false);
                }}
                onConfirmPress={() => {
                  setShowAddAccountConfirmation(false);
                  handleRothBank();
                }}
                onBankSelect={setsouceAccount}
                selectedAccount={souceAccount}
                headerText={"Do you want to create ROTH IRA account?"}
                descriptionText={`($10 + ${walletData?.TransactionFees_persentage}% Transaction fee) will be charged to create ROTH IRA account`}
                amountText={"$10.1"}
              />
            )}
          </CommonModal>
        )}

        {isBankModalVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isBankModalVisible}
            onRequestClose={() => setisBankModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LazyBankModal2
                isVisible={isBankModalVisible}
                onClose={() => setisBankModalVisible(false)}
                onCancel={() => {}}
              />
            </View>
          </Modal>
        )}

        {isVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => setisVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <BalanceModal
                isVisible={isVisible}
                onClose={() => setisVisible(false)}
                onSelected={() => {
                  setisVisible(false);
                  navigation.navigate(SCREENS.Receive);
                }}
              />
            </View>
          </Modal>
        )}
        {showGuide && (
          <GuideModal
            isVisible={showGuide}
            onClose={() => {
              setItem(STORAGE_KEYS.GUIDE, JSON.stringify(false));
              dispatch(setShowGuide(false));
            }}
          />
        )}

        {isVisible2 && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible2}
            onRequestClose={() => setisVisible2(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LazySelectionModal
                isVisible={isVisible2}
                onClose={() => setisVisible2(false)}
                onSelected={() => {}}
                data={[]}
                type={"bank"}
              />
            </View>
          </Modal>
        )}

        {isShowWeeks && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isShowWeeks}
            onRequestClose={() => setisShowWeeks(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LazySelectionModal2
                isVisible={isShowWeeks}
                onClose={() => setisShowWeeks(false)}
                timeframe={timeframe}
                settimeframe={settimeframe}
              />
            </View>
          </Modal>
        )}

        {showRedeemReward && (
          <RewardModal
            isVisible={showRedeemReward}
            onClose={() => {
              handleReward(getRewardData);
            }}
          />
        )}

        {/* PIN Verification Modal */}
        <PinScreen
          ref={pinScreenRef}
          hiddenBalances={hiddenBalances}
          setHiddenBalances={setHiddenBalances}
        />
      </View>
      {
        <View
          style={{
            zIndex: 100,
            width: "100%",
            alignSelf: "center",
            backgroundColor: "black",
            borderRadius: 20,
            position: "absolute",
            bottom: -15,
          }}
        >
          <View
            style={{
              paddingVertical: 10,
              backgroundColor: "black",
              borderRadius: 20,
              position: "absolute",
              bottom: 20,
              zIndex: 100,
              width: "92%",
              alignSelf: "center",
            }}
          >
            <BottomNavigation isVer={true} />
          </View>
        </View>
      }

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.palette.green700]}
            tintColor={theme.colors.palette.green700}
          />
        }
        style={{
          flex: 1,
        }}
      >
        <DashboardHeader
          name={userName}
          style={{
            marginBottom: theme.spacing.spacing.md,
            marginHorizontal: 15,
          }}
        />

        {isShowKYC && (
          <View
            style={{
              backgroundColor: "#000",
              width: "95%",
              padding: 15,
              borderRadius: 15,
              alignSelf: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <SvgXml xml={SVGKYC2} />
              <Text
                style={{
                  color: "rgba(177, 177, 177, 1)",
                  fontFamily: Fonts.semibold,
                  fontSize: 14,
                  marginLeft: 10,
                }}
              >
                Your Second level KYC verification is pending.{" "}
                <TouchableOpacity onPress={kycHandleUrl}>
                  <Text style={{ color: "white", fontFamily: Fonts.bold }}>
                    {" "}
                    Verify Now!
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
            <SvgXml
              xml={SVGSliders}
              style={{ marginTop: 15, width: "80%", alignSelf: "center" }}
            />
          </View>
        )}
        {bankBalance?.bank_account?.usd == undefined ? (
          <CryptoCardSkeleton
            shimmerColor="rgba(255, 255, 255, 0.6)"
            baseColor="rgba(255, 255, 255, 0.2)"
            speed={1000}
            visible={true}
          />
        ) : (
          <DashboardCard />
        )}
        <View style={{ marginHorizontal: 15 }}>
          {/* {console.log("bankBalance?.bank_account?.usd", bankBalance) as any} */}
          {/* Use a consistent height container to prevent layout shifts */}
          {/* <View style={{ minHeight: 220 }}> */}
          {/* </View> */}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginVertical: 20,
            }}
          >
            <SvgXml
              xml={SVGSend}
              onPress={() => {
                navigation.navigate(
                  !isCrypto
                    ? NAVIGATION_SCREENS.SEND_TOKEN
                    : NAVIGATION_SCREENS.SEND,
                  {
                    requested: false,
                  }
                );
              }}
            />
            <SvgXml
              xml={SVGReceive}
              onPress={() =>
                navigation.navigate(
                  !isCrypto
                    ? NAVIGATION_SCREENS.RECEIVE_TOKEN
                    : NAVIGATION_SCREENS.RECEIVE
                )
              }
            />
            <SvgXml
              xml={!isCrypto ? SVGHolding : SVGAdd}
              style={{ marginBottom: 20 }}
              onPress={() => {
                if (!isCrypto) {
                  navigation.navigate("CryptoDashboard");
                } else {
                  navigation.navigate(
                    NAVIGATION_SCREENS.INTRA_ACCOUNT_TRANSFER
                  );
                }
              }}
            />
          </View>
        </View>
        <Card
          style={{
            backgroundColor: theme.colors.palette.white,
            borderWidth: 0,
            marginBottom: 80,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
          padding={10}
          borderRadius={theme.spacing.spacing[10]}
        >
          <View style={{ width: "100%", padding: 5 }}>
            {isCrypto && (
              <>
                <MemoizedDashboardSection
                  title="Your Accounts"
                  actionText="see all"
                  onActionPress={() => {
                    navigation.navigate(NAVIGATION_SCREENS.BANK_DETAILS, {
                      item: processedBankAccounts,
                      bankbalance: processedBankAccounts[0].balance,
                      index: 0,
                    });
                  }}
                >
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{}}
                    style={{ marginRight: 10 }}
                  >
                    {isLoadingAllBankAccounts ? (
                      // Show skeleton loading UI
                      <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                      </>
                    ) : (
                      processedBankAccounts.map((item: any, index: number) => (
                        <View
                          key={index}
                          style={{
                            backgroundColor: theme.colors.palette.grey100,
                            padding: 10,
                            width: 250,
                            borderRadius: 15,
                            marginRight: 10,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-start",
                              alignItems: "center",
                              width: "100%",
                              marginBottom: 10,
                            }}
                          >
                            {item.medium_logo_url ? (
                              <View>
                                <Image
                                  source={{ uri: item?.medium_logo_url }}
                                  style={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: 5,
                                    backgroundColor:
                                      theme.colors.palette.grey200,
                                  }}
                                />
                              </View>
                            ) : (
                              <SvgXml xml={SVGUSD} width={35} height={35} />
                            )}
                            <View style={{ flex: 1 }}>
                              <CustomText
                                variant={"subtitle2"}
                                fontWeight={"bold"}
                                fontFamily={
                                  theme.typography.fontFamily.nexaHeavy
                                }
                                style={{
                                  marginLeft: 5,
                                  marginTop: 2,
                                }}
                              >
                                {item.displayName}
                              </CustomText>
                              <View style={{ flexDirection: "row", flex: 1 }}>
                                <CustomText
                                  color={theme.colors.palette.grey600}
                                  fontFamily={
                                    theme.typography.fontFamily.nexaHeavy
                                  }
                                  style={{
                                    marginLeft: 5,
                                    marginTop: 2,
                                    fontSize: 14,
                                    fontWeight: "400",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {`${item?.account_type}`}
                                </CustomText>
                                <CustomText
                                  color={theme.colors.palette.grey600}
                                  fontFamily={
                                    theme.typography.fontFamily.nexaHeavy
                                  }
                                  style={{
                                    marginLeft: 5,
                                    marginTop: 2,
                                    fontSize: 14,
                                    fontWeight: "400",
                                    // textTransform: 'capitalize'
                                  }}
                                >
                                  {`( ${BANK_TYPE} )`}
                                </CustomText>
                              </View>
                            </View>
                          </View>
                          <CustomText
                            color={theme.colors.palette.grey600}
                            fontFamily={theme.typography.fontFamily.nexaHeavy}
                            style={{
                              marginLeft: 5,
                              marginTop: 2,
                              fontSize: 12,
                              fontWeight: "400",
                            }}
                          >
                            {item?.account_number
                              ? `${item.account_number.slice(
                                  0,
                                  2
                                )}XXXX${item.account_number.slice(-4)}`
                              : ""}
                          </CustomText>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: 5,
                                alignItems: "center",
                                flex: 1,
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                style={{
                                  color: "rgba(44, 106, 63, 1)",
                                  fontSize: 16,
                                  fontFamily: Fonts.bold,
                                  marginLeft: 5,
                                }}
                              >
                                {hiddenBalances[item.accountNumber]
                                  ? "$••••••"
                                  : `$${item.balance}`}
                              </Text>
                              {!hiddenBalances[item.accountNumber] ? (
                                <TouchableOpacity
                                  style={{ padding: 10 }}
                                  onPress={() =>
                                    handleEyeClick(item.accountNumber)
                                  }
                                >
                                  <SvgXml
                                    style={{ marginLeft: 10, top: 1 }}
                                    xml={SVG_eye_on}
                                    width={15}
                                    height={15}
                                  />
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={{ padding: 10 }}
                                  onPress={() =>
                                    handleEyeClick(item.accountNumber)
                                  }
                                >
                                  <SvgXml
                                    style={{ marginLeft: 10, top: 1 }}
                                    xml={SVG_eye_off}
                                    width={15}
                                    height={15}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>

                            <Text
                              onPress={() =>
                                navigation.navigate(
                                  NAVIGATION_SCREENS.BANK_DETAILS,
                                  {
                                    item: processedBankAccounts,
                                    bankbalance: item.balance,
                                    index: index,
                                  }
                                )
                              }
                              style={{
                                color: "rgba(106, 106, 106, 1)",
                                fontSize: 10,
                                fontFamily: Fonts.regular,
                                marginLeft: 5,
                                marginTop: 5,
                                textDecorationLine: "underline",
                              }}
                            >
                              View Details
                            </Text>
                          </View>
                        </View>
                      ))
                    )}
                    {/* <SvgXml
                      width={250}
                      height={130}
                      xml={SVGNewBank}
                      disabled={showLoader}
                      onPress={handleOpenLink}
                    /> */}
                    <AddAndLinkAcountCard
                      title={"LINK ACCOUNT"}
                      description={"Link your external account"}
                      buttonText={"Link Account"}
                      onAddPress={handleOpenLink}
                    />
                    <AddAndLinkAcountCard
                      title={"ADD ACCOUNT"}
                      description={"Add your ROTH IRA account"}
                      buttonText={"Add Account"}
                      onAddPress={() => {
                        setShowAddAccountConfirmation(true);
                      }}
                    />
                  </ScrollView>
                </MemoizedDashboardSection>
                {isCrypto && (
                  <MemoizedDashboardSection
                    title="PayAiro Contacts"
                    actionText="see all"
                    onActionPress={onContactSeeALl}
                  >
                    {isLoadingAllContacts ? (
                      // Skeleton loading for contacts
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-around",
                          marginVertical: 15,
                        }}
                      >
                        {[1, 2, 3, 4].map((_, index) => (
                          <View key={index} style={{ alignItems: "center" }}>
                            <View
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                backgroundColor: theme.colors.palette.grey200,
                              }}
                            />
                            <View
                              style={{
                                width: 40,
                                height: 12,
                                backgroundColor: theme.colors.palette.grey200,
                                borderRadius: 4,
                                marginTop: 8,
                              }}
                            />
                          </View>
                        ))}
                      </View>
                    ) : AllContacts && AllContacts?.allContacts.length > 0 ? (
                      <MemoizedStoryLists
                        data={AllContacts?.allContacts}
                        isVisble3={isCrypto}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(NAVIGATION_SCREENS.ADD_CONTACT)
                        }
                        style={{
                          backgroundColor: "rgba(44, 106, 63, 1)",
                          paddingBottom: 10,
                          paddingTop: 7,
                          paddingHorizontal: 10,
                          borderRadius: 30,
                          alignSelf: "center",
                          marginTop: 20,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontFamily: Fonts.semibold,
                          }}
                        >
                          + Add People
                        </Text>
                      </TouchableOpacity>
                    )}
                  </MemoizedDashboardSection>
                )}
              </>
            )}
            {isCrypto && <CryptoFinanceSection navigation={navigation} />}
            {!isCrypto && (
              <FiatGraphSection
                selectedGraph={selectedGraph}
                setselectedGraph={setselectedGraph}
                alloCationLists={alloCationLists}
                memoizedAllocationLists={memoizedAllocationLists}
              />
            )}

            {isCrypto && sortedTxLists.length > 0 && (
              <MemoizedDashboardSection
                title="Recent Transactions"
                // style={{ marginBottom: 120 }}
                onActionPress={() => {}}
              >
                {isLoadingAllTransactions ? (
                  // Skeleton loading for transactions
                  <>
                    <SkeletonTransactionCard />
                    <SkeletonTransactionCard />
                    <SkeletonTransactionCard />
                  </>
                ) : (
                  <>
                    {txLists &&
                      isCrypto &&
                      sortedTxLists.length > 0 &&
                      sortedTxLists.map((item: any, key: any) => (
                        <View key={key}>
                          <MemoizedTransactionCard
                            item={item}
                            key={key}
                            isMerchent={item?.order_id}
                            isCrypto={true}
                          />
                        </View>
                      ))}
                  </>
                )}
              </MemoizedDashboardSection>
            )}
            {!isCrypto && sortedWeb3TxLists.length > 0 && (
              <MemoizedDashboardSection
                title="Recent Transactions"
                onActionPress={() => {}}
              >
                {isLoadingAllTransactions ? (
                  // Skeleton loading for transactions
                  <>
                    <SkeletonTransactionCard />
                    <SkeletonTransactionCard />
                    <SkeletonTransactionCard />
                  </>
                ) : (
                  <>
                    {web3TxLists &&
                      !isCrypto &&
                      sortedWeb3TxLists.length > 0 &&
                      sortedWeb3TxLists.map((item: any, key: any) => (
                        <View key={key}>
                          <MemoizedTransactionCard
                            isCrypto={true}
                            item={item}
                            key={key}
                            isMerchent={item?.order_id}
                          />
                        </View>
                      ))}
                  </>
                )}
              </MemoizedDashboardSection>
            )}
            {!isCrypto && (
              <CryptoRWASection
                data={getRWACategory?.data}
                navigation={navigation}
              />
            )}
            {!isCrypto && filteredMyRWA.length > 0 && (
              <DashboardSection
                title="My RWA Assets"
                actionText="see all"
                onActionPress={() => {
                  navigation.navigate(NAVIGATION_SCREENS.MY_RWA_ASSETS, {});
                }}
              >
                <FlatList
                  horizontal
                  data={filteredMyRWA}
                  renderItem={({ item, index }) => (
                    <RealStateComponent
                      item={item}
                      type={VIEW_TYPE.owned}
                      key={index}
                    />
                  )}
                />
              </DashboardSection>
            )}
            {isCrypto && <CryptoRewardsSection />}
            {isCrypto && (
              <CryptoOtherServicesSection
                handleRothBank={handleRothBank}
                setisCardModalVisible={setisCardModalVisible}
                navigation={navigation}
              />
            )}
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

// Create styles with theme
const createStyles = (theme: any) =>
  StyleSheet.create({
    content: {
      flex: 1,
      // padding: theme.spacing.spacing.md,
    },
    title: {
      fontFamily: theme.typography.fontFamily.nexaHeavy,
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.card.background,
      borderRadius: 16,
      padding: theme.spacing.spacing.md,
      marginBottom: theme.spacing.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
      shadowColor: theme.colors.shadow.default,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    cardTitle: {
      fontFamily: theme.typography.fontFamily.montserrat,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.spacing.xs,
    },
    balanceText: {
      fontFamily: theme.typography.fontFamily.nexaHeavy,
      fontSize: theme.typography.fontSize.xxxl,
      color: theme.colors.palette.green700,
      marginBottom: theme.spacing.spacing.md,
    },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    actionButton: {
      backgroundColor: theme.colors.button.primary.background,
      paddingVertical: theme.spacing.spacing.xs,
      paddingHorizontal: theme.spacing.spacing.sm,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginHorizontal: theme.spacing.spacing.xs,
    },
    actionButtonText: {
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.button.primary.text,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.spacing.md,
    },
    themeToggleButton: {
      backgroundColor: theme.colors.button.secondary.background,
      padding: theme.spacing.spacing.sm,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginRight: theme.spacing.spacing.xs,
    },
    fontTestButton: {
      backgroundColor: theme.colors.button.secondary.background,
      padding: theme.spacing.spacing.sm,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginLeft: theme.spacing.spacing.xs,
    },
    themeToggleText: {
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.button.secondary.text,
    },
  });

// Export memoized component for better performance
export default React.memo(NewDashboard);

const array = [
  {
    title: "Modern Family Home",
    author: "John Elis",
    price_per_share: 30,
    growth: "5%",
    image_url:
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    title: "Luxury Villa with Pool",
    author: "John Elis",
    price_per_share: 30,
    growth: "5%",
    image_url:
      "https://images.pexels.com/photos/261146/pexels-photo-261146.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    title: "Downtown Apartment",
    author: "John Elis",
    price_per_share: 30,
    growth: "5%",
    image_url:
      "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
];
