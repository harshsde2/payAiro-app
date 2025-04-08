import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';

// Components
import Container from '../../HOC/Container';
import BalanceModal from '../../components/BalanceModal';
import BottomNavigation from '../../components/BottomNavigation';
import Header from '../../components/Header';
import QRModal from '../../components/QRModal';
import StoryLists from '../../components/StoryLists';
import Fonts from '../../constants/Fonts';
import { SCREENS } from '../../constants/SCREENS';

// Import SVG assets directly as needed
// Instead of using constants that may not be properly typed
const SVGSend = `...`; // Replace with actual SVG content if needed
const SVGReceive = `...`; // Replace with actual SVG content if needed
const SVGLogo2 = `...`; // Replace with actual SVG content if needed
const SVGLogo3 = `...`; // Replace with actual SVG content if needed
const SVGAdd = `...`; // Replace with actual SVG content if needed
const SVGHolding = `...`; // Replace with actual SVG content if needed
const SVGKYC2 = `...`; // Replace with actual SVG content if needed
const SVGSliders = `...`; // Replace with actual SVG content if needed
const SVGUSD = `...`; // Replace with actual SVG content if needed
const SVGDownArrow3 = `...`; // Replace with actual SVG content if needed
const SVGCopy3 = `...`; // Replace with actual SVG content if needed
const SVGBANK2 = `...`; // Replace with actual SVG content if needed

// Hooks
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setActiveTab,
  setBankbalances,
  setCalculatedBalance,
  setGuides,
  setisCrypto,
} from '../../redux/slices/authenticationSlice';

// React Query Hooks
import { 
  useWalletBalance, 
  useWalletDetails,
  useTransactions,
  useContacts,
  useCryptoBalance,
  useCryptoTrades,
  useBankBalances,
  useAllBankAccounts,
} from '../../query/hooks';

// Storage
import { getGuide } from '../../services/Auth';
import GhostSlide from '../../animations/animations-components/GhostSlide';

// Types
interface CryptoAsset {
  assetType: string;
  disbursable: number;
  pending: number;
  [key: string]: any;
}

// Response types for API data
interface CryptoBalanceResponse {
  data?: {
    data?: {
      data?: any[];
    };
  };
  isLoading: boolean;
  refetch: () => void;
}

// Navigation type
type NavigationType = any; // Replace with your proper navigation type

/**
 * Refactored Dashboard component using React Query
 */
