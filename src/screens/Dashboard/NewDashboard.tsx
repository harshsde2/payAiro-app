import React, { useCallback, useEffect, useState, useRef, useMemo, Suspense, lazy } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Pressable, ActivityIndicator, useWindowDimensions, Button, Modal, TextInput, RefreshControl, BackHandler } from 'react-native';
import ThemeUsageExample from '../../styles/ThemeUsageExample';
// Import from the module alias utility
import { DashboardHeader, CryptoCard, FontTest, Card, CustomText } from '../../utils/moduleAlias';
import { ScreenContainer } from '../../HOC';
import { useTheme } from '../../styles/ThemeContext';
import { useSelector } from 'react-redux';
import { SVGLoggo, SVGUSD, SVGDownArrow3, SVGSecurities, SVGReceive, SVGHolding, SVGAdd, SVGSend, SVGNewBank, SVGBilPay, SVGRecharge, SVGDebit, SVGCredit, SVGBANK2, SVGDebitAdd, SVGBamkAdd, SVGDebitCardAdd, SVGVoucher, SVGRef, SVGKYC2, SVGSliders, SVG_hide_eye, SVGBit, SVGDownArrow2, SVG_eye_on, SVG_eye_off, SVG_backspace, SVG_done, SVG_Bank_tab, SVG_credit_tab, SVG_debit_tab, SVGBankIcon } from '../../constants/images';
import useDispatchAction from '../../hooks/useDispatchAction';
import { setisCrypto, setCalculatedBalance, setWalletData, setBankLists, setBankbalances, setErrorMsg, setSuccessMsg } from '../../redux/slices/authenticationSlice';
import FlipSlideExample from 'animations/examples/FlipSlideExample';
import BottomNavigation from 'components/BottomNavigation';
import GhostSlide from 'animations/animations-components/GhostSlide';
import { addbankAccountRoth, createPin, getBalance, getBalanceCrypto, getBankDetails, getBanksAllAccount, getContacts, getCryptoTx, getPayAeroTx, getPinFromSev, getWallet, uploadKYC, checkUser, getAllReward, redeemReward } from 'services/Services';
import { SvgXml } from 'react-native-svg';
import { SCREENS } from 'constants/SCREENS';
import { useNavigation } from '@react-navigation/native';
import AssetsCards from 'components/AssetsCards';
import Fonts from 'constants/Fonts';
import { open } from 'react-native-plaid-link-sdk';
import { create } from 'react-native-plaid-link-sdk';
import { dismissLink, LinkIOSPresentationStyle } from 'react-native-plaid-link-sdk';
import { LinkLogLevel } from 'react-native-plaid-link-sdk';
import { BASE_URL } from 'constants/mockData';
import StoryLists from 'components/StoryLists';
import TransactionCard from 'components/TransactionCard';
import Rewards from 'components/Rewards';
import { getPin, setPin, } from 'services/Auth';
import PincodeScreen from 'screens/Authentications/PincodeScreen';
import { SectionHeader } from 'tsx-components';
import DashboardSection from 'tsx-components/DashboardSection';
import CryptoCardSkeleton from 'tsx-components/CryptoCardSkeleton';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import BalanceModal from 'components/BalanceModal';
import GenericButton from 'components/GenericButton';
import LineChartCustom from 'components/LineChartCustom';
import PinScreen from 'tsx-components/modals/PinScreen';
import { PinScreenRef } from 'tsx-components/modals/modal.types';
import IconTextComponent from 'tsx-components/IconTextComponent';
import { renderFinanceIcons, renderUtilitiesIcons } from 'tsx-components/components.configs';
import FiatGraphSection from 'tsx-components/FiatGraphSection';
const CustomPieChart = require('../../components/CustomPieChart').default;
import RewardModal from 'tsx-components/modals/RewardModal';
import axios from 'axios';
import { getReq2 } from 'services/Api';


// Lazy load non-critical components
const LazyBankModal = lazy(() => import('components/BankModal'));
const LazyBankModal2 = lazy(() => import('components/BankModal2'));
const LazySelectionModal = lazy(() => import('components/SelectionModal'));
const LazyBalanceModal = lazy(() => import('components/BalanceModal'));
const LazySelectionModal2 = lazy(() => import('components/SelectionModal2'));
const LazyGuideModal = lazy(() => import('components/GuideModal'));

// Variables

const BANK_TYPE = 'FDIC Insured';

// API call utility with automatic retries, caching, and error handling
export const useApiCall = <T,>(apiFunction: (token: string) => Promise<any>, options = { retries: 1, cacheTime: 5 * 60 * 1000 }) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{ data: T | null, timestamp: number }>({ data: null, timestamp: 0 });

  const execute = useCallback(async (token: string, forceRefresh = false) => {
    // Use cached data if available and not expired
    const now = Date.now();
    if (!forceRefresh &&
      cacheRef.current.data &&
      now - cacheRef.current.timestamp < options.cacheTime) {
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
          timestamp: Date.now()
        };

        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        attempts++;

        // If we've exhausted retries, set the error
        if (attempts > options.retries) {
          const error = err instanceof Error ? err : new Error('Unknown error occurred');
          setError(error);
          setLoading(false);
          console.error(`API call failed after ${options.retries} retries:`, error);
          return null;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }

    return null;
  }, [apiFunction, options.cacheTime, options.retries]);

  return { data, loading, error, execute, clearCache: () => { cacheRef.current = { data: null, timestamp: 0 } } };
};

// Loading fallback component
const LoadingFallback = () => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.palette.green700} />
    </View>
  );
};

// Skeleton components for loading states
const SkeletonCard = () => {
  const { theme } = useTheme();
  return (
    <View style={{
      backgroundColor: 'rgba(247, 247, 247, 1)',
      padding: 10,
      width: 300,
      borderRadius: 15,
      marginRight: 10,
      height: 120,
    }}>
      <View style={{ width: '70%', height: 20, backgroundColor: theme.colors.palette.grey200, borderRadius: 4, marginBottom: 10 }} />
      <View style={{ width: '90%', height: 12, backgroundColor: theme.colors.palette.grey200, borderRadius: 4, marginBottom: 15 }} />
      <View style={{ width: '50%', height: 12, backgroundColor: theme.colors.palette.grey200, borderRadius: 4, marginBottom: 15 }} />
      <View style={{ width: '40%', height: 20, backgroundColor: theme.colors.palette.grey200, borderRadius: 4 }} />
    </View>
  );
};

