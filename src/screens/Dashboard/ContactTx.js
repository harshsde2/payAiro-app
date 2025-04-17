import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  BackHandler,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Fonts from '../../constants/Fonts';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SCREENS } from '../../constants/SCREENS';
import { getContactListsForAll, sendMessage } from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import { SVGLeftArrow, SVGSend2, SVGThreeDot } from '../../constants/images';
import { SvgXml } from 'react-native-svg';
import { ScreenContainer } from '../../HOC';
import { useTheme } from '../../styles/ThemeContext';
import TransactionList from '../../components/TransactionLists';

// Transaction status components
const PendingTransaction = ({ amount, date }) => (
  <View style={styles.transactionCard}>
    <View style={[styles.transactionContent, { backgroundColor: '#FFF9F2' }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={styles.warningIcon}>
          <Text style={{ color: '#FF9500' }}>!</Text>
        </View>
        <Text style={[styles.statusText, { color: '#FF9500' }]}>Pending</Text>
      </View>
    </View>
  </View>
);

const CancelledTransaction = ({ amount, date }) => (
  <View style={styles.transactionCard}>
    <View style={[styles.transactionContent, { backgroundColor: '#FFF0F0' }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.warningIcon, { backgroundColor: '#FFEFEF' }]}>
          <Text style={{ color: '#FF3B30' }}>!</Text>
        </View>
        <Text style={[styles.statusText, { color: '#FF3B30' }]}>Cancelled</Text>
      </View>
    </View>
  </View>
);

const ReceivedTransaction = ({ amount, date }) => (
  <View style={[styles.transactionCard, { alignSelf: 'flex-start' }]}>
    <View style={[styles.transactionContent, { backgroundColor: '#F0F8FF' }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.receivedIcon, { backgroundColor: '#E6F2FF' }]}>
          <Text style={{ color: '#007AFF' }}>✓</Text>
        </View>
        <Text style={[styles.statusText, { color: '#007AFF' }]}>Received</Text>
      </View>
    </View>
  </View>
);

const PaidTransaction = ({ amount, date }) => (
  <View style={styles.transactionCard}>
    <View style={[styles.transactionContent, { backgroundColor: '#F0FFF4' }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.successIcon, { backgroundColor: '#E6FFE8' }]}>
          <Text style={{ color: '#34C759' }}>✓</Text>
        </View>
        <Text style={[styles.statusText, { color: '#34C759' }]}>Paid</Text>
      </View>
    </View>
  </View>
);

// Dropdown Menu component
const DropdownMenu = ({ onSelectItem }) => (
  <View style={styles.dropdownMenu}>
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={() => onSelectItem('Statement')}
    >
      <Text style={styles.menuItemText}>Statement</Text>
    </TouchableOpacity>
    <View style={styles.menuDivider} />
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={() => onSelectItem('Help')}
    >
      <Text style={styles.menuItemText}>Help</Text>
    </TouchableOpacity>
  </View>
);

const ContactTx = ({ route }) => {
  const { item = {}, isVisble3 = false } = route.params || {};
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { tokens } = useSelectorAction();
  const { theme } = useTheme();
  
  // States
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [userTx, setUserTx] = useState([]);
  
  // Memoized components
  const MemoizedTransactionList = React.memo(TransactionList);
  
  // Handle back action - simplified version
  const handleBackPress = useCallback(() => {
    // First, disable any ongoing operations
    if (isLoading) {
      return true; // Prevent back action if already loading
    }
    
    // Set a flag to prevent double-navigation
    setIsLoading(true);
    
    // Immediate cleanup - clear any ongoing timers
    const cleanup = () => {
      // Reset data before unmounting to avoid updates on unmounted component
      setUserTx([]);
      setIsDropdownVisible(false);
    };
    
    cleanup();
    
    // Defer the navigation to next tick
    requestAnimationFrame(() => {
      // Safe navigation
      navigation.goBack();
    });
    
    return true;
  }, [navigation, isLoading]);
  
  // Use a wrapper for safe SVG rendering
  const SafeSvgBackButton = ({ onPress }) => {
    // Use a simple button with background color
    return (
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={onPress}
      >
          <SvgXml width={60} height={60} xml={SVGLeftArrow} />
      </TouchableOpacity>
    );
  };
  
  // Fetch messages when screen is focused
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    
    const fetchData = async () => {
      if (isFocused && isMounted) {
        await getContactLists();
        
        // Set up interval for message fetching - clear any existing interval first
        if (intervalId) {
          clearInterval(intervalId);
        }
        
        intervalId = setInterval(() => {
          if (isFocused && isMounted) {
            getContactLists();
          }
        }, 5000);
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isFocused]);
  
  // Get contact messages
  const getContactLists = async () => {
    if (!item?.username || !tokens?.access || isLoading) return;
    
    try {
      setIsLoading(true);
      const data = await getContactListsForAll(
        'username',
        item?.username,
        tokens?.access,
      );
      
      if (data?.data?.interactions) {
        setUserTx(data.data.interactions);
      }
    } catch (error) {
      console.log('Error fetching contact messages:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send message function
  const sendMess = async () => {
    if (!messageText.trim() || !item?.username || !tokens?.access) return;
    
    try {
      setIsLoading(true);
      await sendMessage(
        {
          recipient_user: item?.username,
          content: messageText,
        },
        tokens?.access,
      );
      setMessageText('');
      await getContactLists();
    } catch (error) {
      console.log('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get display name safely
  const getDisplayName = () => {
    try {
      return (item?.nickname || 'Contact');
    } catch (e) {
      return 'Contact';
    }
  };
  
  // Get user identifier
  const getUserIdentifier = () => {
    try {
      return item?.email?.trim() || item?.username?.trim() || item?.wallet_address || '';
    } catch (e) {
      return '';
    }
  };
  
  // Handle menu selection
  const handleMenuSelection = (option) => {
    setIsDropdownVisible(false);
    
    if (option === 'Statement') {
      navigation.navigate('Statement');
    } else if (option === 'Help') {
      alert('Help Selected');
    }
  };
  
  // Memoize transaction items to prevent unnecessary re-renders
  const memoizedTxItems = useMemo(() => userTx ?? [], [userTx]);
  
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.white}>
      {/* Header with profile and back button */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <SafeSvgBackButton onPress={handleBackPress} />
          
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {item?.image ? (
                <Image source={{ uri: item.image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {getDisplayName().charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{getDisplayName()}</Text>
              <Text style={styles.profileId}>{getUserIdentifier()}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setIsDropdownVisible(!isDropdownVisible)}
          >
            <SvgXml xml={SVGThreeDot} />
          </TouchableOpacity>
        </View>
        
        {/* Dropdown menu */}
        {isDropdownVisible && (
          <DropdownMenu onSelectItem={handleMenuSelection} />
        )}
      </View>
      
      {/* Main content with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Transaction list */}
        <View style={styles.transactionListContainer}>
          {isLoading && userTx.length === 0 ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={theme.colors.palette.green700} />
            </View>
          ) : (
            <MemoizedTransactionList
              items={memoizedTxItems}
              isVisble3={isVisble3}
            />
          )}
        </View>
        
        {/* Bottom action bar */}
        <View style={styles.bottomActions}>
          <View style={styles.actionButtons}>
            {isVisble3 && (
              <TouchableOpacity 
                style={styles.requestButton}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate(
                    isVisble3 ? SCREENS.Send : SCREENS.SendToken,
                    {
                      sender: getUserIdentifier(),
                      type: 'requested',
                    },
                  );
                }}
              >
                <Text style={[styles.requestButtonText,{ fontFamily : theme.typography.fontFamily.montserrat}]}>Request</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.payButton,
                !isVisble3 && { flex: 1 } // Full width if Request button is not shown
              ]}
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate(
                  isVisble3 ? SCREENS.Send : SCREENS.SendToken,
                  {
                    sender: getUserIdentifier(),
                    type: 'receive',
                  },
                );
              }}
            >
              <Text style={[styles.payButtonText,{fontFamily:theme.typography.fontFamily.montserrat}]}>Pay</Text>
            </TouchableOpacity>
          </View>
          
          {/* Message input */}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Message..."
              placeholderTextColor="rgba(106, 106, 106, 0.7)"
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity 
              style={styles.sendButton}
              disabled={!messageText.trim() || isLoading}
              onPress={sendMess}
            >
              <SvgXml xml={SVGSend2} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    position: 'relative',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 37, 99, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 14,
    color: '#000',
    fontFamily: Fonts.bold,
  },
  profileId: {
    fontSize: 10,
    color: 'grey',
    fontFamily: Fonts.semibold,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 75,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 99999,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Fonts.regular,
  },
  keyboardAvoidView: {
    flex: 1,
    display: 'flex',
  },
  transactionListContainer: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom action bar
  bottomActions: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    flexDirection:'row',
    borderTopColor: 'rgba(237, 237, 237, 1)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '45%',
    marginVertical: 5,
  },
  payButton: {
    backgroundColor: 'black',
    borderRadius: 15,
    paddingVertical: 8,
    // paddingHorizontal: 15,
    justifyContent:'center',
    marginLeft: 5,
    width: '45%',
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
    // paddingHorizontal: 15,
    width: '45%',
    alignItems: 'center',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: Fonts.semibold,
  },
  messageInputContainer: {
    borderWidth: 1,
    borderColor: 'rgba(237, 237, 237, 1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 40,
    width: '55%',
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#fff',
    marginTop: 5,
  },
  messageInput: {
    flex: 1,
    paddingLeft: 5,
    color: 'rgba(106, 106, 106, 1)',
    height: 40,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default ContactTx;
