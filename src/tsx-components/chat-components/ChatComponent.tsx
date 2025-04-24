import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native'
import React, { FC, useState, useEffect, useRef, memo } from 'react'
import { Theme, useTheme } from 'styles'
import Fonts from 'constants/Fonts';
import { SvgXml } from 'react-native-svg';
import { SVGSend2 } from '../../constants/images';
import { useSelector } from 'react-redux';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { scale } from '@shopify/react-native-skia';
import { ContactData, Interaction, MessageData, TransactionData, WalletData } from './chat.types';
import ChatItemComponent from './ChatItemComponent';
import { sendMessage } from '../../services/Services';

interface ChatComponentProps {
    currentUser: {},
    initialMessages: [Interaction],
    contact: ContactData,
}

// Memoized chat item to prevent unnecessary re-renders
const MemoizedChatItem = memo(ChatItemComponent);

const ChatComponent: FC<ChatComponentProps> = ({
    currentUser,
    initialMessages,
    contact
}) => {

    const { theme } = useTheme();
    const {
        isCrypto,
        tokens,
        walletData
    } = useSelector((state: any) => state.authenticationSlice);
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const styles = customStyles(theme);

    let MyEmail = (walletData as WalletData)?.account_email || '';
    let userName = (walletData as WalletData)?.username || '';

    // Get user identifier
    const getUserIdentifier = () => {
        try {
            return contact?.email?.trim() || contact?.username?.trim() || contact?.wallet_address || '';
        } catch (e) {
            return '';
        }
    };

    // console.log('contact=>', JSON.stringify(contact,null,2))
    // Use States
    const [messageText, setMessageText] = useState<string>('');
    const [sortedMessages, setSortedMessages] = useState<Interaction[]>([]);
    const [isSending, setIsSending] = useState<boolean>(false);

    // Refs to optimize performance
    const messagesRef = useRef<Interaction[]>([]);
    const isInitialRenderRef = useRef(true);

    // Sort messages when initialMessages change
    useEffect(() => {
        // Skip if messages are the same
        if (initialMessages === messagesRef.current && !isInitialRenderRef.current) {
            return;
        }

        if (initialMessages && initialMessages.length > 0) {
            // Update our ref to avoid duplicate processing
            messagesRef.current = initialMessages;

            // Sort the messages (only if needed)
            const sorted = [...initialMessages].map(message => ({
                ...message,
                sortTimestamp: new Date(message.timestamp).getTime()
            }))
                .sort((a, b) => b.sortTimestamp - a.sortTimestamp);

            setSortedMessages(sorted);
        } else {
            setSortedMessages([]);
        }

        isInitialRenderRef.current = false;
    }, [initialMessages]);

    // Send a message
    const handleSendMessage = async () => {
        if (!messageText.trim() || !contact?.username || !tokens || isSending) return;

        try {
            setIsSending(true);

            // Create message object for UI update
            const newMessage: Interaction = {
                type: 'message',
                timestamp: new Date().toISOString(),
                data: {
                    sender__email: MyEmail,
                    recipient__email: contact.email || '',
                    content: messageText,
                    timestamp: new Date().toISOString(),
                    is_read: false
                } as any // Use type assertion to avoid the type error
            };

            // Update UI immediately for better UX
            setSortedMessages(prevMessages => {
                // Create a new array with the new message at the beginning (newest)
                const updatedMessages = [newMessage, ...prevMessages];
                return updatedMessages.sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
            });

            // Clear the input field immediately
            setMessageText('');

            // Send to API
            await sendMessage(
                {
                    recipient_user: contact.username,
                    content: messageText,
                },
                tokens?.access
            );

        } catch (error) {
            console.log('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Memoize renderItem function to prevent recreating it on every render
    const renderItem = useRef(({ item, index }: { item: Interaction, index: number }) => (
        <MemoizedChatItem item={item} key={index} contact={contact}/>
    )).current;

    return (
        <View style={styles.mainContainer}>
            <View style={styles.messagesContainer}>
                <FlatList
                    data={sortedMessages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.timestamp}
                    contentContainerStyle={styles.messagesList}
                    inverted
                    removeClippedSubviews={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={10}
                    updateCellsBatchingPeriod={100}
                    showsVerticalScrollIndicator={true}
                />
            </View>
            {/* Bottom action bar */}
            <View style={styles.bottomActions}>
                <View style={styles.actionButtons}>
                    {isCrypto && (
                        <TouchableOpacity
                            style={styles.requestButton}
                            activeOpacity={0.8}
                            onPress={() => {
                                navigation.navigate(
                                    (isCrypto ? NAVIGATION_SCREENS.SEND : NAVIGATION_SCREENS.SEND_TOKEN) as never,
                                    {
                                        sender: getUserIdentifier(),
                                        type: 'requested',
                                    } as never
                                );
                            }}
                        >
                            <Text style={[styles.requestButtonText, { fontFamily: theme.typography.fontFamily.montserrat }]}>Request</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.payButton,
                            !isCrypto && { flex: 1 } // Full width if Request button is not shown
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                            navigation.navigate(
                                (isCrypto ? NAVIGATION_SCREENS.SEND : NAVIGATION_SCREENS.SEND_TOKEN) as never,
                                {
                                    sender: getUserIdentifier(),
                                    type: 'receive',
                                } as never
                            );
                        }}
                    >
                        <Text style={[styles.payButtonText, { fontFamily: theme.typography.fontFamily.montserrat }]}>Pay</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                        value={messageText}
                        onChangeText={setMessageText}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !messageText.trim() && styles.disabledSendButton
                        ]}
                        onPress={handleSendMessage}
                        disabled={!messageText.trim() || isSending}
                    >
                        <SvgXml xml={SVGSend2} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default ChatComponent

const customStyles = (theme: Theme) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.colors.palette.green50,
        padding: theme.spacing.spacing[1],
    },
    messagesContainer: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 5,
        paddingVertical: 10,
        flexGrow: 1,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
        fontFamily: Fonts.regular,
        color: '#333',
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(44, 106, 63, 1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledSendButton: {
        opacity: 0.5,
    },

    // Bottom action bar
    bottomActions: {
        height: 70,
        flexDirection: 'row',
        backgroundColor: 'white',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '38%',
        marginVertical: 5,
    },
    payButton: {
        backgroundColor: 'black',
        borderRadius: 15,
        paddingVertical: 8,
        justifyContent: 'center',
        marginLeft: 5,
        width: '50%',
        alignItems: 'center',
    },
    payButtonText: {
        color: 'white',
        fontSize: 12,
        fontFamily: Fonts.semibold,
    },
    requestButton: {
        backgroundColor: 'rgba(44, 106, 63, 1)',
        borderRadius: 15,
        paddingVertical: 8,
        width: '45%',
        alignItems: 'center',
    },
    requestButtonText: {
        color: 'white',
        fontSize: 12,
        fontFamily: Fonts.semibold,
    },
})


