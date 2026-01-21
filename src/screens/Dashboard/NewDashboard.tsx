import React, {
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
// Import from the module alias utility
import { useIsFocused, useNavigation } from "@react-navigation/native";
import axios from "axios";
import BalanceModal from "components/BalanceModal";
import BottomNavigation from "components/BottomNavigation";
import GuideModal from "components/GuideModal";
import Rewards from "components/Rewards";
import StoryLists from "components/StoryLists";
import TransactionCard from "components/TransactionCard";
import Fonts from "constants/Fonts";
import { SCREENS } from "constants/SCREENS";
import { REWARDS } from "constants/constant";
import { BASE_URL } from "constants/mockData";
import { SvgIcons } from "constants/svgs";
import { SvgUri } from "react-native-svg";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  bankKeys,
  useAddTraditionalIRABankAccount,
  useAllCryptoBalances,
  useBankBalances,
  useCryptoBalance,
  useDashBoardFiatData,
  useGetReward,
  useRedeemReward,
  useWalletDashboardData,
  userKeys,
  paymentRequestKeys,
} from "query/hooks";
import { queryClient } from "query/queryClient";
import DeviceInfo from "react-native-device-info";
import { useDispatch, useSelector } from "react-redux";
import { VIEW_TYPE } from "screens/TSX-Screens/RWA/RWA";
import { addbankAccountRoth, uploadKYC } from "services/Services";
import { STORAGE_KEYS, setItem } from "storage/mmkv";
import AddAndLinkAcountCard from "tsx-components/AddAndLinkAcountCard";
import ConfirmationModalComponent from "tsx-components/ConfirmationModalComponent";
import CryptoCardSkeleton from "tsx-components/CryptoCardSkeleton";
import DashboardCard from "tsx-components/DashboardCard";
import DashboardSection from "tsx-components/DashboardSection";
import FiatGraphSection from "tsx-components/FiatGraphSection";
import IconTextComponent from "tsx-components/IconTextComponent";
import RealStateComponent from "tsx-components/RealStateComponent";
import { renderUtilitiesIcons, size } from "tsx-components/components.configs";
import CommonModal from "tsx-components/modals/CommonModal";
import PinScreen from "tsx-components/modals/PinScreen";
import RewardModal from "tsx-components/modals/RewardModal";
import { ScreenContainer } from "../../HOC";
import {
  setBankLists,
  setBankbalances,
  setCybridBankbalances,
  setShowGuide,
  setShowLoader,
  setShowRedeemReward,
  setTotalDisbursable,
  setTotalDisbursablePending,
} from "../../redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../utils/toast";
import { useTheme } from "../../styles/ThemeContext";
import { Card, CustomText, DashboardHeader } from "../../utils/moduleAlias";
import useSelectorAction from "hooks/useSelectorAction";
import PlaidLinkButton from "tsx-components/PlaidLinkButton";
import { UnifiedTransactionCard } from "screens/TSX-Screens/UnifiedTransactions";
import ReferralCard from "tsx-components/ReferralCard";
import NewDashboardCard from "tsx-components/NewDashboardCard";

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
const BANK_TYPE = "";

