import { View, Text, StyleSheet } from 'react-native'
import React, { FC } from 'react'
import { ContactData, Interaction, MessageData, TransactionData } from './chat.types'
import MessageBubble from './MessageBubble'
import useSelectorAction from 'hooks/useSelectorAction'
import { getMessageSender } from './ChatConfigs'
import Fonts from 'constants/Fonts'
import { Theme, useTheme } from 'styles'
import BankingTransaction from './BankingTransaction'
import PendingRequest from './PendingRequest'
import NFTTransaction from './NFTTransaction'

interface ChatItemComponentProps {
    item?: Interaction,
    contact: ContactData,
}

const ChatItemComponent: FC<ChatItemComponentProps> = ({
    item,
    contact
}) => {
    const { theme } = useTheme();
    const { tokens, userData, walletData, isCrypto } = useSelectorAction();

    
//    console.log("contact on ChatItemComponent",contact)
console.log("nft_transactions",item?.type == 'nft_transaction')
    if (item?.type == 'message') {

        const senderType = getMessageSender(walletData, item?.data,'message');
        const isFromUser = senderType == 'user';

        return (
            <MessageBubble item={item.data} isFromUser={isFromUser} />
        )
    }
    else if (isCrypto && item?.type == 'crypto_transaction') {

        const senderType = getMessageSender(walletData, item?.data,"crypto_transaction");
        const isFromUser = senderType == 'user';

        return (
            <BankingTransaction contact={contact} item={item.data} isFromUser={isFromUser}   />
        )
    }
    else if (!isCrypto && item?.type == 'nft_transaction') {

        
        const senderType = getMessageSender(walletData, item?.data,"nft_transaction");
        const isFromUser = senderType == 'user';
        console.log("senderType =>",senderType)

        return (
            <NFTTransaction contact={contact} item={item.data} isFromUser={isFromUser}   />
        )
    }
    else if (isCrypto && item?.type == 'payment_request') {

        const senderType = getMessageSender(walletData, item?.data,"payment_request");
        const isFromUser = senderType == 'user';
        // console.log("payment_request =>",JSON.stringify(item?.data,null,2))
        // console.log("payment_request walletData =>",JSON.stringify(walletData,null,2))

        return (
            <PendingRequest contact={contact} item={item.data} isFromUser={isFromUser}   />
        )
    }
}

export default ChatItemComponent;

