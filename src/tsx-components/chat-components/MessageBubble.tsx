import { View, Text, StyleSheet } from 'react-native'
import React, { FC } from 'react'
import { Theme, themes, useTheme } from 'styles'
import Fonts from 'constants/Fonts';
import { TransactionData, MessageData } from './chat.types';
import { getMessageSender } from './ChatConfigs'
import useSelectorAction from 'hooks/useSelectorAction';

interface MessageBubbleProps {
    item: TransactionData,
    isFromUser: boolean
}

const MessageBubble: FC<MessageBubbleProps> = ({
    item,
    isFromUser
}) => {
    const { theme } = useTheme();
    theme.colors.palette
    const styles = createStyles(theme);
 


    // Format the timestamp for display
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    return (
        <View
            style={[
                styles.messageBubble,
                isFromUser ? styles.userMessage : styles.contactMessage,
            ]}
        >
            <Text
                style={[
                    styles.messageText,
                    isFromUser ? styles.userMessageText : styles.contactMessageText
                ]}
            >
                {item?.content}
            </Text>
            <Text style={styles.messageTime}>
                {formatTime(item.timestamp)}
            </Text>
        </View>
    )
}

export default MessageBubble

const createStyles = (theme: Theme) => StyleSheet.create({
    messageBubble: {
        maxWidth: '80%',
        padding: theme?.spacing?.spacing[3],
        borderRadius: theme?.spacing?.spacing[3],
        marginVertical: theme?.spacing?.spacing[2],
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.palette.green200, // Green background for user messages
    },
    contactMessage: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.palette.white, // Gray background for contact messages
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