// // API call utility with automatic retries, caching, and error handling
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
          await new Promise((resolve: any) =>
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
const MemoizedTransactionCard = React.memo(UnifiedTransactionCard);
const MemoizedRewards = React.memo(Rewards);
const MemoizedDashboardSection = React.memo(DashboardSection);

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
        {/* <MemoizedDashboardSection
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
            {renderUtilitiesIcons.map((item, index) => {
              const Icon = item?.IconName;
              return (
                <IconTextComponent label={item?.label} key={index}>
                  <Icon
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
              );
            })}
          </ScrollView>
        </MemoizedDashboardSection> */}
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          marginRight: 10,
        }}
      >
        {REWARDS.map((item, index) => (
          <MemoizedRewards key={index} item={item} />
        ))}
        {/* <MemoizedRewards
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
        /> */}
      </View>
    </MemoizedDashboardSection>
  );
});
// No props needed for this component
const CryptoRWASection = React.memo(({ data, navigation }: any) => {
  const { walletData } = useSelectorAction() as any;
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
        // if(walletData?.fortress){
        //   navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN);
        // } else {
        navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN);
        // }
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
          onPress={() => setisCardModalVisible(true)}
        >
          <SvgIcons.LinkDebitCard />
          <CustomText size={13} variant="button">
            Link Card
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
    bankBalance,
    walletData,
    tokens,
    bankLists,
    showRedeemReward,
    showGuide,
  } = useSelector((state: any) => state.authenticationSlice);

  const isTablet = DeviceInfo.isTablet();
  const { width: screenWidth } = useWindowDimensions();

  // console.log("is tablet =>", isTablet);
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
  const [
    showAddTraditionalAccountConfirmation,
    setShowAddTraditionalAccountConfirmation,
  ] = useState(false);
  const [hiddenBalances, setHiddenBalances] = useState<Record<string, boolean>>(
    {}
  );
  const [isMainCardBalanceVisible, setIsMainCardBalanceVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [souceAccount, setsouceAccount] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isBalanceRefreshing, setIsBalanceRefreshing] = useState(false);

  const focus = useIsFocused();

  // Get the bank accounts from the API with cache stoage and store them in Redux
  // const {
  //   data: AllBankAccounts,
  //   isLoading: isLoadingAllBankAccounts,
  //   error: allBankAccountsError,
  //   refetch: refetchAllBankAccounts,
  // } = useAllBankAccounts();

  // console.log(JSON.stringify(walletData, null, 2), "walletData");
  const { mutate: redeemReward } = useRedeemReward();
  const { data: getRewardData, isError, isSuccess } = useGetReward();

  const {
    data: DashBoardData,
    isError: isErrorDashBoardData,
    isSuccess: isSuccessDashBoardData,
    isPending: isDashBoardDataPending,
    isFetched: isDashBoardDataFetched,
    refetch: refetchDashBoardFiatData,
  } = useDashBoardFiatData();

  const {
    mutate: handleTraditionalIRABankAccountt,
    isPending: isPendingTraditionalIRABankAccount,
    isSuccess: isSuccessTraditionalIRABankAccount,
  } = useAddTraditionalIRABankAccount();

  const {
    data: WalletDashboardData,
    isError: isErrorWalletDashboardData,
    isSuccess: isSuccessWalletDashboardData,
    isPending: isWalletDashboardDataPending,
    isFetched: isWalletDashboardDataFetched,
    refetch: refectWalletDashboardData,
  } = useWalletDashboardData();

  const { data, isLoading, error, refetch } = useAllCryptoBalances();
  const balances = data?.data?.balances || [];
  // console.log("balances =>", JSON.stringify(data, null, 2));

  // const {
  //   data: getRWAList,
  //   isError: isErrorRWAListA,
  //   isSuccess: isSuccessRWAList,
  // } = useGetUserHoldings();
 
  const filteredMyRWA =
    WalletDashboardData?.data?.holdings.filter(
      (item: any) => item.asset_type == "Realestate"
    ) ?? [];

  // console.log("DashBoardData =>", JSON.stringify(DashBoardData, null, 2));
  // console.log("token =>", tokens.access);

  const {
    data: bankBalanceData,
    isLoading: isLoadingBankBalanceData,
    error: bankBalanceDataError,
    refetch: refetchBankBalanceData,
    isFetched: isBankBalanceDataFetched,
    isSuccess: isBankBalanceDataSuccess,
  } = useBankBalances();

  const {
    data: CryptoBalance,
    isLoading: isLoadingCryptoBalances,
    error: CryptoBalanceError,
    isSuccess: CryptoBalanceSuccess,
    refetch: refetchCryptoBalance,
  } = useCryptoBalance();

  useEffect(() => {
    if (pinScreenRef.current) {
      pinScreenRef.current?.onClose();
    }

    if (CryptoBalance) {
      const cryptoAssets = (CryptoBalance as any)?.data?.data;

      // console.log("cryptoAssets =>", JSON.stringify(cryptoAssets, null, 2));
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
  }, [CryptoBalanceSuccess]);

  useEffect(() => {
    if (
      !isErrorWalletDashboardData &&
      isWalletDashboardDataFetched &&
      isSuccessWalletDashboardData &&
      WalletDashboardData?.data?.transactions
    ) {
      setweb3TxLists((WalletDashboardData?.data?.transactions || []) as any);
    }
  }, [
    WalletDashboardData,
    isWalletDashboardDataFetched,
    isErrorWalletDashboardData,
    isSuccessWalletDashboardData,
  ]);

  console.log(JSON.stringify(tokens?.access, null, 2), "token");

  // Dispatched all the data into Redux store
  useEffect(() => {
    if (
      isBankBalanceDataFetched &&
      isBankBalanceDataSuccess &&
      bankBalanceData &&
      typeof bankBalanceData === "object" &&
      !Array.isArray(bankBalanceData) &&
      Object.keys(bankBalanceData).length > 0
    ) {
      dispatch(setBankbalances(bankBalanceData));
    }
  }, [isBankBalanceDataFetched, isBankBalanceDataSuccess]);

  // useEffect(() => {
  //   if (
  //     isCybridBankBalancesFetched &&
  //     isCybridBankBalancesSuccess &&
  //     Object.keys(CybridBankBalances).length > 0
  //   ) {
  //     dispatch(setCybridBankbalances(CybridBankBalances));
  //   }
  // }, [isCybridBankBalancesFetched, isCybridBankBalancesSuccess]);

  useEffect(() => {
    if (
      !isErrorDashBoardData &&
      isDashBoardDataFetched &&
      DashBoardData?.data.bank
    ) {
      dispatch(
        setBankLists([
          ...(DashBoardData?.data?.bank?.bank_accounts || []),
          ...(DashBoardData?.data?.bank?.roth_ira_accounts || []),
          ...(DashBoardData?.data?.bank?.traditional_ira_accounts || []),
          ...(DashBoardData?.data?.bank?.external_accounts || []),
          ...(DashBoardData?.data?.bank?.cybrid_accounts || []),
        ])
      );
    }

    if (
      !isErrorDashBoardData &&
      isDashBoardDataFetched &&
      DashBoardData?.data?.transactions
    ) {
      settxLists(
        [...(DashBoardData?.data?.transactions?.latestCombined || [])].filter(
          (i) => i?.status === "success" || i?.status === "completed"
        ) ?? []
      );
    }
  }, [isDashBoardDataFetched, DashBoardData]);

  const [selectedGraph, setselectedGraph] = useState("Assets");

  // Create API hooks with automatic retries and caching
  // const kycApi = useApiCall(uploadKYC);

  // Add this near other hooks at the top level of your NewDashboard component
  const memoizedAllocationLists = useMemo(
    () => alloCationLists,
    [alloCationLists]
  );

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

    // fetchLinkToken();
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
      // ✅ Refresh bank balance (for NewDashboardCard in Fiat mode)
      refetchBankBalanceData();
      
      // ✅ Refresh aggregated crypto balances (for NewDashboardCard in Crypto mode)
      refetch();
      
      // ✅ Refresh pending payment requests (for BottomNavigation badge count)
      queryClient.invalidateQueries({ queryKey: paymentRequestKeys.pending() });
      
      // Refresh other dashboard data
      refetchDashBoardFiatData();
      refectWalletDashboardData();
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [tokens?.access, refetchBankBalanceData, refetch, refetchDashBoardFiatData, refectWalletDashboardData]);

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
      // const data = await kycApi.execute(tokens?.access);
      // console.log("data =>", data)
      // if (data?.status === 400 || !data?.status) {
      //   // console.log("fetchKycStatus if")
      //   if (data?.title) {
      //     setisShowKYC(data?.title === "Identity suspended");
      //   } else {
      //     setisShowKYC(true);
      //   }
      // } else {
      //   // console.log("fetchKycStatus esle")
      //   setisShowKYC(true);
      // }
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setisShowKYC(false);
    }
  };

  const handleCreateTraditionalIRAAccount = () => {
    dispatch(setShowLoader(true));
    const formdata = new FormData();
    formdata.append("account_type", souceAccount.toLowerCase());
    handleTraditionalIRABankAccountt(formdata as any, {
      onSuccess: async (data) => {
        showSuccess("Bank Account Created Successfully");
        setsouceAccount("");
        await queryClient.invalidateQueries({
          queryKey: userKeys.fiatDashboard(),
        });
        await queryClient.refetchQueries({
          queryKey: userKeys.fiatDashboard(),
        });
      },
      onError: (error: any) => {
        console.log(
          "Error adding Traditional IRA Bank Account:",
          JSON.stringify(error, null, 2)
        );
      },
      onSettled: () => {
        dispatch(setShowLoader(false));
        setsouceAccount("");
      },
    });
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
        showSuccess("Bank Account Created Successfully");
        dispatch(setShowLoader(false));
        setsouceAccount("");
        await queryClient.invalidateQueries({
          queryKey: userKeys.fiatDashboard(),
        });
        await queryClient.refetchQueries({
          queryKey: userKeys.fiatDashboard(),
        });
        // fetchBankAccounts();
      } else {
        showError(data?.data?.error ?? "Something went wrong");
      }
    } catch (error) {
      console.log("error =>", error);
    } finally {
      dispatch(setShowLoader(false));
    }
  };

  const hasKey = (bank: any, key: any) => bank.some((obj: any) => key in obj);

  const handleOpenLink = useCallback(async () => {
    // console.log(
    //   "!hasKey(bankLists, bank_type) =>",
    //   !hasKey(bankLists, "bank_type")
    // );
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
      showError("External account aleardy found");
    }
  }, [bankLists]);

  // Memoize contact see all navigation
  const onContactSeeALl = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.CONTACT_SCREEN, {
      isVisble3: isCrypto,
    });
  }, [navigation, isCrypto]);

  const onRewardSeeALl = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.REWARDS);
  }, [navigation]);

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
    if (!web3TxLists || !Array.isArray(web3TxLists)) return [];
    return [...web3TxLists]
      .sort(
        (a, b) =>
          (new Date(b.timestamp) as any) - (new Date(a.timestamp) as any)
      )
      .slice(0, 5);
  }, [web3TxLists]);

  // console.log("DashBoardData =>", JSON.stringify(DashBoardData, null, 2));
  // console.log("bankLists =>", JSON.stringify(bankLists, null, 2));

  // Memoize banking data processing
  const processedBankAccounts = useMemo(() => {
    if (!bankLists || !Array.isArray(bankLists)) return [];

    return bankLists
      .filter((item: any) => item && typeof item === "object")
      .map((item: any) => ({
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
      })).reverse();
  }, [bankLists, bankBalance]);

  //  console.log("processedBankAccounts =>", JSON.stringify(processedBankAccounts, null, 2));

  const handleEyeClick = (account_id: string) => {
    setHiddenBalances((prev: Record<string, boolean>) => ({
      ...prev,
      [account_id]: !prev[account_id],
    }));
  };

  // Handler for main card balance visibility with PIN verification
  const handleMainCardBalanceVisibility = () => {
    if (!isMainCardBalanceVisible) {
      // Balance is hidden, trigger PIN verification
      if (pinScreenRef.current) {
        pinScreenRef.current.checkUserPin();
        // After PIN verification, we'll show the balance
        // This will be handled by listening to PIN success
      }
    } else {
      // Balance is visible, just hide it
      setIsMainCardBalanceVisible(false);
    }
  };

  // Handler for refreshing balance data when eye icon is clicked to show balance
  const handleRefreshBalance = useCallback(async () => {
    setIsBalanceRefreshing(true);
    try {
      // Create an array of promises to execute in parallel
      const refreshPromises: Promise<any>[] = [];

      // Refresh bank balance (for PayAiro/Fiat mode - isCrypto = true)
      if (isCrypto) {
        refreshPromises.push(refetchBankBalanceData());
      }
      
      // Refresh crypto balances (for Crypto mode - isCrypto = false)
      if (!isCrypto) {
        refreshPromises.push(refetch());
      }

      // Wait for all promises to complete
      await Promise.all(refreshPromises);
    } catch (error) {
      console.log("Error refreshing balance data:", error);
    } finally {
      setIsBalanceRefreshing(false);
    }
  }, [isCrypto, refetchBankBalanceData, refetch]);

  const isPendingTransactions = () => {
    setTimeout(() => {
      setIsPending(true);
    }, 2000);
  };

  // Render function for crypto asset items
  const renderCryptoAssetItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const {
      asset,
      rounded_balance,
      platform_available,
      platform_pending,
      platform_total_balance,
      usd_value_total,
      usd_value_available,
      usd_value_pending,
      usd_price,
      logo,
    } = item;

    // Use new field names with fallback for backward compatibility
    const availableBalance = platform_available ?? 0;
    const pendingBalance = platform_pending ?? 0;
    const totalBalance = platform_total_balance ?? rounded_balance ?? 0;
    const usdValue = usd_value_total ?? usd_value_available ?? 0;

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: "white",
          marginVertical: 2,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#f0f0f0",
        }}
        onPress={() => {
          // Navigate to crypto details or trading screen
          if(item?.asset != 'Bank Balance'){
            navigation.navigate(NAVIGATION_SCREENS.CRYPTO_DETAILS,{ item: item });
          }
        }}
      >
        {/* Crypto Logo */}
        <View style={{ width: 40, height: 40, marginRight: 12 }}>
          {(() => {
            const logoUri = logo as string | undefined;
            const isValidLogo =
              typeof logoUri === "string" && logoUri.trim().length > 0;
            const isSvgLogo =
              isValidLogo &&
              (logoUri!.toLowerCase().endsWith(".svg") ||
                logoUri!.toLowerCase().includes("svg+xml"));

            if (!isValidLogo) {
              return <SvgIcons.DollarIcon width={40} height={40} />;
            }

            return (
              <View style={{ width: 40, height: 40 }}>
                {isSvgLogo ? (
                  <SvgUri uri={logoUri!} width={40} height={40} />
                ) : (
                  <Image
                    source={{ uri: logoUri! }}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                )}
              </View>
            );
          })()}
        </View>

        {/* Crypto Info */}
        <View style={{ flex: 1 }}>
          <CustomText variant="subtitle2" style={{ fontWeight: "600" }}>
            {asset}
          </CustomText>
          <CustomText variant="caption" color="grey">
            Available Balance: {availableBalance}
          </CustomText>
          <CustomText variant="caption" color="grey">
            Pending Balance: {pendingBalance}
          </CustomText>
        </View>

        {/* USD Value */}
        <View style={{ alignItems: "flex-end" }}>
          <CustomText variant="subtitle2" style={{ fontWeight: "600" }}>
            ${typeof usdValue === 'number' ? usdValue.toFixed(2) : "0.00"}
          </CustomText>
          <CustomText variant="caption" color="grey">
            USD
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer
      style={{
        paddingHorizontal: 0,
      }}
    >
      {/*
       <Button
        title="Go to Result"
        onPress={() => {
          // Handle navigation to result screen
          setShowResultModal(true);
          isPendingTransactions();
        }}
      />
      <CommonModal
        isVisible={showResultModal}
        onClose={() => setShowResultModal(false)}
      >
        <ResultModal
          isPending={isPending}
          onClose={() => {
            setShowResultModal(false);
            setIsPending(false);
          }}
          data={dummyData}
        />
      </CommonModal> */}
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
        {showAddTraditionalAccountConfirmation && (
          <CommonModal
            isVisible={showAddTraditionalAccountConfirmation}
            onClose={() => {
              setShowAddTraditionalAccountConfirmation(false);
            }}
            containerStyle={{ justifyContent: "center", alignItems: "center" }}
          >
            {showAddTraditionalAccountConfirmation && (
              <ConfirmationModalComponent
                onCancelPress={() => {
                  setShowAddTraditionalAccountConfirmation(false);
                }}
                onConfirmPress={() => {
                  setShowAddTraditionalAccountConfirmation(false);
                  handleCreateTraditionalIRAAccount();
                }}
                onBankSelect={setsouceAccount}
                selectedAccount={souceAccount}
                headerText={"Do you want to create TRADITIONAL \nIRA account?"}
                descriptionText={`($10 + ${walletData?.TransactionFees_persentage}% Transaction fee) will be charged to create TRADITIONAL IRA account`}
                amountText={"$10.1"}
              />
            )}
          </CommonModal>
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
          onAction={(data) => {
            // When PIN verification succeeds (for CHECK_PIN task), show the main card balance
            if (data === null) {
              setIsMainCardBalanceVisible(true);
            }
          }}
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
            bottom: -17,
          }}
        >
          {/* <View
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
             */}
            <BottomNavigation isVer={false} />
          {/* </View> */}
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

        {/* {isShowKYC && (
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
        )} */}

        {isDashBoardDataPending ? (
          <CryptoCardSkeleton
            shimmerColor="rgba(255, 255, 255, 0.6)"
            baseColor="rgba(255, 255, 255, 0.2)"
            speed={1000}
            visible={true}
          />
        ) : (
          <View style={{ width: "100%" }}>
            <NewDashboardCard 
              isBalanceVisible={isMainCardBalanceVisible}
              onRefreshBalance={handleRefreshBalance}
              isRefreshing={isBalanceRefreshing}
            />
          </View>
        )}
        {isCrypto ? (
          <View style={{ marginHorizontal: 15 }}>
            {(() => {
              // Calculate responsive sizes based on screen width
              const horizontalPadding = 30; // 15 * 2 (left + right margins)
              const iconSpacing = screenWidth < 350 ? 8 : 12; // Smaller spacing on small devices
              const numberOfIcons = 4;
              const availableWidth = screenWidth - horizontalPadding;
              const totalSpacing = iconSpacing * (numberOfIcons - 1);
              const iconContainerWidth =
                (availableWidth - totalSpacing) / numberOfIcons;
              const iconSize = Math.min(iconContainerWidth * 0.4, 30); // Icon size proportional to container, max 30
              const iconBackgroundSize = Math.min(
                iconContainerWidth * 0.73,
                55
              ); // Background size proportional to container, max 55
              const iconBackgroundHeight = Math.min(
                iconBackgroundSize * 0.73,
                40
              ); // Height proportional to width

              return (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginVertical: 20,
                  }}
                >
                  <TouchableOpacity
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
                    style={{
                      width: iconContainerWidth,
                      alignItems: "center",
                      borderRadius: 10,
                      height: 80,
                      marginRight: iconSpacing,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.palette.green150,
                        width: iconBackgroundSize,
                        height: iconBackgroundHeight,
                        borderRadius: iconBackgroundHeight / 2,
                        marginBottom: 10,
                      }}
                    >
                      <SvgIcons.MoneySendIcon
                        width={iconSize - 5}
                        height={iconSize - 5}
                      />
                    </View>
                    <CustomText size={11}>Send</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        !isCrypto
                          ? NAVIGATION_SCREENS.RECEIVE_TOKEN
                          : NAVIGATION_SCREENS.RECEIVE
                      )
                    }
                    style={{
                      width: iconContainerWidth,
                      alignItems: "center",
                      borderRadius: 10,
                      height: 80,
                      marginRight: iconSpacing,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.palette.green150,
                        width: iconBackgroundSize,
                        height: iconBackgroundHeight,
                        borderRadius: iconBackgroundHeight / 2,
                        marginBottom: 10,
                      }}
                    >
                      <SvgIcons.MoneyReciveIcon
                        width={iconSize - 5}
                        height={iconSize - 5}
                      />
                    </View>
                    <CustomText size={11}>Request</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (walletData?.fortress) {
                        if (!isCrypto) {
                          navigation.navigate("CryptoDashboard");
                        } else {
                          navigation.navigate(NAVIGATION_SCREENS.ADD_BALANCE);
                        }
                      } else {
                        navigation.navigate(NAVIGATION_SCREENS.ADD_BALANCE);
                      }
                    }}
                    style={{
                      width: iconContainerWidth,
                      alignItems: "center",
                      borderRadius: 10,
                      height: 80,
                      marginRight: iconSpacing,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.palette.green150,
                        width: iconBackgroundSize,
                        height: iconBackgroundHeight,
                        borderRadius: iconBackgroundHeight / 2,
                        marginBottom: 10,
                      }}
                    >
                      <SvgIcons.AddWallet
                        width={iconSize - 5}
                        height={iconSize - 5}
                      />
                    </View>
                    <CustomText size={11}>Add Balance</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate(NAVIGATION_SCREENS.WITHDRAW_BALANCE);
                    }}
                    style={{
                      width: iconContainerWidth,
                      alignItems: "center",
                      borderRadius: 10,
                      height: 80,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.palette.green150,
                        width: iconBackgroundSize,
                        height: iconBackgroundHeight,
                        borderRadius: iconBackgroundHeight / 2,
                        marginBottom: 10,
                      }}
                    >
                      <SvgIcons.DebitCard
                        width={iconSize + 20}
                        height={iconSize + 20}
                      />
                    </View>
                    <CustomText size={11}>Withdraw</CustomText>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        ) : (
          <View style={{ marginHorizontal: 15 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                marginVertical: 20,
              }}
            >
              <SvgIcons.SendAndReceive
                style={{ marginRight: 15 }}
                onPress={() => {
                  // if (walletData?.fortress) {
                  //   navigation.navigate(NAVIGATION_SCREENS.SEND_TOKEN, {
                  //     requested: false,
                  //   });
                  // } else {
                  navigation.navigate(NAVIGATION_SCREENS.SEND_AND_RECEIVE);
                  // }
                }}
              />
              <SvgIcons.BuyAndSell
                style={{ marginRight: 15 }}
                onPress={
                  () => {
                    if (walletData?.fortress) {
                      navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN);
                    } else {
                      navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN);
                    }
                  }
                  // navigation.navigate(
                  //   !isCrypto
                  //     ? NAVIGATION_SCREENS.RECEIVE_TOKEN
                  //     : NAVIGATION_SCREENS.RECEIVE
                  // )
                }
              />
              {/* {!walletData?.fortress ? (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(NAVIGATION_SCREENS.COMING_SOON, {
                      title: "RWA Holdings",
                    });
                  }}
                  style={[
                    {
                      width: 179,
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      gap: 10,
                      alignItems: "center",
                      backgroundColor: theme.colors.palette.green700,
                      padding: 5,
                      borderRadius: theme.spacing.spacing[10],
                      marginRight: 15,
                      marginBottom: 20,
                      // marginVertical:10
                    },
                  ]}
                >
                  <SvgIcons.RWAHoldings />
                  <CustomText
                    variant={"body2"}
                    size={13}
                    fontWeight={"semiBold"}
                    color={theme.colors.palette.white}
                  >
                    RWA Holdings
                  </CustomText>
                </TouchableOpacity>
              ) : (
                <SvgIcons.IRAHoldings
                  // xml={!isCrypto ? SVGHolding : SVGAdd}
                  style={{ marginBottom: 20 }}
                  onPress={() => {
                    if (walletData?.fortress) {
                      navigation.navigate(NAVIGATION_SCREENS.IRA_HOLDING);
                    } else {
                    }
                  }}
                />
              )} */}
              {walletData?.fortress && (
                <SvgIcons.IRAHoldings
                  // xml={!isCrypto ? SVGHolding : SVGAdd}
                  style={{ marginBottom: 20 }}
                  onPress={() => {
                    if (walletData?.fortress) {
                      navigation.navigate(NAVIGATION_SCREENS.IRA_HOLDING);
                    } else {
                    }
                  }}
                />
              )}
            </View>
          </View>
        )}
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
                      bankbalance: processedBankAccounts[0]?.balance,
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
                    {isDashBoardDataPending ? (
                      // Show skeleton loading UI
                      <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                      </>
                    ) : (
                      processedBankAccounts
                        .map((item: any, index: number) => (
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
                                <SvgIcons.DollarIcon width={35} height={35} />
                              )}
                              <View style={{ flex: 1 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
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
                                  {item?.account_status && (
                                    <View
                                      style={{
                                        backgroundColor: theme.colors.palette.green700,
                                        padding: 5,
                                        paddingHorizontal: 10,
                                        borderRadius: 10,
                                      }}
                                    >
                                      <CustomText color={theme.colors.palette.white} fontWeight={"bold"} fontFamily={theme.typography.fontFamily.nexaHeavy} style={{ fontSize: 12 }}>
                                        {item?.account_status}
                                      </CustomText>
                                    </View>
                                  )}
                                </View>
                                {item?.account_type && (
                                  <View
                                    style={{ flexDirection: "row", flex: 1 }}
                                  >
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
                                      {``}
                                      {/* {`( ${BANK_TYPE} )`} */}
                                    </CustomText>
                                  </View>
                                )}
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
                              {item?.bank_type !== "external" ? (
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
                                      <SvgIcons.EyeOnGreenbg
                                        style={{ marginLeft: 10, top: 1 }}
                                        // xml={SVG_eye_on}
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
                                      <SvgIcons.EyeOffGreenbg
                                        style={{ marginLeft: 10, top: 1 }}
                                        width={15}
                                        height={15}
                                      />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              ) : (
                                <View style={{ flex: 1 }} />
                              )}
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
                                {item?.account_type == "external"
                                  ? ""
                                  : "View Details"}
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
                    {walletData?.fortress ? (
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <AddAndLinkAcountCard
                          title={"LINK ACCOUNT"}
                          description={"Link your external account"}
                          buttonText={"Link Account"}
                          onAddPress={handleOpenLink}
                        />
                        <AddAndLinkAcountCard
                          title={"ADD ACCOUNT"}
                          description={"Add your TRADITIONAL IRA account"}
                          buttonText={"Add Account"}
                          onAddPress={() => {
                            setShowAddTraditionalAccountConfirmation(true);
                          }}
                        />
                        <AddAndLinkAcountCard
                          title={"ADD ACCOUNT"}
                          description={"Add your ROTH IRA account"}
                          buttonText={"Add Account"}
                          onAddPress={() => {
                            setShowAddAccountConfirmation(true);
                          }}
                        />
                      </View>
                    ) : (
                      <PlaidLinkButton
                        onSuccess={() => {
                          console.log("Plaid link successful");
                        }}
                        onCancel={() => {
                          console.log("Plaid link cancelled");
                        }}
                      />
                    )}
                  </ScrollView>
                </MemoizedDashboardSection>
                {isCrypto && (
                  <MemoizedDashboardSection
                    title="PayAiro Contacts"
                    actionText="see all"
                    onActionPress={onContactSeeALl}
                  >
                    {isDashBoardDataPending ? (
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
                    ) : DashBoardData?.data?.contacts &&
                      DashBoardData?.data?.contacts.length > 0 ? (
                      <MemoizedStoryLists
                        data={DashBoardData?.data?.contacts}
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
                          + Add Contact
                        </Text>
                      </TouchableOpacity>
                    )}
                  </MemoizedDashboardSection>
                )}
                {isCrypto && (
                  <MemoizedDashboardSection
                    title="Rewards & Referrals"
                    actionText="see all"
                    onActionPress={onRewardSeeALl}
                    contentContainerStyle={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {REWARDS.map((item, index) => (
                      <MemoizedRewards key={index} item={item} />
                    ))}
                  </MemoizedDashboardSection>
                )}
              </>
            )}
            {isCrypto && <CryptoFinanceSection navigation={navigation} />}
            {/* {!isCrypto && (
              <FiatGraphSection
                selectedGraph={selectedGraph}
                setselectedGraph={setselectedGraph}
                alloCationLists={alloCationLists}
                memoizedAllocationLists={memoizedAllocationLists}
              />
            )} */}
            {!isCrypto && (
              <DashboardSection title="Assets">
                {isLoading ? (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#2F6B3B" />
                    <CustomText variant="caption" style={{ marginTop: 8 }}>
                      Loading assets...
                    </CustomText>
                  </View>
                ) : balances.length > 0 ? (
                  <FlatList
                    data={balances}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderCryptoAssetItem}
                    keyExtractor={(item, index) => `${item?.asset}-${index}`}
                    scrollEnabled={false}
                  />
                ) : (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <CustomText variant="caption" color="grey">
                      No crypto assets found
                    </CustomText>
                  </View>
                )}
              </DashboardSection>
            )}

            {isCrypto && sortedTxLists.length > 0 && (
              <MemoizedDashboardSection
                title="Recent Transactions"
                // style={{ marginBottom: 120 }}
                onActionPress={() => {}}
              >
                {isDashBoardDataPending ? (
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
                            transaction={item}
                            key={key}
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
                {isDashBoardDataPending ? (
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
                            transaction={item}
                            key={key}
                          />
                        </View>
                      ))}
                  </>
                )}
              </MemoizedDashboardSection>
            )}
            {walletData?.fortress && !isCrypto && (
              <CryptoRWASection
                data={WalletDashboardData?.data?.icon}
                navigation={navigation}
              />
            )}
            {walletData?.fortress && !isCrypto && filteredMyRWA.length > 0 && (
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
            <ReferralCard />
            {/* {isCrypto && <CryptoRewardsSection />} */}
            {/* {isCrypto && (
              <CryptoOtherServicesSection
                handleRothBank={handleRothBank}
                setisCardModalVisible={setisCardModalVisible}
                navigation={navigation}
              />
            )} */}
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