const SkeletonTransactionCard = () => {
  const { theme } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey200,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.palette.grey200, marginRight: 10 }} />
        <View>
          <View style={{ width: 120, height: 16, backgroundColor: theme.colors.palette.grey200, borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: 80, height: 12, backgroundColor: theme.colors.palette.grey200, borderRadius: 4 }} />
        </View>
      </View>
      <View style={{ width: 70, height: 20, backgroundColor: theme.colors.palette.grey200, borderRadius: 4 }} />
    </View>
  );
};

// Memoized components for better performance
const MemoizedStoryLists = React.memo(StoryLists);
const MemoizedTransactionCard = React.memo(TransactionCard);
const MemoizedRewards = React.memo(Rewards);
const MemoizedDashboardSection = React.memo(DashboardSection);

// Separate crypto view components to improve re-rendering
interface CryptoFinanceSectionProps {
  navigation: any;
}

const CryptoFinanceSection = React.memo(({ navigation }: CryptoFinanceSectionProps) => {
  const { theme } = useTheme();

  return (
    <View>
      <MemoizedDashboardSection
        title='Finance'
        actionText='see all'
        onActionPress={() => { }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{}}
          style={{ marginVertical: 10 }}>
          {renderFinanceIcons.map((item, index) => (
            <IconTextComponent
              label={item?.label}
              key={index}
            >
              <SvgXml
                xml={item?.IconName}
                width={item?.width}
                height={item?.height}
                disabled={item?.navigationScreenName == ''}
                onPress={() => navigation.navigate(item?.navigationScreenName)}
              // style={{ marginRight: 10 }}
              />
            </IconTextComponent>
          ))}
        </ScrollView>
      </MemoizedDashboardSection>
      <MemoizedDashboardSection
        title='Utilities'
        actionText='see all'
        onActionPress={() => { }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{}}
          style={{ marginVertical: 10 }}>
          {renderUtilitiesIcons.map((item, index) => (
            <IconTextComponent
              label={item?.label}
              key={index}
            >
              <SvgXml
                xml={item?.IconName}
                width={item?.width}
                height={item?.height}
                disabled={item?.navigationScreenName == ''}
                onPress={() => navigation.navigate(item?.navigationScreenName)}
              // style={{ marginRight: 10 }}
              />
            </IconTextComponent>
          ))}
        </ScrollView>
      </MemoizedDashboardSection>
    </View>
  );
});

// No props needed for this component
const CryptoRewardsSection = React.memo(() => (
  <MemoizedDashboardSection title='Offer & Rewards' actionText='see all' onActionPress={() => { }}>
    <View style={[]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginRight: 10,
        }}>
        <MemoizedRewards item={{}} />
        <MemoizedRewards
          item={{
            name: 'Vouchers',
            icon: SVGVoucher,
            route: 'VouchersScreens',
            bgColor: '#f1edfe',
          }}
        />
        <MemoizedRewards
          item={{
            name: 'Referrals',
            icon: SVGRef,
            route: 'VouchersScreens',
            bgColor: 'rgba(95, 255, 0, 0.09)',
          }}
        />
      </View>
    </View>
  </MemoizedDashboardSection>
));

interface CryptoOtherServicesSectionProps {
  handleRothBank: () => Promise<void>;
  setisCardModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: any;
}

