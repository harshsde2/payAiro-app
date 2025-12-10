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

// Define wallet data interface for type safety
interface IWalletData {
  email?: string;
  name?: string;
  username?: string;
  id?: string;
  phone?: string;
}

// =====================================================
// TODO: Replace with your Freshchat credentials
// Get these from: Freshchat Dashboard → Settings → Mobile SDK
// =====================================================
const FRESHCHAT_APP_ID = "55a5f65c-dc34-4673-8a0e-ec378efb9193"; 
const FRESHCHAT_APP_KEY = "b7a36ae2-b186-402b-8f93-060c0b7084d4"; 
const FRESHCHAT_DOMAIN = "msdk.in.freshchat.com"; // Default domain
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

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSDKReady, setIsSDKReady] = useState(false);

  useEffect(() => {
    initializeFreshchat();
  }, []);

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

      await Freshchat.init(freshchatConfig);

      // Set user information if available
      if (walletData) {
        await setFreshchatUser(walletData);
      }

      setIsSDKReady(true);
      setIsInitializing(false);
    } catch (error: any) {
      console.error("Freshchat init error:", error);
      setInitError(error?.message || "Failed to initialize chat support");
      setIsInitializing(false);
    }
  };

  const setFreshchatUser = async (userData: IWalletData) => {
    // User properties setup is optional - chat works without it
    // The SDK uses callback-style API which we'll skip for simplicity
    console.log("Freshchat ready for user:", userData.email || userData.name);
  };

  const openChat = async () => {
    try {
      if (!isSDKReady) {
        showError("Chat is not ready. Please try again.");
        return;
      }

      // Open Freshchat conversation
      await Freshchat.showConversations();
    } catch (error: any) {
      console.error("Error opening chat:", error);
      showError("Failed to open chat. Please try again.");
    }
  };

  const openFAQs = async () => {
    try {
      if (!isSDKReady) {
        showError("FAQs are not ready. Please try again.");
        return;
      }

      // Open Freshchat FAQs
      await Freshchat.showFAQs();
    } catch (error: any) {
      console.error("Error opening FAQs:", error);
      showError("Failed to open FAQs. Please try again.");
    }
  };

  const handleRetry = () => {
    initializeFreshchat();
  };

  // Open email support as fallback
  const openEmailSupport = () => {
    const email = "support@payairo.com";
    const subject = "Support Request from PayAiro App";
    const body = `\n\n---\nUser: ${
      walletData?.name || walletData?.username || "Unknown"
    }\nEmail: ${walletData?.email || "Unknown"}`;

    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
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
                {walletData.email || ""}
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
      marginBottom: 16,
    //   backgroundColor: theme.colors.palette.grey100,
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

