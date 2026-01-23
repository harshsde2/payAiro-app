import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  TouchableWithoutFeedback,
} from "react-native";
import Fonts from "../../constants/Fonts";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCREENS } from "../../constants/SCREENS";
import { getContactListsForAll, sendMessage } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import { SVGLeftArrow, SVGSend2, SVGThreeDot } from "../../constants/images";
import { SvgXml } from "react-native-svg";
import { ScreenContainer } from "../../HOC";
import { useTheme } from "../../styles/ThemeContext";
import TransactionList from "../../components/TransactionLists";
import CustomChatComponent from "../../tsx-components/CustomChatComponent";
import MinimalChatComponent from "../../tsx-components/MinimalChatComponent";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import ChatComponent from "tsx-components/chat-components/ChatComponent";
import ChatContainer from "tsx-components/chat-components/ChatContainer";

// Transaction status components
const PendingTransaction = ({ amount, date }) => (
  <View style={styles.transactionCard}>
    <View style={[styles.transactionContent, { backgroundColor: "#FFF9F2" }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={styles.warningIcon}>
          <Text style={{ color: "#FF9500" }}>!</Text>
        </View>
        <Text style={[styles.statusText, { color: "#FF9500" }]}>Pending</Text>
      </View>
    </View>
  </View>
);

const CancelledTransaction = ({ amount, date }) => (
  <View style={styles.transactionCard}>
    <View style={[styles.transactionContent, { backgroundColor: "#FFF0F0" }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.warningIcon, { backgroundColor: "#FFEFEF" }]}>
          <Text style={{ color: "#FF3B30" }}>!</Text>
        </View>
        <Text style={[styles.statusText, { color: "#FF3B30" }]}>Cancelled</Text>
      </View>
    </View>
  </View>
);

const ReceivedTransaction = ({ amount, date }) => (
  <View style={[styles.transactionCard, { alignSelf: "flex-start" }]}>
    <View style={[styles.transactionContent, { backgroundColor: "#F0F8FF" }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.receivedIcon, { backgroundColor: "#E6F2FF" }]}>
          <Text style={{ color: "#007AFF" }}>✓</Text>
        </View>
        <Text style={[styles.statusText, { color: "#007AFF" }]}>Received</Text>
      </View>
    </View>
  </View>
);

const PaidTransaction = ({ amount, date }) => (
  <View style={styles.transactionCard}>
    <View style={[styles.transactionContent, { backgroundColor: "#F0FFF4" }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionAmount}>${amount}</Text>
        <View style={styles.checkContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.successIcon, { backgroundColor: "#E6FFE8" }]}>
          <Text style={{ color: "#34C759" }}>✓</Text>
        </View>
        <Text style={[styles.statusText, { color: "#34C759" }]}>Paid</Text>
      </View>
    </View>
  </View>
);

// Dropdown Menu component
const DropdownMenu = ({ onSelectItem }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.dropdownMenu}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => onSelectItem("Statement")}
      >
        <Text style={styles.menuItemText}>Statement</Text>
      </TouchableOpacity>
      <View style={styles.menuDivider} />
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('SupportScreen')}
      >
        <Text style={styles.menuItemText}>Support</Text>
      </TouchableOpacity>
    </View>
  );
}

// Let's try a simple placeholder component first to verify the component area is rendering
const PlaceholderChatComponent = ({ onTestPress }) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f0f0",
    }}
  >
    <Text style={{ fontSize: 16, marginBottom: 20 }}>
      Chat Component Placeholder
    </Text>
    <TouchableOpacity
      onPress={onTestPress}
      style={{
        padding: 15,
        backgroundColor: "#2C6A3F",
        borderRadius: 8,
      }}
    >
      <Text style={{ color: "white" }}>Test Button</Text>
    </TouchableOpacity>
  </View>
);

