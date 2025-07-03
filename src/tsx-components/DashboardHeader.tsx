import { useNavigation } from "@react-navigation/native";
import { SvgIcons } from "constants/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "../styles/ThemeContext";

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

  // console.log('Theme spacing:', theme.spacing);
  // console.log("PayAiorRoundIcon", PayAiorRoundIcon);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        <SvgIcons.PayAiorRoundIcon />
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.nameText}>{walletData?.name || ""}</Text>
        </View>
      </View>
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
  });

export default DashboardHeader;