const CryptoOtherServicesSection = React.memo(
  ({ handleRothBank, setisCardModalVisible, navigation }: CryptoOtherServicesSectionProps) => (
    <MemoizedDashboardSection
      title='Others Services'
      actionText='see all'
      onActionPress={() => { }}
    >
      <View style={{ marginBottom: 130, marginRight: 20 }}>
        <SvgXml
          xml={SVGBamkAdd}
          style={{ marginVertical: 10 }}
          onPress={() => handleRothBank()}
        />
        <SvgXml
          xml={SVGDebitCardAdd}
          onPress={() => setisCardModalVisible(true)}
        />
        <Pressable
          onPress={() =>
            navigation.navigate('IntraAccountTransfer')
          }
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginVertical: 10,
          }}>
          <SvgXml xml={SVGDebitAdd} />
          <Text
            style={{
              color: 'black',
              fontFamily: Fonts.semibold,
              marginLeft: 10,
            }}>
            Intra account transfer
          </Text>
        </Pressable>
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
  } = useSelector((state: any) => state.authenticationSlice);

  const { height: screenHeight } = useWindowDimensions();
  const navigation = useNavigation<any>();

  const pinScreenRef = useRef<PinScreenRef>(null)

  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState('');
  const [showFontTest, setShowFontTest] = useState(false);
  const [ghostSlideVisible, setGhostSlideVisible] = useState(false);
  const [isVisible, setisVisible] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [contactLists, setcontactLists] = useState<any[]>([]);
  const [txLists, settxLists] = useState<any[]>([]);
  const [web3TxLists, setweb3TxLists] = useState<any[]>([]);
  const [isCardModalVisible, setisCardModalVisible] = useState(false);
  const [showPin, setshowPin] = useState(false);
  const [isConfirm, setisConfirm] = useState(false);
  const [pinTxt, setpinTxt] = useState('Create your pin');
  const [isBankModalVisible, setisBankModalVisible] = useState(false);
  const [isVisible2, setisVisible2] = useState(false);
  const [isShowWeeks, setisShowWeeks] = useState(false);
  const [timeframe, settimeframe] = useState('Week');
  const [isGuideVisible, setisGuideVisible] = useState(false);
  const [isShowKYC, setisShowKYC] = useState(false);
  const [alloCationLists, setalloCationLists] = useState([]);
  const [totalDisbursable, settotalDisbursable] = useState(0);
  const [totalDisbursablePending, settotalDisbursablePending] = useState(0);
  const [hiddenBalances, setHiddenBalances] = useState<Record<string, boolean>>({});
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [currentAccountForPin, setCurrentAccountForPin] = useState<string | null>(null);
  const [pinForShowBalance, setPinForShowBalance] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinAmount, setPinAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isRewardModalVisible, setisRewardModalVisible] = useState(false);


  const [selectedGraph, setselectedGraph] = useState('Assets');

  // Create API hooks with automatic retries and caching
  const cryptoBalanceApi = useApiCall(getBalanceCrypto);
  const bankBalanceApi = useApiCall(getBalance);
  const walletApi = useApiCall(getWallet);
  const bankDetailsApi = useApiCall(getBankDetails);
  const bankAccountsApi = useApiCall(getBanksAllAccount);
  const contactsApi = useApiCall(getContacts);
  const txListsApi = useApiCall(getPayAeroTx);
  const cryptoTxApi = useApiCall(getCryptoTx);
  const kycApi = useApiCall(uploadKYC);
  const rewardsApi = useApiCall(getAllReward);


  // Add this near other hooks at the top level of your NewDashboard component
  const memoizedAllocationLists = useMemo(
    () => alloCationLists,
    [alloCationLists],
  );

  useEffect(() => {
    // Group all data fetch operations
    const fetchInitialData = async () => {
      if (!tokens && !tokens?.access) {
        // console.error("No access token available");
        return;
      }

      try {
        // console.log("Fetching initial dashboard data");

        // Create an array of promises with descriptive catch handlers
        const promises = [

          fetchKycStatus().catch(err => console.error("KYC status fetch failed:", err)),
          fetchCryptoBalance().catch(err => console.error("Crypto balance fetch failed:", err)),
          fetchBankBalance().catch(err => console.error("Bank balance fetch failed:", err)),
          fetchBankAccounts().catch(err => console.error("Bank accounts fetch failed:", err)),
          fetchContacts().catch(err => console.error("Contacts fetch failed:", err)),
          fetchTransactions().catch(err => console.error("Transactions fetch failed:", err)),
          fetchCryptoTransactions().catch(err => console.error("Crypto transactions fetch failed:", err)),
          fetchWalletData().catch(err => console.error("Wallet data fetch failed:", err)),
        ];

        // Execute all promises in parallel
        await Promise.allSettled(promises);
        // console.log("All initial data fetch operations completed");
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    fetchInitialData();
    handlePin();
  }, [tokens?.access]);


  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('Back button pressed');
      return false; // Let it behave normally
    });
  
    return () => backHandler.remove();
  }, []);

  // Separate effect for Plaid token which changes independently
  useEffect(() => {
    const fetchLinkToken = async () => {
      if (!tokens?.access) return;

      try {
        const response = await fetch(`${BASE_URL}kyc/link-token/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokens?.access}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setLinkToken(data?.data?.link_token);
      } catch (err) {
        console.error('Error fetching link token:', err);
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
      // Group all data fetch operations
      const promises = [
        handleReward().catch(err => console.error("handle Reward fetch failed:", err)),
        fetchKycStatus().catch(err => console.error("KYC status fetch failed:", err)),
        fetchCryptoBalance().catch(err => console.error("Crypto balance fetch failed:", err)),
        fetchBankBalance().catch(err => console.error("Bank balance fetch failed:", err)),
        fetchBankAccounts().catch(err => console.error("Bank accounts fetch failed:", err)),
        fetchContacts().catch(err => console.error("Contacts fetch failed:", err)),
        fetchTransactions().catch(err => console.error("Transactions fetch failed:", err)),
        fetchCryptoTransactions().catch(err => console.error("Crypto transactions fetch failed:", err)),
        fetchWalletData().catch(err => console.error("Wallet data fetch failed:", err)),
      ];

      // Execute all promises in parallel
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
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

  const handleReward = async () => {
    // console.log("ashdhas. =>")
    try {
      const data = await rewardsApi.execute(tokens?.access);

      // console.log(data, 'datatatatatat');
      if (data && data?.data?.length > 0) {
        setisRewardModalVisible(!data?.data[0]?.redeem);
        const redeem = await redeemReward(
          { redeem: true },
          data?.data[0]?.id,
          tokens?.access,
        );
        console.log(redeem, 'redeem===>>>>');
      }
    } catch (error) {
      console.log(error, '=====>>>');
      setisRewardModalVisible(false);
    }
  };

  // Optimized API call functions
  const fetchCryptoBalance = async () => {
    try {
      const response = await cryptoBalanceApi.execute(tokens?.access);
      const cryptoAssets = response?.data;

      if (!cryptoAssets) return;

      // Filter non-USD assets in one pass
      const nonUsdAssets = cryptoAssets.filter((asset: CryptoAsset) =>
        asset?.assetType !== 'usd'
      );

      setalloCationLists(nonUsdAssets);

      // Calculate totals in a single reduce operation for better performance
      const totals = nonUsdAssets.reduce((acc: { disbursable: number, pending: number }, asset: CryptoAsset) => {
        return {
          disbursable: acc.disbursable + (asset?.disbursable || 0),
          pending: acc.pending + (asset?.pending || 0)
        };
      }, { disbursable: 0, pending: 0 });

      settotalDisbursable(Number(totals.disbursable));
      settotalDisbursablePending(Number(totals.pending));
    } catch (error) {
      console.error('Error fetching crypto balance:', error);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const data = await kycApi.execute(tokens?.access);
      console.log("data =>", data)
      if (data?.status === 400 || !data?.status) {
        // console.log("fetchKycStatus if")
        if (data?.title) {
          setisShowKYC(data?.title === 'Identity suspended');
        } else {
          setisShowKYC(true);
        }
      } else {
        // console.log("fetchKycStatus esle")

        setisShowKYC(true);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setisShowKYC(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      const data = await walletApi.execute(tokens?.access);
      if (!data) return;

      useDispatchAction(setWalletData(data));
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchBankBalance = async () => {
    try {
      const data = await bankBalanceApi.execute(tokens?.access);
      if (!data) return;

      useDispatchAction(setBankbalances(data));
    } catch (error) {
      console.error('Error fetching bank balance:', error);
    }
  };

  const kycHandleUrl = async () => {
    const data = await uploadKYC(tokens?.access);
    // console.log(data, 'kycHandle');
    if (data?.data?.status === 400) {
      if (data?.data?.title === 'Identity suspended') {
        useDispatchAction(
          setErrorMsg('Operation is forbidden. Custodial account is suspended'),
        );
        // navigation.navigate('InAppKYCBrowser', {
        //   url: 'https://docv.alloy.co/02797998-719f-407b-bf98-ed852e3540b3',
        // });
      }
    } else {
      navigation.navigate('InAppKYCBrowser', {
        url: data?.data?.url,
      });
    }
  };

  const fetchBankAccounts = async () => {
    try {
      // Get both data sources in parallel using optimized API calls
      const [bankDetailsResponse, bankAccountsResponse] = await Promise.all([
        bankDetailsApi.execute(tokens?.access),
        bankAccountsApi.execute(tokens?.access)
      ]);

      if (!bankAccountsResponse) return;

      // Extract all bank accounts
      const payAiroBankAccounts = [
        ...(bankAccountsResponse?.bank_accounts || []),
        ...(bankAccountsResponse?.traditional_ira_accounts || []),
        ...(bankAccountsResponse?.roth_ira_accounts || [])
      ];

      // Combine with bank details accounts if available
      const combinedAccounts = [
        ...(bankDetailsResponse?.accounts || []),
        ...payAiroBankAccounts
      ];

      useDispatchAction(setBankLists(combinedAccounts));
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    // if(!tokens?.access) return;
    try {
      // console.log("Fetching PayAiro transactions...");
      const response = await getPayAeroTx(tokens?.access);
      // console.log("PayAiro transactions response:", response);

      // Extract transactions data correctly based on response format
      let transactionsData = null;

      if (response?.data?.merchantTransactions || response?.data?.userToUserTransactions) {
        // Format: { data: { merchantTransactions: [], userToUserTransactions: [] } }
        transactionsData = {
          merchantTransactions: response.data.merchantTransactions || [],
          userToUserTransactions: response.data.userToUserTransactions || []
        };
      } else if (response?.merchantTransactions || response?.userToUserTransactions) {
        // Format: { merchantTransactions: [], userToUserTransactions: [] }
        transactionsData = {
          merchantTransactions: response.merchantTransactions || [],
          userToUserTransactions: response.userToUserTransactions || []
        };
      } else if (response?.data?.data) {
        // Format: { data: { data: { merchantTransactions: [], userToUserTransactions: [] } } }
        transactionsData = {
          merchantTransactions: response.data.data.merchantTransactions || [],
          userToUserTransactions: response.data.data.userToUserTransactions || []
        };
      }

      if (!transactionsData) {
        console.error("Could not find valid transactions data in response:", response);
        return;
      }

      // console.log("Extracted transactions data:", transactionsData);

      // Create a merged and filtered list in one operation
      const successfulTransactions = [
        ...transactionsData.merchantTransactions,
        ...transactionsData.userToUserTransactions
      ].filter(tx => tx?.status === 'success');

      // console.log(`Found ${successfulTransactions.length} successful transactions`);
      settxLists(successfulTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCryptoTransactions = async () => {
    try {
      // console.log("Fetching crypto transactions...");
      const response = await getCryptoTx(tokens?.access);
      // console.log("Crypto transactions response:", response);

      // Extract crypto transactions data correctly based on response format
      let cryptoData = null;

      if (response?.data?.nft_transactions || response?.data?.trades) {
        // Format: { data: { nft_transactions: [], trades: [] } }
        cryptoData = {
          nft_transactions: response.data.nft_transactions || [],
          trades: response.data.trades || []
        };
      } else if (response?.nft_transactions || response?.trades) {
        // Format: { nft_transactions: [], trades: [] }
        cryptoData = {
          nft_transactions: response.nft_transactions || [],
          trades: response.trades || []
        };
      } else if (response?.data?.data) {
        // Format: { data: { data: { nft_transactions: [], trades: [] } } }
        cryptoData = {
          nft_transactions: response.data.data.nft_transactions || [],
          trades: response.data.data.trades || []
        };
      }

      if (!cryptoData) {
        console.error("Could not find valid crypto transactions data in response:", response);
        return;
      }

      // console.log("Extracted crypto transactions data:", cryptoData);

      // Safely combine NFT transactions and trades
      const allTransactions = [
        ...cryptoData.nft_transactions,
        ...cryptoData.trades
      ];

      // console.log(`Found ${allTransactions.length} crypto transactions`);
      setweb3TxLists(allTransactions);
    } catch (error) {
      console.error('Error fetching crypto transactions:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      // console.log("Starting fetchContacts with token:", tokens?.access?.substring(0, 10) + "...");

      // Direct API call to get contacts
      const response = await getContacts(tokens?.access);
      // console.log("Raw contacts API response:", response);

      // Check different possible response formats
      let contactsData = null;

      if (response?.data?.data) {
        // Format: { data: { data: [...contacts] } }
        contactsData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        // Format: { data: [...contacts] }
        contactsData = response.data;
      } else if (Array.isArray(response)) {
        // Format: [...contacts]
        contactsData = response;
      }

      if (!contactsData || !Array.isArray(contactsData)) {
        console.error("Could not find valid contacts data in response:", response);
        return;
      }

      // console.log("Extracted contacts data:", contactsData);

      // Check the object structure to identify the correct field names
      const sampleContact = contactsData[0];
      // console.log("Sample contact object:", sampleContact);

      // Determine which field name is used for pending requests
      const pendingRequestsField = sampleContact?.pending_requests
        ? 'pending_requests'
        : sampleContact?.pendingRequests
          ? 'pendingRequests'
          : null;

      if (!pendingRequestsField) {
        console.warn("Could not determine pending requests field, using data as is");
        setcontactLists(contactsData);
        return;
      }

      // console.log(`Using '${pendingRequestsField}' as the pending requests field`);

      // Function to get earliest timestamp - adapted to work with variable field names
      const getEarliestTimestamp = (contact: any) => {
        const requests = contact[pendingRequestsField];
        if (!requests || !Array.isArray(requests) || requests.length === 0) return null;

        // Check if timestamp or created_at is used
        const timestampField = requests[0]?.timestamp
          ? 'timestamp'
          : requests[0]?.created_at
            ? 'created_at'
            : null;

        if (!timestampField) return null;

        try {
          return new Date(
            Math.min(...requests.map(request => new Date(request[timestampField]).getTime()))
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
      console.error('Error fetching contacts:', error);
    }
  };

  const handleRothBank = async () => {
    try {
      const data = await addbankAccountRoth(tokens?.access);
      // console.log(data?.data, 'royjir');
      if (data && data?.data && !data?.data?.error) {
        useDispatchAction(setSuccessMsg('Bank Account Created Successfully'));
        fetchBankAccounts();
      } else {
        useDispatchAction(
          setErrorMsg(data?.data?.error ?? 'Something went wrong'),
        );
      }
    } catch (error) { }
  };

  const onSuccess = useCallback(async (publicToken: any) => {
    try {
      // Parse the metadataJson string
      const metadata = publicToken?.metadata;
      const metadataJson = metadata?.metadataJson
        ? JSON.parse(metadata.metadataJson)
        : null;

      if (!metadataJson) {
        console.error('Invalid metadataJson structure');
        return;
      }

      const accountId = metadataJson?.account_id;

      // Process all API calls in sequence with proper error handling
      // 1. Exchange for access token
      const exchangeResponse = await fetch(`${BASE_URL}kyc/exchange-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          public_token: publicToken.publicToken,
        }),
      });

      const exchangeData = await exchangeResponse.json();
      if (!exchangeResponse.ok) {
        throw new Error(
          `Exchange token error: ${exchangeData?.message || 'Unknown error'}`,
        );
      }

      const accessToken = exchangeData?.data?.access_token;
      if (!accessToken) {
        throw new Error('Missing access token in exchange response');
      }

      // 2. Get processor token
      const processorResponse = await fetch(`${BASE_URL}kyc/processor-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          access_token: accessToken,
          account_id: accountId,
        }),
      });

      const processorData = await processorResponse.json();
      if (!processorResponse.ok) {
        throw new Error(
          `Processor token error: ${processorData?.message || 'Unknown error'}`,
        );
      }

      const processorToken = processorData?.data?.processor_token;
      if (!processorToken) {
        throw new Error('Missing processor token in processor response');
      }

      // 3. Register bank
      const registerBankResponse = await fetch(
        `${BASE_URL}kyc/register-bank/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens?.access}`,
          },
          body: JSON.stringify({
            processor_token: processorToken,
            identityId: exchangeData?.data?.identityId,
            type: 'financial',
            accountNumberLast4: metadataJson?.account_id?.slice(-4),
          }),
        },
      );

      if (!registerBankResponse.ok) {
        const registerBankData = await registerBankResponse.json();
        throw new Error(
          `Register bank error: ${registerBankData?.message || 'Unknown error'}`
        );
      }

      // 4. Success - refresh bank accounts
      await fetchBankAccounts();
      useDispatchAction(setSuccessMsg('Bank account added successfully'));
    } catch (error) {
      console.error('Error in Plaid success handler:', error);
      useDispatchAction(setErrorMsg(error instanceof Error ? error.message : 'Failed to add bank account'));
    }
  }, [tokens?.access]); // Only depend on the access token

  // console.log("bankBalance?.bank_account?.usd =>", bankBalance?.bank_account?.usd)

  // Handling open links
  // const handleOpenLink = useCallback(() => {
  //   if (!linkToken) return;

  //   const config = {
  //     token: linkToken,
  //     onSuccess,
  //     onExit: (linkExit: any) => {
  //       dismissLink();
  //     },
  //     iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
  //     logLevel: LinkLogLevel.ERROR,
  //   };

  //   create(config);
  //   open(config);
  // }, [linkToken, onSuccess]);

  // console.log("access =>",tokens)

  const handleOpenLink = useCallback(async () => {
    try {
      const resp = await axios.get(`${BASE_URL}auth/url-external-account`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`, // ✅ this is the correct way to send auth header
        },
      });
      const {status ,data} = resp?.data;
      if(status && data){
        navigation.navigate(NAVIGATION_SCREENS.MX_CONNECT_WIDGET_SCREEN,{URL :data?.fortress_response.widgetUrl })
      }
      console.log("handleOpenLink =>", JSON.stringify(resp.data,null,2)); // Use .data to access response body
    } catch (e) {
      console.error("Error fetching external account URL:", e);
    }
  }, []);
  
  // Memoize contact see all navigation
  const onContactSeeALl = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.CONTACT_SCREEN, {
      isVisble3: isCrypto,
    });
  }, [navigation, isCrypto]);

  // Example custom theme handling
  const styles = createStyles(theme);

  // Memoize expensive calculations and derived state
  const sortedTxLists = useMemo(() => {
    if (!txLists) return [];
    return [...txLists].sort(
      (a, b) => (new Date(b.created_at) as any) - (new Date(a.created_at) as any)
    ).slice(0, 5);
  }, [txLists]);

  const sortedWeb3TxLists = useMemo(() => {
    if (!web3TxLists) return [];
    return [...web3TxLists].sort(
      (a, b) => (new Date(b.timestamp) as any) - (new Date(a.timestamp) as any)
    ).slice(0, 5);
  }, [web3TxLists]);

  // Memoize banking data processing
  const processedBankAccounts = useMemo(() => {
    if (!bankLists) return [];

    return bankLists.map((item: any) => ({
      ...item,
      displayName: item?.bank_name ?? item?.name,
      accountType: item?.account_type ?? 'Personal',
      address: item?.bank_address ?? item?.official_name,
      accountNumber: item?.account_number ?? item?.account_id,
      balance: item?.balances?.available
        ? item?.balances?.available
        : item?.account_type === 'rothIra'
          ? bankBalance?.roth_ira_account?.usd
          : item?.account_type === 'traditionalIra'
            ? bankBalance?.traditional_ira_account?.usd
            : bankBalance?.bank_account?.usd
    }));
  }, [bankLists, bankBalance]);

  //
  const handleEyeClick = (account_id: string) => {
    if (pinScreenRef.current) {
      pinScreenRef.current.toggleBalanceVisibility(account_id)
    }
  }

  // Handle pin if it is not set then it will set in local stroage
  const handlePin = async () => {

    if (!tokens?.access) return
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


  // 
  const renderButtonGraph = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => setselectedGraph('pnl')}
            style={{
              backgroundColor:
                selectedGraph === 'pnl'
                  ? 'rgba(44, 106, 63, 1)'
                  : 'rgba(255, 255, 255, 0.1)',
              // padding: 10,
              paddingBottom: 10,
              paddingTop: 7,
              width: '33%',
              borderRadius: 30,
            }}>
            <Text
              style={{
                color: selectedGraph === 'pnl' ? '#fff' : '#fff',
                fontFamily: Fonts.bold,
                textAlign: 'center',
                fontSize: 12,
              }}>
              PnL(%)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setselectedGraph('Assets')}
            style={{
              backgroundColor:
                selectedGraph === 'Assets' ? 'rgba(44, 106, 63, 1)' : '#000',
              // padding: 10,
              paddingBottom: 10,
              paddingTop: 7,
              width: '33%',
              borderRadius: 30,
              marginLeft: 15,
            }}>
            <Text
              style={{
                color: selectedGraph === 'Assets' ? '#fff' : '#fff',
                fontFamily: Fonts.bold,
                textAlign: 'center',
                fontSize: 12,
              }}>
              Assets
            </Text>
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity
            onPress={() => {
              setisShowWeeks(true);
            }}
            style={{
              backgroundColor:theme.colors.palette.green700,
              // padding: 10,
              paddingBottom: 10,
              paddingTop: 7,
              width: '27%',
              borderRadius: 30,
            }}>
            <Text
              style={{
                color: 'black',
                fontFamily: Fonts.bold,
                textAlign: 'center',
                fontSize: 12,
                textTransform: 'capitalize',
              }}>
              {timeframe} <SvgXml xml={SVGDownArrow2} />
            </Text>
          </TouchableOpacity> */}
      </View>
    );
  };
  

  return (
    <ScreenContainer
      style={{
        paddingHorizontal: 0
      }}
    >
      {/* Modal container with high z-index */}
      <View style={{
        position: 'absolute',
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        zIndex: 9999,
        elevation: 9999,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {isCardModalVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isCardModalVisible}
            onRequestClose={() => setisCardModalVisible(false)}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <LazyBankModal
                isVisible={isCardModalVisible}
                onClose={() => setisCardModalVisible(false)}
                onCancel={() => { }}
              />
            </View>
          </Modal>
        )}

        {isBankModalVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isBankModalVisible}
            onRequestClose={() => setisBankModalVisible(false)}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <LazyBankModal2
                isVisible={isBankModalVisible}
                onClose={() => setisBankModalVisible(false)}
                onCancel={() => { }}
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
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
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

        {isVisible2 && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible2}
            onRequestClose={() => setisVisible2(false)}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <LazySelectionModal
                isVisible={isVisible2}
                onClose={() => setisVisible2(false)}
                onSelected={() => { }}
                data={[]}
                type={'bank'}
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
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <LazySelectionModal2
                isVisible={isShowWeeks}
                onClose={() => setisShowWeeks(false)}
                timeframe={timeframe}
                settimeframe={settimeframe}
              />
            </View>
          </Modal>
        )}

        {isGuideVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={isGuideVisible}
            onRequestClose={() => setisGuideVisible(false)}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <LazyGuideModal
                isVisible={isGuideVisible}
                onClose={() => setisGuideVisible(false)}
                onConfirm={() => { }}
              />
            </View>
          </Modal>
        )}

        {isRewardModalVisible && (
          <RewardModal
            isVisible={isRewardModalVisible}
            onClose={() => setisRewardModalVisible(false)}
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
        // isCrypto &&
        <View style={{
          zIndex: 100,
          width: '100%',
          alignSelf: 'center',
          backgroundColor: 'black',
          borderRadius: 20,
          position: 'absolute',
          bottom: -15,
        }}>
          {/* <GhostSlide
            visible={isCrypto}
            direction="custom"
            duration={2500}
            distance={1000}
            customX={0}
            customY={-400}
            ghostOpacity={1}
            onAnimationComplete={() => console.log('Ghost slide completed')}
          > */}
            <View style={{
              paddingVertical: 10,
              backgroundColor: 'black',
              borderRadius: 20,
              position: 'absolute',
              bottom: 20,
              zIndex: 100,
              width: '92%',
              alignSelf: 'center',
            }}>
              <BottomNavigation isVer={true} />
            </View>
          {/* </GhostSlide> */}
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
      >
        <DashboardHeader
          name={userName}
          style={{
            marginBottom: theme.spacing.spacing.md,
            marginHorizontal: 15
          }}
        />
        {isShowKYC && (
          <View
            style={{
              backgroundColor: '#000',
              width: '95%',
              padding: 15,
              borderRadius: 15,
              alignSelf: 'center',
              marginBottom: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}>
              <SvgXml xml={SVGKYC2} />
              <Text
                style={{
                  color: 'rgba(177, 177, 177, 1)',
                  fontFamily: Fonts.semibold,
                  fontSize: 14,
                  marginLeft: 10,
                }}>
                Your Second level KYC verification is pending.{' '}
                <TouchableOpacity onPress={kycHandleUrl}>
                  <Text style={{ color: 'white', fontFamily: Fonts.bold }}>
                    {' '}
                    Verify Now!
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
            <SvgXml
              xml={SVGSliders}
              style={{ marginTop: 15, width: '80%', alignSelf: 'center' }}
            />
          </View>
        )}
        <View style={{ marginHorizontal: 15 }}>
          {/* Use a consistent height container to prevent layout shifts */}
          <View style={{ minHeight: 220 }}>
            {(bankBalance?.bank_account?.usd == undefined) ? (
              <CryptoCardSkeleton
                shimmerColor="rgba(255, 255, 255, 0.6)"
                baseColor="rgba(255, 255, 255, 0.2)"
                speed={1000}
                visible={true}
              />
            ) : (

              <CryptoCard
                isCrypto={isCrypto}
                onSwitchView={() => {
                  // handleSwitchView();
                  setGhostSlideVisible(!ghostSlideVisible)
                  // console.log("onSwitchView")
                }}
                headerTitle={'Payairo Account'}
                balance={isCrypto ?
                  (bankBalance?.bank_account?.usd ?? 0) :
                  Number(totalDisbursable || 0)}
                currencySymbol="USD"
                currencyIcon={SVGUSD}
                identifierType={"Payairo ID:"}
                identifier={walletData?.username || "Username"}
                pendingAmount={!isCrypto ? totalDisbursablePending : 0}
                onCopy={() => console.log("Copy identifier")}
                onWithdraw={() => console.log("Withdraw pressed")}
                logoSvg={isCrypto ? SVGSecurities : SVGLoggo}
              />
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginVertical: 20,
            }}>
            <SvgXml
              xml={SVGSend}
              onPress={() => {
                navigation.navigate(
                  !isCrypto ? NAVIGATION_SCREENS.SEND_TOKEN : NAVIGATION_SCREENS.SEND,
                  {
                    requested: false,
                  },
                );
              }}
            />
            <SvgXml
              xml={SVGReceive}
              onPress={() =>
                navigation.navigate(
                  !isCrypto ? NAVIGATION_SCREENS.RECEIVE_TOKEN : NAVIGATION_SCREENS.RECEIVE,
                )
              }
            />
            <SvgXml
              xml={!isCrypto ? SVGHolding : SVGAdd}
              style={{ marginBottom: 20 }}
              onPress={() => {
                if (!isCrypto) {
                  navigation.navigate('CryptoDashboard');
                } else {
                  setisVisible(true);
                }
              }}
            />
          </View>
        </View>
        <Card
          style={{ backgroundColor: theme.colors.palette.white, borderWidth: 0 }}
          padding={10}
          borderRadius={theme.spacing.spacing[10]}
        >
          <View style={{ width: '100%', padding: 5, }}>
            <MemoizedDashboardSection
              title='Your Accounts'
              actionText='see all'
              onActionPress={() => { }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{}}
                style={{ marginRight: 10 }}>
                {walletApi.loading || bankDetailsApi.loading ? (
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
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          width: '90%',
                          marginBottom: 10,
                        }}>
                        <SvgXml xml={SVGUSD} width={35} height={35} />
                        <View style={{ flex: 1, }}>

                          <CustomText
                            variant={'subtitle2'}
                            fontWeight={'bold'}

                            fontFamily={theme.typography.fontFamily.nexaHeavy}
                            style={{
                              marginLeft: 5,
                              marginTop: 2,
                            }}
                          >
                            {item.displayName}
                          </CustomText>
                          <CustomText

                            color={theme.colors.palette.grey600}
                            fontFamily={theme.typography.fontFamily.nexaHeavy}
                            style={{
                              marginLeft: 5,
                              marginTop: 2,
                              fontSize: 14,
                              fontWeight: "400"
                            }}
                          >
                            {`${BANK_TYPE}`}
                          </CustomText>
                        </View>
                      </View>
                      <CustomText

                        color={theme.colors.palette.grey600}
                        fontFamily={theme.typography.fontFamily.nexaHeavy}
                        style={{
                          marginLeft: 5,
                          marginTop: 2,
                          fontSize: 12,
                          fontWeight: "400"
                        }}
                      >
                        {`Total Available Balance`}
                      </CustomText>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}>
                        <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center', flex: 1 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: 'rgba(44, 106, 63, 1)',
                              fontSize: 16,
                              fontFamily: Fonts.bold,
                              marginLeft: 5,
                            }}>
                            {hiddenBalances[item.accountNumber] ? '••••••' : `$${item.balance}`}
                          </Text>
                          {!hiddenBalances[item.accountNumber] ? (
                            <TouchableOpacity style={{ padding: 10 }} onPress={() => handleEyeClick(item.accountNumber)}>
                              <SvgXml style={{ marginLeft: 10, top: 1 }} xml={SVG_eye_on} width={15} height={15} />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity style={{ padding: 10 }} onPress={() => handleEyeClick(item.accountNumber)}>
                              <SvgXml style={{ marginLeft: 10, top: 1 }} xml={SVG_eye_off} width={15} height={15} />
                            </TouchableOpacity>
                          )}
                        </View>

                        <Text
                          onPress={() =>
                            navigation.navigate(NAVIGATION_SCREENS.BANK_DETAILS, {
                              item: item,
                              bankbalance: item.balance,
                            })
                          }
                          style={{
                            color: 'rgba(106, 106, 106, 1)',
                            fontSize: 10,
                            fontFamily: Fonts.regular,
                            marginLeft: 5,
                            marginTop: 5,
                            textDecorationLine: 'underline',
                          }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  ))
                )}
                <SvgXml width={250} height={130} xml={SVGNewBank} onPress={handleOpenLink} />
              </ScrollView>
            </MemoizedDashboardSection>
            <MemoizedDashboardSection
              title='PayAiro Contacts'
              actionText='see all'
              onActionPress={onContactSeeALl}
            >
              {contactsApi.loading ? (
                // Skeleton loading for contacts
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 }}>
                  {[1, 2, 3, 4].map((_, index) => (
                    <View key={index} style={{ alignItems: 'center' }}>
                      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.palette.grey200 }} />
                      <View style={{ width: 40, height: 12, backgroundColor: theme.colors.palette.grey200, borderRadius: 4, marginTop: 8 }} />
                    </View>
                  ))}
                </View>
              ) : contactLists.length > 0 ? (
                <MemoizedStoryLists data={contactLists} isVisble3={isCrypto} />
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate(NAVIGATION_SCREENS.ADD_CONTACT)}
                  style={{
                    backgroundColor: 'rgba(44, 106, 63, 1)',
                    paddingBottom: 10,
                    paddingTop: 7,
                    paddingHorizontal: 10,
                    borderRadius: 30,
                    alignSelf: 'center',
                    marginTop: 20,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      fontFamily: Fonts.semibold,
                    }}>
                    + Add People
                  </Text>
                </TouchableOpacity>
              )}
            </MemoizedDashboardSection>
            {isCrypto && <CryptoFinanceSection navigation={navigation} />}
            {/* {!isCrypto &&
              <MemoizedDashboardSection
                title='PnL & Assets Allocation'
              // actionText='see all'
              // onActionPress={onContactSeeALl}
              >
                <View style={{ width: '100%' }}>
                  <View>
                    {selectedGraph !== 'Assets' && (
                      <>
                        <View
                          style={{
                            width: '100%',
                            alignSelf: 'center',
                            marginTop: 30,
                            marginBottom: 20,
                          }}>
                          {renderButtonGraph()}
                        </View>
                        <LineChartCustom isNoBg={true} />
                      </>
                    )}
                    {selectedGraph === 'Assets' && (
                      <View
                        style={{
                          backgroundColor: '#000',
                          padding: 20,
                          borderRadius: 20,
                          width: '100%',
                          alignSelf: 'center',
                          marginVertical: 15,
                        }}>
                        {renderButtonGraph()}
                        <View style={{ width: '100%', alignSelf: 'center' }}>
                          <CustomPieChart
                            allocationLists={memoizedAllocationLists}
                          />
                        </View>

                        <View
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: 20,
                            borderRadius: 20,
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontFamily: Fonts.bold,
                              marginBottom: 10,
                              fontSize: 16,
                            }}>
                            Assets Allocation
                          </Text>
                          {alloCationLists &&
                            alloCationLists.length > 0 &&
                            alloCationLists.map((item, key) => (
                              <View key={key}>
                                <AssetsCards
                                  item={item}
                                  isSelected={false}
                                  onPress={() => { }}
                                  type="display"
                                />
                              </View>
                            ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </MemoizedDashboardSection>
            } */}
            {!isCrypto && (
              <FiatGraphSection
                selectedGraph={selectedGraph}
                setselectedGraph={setselectedGraph}
                alloCationLists={alloCationLists}
                memoizedAllocationLists={memoizedAllocationLists}
              />
            )}

            {!isCrypto &&
              <MemoizedDashboardSection
                title='Explore Securities'
                // actionText=''
                onActionPress={() => { }}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(248, 248, 248, 1)',
                      borderRadius: 15,
                      padding: 15,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      width: 170,
                    }}>
                    <SvgXml xml={SVGBit} />
                    <View style={{ marginLeft: 15 }}>
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: Fonts.semibold,
                          textAlign: 'left',
                          marginLeft: 15,
                          marginBottom: 10,
                        }}>
                        Crypto
                      </Text>
                      <GenericButton
                        title={'Explore '}
                        onPress={() => navigation.navigate('CryptoScreen')}
                        cStyle={{
                          backgroundColor: '#000',
                          padding: 5,
                          width: '80%',
                        }}
                        tStyle={{ color: 'white', fontSize: 10 }}
                        disabled={false}
                        icon={null}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(248, 248, 248, 1)',
                      borderRadius: 15,
                      padding: 15,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      width: 170,
                      marginLeft: 10,
                    }}>
                    <SvgXml xml={SVGSecurities} />
                    <View style={{ marginLeft: 15 }}>
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: Fonts.semibold,
                          textAlign: 'left',
                          marginLeft: 8,
                          marginBottom: 10,
                        }}>
                        Stocks
                      </Text>
                      <GenericButton
                        onPress={() => navigation.navigate('StocksScreen')}
                        title={'Explore '}
                        cStyle={{
                          backgroundColor: '#000',
                          padding: 5,
                          width: '80%',
                        }}
                        tStyle={{ color: 'white', fontSize: 10 }}
                        disabled={false}
                        icon={null}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(248, 248, 248, 1)',
                      borderRadius: 15,
                      padding: 15,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      width: 170,
                      marginLeft: 10,
                    }}>
                    <SvgXml xml={SVGSecurities} />
                    <View style={{ marginLeft: 15 }}>
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: Fonts.semibold,
                          textAlign: 'left',
                          marginLeft: 8,
                          marginBottom: 10,
                        }}>
                        Stocks
                      </Text>
                      <GenericButton
                        onPress={() => navigation.navigate('StocksScreen')}
                        title={'Explore '}
                        cStyle={{
                          backgroundColor: '#000',
                          padding: 5,
                          width: '80%',
                        }}
                        tStyle={{ color: 'white', fontSize: 10 }}
                        disabled={false}
                        icon={null}
                      />
                    </View>
                  </View>
                </ScrollView>

              </MemoizedDashboardSection>
            }
            <MemoizedDashboardSection title='Recent Transactions' onActionPress={() => { }}>
              {txListsApi.loading || cryptoTxApi.loading ?
                ( // Skeleton loading for transactions
                  <>
                    <SkeletonTransactionCard />
                    <SkeletonTransactionCard />
                    <SkeletonTransactionCard />
                  </>
                ) :
                (
                  <>
                    {txLists && isCrypto && sortedTxLists.length > 0 ? (
                      sortedTxLists.map((item: any, key: any) => (
                        <View key={key}>
                          <MemoizedTransactionCard
                            item={item}
                            key={key}
                            isMerchent={item?.order_id}
                            isCrypto={item?.order_id}
                          />
                        </View>
                      ))
                    ) : (
                      <></>
                    )}
                    {web3TxLists &&
                      !isCrypto &&
                      sortedWeb3TxLists.length > 0 &&
                      sortedWeb3TxLists.map((item: any, key: any) => (
                        <View key={key}>
                          <MemoizedTransactionCard isCrypto={true} item={item} key={key} isMerchent={item?.order_id} />
                        </View>
                      ))}
                  </>
                )}
            </MemoizedDashboardSection>
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
      {
        showPin && (
          <PincodeScreen
            pinTxt={pinTxt}
            onPress={async (e: any, f: any) => {
              setshowPin(false);

              if (!f) {
                if (e !== isConfirm) {
                  useDispatchAction(setErrorMsg('Pin not matched , Try Again'));
                  setpinTxt('Confirm your pin');
                  setshowPin(true);
                  return;
                }
                const formData = new FormData();
                formData.append('tpin', e);
                const data = await createPin(formData, tokens?.access);
                if (data && data?.status) {
                  setPin(e);
                  useDispatchAction(
                    setSuccessMsg('Transaction Pin created successfully'),
                  );
                } else {
                  useDispatchAction(setErrorMsg('Something Went Wrong'));
                }
              } else {
                setisConfirm(e);
                setpinTxt('Confirm your pin');
                setshowPin(f);
              }
            }}
            isNotDecimals={null}
          />
        )
      }
    </ScreenContainer >
  );
};

// Create styles with theme
const createStyles = (theme: any) => StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: theme.colors.button.primary.background,
    paddingVertical: theme.spacing.spacing.xs,
    paddingHorizontal: theme.spacing.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.spacing.xs,
  },
  actionButtonText: {
    fontFamily: theme.typography.fontFamily.montserratSemiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.button.primary.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.spacing.md,
  },
  themeToggleButton: {
    backgroundColor: theme.colors.button.secondary.background,
    padding: theme.spacing.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.spacing.xs,
  },
  fontTestButton: {
    backgroundColor: theme.colors.button.secondary.background,
    padding: theme.spacing.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
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
