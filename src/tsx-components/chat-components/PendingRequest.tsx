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

interface PendingRequestProps {
    item?: TransactionData,
    isFromUser?: boolean,
    contact: ContactData,

}


const PendingRequest: FC<PendingRequestProps> = ({
    item,
    isFromUser,
    contact,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { tokens, userData, walletData } = useSelectorAction();
    // console.log("contact =>",JSON.stringify(contact,null,2))
    let userName = isFromUser ? contact && (contact as ContactData).nickname ? (contact as ContactData).nickname : '' : 'you';
    let amount = `$ ${item?.amount}`;

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
                />
            </View>
            <View>
                <CustomText size={theme.typography.fontSize.xxl} fontWeight={'medium'} >{amount}</CustomText>
            </View>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center'
                    }}
                >
                    <SvgXml
                        xml={
                            SVGRequested
                        }
                        width={17}
                        height={17}
                    />
                    <CustomText variant={'body2'} color={theme.colors.palette.orange500} style={{ flex: 1, paddingLeft: 5, marginTop: 3 }}>{`Pending`}</CustomText>
                </View>
                <CustomText variant='caption' >
                    {moment(item?.timestamp).format('DD MMM')}
                </CustomText>
            </View>
        </View>
    )
}

export default PendingRequest;

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