export default function DashboardRefactored() {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationType>();
  
  // Redux state
  const {
    walletData,
    userData,
    selectedCrypto,
    networkLists,
    isCrypto,
  } = useSelector((state: any) => state.authenticationSlice);
  
  // Local state
  const [isVisible, setisVisible] = useState(false);
  const [isVisible2, setisVisible2] = useState(false);
  const [isVisble3, setisVisble3] = useState(isCrypto);
  const [show, setshow] = useState(true);
  const [isShowKYC, setisShowKYC] = useState(false);
  const [isShowWeeks, setisShowWeeks] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCardModalVisible, setisCardModalVisible] = useState(false);
  const [isBankModalVisible, setisBankModalVisible] = useState(false);
  const [isGuideVisible, setisGuideVisible] = useState(false);
  const [ghostSlideVisible, setGhostSlideVisible] = useState(false);
  
  // Animation refs
  const translateY = useRef(new Animated.Value(0)).current;
  
  // React Query hooks
  const walletBalance = useWalletBalance();
  const walletDetails = useWalletDetails();
  const transactions = useTransactions();
  const contacts = useContacts();
  const cryptoBalance = useCryptoBalance() as CryptoBalanceResponse;
  const cryptoTrades = useCryptoTrades();
  const bankBalances = useBankBalances();
  const bankAccounts = useAllBankAccounts();
  
  // Derived data
  const txLists = useMemo(() => {
    if (transactions.data?.data) {
      const { merchantTransactions = [], userToUserTransactions = [] } = transactions.data.data;
      return [...merchantTransactions, ...userToUserTransactions].filter(i => i?.status === 'success') || [];
    }
    return [];
  }, [transactions.data]);
  
  const contactLists = useMemo(() => {
    return contacts.data?.data || [];
  }, [contacts.data]);
  
  const cryptoAssets: CryptoAsset[] = useMemo(() => {
    if (cryptoBalance?.data?.data?.data) {
      return cryptoBalance.data.data.data.filter((asset: any) => asset?.assetType !== 'usd') || [];
    }
    return [];
  }, [cryptoBalance]);
  
  const totalDisbursable = useMemo(() => {
    if (cryptoAssets.length > 0) {
      return Number(cryptoAssets.reduce((sum: number, asset: CryptoAsset) => sum + (asset?.disbursable || 0), 0));
    }
    return 0;
  }, [cryptoAssets]);
  
  const totalDisbursablePending = useMemo(() => {
    if (cryptoAssets.length > 0) {
      return Number(cryptoAssets.reduce((sum: number, asset: CryptoAsset) => sum + (asset?.pending || 0), 0));
    }
    return 0;
  }, [cryptoAssets]);
  
  const bankLists = useMemo(() => {
    if (bankAccounts.data?.data) {
      const { bank_accounts = [], traditional_ira_accounts = [], roth_ira_accounts = [] } = bankAccounts.data.data;
      return [...bank_accounts, ...traditional_ira_accounts, ...roth_ira_accounts];
    }
    return [];
  }, [bankAccounts.data]);
  
  // Focus effect
  React.useEffect(() => {
    if (isFocused) {
      useDispatchAction(setActiveTab('1'));
      getGuideStatus();
    }
  }, [isFocused]);
  
  // Guide status check
  const getGuideStatus = async () => {
    const guide = await getGuide();
    useDispatchAction(setGuides(guide));
    if (!guide) {
      setisGuideVisible(true);
    }
  };
  
  // Bank balance update
  React.useEffect(() => {
    if (bankBalances.data?.data) {
      useDispatchAction(setBankbalances(bankBalances.data.data));
    }
  }, [bankBalances.data]);
  
  // Toggle ghost slide animation
  const toggleGhostSlide = () => setGhostSlideVisible(prev => !prev);
  
  // Handle wallet switch (crypto/fiat)
  const handleSwitch = () => {
    toggleGhostSlide();
    useDispatchAction(
      setCalculatedBalance(selectedCrypto?.balance_in_tether ?? 0),
    );
    useDispatchAction(setisCrypto(!isCrypto));
  };
  
  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    // Refetch all data
    walletBalance.refetch();
    walletDetails.refetch();
    transactions.refetch();
    contacts.refetch();
    cryptoBalance.refetch();
    cryptoTrades.refetch();
    bankBalances.refetch();
    bankAccounts.refetch();
    
    // Delay to ensure a smooth refresh experience
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Opacity animation for smooth transitions
  const opacity = translateY.interpolate({
    inputRange: [-100, 0],
    outputRange: [0.2, 1],
    extrapolate: 'clamp',
  });
  
  // Loading state
  const isLoading = 
    walletBalance.isLoading || 
    walletDetails.isLoading || 
    transactions.isLoading || 
    contacts.isLoading ||
    bankBalances.isLoading ||
    bankAccounts.isLoading;
  
  // Render a loading placeholder if data is still loading
  if (isLoading && !refreshing) {
    return (
      <Container bgColor={'rgba(226, 241, 227, 0.2)'} translucent={false} isWhite={false}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 16 }}>Loading...</Text>
        </View>
      </Container>
    );
  }
  
  return (
    <Container bgColor={'rgba(226, 241, 227, 0.2)'} translucent={false} isWhite={false}>
      {/* Bottom Navigation with Ghost Slide animation */}
      <View style={{
        position: 'absolute',
        bottom: 20,
        zIndex: 9999,
        width: '92%',
        alignSelf: 'center',
      }}>
        <GhostSlide
          visible={ghostSlideVisible}
          direction="custom"
          duration={2500}
          distance={1000}
          customX={0}
          customY={-400}
          ghostOpacity={1}
          onAnimationComplete={() => console.log('Ghost slide completed')}
        >
          <View style={{
            padding: 10,
            backgroundColor: 'black',
            borderRadius: 20,
            width: '92%',
            alignSelf: 'center',
          }}>
            <BottomNavigation isVer={true} />
          </View>
        </GhostSlide>
      </View>
      
      {/* Modals */}
      <BalanceModal
        isVisible={isVisible}
        onClose={() => setisVisible(false)}
        onSelected={() => {
          setisVisible(false);
          navigation.navigate(SCREENS.Receive);
        }}
      />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#B1FF84', '#000']}
            />
          }
          contentContainerStyle={{ flexGrow: 1 }}>
          
          {/* Header */}
          <Header name={walletDetails.data?.data?.name || walletData?.name} />
          
          {/* KYC Notice */}
          {isShowKYC && (
            <View style={{
              backgroundColor: '#000',
              width: '95%',
              padding: 15,
              borderRadius: 15,
              alignSelf: 'center',
              marginBottom: 10,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}>
                <SvgXml xml={SVGKYC2} />
                <Text style={{
                  color: 'rgba(177, 177, 177, 1)',
                  fontFamily: Fonts.semibold,
                  fontSize: 14,
                  marginLeft: 10,
                }}>
                  Your Second level KYC verification is pending.{' '}
                  <TouchableOpacity>
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
          
          {/* Wallet Section */}
          <View style={{ backgroundColor: 'rgba(249, 249, 249, 1)' }}>
            <View style={{
              backgroundColor: 'rgba(224, 239, 225, 1)',
              borderRadius: 40,
              width: '90%',
              alignSelf: 'center',
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 15,
                paddingHorizontal: 25,
              }}>
                <Text style={{ fontFamily: Fonts.semibold, color: '#000' }}>
                  {!isCrypto ? 'SECURITY' : 'PAYAIRO'} ACCOUNT
                </Text>
                <Animated.View
                  style={[
                    { transform: [{ translateY }], opacity },
                  ]}>
                  <TouchableOpacity
                    disabled={true}
                    style={{
                      backgroundColor: 'rgba(224, 239, 225, 1)',
                      padding: 5,
                      borderRadius: 40,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: 'rgba(224, 239, 225, 1)',
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                    <SvgXml xml={SVGUSD} width={isCrypto ? undefined : 30} height={isCrypto ? undefined : 30} />
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginLeft: 5,
                    }}>
                      <Text style={{
                        color: '#000',
                        fontSize: 14,
                        fontFamily: Fonts.semibold,
                        marginRight: 5,
                      }}>
                        USD
                      </Text>
                      <SvgXml xml={SVGDownArrow3} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              
              {/* Balance Display */}
              <View style={[
                {
                  padding: 10,
                  borderRadius: 25,
                  backgroundColor: isCrypto ? 'rgba(44, 106, 63, 1)' : '#fff',
                  marginVertical: 5,
                  elevation: 7,
                },
              ]}>
                <Animated.View
                  style={{
                    transform: [{ translateY }],
                    opacity,
                    width: '100%',
                  }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {show && (
                      <View style={{ padding: 10, width: '80%' }}>
                        <Text style={{
                          fontFamily: Fonts.semibold,
                          color: isCrypto ? '#fff' : 'black',
                          marginTop: 0,
                        }}>
                          {!isCrypto ? 'Holdings' : 'Payairo Balance'}
                        </Text>
                        <Text style={{
                          fontFamily: Fonts.bold,
                          color: isCrypto ? '#fff' : 'black',
                          fontSize: 25,
                          marginBottom: !isCrypto ? 0 : 40,
                        }}>
                          {!isCrypto
                            ? totalDisbursable.toFixed(5)
                            : '$' + Number(
                              bankBalances.data?.data?.bank_account?.usd ?? 0,
                            ).toFixed(2)}
                        </Text>
                        {!isCrypto && (
                          <Text style={{
                            fontFamily: Fonts.regular,
                            color: 'red',
                            fontSize: 12,
                            marginBottom: 30,
                          }}>
                            (Pending {totalDisbursablePending.toFixed(5)})
                          </Text>
                        )}
                        <Text style={{
                          fontFamily: Fonts.semibold,
                          color: isCrypto ? '#fff' : 'black',
                        }}>
                          {!isCrypto ? '' : 'Payairo ID'}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: Fonts.semibold,
                            color: isCrypto ? '#fff' : 'black',
                            fontSize: 12,
                            width: '80%',
                          }}>
                          {!isCrypto ? '' : walletData?.username}
                          {isCrypto && <SvgXml xml={SVGCopy3} />}
                        </Text>
                      </View>
                    )}
                    <SvgXml
                      xml={isCrypto ? SVGLogo3 : SVGLogo2}
                      style={{ marginLeft: -100 }}
                      onPress={() => handleSwitch()}
                    />
                  </View>
                </Animated.View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginVertical: 10,
              marginHorizontal: 15,
            }}>
              <SvgXml
                xml={SVGSend}
                onPress={() => {
                  navigation.navigate(
                    !isCrypto ? SCREENS.SendToken : SCREENS.Send,
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
                    !isCrypto ? SCREENS.ReceiveToken : SCREENS.Receive,
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
          
          {/* Contacts Section */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '95%',
            alignSelf: 'center',
            paddingVertical: 20,
            marginLeft: 5,
            paddingHorizontal: 5,
          }}>
            <Text style={{
              color: '#1D1D1D',
              fontFamily: Fonts.semibold,
              fontSize: 20,
            }}>
              Pay Airo Contacts
            </Text>
            <Text
              onPress={() =>
                navigation.navigate('ContactScreen', {
                  isVisble3: isCrypto,
                })
              }
              style={{
                color: '#6A6A6A',
                fontFamily: Fonts.semibold,
                fontSize: 12,
              }}>
              See all
            </Text>
          </View>
          
          {/* Contact List */}
          {contactLists.length > 0 ? (
            <StoryLists data={contactLists} isVisble3={isCrypto} />
          ) : (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ fontFamily: Fonts.semibold, color: '#6A6A6A' }}>
                No contacts found
              </Text>
            </View>
          )}
          
          {/* Recent Transactions Section */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '95%',
            alignSelf: 'center',
            paddingVertical: 20,
            marginLeft: 5,
            paddingHorizontal: 5,
          }}>
            <Text style={{
              color: '#1D1D1D',
              fontFamily: Fonts.semibold,
              fontSize: 20,
            }}>
              Recent Transactions
            </Text>
            <Text
              onPress={() => navigation.navigate('Transaction')}
              style={{
                color: '#6A6A6A',
                fontFamily: Fonts.semibold,
                fontSize: 12,
              }}>
              See all
            </Text>
          </View>
          
          {/* Display transaction items */}
          {txLists.length > 0 ? (
            txLists.slice(0, 3).map((item, index) => (
              <View key={index} style={{
                backgroundColor: '#fff',
                padding: 15,
                borderRadius: 15,
                width: '90%',
                alignSelf: 'center',
                marginBottom: 10,
              }}>
                <Text style={{ fontFamily: Fonts.semibold }}>
                  {item.transactionType || 'Payment'}
                </Text>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
                  ${Number(item.amount).toFixed(2)}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, color: '#6A6A6A', fontSize: 12 }}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ fontFamily: Fonts.semibold, color: '#6A6A6A' }}>
                No transactions found
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
} 