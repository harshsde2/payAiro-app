import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { Theme, useTheme } from "styles";
import useSelectorAction from "hooks/useSelectorAction";
import { showError, showSuccess } from "utils/toast";
import { SvgIcons } from "constants/svgs";
import { CustomText } from "tsx-components";
import GenericButton from "components/GenericButton";
import { IFreshchatUser } from "./types";
import { useAppLock } from "hooks/useAppLock";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

// Try to import Freshchat SDK
let Freshchat: any = null;
let FreshchatConfig: any = null;
let FreshchatUser: any = null;
try {
  const FreshchatSDK = require("react-native-freshchat-sdk");
  Freshchat = FreshchatSDK.Freshchat;
  FreshchatConfig = FreshchatSDK.FreshchatConfig;
  FreshchatUser = FreshchatSDK.FreshchatUser;
} catch (e) {
  console.warn("Freshchat SDK not available:", e);
}

// Define wallet data interface for type safety (matches actual walletData structure)
interface IWalletData {
  account_email?: string;
  name?: string;
  username?: string;
  phone?: string;
  phoneCountryCode?: string;
}

// =====================================================
// TODO: Replace with your Freshchat credentials
// Get these from: Freshchat Dashboard → Settings → Mobile SDK
// =====================================================
const FRESHCHAT_APP_ID = "55a5f65c-dc34-4673-8a0e-ec378efb9193"; 
const FRESHCHAT_APP_KEY = "b7a36ae2-b186-402b-8f93-060c0b7084d4"; 
const FRESHCHAT_DOMAIN = "msdk.in.freshchat.com"; // From Freshworks dashboard
// =====================================================

// Check if SDK is available and configured
const isSDKConfigured = (): boolean => {
  return (
    FRESHCHAT_APP_ID.length > 10 && 
    FRESHCHAT_APP_KEY.length > 10 &&
    !FRESHCHAT_APP_ID.includes("YOUR_")
  );
};

const FreshchatScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { walletData } = useSelectorAction() as {
    walletData: IWalletData | null;
  };
  const styles = customStyles(theme);
  const { setNativeModalVisible } = useAppLock();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSDKReady, setIsSDKReady] = useState(false);

  useEffect(() => {
    initializeFreshchat();
  }, []);

  // Update Freshchat user when walletData changes
  useEffect(() => {
    if (isSDKReady && walletData) {
      setFreshchatUser(walletData);
    }
  }, [walletData, isSDKReady]);

  const initializeFreshchat = async () => {
    try {
      setIsInitializing(true);
      setInitError(null);

      // Check if SDK is available
      if (!Freshchat || !FreshchatConfig) {
        throw new Error("Freshchat SDK not installed properly");
      }

      // Check if credentials are configured
      if (!isSDKConfigured()) {
        throw new Error(
          "Freshchat not configured.\n\n" +
            "To set up:\n" +
            "1. Sign up at freshchat.com\n" +
            "2. Get App ID & App Key from Settings → Mobile SDK\n" +
            "3. Update credentials in FreshchatScreen.tsx"
        );
      }

      // Initialize Freshchat SDK
      const freshchatConfig = new FreshchatConfig(
        FRESHCHAT_APP_ID,
        FRESHCHAT_APP_KEY
      );
      freshchatConfig.domain = FRESHCHAT_DOMAIN;
      freshchatConfig.teamMemberInfoVisible = true;
      freshchatConfig.cameraCaptureEnabled = true;
      freshchatConfig.gallerySelectionEnabled = true;
      
      // Custom theme to remove "Powered by Freshchat" branding (iOS only)
      // iOS: uses FreshchatCustomTheme.plist from ios/payAiro/
      // Note: Requires FreshchatDisableFrame secret key from Freshworks
      if (Platform.OS === 'ios') {
        freshchatConfig.themeName = 'FreshchatCustomTheme';
      }

      // Freshchat.init() may not return a promise - just call it and proceed
      Freshchat.init(freshchatConfig);

      // Small delay to allow SDK to initialize
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500));

      // Set user information if available (in background)
      if (walletData) {
        setFreshchatUser(walletData).catch((err) =>
          console.warn("Failed to set user:", err)
        );
      }

      setIsSDKReady(true);
      setIsInitializing(false);
    } catch (error: any) {
      console.error("Freshchat init error:", error);
      setInitError(error?.message || "Failed to initialize chat support");
      setIsInitializing(false);
    }
  };

  const setFreshchatUser = (userData: IWalletData): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!FreshchatUser || !userData) {
        resolve();
        return;
      }

      try {
        // STEP 1: Identify user with unique external ID (email)
        // This is what creates a UNIQUE user in Freshchat
        const externalId = userData.account_email || userData.username || "";
        
        if (externalId) {
          Freshchat.identifyUser(externalId, null, (error: any) => {
            if (error) {
              console.error("Freshchat identifyUser error:", error);
            } else {
              console.log("Freshchat user identified with externalId:", externalId);
            }
          });
        }

        // STEP 2: Set user details (name, email, phone)
        const freshchatUser = new FreshchatUser();

        if (userData.account_email) {
          freshchatUser.email = userData.account_email;
        }

        // Set firstName from name or username
        if (userData.name) {
          const nameParts = userData.name.split(" ");
          freshchatUser.firstName = nameParts[0] || userData.name;
          freshchatUser.lastName = nameParts.slice(1).join(" ") || "";
        } else if (userData.username) {
          freshchatUser.firstName = userData.username;
        }

        // Set phone if available
        if (userData.phone) {
          freshchatUser.phone = userData.phone;
          freshchatUser.phoneCountryCode = userData.phoneCountryCode || "+1";
        }

        // Set user with callback (Freshchat uses callback-style API)
        Freshchat.setUser(freshchatUser, (error: any) => {
          if (error) {
            console.error("Freshchat setUser error:", error);
            reject(error);
          } else {
            console.log(
              "Freshchat user set successfully:",
              userData.account_email || userData.username
            );

            // Set additional user properties (metadata) for agents
            setFreshchatUserProperties(userData);
            resolve();
          }
        });
      } catch (error) {
        console.error("Error setting Freshchat user:", error);
        reject(error);
      }
    });
  };

  // Set additional user properties (metadata) visible to support agents
  const setFreshchatUserProperties = (userData: IWalletData) => {
    try {
      const userProperties: Record<string, string> = {};

      if (userData.username) {
        userProperties["username"] = userData.username;
      }
      if (userData.name) {
        userProperties["full_name"] = userData.name;
      }
      if (userData.account_email) {
        userProperties["email"] = userData.account_email;
      }

      // Only set properties if we have any
      if (Object.keys(userProperties).length > 0) {
        Freshchat.setUserProperties(userProperties, (error: any) => {
          if (error) {
            console.error("Error setting user properties:", error);
          } else {
            console.log("Freshchat user properties set successfully");
          }
        });
      }
    } catch (error) {
      console.error("Error in setFreshchatUserProperties:", error);
    }
  };

  const openChat = async () => {
    setNativeModalVisible(true);
    try {
      if (!isSDKReady) {
        showError("Chat unavailable", "Chat is not ready. Please try again.");
        return;
      }

      // Open Freshchat conversation
      await Freshchat.showConversations();
    } catch (error: any) {
      console.error("Error opening chat:", error);
      showError("Couldn't open chat", "Please try again.");
    } finally {
      // Reset flag AFTER chat modal closes (with delay to ensure app state change completes first)
      // The delay is important because the app state change to 'active' may happen AFTER Freshchat.showConversations() resolves/rejects
      setTimeout(() => {
        setNativeModalVisible(false);
      }, 1000);
    }
  };

  const openFAQs = async () => {
    try {
      if (!isSDKReady) {
        showError("FAQs unavailable", "FAQs are not ready. Please try again.");
        return;
      }

      // Open Freshchat FAQs
      await Freshchat.showFAQs();
    } catch (error: any) {
      console.error("Error opening FAQs:", error);
      showError("Couldn't open FAQs", "Please try again.");
    }
  };

  const handleRetry = () => {
    initializeFreshchat();
  };

  // Open email support as fallback
  const openEmailSupport = () => {
    const supportEmail = "support@payairo.com";
    const subject = "Support Request from PayAiro App";
    const body = `\n\n---\nUser: ${
      walletData?.name || walletData?.username || "Unknown"
    }\nEmail: ${walletData?.account_email || "Unknown"}`;

    Linking.openURL(
      `mailto:${supportEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  };

  const openEmailSupportForm = () => {
    navigation.navigate(NAVIGATION_SCREENS.SUPPORT_SCREEN, { mode: "emailSupport" });
  };

  // Render loading state
  if (isInitializing) {
    return (
      <ScreenContainer padding={0}>
        <HeaderTitle title="Chat Support" leftIcon="true" />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.palette.primary}
            />
            <CustomText variant="body1" style={styles.loadingText}>
              Initializing chat...
            </CustomText>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Render error state
  if (initError) {
    return (
      <ScreenContainer padding={0}>
        <HeaderTitle title="Chat Support" leftIcon="true" />
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <SvgIcons.InfoNote width={48} height={48} />
            <CustomText variant="h3" style={styles.errorTitle}>
              Chat Setup Required
            </CustomText>
            <CustomText variant="body2" style={styles.errorMessage}>
              {initError}
            </CustomText>
            {isSDKConfigured() && (
              <GenericButton
                title="Try Again"
                onPress={handleRetry}
                cStyle={styles.retryButton}
              />
            )}
            <GenericButton
              title="Email Support Instead"
              onPress={openEmailSupport}
              cStyle={styles.emailButton}
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Render main chat screen
  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title="Chat Support" leftIcon="true" />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Chat Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.iconContainer}>
              <SvgIcons.ChatSupport width={64} height={64} />
            </View>
            <CustomText variant="h2" style={styles.title}>
              Need Help?
            </CustomText>
            <CustomText variant="body1" style={styles.description}>
              Chat with our AI-powered support team and get instant help with
              your queries.
            </CustomText>
          </View>

          {/* User Info Card */}
          {walletData && (
            <View style={styles.userCard}>
              <CustomText variant="caption" style={styles.userCardLabel}>
                Chatting as
              </CustomText>
              <CustomText variant="body1" style={styles.userCardName}>
                {walletData.name || walletData.username || "User"}
              </CustomText>
              <CustomText variant="caption" style={styles.userCardEmail}>
                {walletData.account_email || ""}
              </CustomText>
            </View>
          )}

          {/* Action Buttons */}
          <GenericButton
            title="💬 Start Chat"
            onPress={openChat}
            cStyle={styles.startChatButton}
          />

          <GenericButton
            title="📚 Browse FAQs"
            onPress={openFAQs}
            cStyle={styles.faqButton}
          />

          <GenericButton
            title="✉️ Email Support"
            onPress={openEmailSupportForm}
            cStyle={styles.emailSupportButton}
          />

          {/* Info Note */}
          <View style={styles.noteContainer}>
            <SvgIcons.InfoNote width={16} height={16} />
            <CustomText variant="caption" style={styles.noteText}>
              Our AI assistant handles most queries instantly. Complex issues
              are escalated to human agents.
            </CustomText>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      color: theme.colors.palette.grey600,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    errorTitle: {
      marginTop: 16,
      color: theme.colors.palette.grey900,
      textAlign: "center",
    },
    errorMessage: {
      marginTop: 8,
      color: theme.colors.palette.grey600,
      textAlign: "center",
    },
    retryButton: {
      marginTop: 24,
      minWidth: 150,
    },
    emailButton: {
      marginTop: 12,
      minWidth: 150,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "#2C6A3F",
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 32,
    },
    infoSection: {
      alignItems: "center",
      marginBottom: 32,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.palette.green100,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      color: theme.colors.palette.grey900,
      textAlign: "center",
      marginBottom: 8,
    },
    description: {
      color: theme.colors.palette.grey600,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    userCard: {
      backgroundColor: theme.colors.palette.grey100,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      marginBottom: 24,
    },
    userCardLabel: {
      color: theme.colors.palette.grey500,
      marginBottom: 4,
    },
    userCardName: {
      color: theme.colors.palette.grey900,
      fontWeight: "600",
    },
    userCardEmail: {
      color: theme.colors.palette.grey600,
      marginTop: 2,
    },
    startChatButton: {
      marginBottom: 12,
    },
    faqButton: {
      marginBottom: 12,
    //   backgroundColor: theme.colors.palette.grey100,
    },
    // Last action before the info note, so it carries the larger gap.
    emailSupportButton: {
      marginBottom: 16,
    },
    noteContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: theme.colors.palette.grey50,
      borderRadius: 12,
      padding: 12,
      gap: 8,
    },
    noteText: {
      flex: 1,
      color: theme.colors.palette.grey600,
    },
  });

export default FreshchatScreen;

