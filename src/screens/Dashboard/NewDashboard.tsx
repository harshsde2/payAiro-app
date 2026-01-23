import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  ActivityIndicator,
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
  useWindowDimensions,
} from "react-native";
// Import from the module alias utility
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import GuideModal from "components/GuideModal";
import Rewards from "components/Rewards";
import StoryLists from "components/StoryLists";
import Fonts from "constants/Fonts";
import { REWARDS } from "constants/constant";
import { BASE_URL } from "constants/mockData";
import { SvgIcons } from "constants/svgs";
import useSelectorAction from "hooks/useSelectorAction";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  bankKeys,
  paymentRequestKeys,
  useAddTraditionalIRABankAccount,
  useAllCryptoBalances,
  useBankBalances,
  useCryptoBalance,
  useDashBoardFiatData,
  useGetReward,
  useRedeemReward,
  useWalletDashboardData,
  userKeys,
} from "query/hooks";
import { queryClient } from "query/queryClient";
import DeviceInfo from "react-native-device-info";
import { useDispatch, useSelector } from "react-redux";
import { VIEW_TYPE } from "screens/TSX-Screens/RWA/RWA";
import { UnifiedTransactionCard } from "screens/TSX-Screens/UnifiedTransactions";
import { addbankAccountRoth } from "services/Services";
import { STORAGE_KEYS, setItem } from "storage/mmkv";
import ConfirmationModalComponent from "tsx-components/ConfirmationModalComponent";
import CryptoCardSkeleton from "tsx-components/CryptoCardSkeleton";
import DashboardSection from "tsx-components/DashboardSection";
import IconTextComponent from "tsx-components/IconTextComponent";
import NewDashboardCard from "tsx-components/NewDashboardCard";
import PlaidLinkButton from "tsx-components/PlaidLinkButton";
import ReferralCard from "tsx-components/ReferralCard";
import { size } from "tsx-components/components.configs";
import CommonModal from "tsx-components/modals/CommonModal";
import PinScreen from "tsx-components/modals/PinScreen";
import RewardModal from "tsx-components/modals/RewardModal";
import { ScreenContainer } from "../../HOC";
import {
  setBankLists,
  setBankbalances,
  setShowGuide,
  setShowLoader,
  setShowRedeemReward,
  setTotalDisbursable,
  setTotalDisbursablePending
} from "../../redux/slices/authenticationSlice";
import { useTheme } from "../../styles/ThemeContext";
import { Card, CustomText, DashboardHeader } from "../../utils/moduleAlias";
import { showError, showSuccess } from "../../utils/toast";


const categories = {
  Commodities: "Commodities",
  Crypto: "Crypto",
  Bonds: "Bonds",
  EFTS: "EFTS",
  Metal: "Metal",
  Stocks: "Stocks",
  RealEstate: "Real Estate",
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


const NewDashboard = () => {
  // Get data from Redux store
  const {
    isCrypto,
    bankBalance,
    walletData,
    tokens,
    bankLists,
  } = useSelector((state: any) => state.authenticationSlice);

  const { width: screenWidth } = useWindowDimensions();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const navigation = useNavigation<any>();
  const pinScreenRef = useRef<any>(null);


  const [txLists, settxLists] = useState<any[]>([]);
  const [web3TxLists, setweb3TxLists] = useState<any[]>([]);

  const [alloCationLists, setalloCationLists] = useState([]);
  const [totalDisbursable, settotalDisbursable] = useState(0);
  const [totalDisbursablePending, settotalDisbursablePending] = useState(0);

  const [hiddenBalances, setHiddenBalances] = useState<Record<string, boolean>>(
    {}
  );
  const [isMainCardBalanceVisible, setIsMainCardBalanceVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceRefreshing, setIsBalanceRefreshing] = useState(false);


  const {
    data: DashBoardData,
    isError: isErrorDashBoardData,
    isSuccess: isSuccessDashBoardData,
    isPending: isDashBoardDataPending,
    isFetched: isDashBoardDataFetched,
    refetch: refetchDashBoardFiatData,
  } = useDashBoardFiatData();

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

      if (!cryptoAssets) return;

      const nonUsdAssets = cryptoAssets.filter(
        (asset: CryptoAsset) => asset?.assetType !== "usd"
      );

      setalloCationLists(nonUsdAssets as any);
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


  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      refetchBankBalanceData();
      refetch();

      queryClient.invalidateQueries({ queryKey: paymentRequestKeys.pending() });
      refetchDashBoardFiatData();
      refectWalletDashboardData();
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [tokens?.access, refetchBankBalanceData, refetch, refetchDashBoardFiatData, refectWalletDashboardData]);

  interface CryptoAsset {
    assetType: string;
    disbursable: number;
    pending: number;
    name?: string;
    symbol?: string;
  }



  const onContactSeeALl = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.CONTACT_SCREEN, {
      isVisble3: isCrypto,
    });
  }, [navigation, isCrypto]);

  const onRewardSeeALl = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.REWARDS);
  }, [navigation]);

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


  const handleEyeClick = (account_id: string) => {
    setHiddenBalances((prev: Record<string, boolean>) => ({
      ...prev,
      [account_id]: !prev[account_id],
    }));
  };



  const handleRefreshBalance = useCallback(async () => {
    setIsBalanceRefreshing(true);
    try {
      const refreshPromises: Promise<any>[] = [];

      if (isCrypto) {
        refreshPromises.push(refetchBankBalanceData());
      }

      if (!isCrypto) {
        refreshPromises.push(refetch());
      }

      await Promise.all(refreshPromises);
    } catch (error) {
      console.log("Error refreshing balance data:", error);
    } finally {
      setIsBalanceRefreshing(false);
    }
  }, [isCrypto, refetchBankBalanceData, refetch]);


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
          if (item?.asset != 'Bank Balance') {
            navigation.navigate(NAVIGATION_SCREENS.CRYPTO_DETAILS, { item: item });
          }
        }}
      >
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
                  <></>
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
          style={{
            marginBottom: theme.spacing.spacing.md,
            marginHorizontal: 15,
          }}
        />

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
                  navigation.navigate(NAVIGATION_SCREENS.SEND_AND_RECEIVE);
                }}
              />
              <SvgIcons.BuyAndSell
                style={{ marginRight: 15 }}
                onPress={
                  () => {
                    navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN);
                  }
                }
              />

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
                    <PlaidLinkButton
                      onSuccess={() => {
                        console.log("Plaid link successful");
                      }}
                      onCancel={() => {
                        console.log("Plaid link cancelled");
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
                onActionPress={() => { }}
              >
                {isDashBoardDataPending ? (
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
                onActionPress={() => { }}
              >
                {isDashBoardDataPending ? (
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

            <ReferralCard />
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
