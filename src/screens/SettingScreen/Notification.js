import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import HeaderTitle from "../../components/HeaderTitle";
import { SVGLeftArrow } from "../../constants/images";
import Notificatiom from "../Authentications/Notificatiom";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../styles/ThemeContext";
import CustomText from "../../tsx-components/CustomText";
import { colors } from "styles";
import { ScreenContainer } from "HOC";
import { useNotifications } from "../../query/hooks";

// Constants
const TAB_GENERAL = "1";
const TAB_TRANSACTION = "2";
const TAB_OPTIONS = [
  { id: TAB_GENERAL, label: "General" },
  { id: TAB_TRANSACTION, label: "Transaction" },
];

export default function Notification() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(TAB_GENERAL);

  const styles = customStyles(theme);

  // Use the notifications hook
  const {
    data: notificationsResponse,
    isLoading,
    isError,
    error,
    refetch: refetchNotifications,
  } = useNotifications(true);

  // Extract notifications from response
  const notifications = notificationsResponse?.data || [];
  const errorMessage = isError
    ? error?.response?.data?.message || error?.message || "Failed to load notifications"
    : null;

  // Handle back action
  const handleGoBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log("Cannot go back, no screens in history");
        BackHandler.exitApp();
      }
    } catch (err) {
      console.log("Navigation error:", err);
    }
  }, [navigation]);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [handleGoBack]);

  // Tab Button Component
  const TabButton = ({ isActive, label, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, isActive && styles.activeTabButton]}
    >
      <CustomText
        variant="button"
        color={
          isActive ? theme.colors.text.inverse : theme.colors.palette.green700
        }
        style={styles.tabText}
      >
        {label}
      </CustomText>
    </TouchableOpacity>
  );

  // Render content based on current state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <CustomText variant="body1" color={theme.colors.text.secondary}>
            Loading notifications...
          </CustomText>
        </View>
      );
    }

    if (isError || errorMessage) {
      return (
        <View style={styles.centerContainer}>
          <CustomText variant="body1" color={theme.colors.error}>
            {errorMessage || "Failed to load notifications"}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchNotifications()}
          >
            <CustomText variant="button" color={theme.colors.text.inverse}>
              Retry
            </CustomText>
          </TouchableOpacity>
        </View>
      );
    }

    if (notifications.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <CustomText variant="body1" color={theme.colors.text.secondary}>
            No notifications available
          </CustomText>
        </View>
      );
    }
    // console.log("Notifications:", JSON.stringify(notifications, null, 2));

    // Using ScrollView instead of FlatList
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item, index) => (
          <View key={`notification-${item?.id || index}`}>
            <Notificatiom item={item} />
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.palette.green50}
      style={styles.safeArea}
    >
      <HeaderTitle
        title="Notification"
        leftIcon={SVGLeftArrow}
        isBack={true}
        onPressLeft={handleGoBack}
      />

      <View style={styles.container}>
        {/* <View style={styles.tabContainer}>
          {TAB_OPTIONS.map((tab) => (
            <TabButton
              key={tab.id}
              isActive={activeTab === tab.id}
              label={tab.label}
              onPress={() => setActiveTab(tab.id)}
            />
          ))}
        </View> */}
        {renderContent()}
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      // backgroundColor: colors.green100,
    },
    headerContainer: {
      // paddingHorizontal: theme.spacing.layout,
      // paddingTop: theme.spacing.spacing.md,
      // backgroundColor:'green'
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
      // marginTop: theme.spacing.spacing.md,
    },
    tabContainer: {
      padding: theme.spacing.spacing.xs,
      backgroundColor: theme.colors.palette.green100,
      borderRadius: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.spacing.md,
    },
    tabButton: {
      width: "50%",
      borderRadius: 30,
      padding: theme.spacing.spacing.md,
    },
    activeTabButton: {
      backgroundColor: theme.colors.palette.green700,
    },
    tabText: {
      textAlign: "center",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    retryButton: {
      padding: theme.spacing.spacing.md,
      backgroundColor: theme.colors.palette.green600,
      borderRadius: 8,
      marginTop: theme.spacing.spacing.md,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingVertical: theme.spacing.spacing.md,
    },
  });
