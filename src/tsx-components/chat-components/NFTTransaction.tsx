import { View, Text, StyleSheet } from 'react-native'
import React, { FC } from 'react'
import useSelectorAction from 'hooks/useSelectorAction';
import { Theme, useTheme } from 'styles';
import Fonts from 'constants/Fonts';
import { ContactData, TransactionData, WalletData } from './chat.types';
import CustomText from 'tsx-components/CustomText';
import { SvgXml } from 'react-native-svg';
import { SVGCanceled, SVGInfo, SVGReceived, SVGRequested, SVGSent } from 'constants/images';
import moment from 'moment';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';

interface NFTTransactionProps {
    item?: TransactionData,
    isFromUser?: boolean,
    contact:ContactData
}


const NFTTransaction: FC<NFTTransactionProps> = ({
    item,
    isFromUser,
    contact
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { tokens, userData, walletData,isCrypto } = useSelectorAction();
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    // console.log("contact =>",JSON.stringify(contact,null,2))
    let userName = isFromUser ? contact && (contact as ContactData).nickname ? (contact as ContactData).nickname : '' : 'you';
    let amount = `$ ${item?.amount}`;
    let value = `${item?.value}`;
    let paymentStatus = {
        false: isFromUser ? 'Paid' : 'Recieved',
        cancelled: 'Cancelled',
    } as any

    // console.log(item)


    const getPaymentStatus = (status: any) => {
        switch (status) {
            case false:
                return <View
                        style={{ 
                            flex: 1, 
                            flexDirection: 'row', 
                            justifyContent: 'space-around', 
                            alignItems: 'center' 
                        }}
                    >
                        <SvgXml
                            xml={
                                isFromUser
                                ? SVGSent
                                    : SVGReceived
                            }
                            width={17}
                            height={17}
                        />
                        <CustomText variant={'body2'} color={isFromUser ?  theme.colors.palette.green700 : theme.colors.palette.blue500} style={{ flex: 1, paddingLeft: 5,marginTop:3 }}>{`${paymentStatus[status]}`}</CustomText>
                    </View>
            case 'cancelled':
                return <View
                style={{ 
                    flex: 1, 
                    flexDirection: 'row', 
                    justifyContent: 'space-around', 
                    alignItems: 'center' ,
                }}
            >
                <SvgXml
                    xml={
                        SVGCanceled
                    }
                    width={17}
                    height={17}
                />
                <CustomText variant={'body2'} color={theme.colors.palette.red500} style={{ flex: 1, paddingLeft: 5,marginTop:3}}>{`${paymentStatus[status]}`}</CustomText>
            </View>
                    
        }
    } 


    return (
        <View style={[
            styles.transactionCard,
            isFromUser ? styles.userMessage : styles.contactMessage,
        ]}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}>

                <CustomText variant='caption' >Payment to {userName}</CustomText>
                <SvgXml
                    xml={SVGInfo}
                    style={{ marginLeft: -30 }}
                    onPress={() => {
                        navigation.navigate(NAVIGATION_SCREENS.TX_VIEW_DETAILS as string, 
                        {
                          transactionLists: [
                            {
                              To:
                                (item as any)?.to_address__wallet_public_key ??
                                (item as any)?.to_wallet,
                            },
                            {
                              From:
                                (item as any)?.from_address__wallet_public_key ??
                                (item as any)?.to_address__wallet_public_key,
                            },
                            {TxId: '1ertya34uiopchh-2345790'},
                            {Amount: ((item as any)?.amount ? (item as any)?.amount + '$' : (item as any)?.value)},
                            {
                              Date: moment((item as any)?.timestamp).format(
                                'DD MMM YYYY , LT',
                              ),
                            },
                          ],
                          isCrypto: (item as any)?.token,
                        });
                      }}
                />
            </View>
            <View>
                <CustomText size={theme.typography.fontSize.xxl} fontWeight={'medium'} >{value}</CustomText>
            </View>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {getPaymentStatus(item?.status)}
                <CustomText variant='caption' >
                    {moment(item?.timestamp).format('DD MMM')}
                </CustomText>
            </View>
        </View>
    )
}

export default NFTTransaction;

const createStyles = (theme: Theme) => StyleSheet.create({
    transactionCard: {
        padding: 10,
        marginVertical: 8,
        borderRadius: 12,
        width: '50%',
        borderWidth: 3,
        borderColor: 'rgba(52, 153, 224, 0.07)',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.palette.grey100, // Green background for user messages
    },
    contactMessage: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.palette.grey100, // Gray background for contact messages
    },
    messageText: {
        fontSize: 12,
        marginBottom: 5,
        fontFamily: Fonts.semibold,
    },
    userMessageText: {
        color: theme.colors.palette.green700, // Dark green text for user messages
    },
    contactMessageText: {
        color: 'rgba(106, 106, 106, 1)', // Gray text for contact messages
    },
    messageTime: {
        fontSize: 11,
        color: '#999',
        alignSelf: 'flex-end',
        fontFamily: Fonts.regular,
    },
})