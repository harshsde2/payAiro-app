import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { ScreenContainer } from 'HOC'
import { SVG_eye_off, SVG_eye_on, SVGAddIcon, SVGLeftArrow, SVGUSD } from '../../constants/images'
import HeaderTitle from 'components/HeaderTitle'
import { Theme, useTheme } from 'styles'
import CustomSearchTextInput from 'tsx-components/CustomSearchTextInput'
import { SvgXml } from 'react-native-svg'
import DashboardSection from 'tsx-components/DashboardSection'
// import { useRecentContacts } from 'query/hooks/useRecentContacts'
import StoryLists from 'components/StoryLists'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { CustomText, TransactionCard } from 'tsx-components'
import Fonts from 'constants/Fonts'
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants'
import { RecentContact } from 'api/types'
import { getCryptoTx, getPayAeroTx } from 'services/Services'
import { useAllBankAccounts, useBankAccounts, useRecentContacts, useTransactions } from 'query/hooks'


const TrustedCircle = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { isCrypto ,tokens} = useSelector((state: any) => state.authenticationSlice);
    const { data:RecentContacts  } = useRecentContacts() as any;

    const { data: AllBankAccounts } = useAllBankAccounts();
    const { data: BankAccounts, } = useBankAccounts();

    console.log("AllBankAccounts =>", JSON.stringify(AllBankAccounts,null,2));
    console.log("BankAccounts =>", JSON.stringify(BankAccounts?.data,null,2));

    const styles = customStyles(theme);

    const contactLists = RecentContacts?.data || [];
    

    const [latestContacts, setLatestContacts] = useState<RecentContact[]>([]);
    const [isLoadingLatestContact, setIsLoadingLatestContact] = useState(false);
    const [txLists, settxLists] = useState<any[]>([]);
    const [web3TxLists, setweb3TxLists] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('')



    useEffect(() => {
        if (Array.isArray(RecentContacts?.data)) {
            setLatestContacts(RecentContacts?.data);
            setIsLoadingLatestContact(false);

        }
    }, [])

    // useEffect(() => {
    //     // Group all data fetch operations
    //     const fetchInitialData = async () => {
    //       if (!tokens && !tokens?.access) {
    //         console.error("No access token available");
    //         return;
    //       }
    
    //       try {
    //         console.log("Fetching initial dashboard data");
    
    //         // Create an array of promises with descriptive catch handlers
    //         const promises = [
    //           fetchTransactions().catch(err => console.error("Transactions fetch failed TrustedCircle:", err)),
    //           fetchCryptoTransactions().catch(err => console.error("Crypto transactions fetch failed:", err)),
    //         ];
    
    //         // Execute all promises in parallel
    //         await Promise.allSettled(promises);
    //         // console.log("All initial data fetch operations completed");
    //       } catch (error) {
    //         console.error('Error loading dashboard data:', error);
    //       }
    //     };
    
    //     fetchInitialData();
    
    //   }, [tokens?.access]);

    const handleNavigation = (ScreenName: string) => {
        switch (ScreenName) {
            case NAVIGATION_SCREENS.CONTACT_SCREEN: {
                (navigation as any).navigate(NAVIGATION_SCREENS.CONTACT_SCREEN, { isVisible3: true });
                break;
            }

        }
    }

    // const fetchTransactions = async () => {
    //     if(!tokens?.access) return;
    //     try {
    //       console.log("Fetching PayAiro transactions...");
    //       const response = await getPayAeroTx(tokens?.access);

    //       console.log("PayAiro transactions response:", response);
    
    //       // Extract transactions data correctly based on response format
    //       let transactionsData = null;
    
    //       if (response?.data?.merchantTransactions || response?.data?.userToUserTransactions) {
    //         // Format: { data: { merchantTransactions: [], userToUserTransactions: [] } }
    //         transactionsData = {
    //           merchantTransactions: response.data.merchantTransactions || [],
    //           userToUserTransactions: response.data.userToUserTransactions || []
    //         };
    //       } else if (response?.merchantTransactions || response?.userToUserTransactions) {
    //         // Format: { merchantTransactions: [], userToUserTransactions: [] }
    //         transactionsData = {
    //           merchantTransactions: response.merchantTransactions || [],
    //           userToUserTransactions: response.userToUserTransactions || []
    //         };
    //       } else if (response?.data?.data) {
    //         // Format: { data: { data: { merchantTransactions: [], userToUserTransactions: [] } } }
    //         transactionsData = {
    //           merchantTransactions: response.data.data.merchantTransactions || [],
    //           userToUserTransactions: response.data.data.userToUserTransactions || []
    //         };
    //       }
    
    //       if (!transactionsData) {
    //         console.error("Could not find valid transactions data in response:", response);
    //         return;
    //       }
    
    //       // console.log("Extracted transactions data:", transactionsData);
    
    //       // Create a merged and filtered list in one operation
    //       const successfulTransactions = [
    //         ...transactionsData.merchantTransactions,
    //         ...transactionsData.userToUserTransactions
    //       ].filter(tx => tx?.status === 'success');
    
    //       // console.log(`Found ${successfulTransactions.length} successful transactions`);
    //       settxLists(successfulTransactions);
    //     } catch (error) {
    //       console.error('Error fetching transactions:', error);
    //     }
    //   };

    // const fetchCryptoTransactions = async () => {
    //     try {
    //       // console.log("Fetching crypto transactions...");
    //       const response = await getCryptoTx(tokens?.access);
    //       // console.log("Crypto transactions response:", response);
    
    //       // Extract crypto transactions data correctly based on response format
    //       let cryptoData = null;
    
    //       if (response?.data?.nft_transactions || response?.data?.trades) {
    //         // Format: { data: { nft_transactions: [], trades: [] } }
    //         cryptoData = {
    //           nft_transactions: response.data.nft_transactions || [],
    //           trades: response.data.trades || []
    //         };
    //       } else if (response?.nft_transactions || response?.trades) {
    //         // Format: { nft_transactions: [], trades: [] }
    //         cryptoData = {
    //           nft_transactions: response.nft_transactions || [],
    //           trades: response.trades || []
    //         };
    //       } else if (response?.data?.data) {
    //         // Format: { data: { data: { nft_transactions: [], trades: [] } } }
    //         cryptoData = {
    //           nft_transactions: response.data.data.nft_transactions || [],
    //           trades: response.data.data.trades || []
    //         };
    //       }
    
    //       if (!cryptoData) {
    //         console.error("Could not find valid crypto transactions data in response:", response);
    //         return;
    //       }
    
    //       // console.log("Extracted crypto transactions data:", cryptoData);
    
    //       // Safely combine NFT transactions and trades
    //       const allTransactions = [
    //         ...cryptoData.nft_transactions,
    //         ...cryptoData.trades
    //       ];
    
    //       // console.log(`Found ${allTransactions.length} crypto transactions`);
    //       setweb3TxLists(allTransactions);
    //     } catch (error) {
    //       console.error('Error fetching crypto transactions:', error);
    //     }
    //   };


    const MemoizedStoryLists = React.memo(StoryLists);
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

    const MemoizedTransactionCard = React.memo(TransactionCard);



    return (
        <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50} >
            <HeaderTitle
                title={"Circle"}
                leftIcon={SVGLeftArrow}
                isBack
                onPressLeft={() => { navigation.goBack() }}
            />
            <View style={{ flex: 1, paddingHorizontal: 10, flexDirection: 'row', maxHeight: 70, justifyContent: 'space-between', alignItems: 'center' }}>
                <CustomSearchTextInput
                    placeholder="Search Name or Payairo tag..."
                    placeholderTextColor={theme.colors.palette.green700}
                    onChangeText={setSearchText}
                    value={searchText}
                />
                <SvgXml width={50} height={50} style={{ marginLeft: 10 }} onPress={() => handleNavigation(NAVIGATION_SCREENS.CONTACT_SCREEN)} xml={SVGAddIcon} />
            </View>
            <ScrollView style={styles.container}>
                <DashboardSection
                    title='Latest People'
                    actionText='See all'
                    onActionPress={() => { }}
                    style={{ marginBottom: 10 }}
                >
                    {isLoadingLatestContact ? <ActivityIndicator size={'small'} color={theme.colors.palette.green700} /> :
                        <MemoizedStoryLists data={contactLists} isVisble3={isCrypto} />}
                </DashboardSection>
                <DashboardSection
                    title='Pending Requests'
                    actionText='see all'
                    onActionPress={() => { }}
                >
                    <View
                        // key={}
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
                                    variant={'caption'}
                                    fontWeight={'regular'}

                                    fontFamily={theme.typography.fontFamily.nexaHeavy}
                                    style={{
                                        marginLeft: 5,
                                        marginTop: 2,
                                    }}
                                >
                                    {"Request from"}
                                </CustomText>
                                <CustomText

                                    color={theme.colors.palette.grey600}
                                    fontFamily={theme.typography.fontFamily.nexaHeavy}
                                    style={{
                                        marginLeft: 5,
                                        marginTop: 2,
                                        fontSize: 14,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {`Harsh Pal`}
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
                            {`Amount`}
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
                                    {`$${923882}`}
                                </Text>
                            </View>

                            <Text
                                onPress={() =>
                                    navigation.navigate(NAVIGATION_SCREENS.BANK_DETAILS as never)
                                }
                                style={{
                                    color: 'rgba(106, 106, 106, 1)',
                                    fontSize: 10,
                                    // fontFamily: Fonts.regular,
                                    marginLeft: 5,
                                    marginTop: 5,
                                    textDecorationLine: 'underline',
                                }}>
                                View Details
                            </Text>
                        </View>
                    </View>
                </DashboardSection>
                <DashboardSection
                    title='Recent Transactions'
                    actionText='see all'
                    onActionPress={() => { }}
                >
                    <>
                        {/* {txLists && isCrypto && sortedTxLists.length > 0 ? (
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
                        )} */}
                        {/* {web3TxLists &&
                            !isCrypto &&
                            sortedWeb3TxLists.length > 0 &&
                            sortedWeb3TxLists.map((item: any, key: any) => (
                                <View key={key}>
                                    <MemoizedTransactionCard isCrypto={true} item={item} key={key} isMerchent={item?.order_id} />
                                </View>
                            ))} */}
                    </>
                </DashboardSection>
            </ScrollView>
        </ScreenContainer>
    )
}

export default TrustedCircle;

const customStyles = (theme: Theme) => StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: theme.colors.palette.white,
        borderTopEndRadius: 32,
        borderTopStartRadius: 32,
        padding: theme.spacing.layout.screenPadding,
        marginTop: theme.spacing.spacing[0],
    },
})