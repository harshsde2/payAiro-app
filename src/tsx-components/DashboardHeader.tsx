import { useNavigation } from "@react-navigation/native";
import { SvgIcons } from "constants/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "../styles/ThemeContext";
import { useNotifications } from "query/hooks/useUser";


interface DashboardHeaderProps {
  name?: string;
  style?: ViewStyle;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ name, style }) => {
  // Navigation hook
  const navigation = useNavigation();

  // Theme hook
  const { theme } = useTheme();

  // Redux store
  const { walletData } = useSelector((state: any) => state.authenticationSlice);

  // Create styles with theme
  const styles = createStyles(theme);

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const {
    data: notificationsResponse,
    isLoading,
    isError,
    error,
    refetch: refetchNotifications,
  } = useNotifications(true);

  const notifications = notificationsResponse?.data || [];

  // console.log('Theme spacing:', theme.spacing);
  // console.log("PayAiorRoundIcon", JSON.stringify(walletData,null,2));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL as never)}>
          <Text style={styles.avatarText}>
            {getInitials(walletData?.name || name || "")}
          </Text>
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.nameText}>{walletData?.name || ""}</Text>
        </View>
      </View>
      {notifications.length > 0 && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationText}>{notifications.length}</Text>
        </View>
      )}
      <SvgIcons.NotificationIcon
        onPress={() =>
          navigation.navigate(NAVIGATION_SCREENS.NOTIFICATION as never)
        }
      />
    </View>
  );
};

// Create styles with theme
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // paddingHorizontal: theme.spacing.spacing.md, // 16
      paddingVertical: theme.spacing.spacing.xs, // 8
      // backgroundColor: theme.colors.palette.green50,
      // borderBottomWidth: 1,
      // borderBottomColor: theme.colors.palette.green100,
    },
    leftSection: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.palette.green200, // Using a theme color
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontFamily: theme.typography.fontFamily.nexaHeavy,
      color: theme.colors.palette.green700,
      fontSize: theme.typography.fontSize.md,
    },
    textContainer: {
      marginHorizontal: theme.spacing.spacing.xs, // 8
    },
    welcomeText: {
      fontFamily: theme.typography.fontFamily.montserrat,
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.sm,
    },
    nameText: {
      fontFamily: theme.typography.fontFamily.nexaHeavy,
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.md,
    },
    notificationContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      position: "absolute",
      right: 0,
      top: 0,
      backgroundColor: theme.colors.palette.red500,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    notificationText: {
      fontFamily: theme.typography.fontFamily.montserrat,
      color: theme.colors.palette.white,
      fontSize: 10,
    },
  });

export default DashboardHeader;