const ContactTx = ({ route }) => {
  const { item = {}, isVisble3 = false } = route.params || {};
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { tokens, userData, walletData } = useSelectorAction();
  const { theme } = useTheme();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [contactData, setContactData] = useState(item);

  // Ensure we have complete contact data
  // useEffect(() => {
  //   // Ensure the contact data is complete
  //   if (item && Object.keys(item).length > 0) {
  //     // Make a copy to avoid reference issues
  //     const enhancedContact = { ...item };

  //     // Ensure contact has required fields
  //     if (!enhancedContact.email && enhancedContact.username) {
  //       console.log('Adding inferred email to contact data');
  //       // Create a placeholder email if none exists (for message identification)
  //       enhancedContact.email = `${enhancedContact.username}@example.com`;
  //     }

  //     setContactData(enhancedContact);
  //   }
  // }, [item]);

  // Ensure user data is also complete for proper message identification
  const getUserData = useMemo(() => {
    const user = {
      email: userData?.email || "",
      username: userData?.username || "",
    };

    // Add email if missing but username exists
    if (!user.email && user.username) {
      user.email = `${user.username}@myapp.com`;
    }

    return user;
  }, [userData]);

  // Handle back action - simplified version
  const handleBackPress = useCallback(() => {
    // Prevent back action if already loading
    if (isLoading) {
      return true;
    }
    try {
      // Use immediate navigation for clean exit
      navigation.goBack();
    } catch (error) {
      console.log("Navigation error:", error);
      // Force navigation as fallback
      if (navigation.canGoBack()) {
        navigation.popToTop();
      }
    }

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

  // Get display name safely
  const getDisplayName = () => {
    try {
      return item?.nickname || "Contact";
    } catch (e) {
      return "Contact";
    }
  };

  // console.log("item =>",JSON.stringify(item,null,2));

  // Get user identifier
  const getUserIdentifier = () => {
    try {
      return (
        item?.email?.trim() ||
        item?.username?.trim() ||
        item?.wallet_address ||
        ""
      );
    } catch (e) {
      return "";
    }
  };

  // Handle menu selection
  const handleMenuSelection = (option) => {
    setIsDropdownVisible(false);

    if (option === "Statement") {
      navigation.navigate("Statement");
    } else if (option === "Help") {
      alert("Help Selected");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsDropdownVisible(false);
          // console.log("isDropdownVisible =>", isDropdownVisible)
        }}
      >
        <View style={{ flex: 1 }}>
          <ScreenContainer
            padding={0}
            backgroundColor={theme.colors.palette.white}
          >
            {/* Header with profile and back button */}
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <SafeSvgBackButton onPress={handleBackPress} />

                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    {contactData?.image ? (
                      <Image
                        source={{ uri: contactData.image }}
                        style={styles.avatar}
                      />
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

            {/* Main content with custom chat UI */}
            <View style={styles.chatContainer}>
              {isFocused && tokens?.access ? (
                <ChatContainer
                  contactData={contactData}
                  getUserData={getUserData}
                />
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.palette.green700}
                  />
                </View>
              )}
            </View>

            {/* Bottom action bar */}
            {/* <View style={styles.bottomActions}>
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
      </View> */}
          </ScreenContainer>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    // backgroundColor: '',
    paddingTop: Platform.OS === "ios" ? 44 : 0,
    position: "relative",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: "hidden",
    backgroundColor: "rgba(255, 37, 99, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 14,
    color: "#000",
    fontFamily: Fonts.bold,
  },
  profileId: {
    fontSize: 10,
    color: "grey",
    fontFamily: Fonts.semibold,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    position: "absolute",
    top: 75,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
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
    backgroundColor: "#EEEEEE",
  },
  menuItemText: {
    fontSize: 16,
    color: "#000",
    fontFamily: Fonts.regular,
  },
  keyboardAvoidView: {
    flex: 1,
    display: "flex",
  },
  transactionListContainer: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Bottom action bar
  bottomActions: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    flexDirection: "row",
    borderTopColor: "rgba(237, 237, 237, 1)",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "45%",
    marginVertical: 5,
  },
  payButton: {
    backgroundColor: "black",
    borderRadius: 15,
    paddingVertical: 8,
    // paddingHorizontal: 15,
    justifyContent: "center",
    marginLeft: 5,
    width: "45%",
    alignItems: "center",
  },
  payButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: Fonts.semibold,
  },
  requestButton: {
    backgroundColor: "rgba(44, 106, 63, 1)",
    borderRadius: 15,
    paddingVertical: 8,
    // paddingHorizontal: 15,
    width: "45%",
    alignItems: "center",
  },
  requestButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: Fonts.semibold,
  },
  messageInputContainer: {
    borderWidth: 1,
    borderColor: "rgba(237, 237, 237, 1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 40,
    width: "55%",
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  messageInput: {
    flex: 1,
    paddingLeft: 5,
    color: "rgba(106, 106, 106, 1)",
    height: 40,
  },
  sendButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 22,
    color: "#333",
    fontWeight: "bold",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default ContactTx;

const messageData = {
  status: true,
  message: "OK",
  data: {
    contact: {
      mobileno: "",
      email: "",
      wallet_address: "0x40C0c3132baAbE39e3002De9aA786088D86a5469",
      nickname: "rishabh",
      username: "rishabpay12",
    },
    interactions: [
      {
        type: "crypto_transaction",
        timestamp: "2025-04-21T06:42:16.027599Z",
        data: {
          sender__wallet_public_key:
            "0xd3C2A59CE57A28B927211A931Fc919d1683c6004",
          recipient__wallet_public_key:
            "0x40C0c3132baAbE39e3002De9aA786088D86a5469",
          amount: 10,
          status: "success",
          timestamp: "2025-04-21T06:42:16.027599Z",
          description: null,
          is_read: true,
        },
      },
      {
        type: "crypto_transaction",
        timestamp: "2025-04-21T08:25:44.260292Z",
        data: {
          sender__wallet_public_key:
            "0xd3C2A59CE57A28B927211A931Fc919d1683c6004",
          recipient__wallet_public_key:
            "0x40C0c3132baAbE39e3002De9aA786088D86a5469",
          amount: 1,
          status: "success",
          timestamp: "2025-04-21T08:25:44.260292Z",
          description: null,
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T08:31:37.194253Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "hello",
          timestamp: "2025-04-21T08:31:37.194253Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T08:34:40.971209Z",
        data: {
          sender__email: "rishabhsingh321@yopmail.com",
          recipient__email: "payairotest12@yopmail.com",
          content: "Hyy",
          timestamp: "2025-04-21T08:34:40.971209Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T08:37:04.002460Z",
        data: {
          sender__email: "rishabhsingh321@yopmail.com",
          recipient__email: "payairotest12@yopmail.com",
          content: "How are you ",
          timestamp: "2025-04-21T08:37:04.002460Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T08:57:01.880480Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "Hey\n",
          timestamp: "2025-04-21T08:57:01.880480Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:42:59.890688Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "hello",
          timestamp: "2025-04-21T09:42:59.890688Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:43:19.007911Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "Hey I am here",
          timestamp: "2025-04-21T09:43:19.007911Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:44:01.460358Z",
        data: {
          sender__email: "rishabhsingh321@yopmail.com",
          recipient__email: "payairotest12@yopmail.com",
          content: "Hry",
          timestamp: "2025-04-21T09:44:01.460358Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:48:27.232113Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "Hey",
          timestamp: "2025-04-21T09:48:27.232113Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:48:36.385492Z",
        data: {
          sender__email: "rishabhsingh321@yopmail.com",
          recipient__email: "payairotest12@yopmail.com",
          content: "How are you ",
          timestamp: "2025-04-21T09:48:36.385492Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:48:55.654539Z",
        data: {
          sender__email: "rishabhsingh321@yopmail.com",
          recipient__email: "payairotest12@yopmail.com",
          content: "Hey",
          timestamp: "2025-04-21T09:48:55.654539Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:49:05.394317Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "Hii",
          timestamp: "2025-04-21T09:49:05.394317Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:51:46.242638Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "hey",
          timestamp: "2025-04-21T09:51:46.242638Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:54:07.608662Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "hii",
          timestamp: "2025-04-21T09:54:07.608662Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T09:56:31.347244Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "hey",
          timestamp: "2025-04-21T09:56:31.347244Z",
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T10:03:26.837772Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "hy",
          timestamp: "2025-04-21T10:03:26.837772Z",
          is_read: true,
        },
      },
      {
        type: "crypto_transaction",
        timestamp: "2025-04-21T10:04:08.988863Z",
        data: {
          sender__wallet_public_key:
            "0xd3C2A59CE57A28B927211A931Fc919d1683c6004",
          recipient__wallet_public_key:
            "0x40C0c3132baAbE39e3002De9aA786088D86a5469",
          amount: 1,
          status: "success",
          timestamp: "2025-04-21T10:04:08.988863Z",
          description: null,
          is_read: true,
        },
      },
      {
        type: "crypto_transaction",
        timestamp: "2025-04-21T10:06:24.970485Z",
        data: {
          sender__wallet_public_key:
            "0xd3C2A59CE57A28B927211A931Fc919d1683c6004",
          recipient__wallet_public_key:
            "0x40C0c3132baAbE39e3002De9aA786088D86a5469",
          amount: 10,
          status: "success",
          timestamp: "2025-04-21T10:06:24.970485Z",
          description: null,
          is_read: true,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T10:15:52.117664Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "Hey",
          timestamp: "2025-04-21T10:15:52.117664Z",
          is_read: false,
        },
      },
      {
        type: "message",
        timestamp: "2025-04-21T10:16:43.779533Z",
        data: {
          sender__email: "payairotest12@yopmail.com",
          recipient__email: "rishabhsingh321@yopmail.com",
          content: "hey",
          timestamp: "2025-04-21T10:16:43.779533Z",
          is_read: false,
        },
      },
    ],
  },
};
