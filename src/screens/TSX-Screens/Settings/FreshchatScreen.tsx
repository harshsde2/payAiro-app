import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import { SvgIcons } from "constants/svgs";
import { CustomText } from "tsx-components";
import GenericButton from "components/GenericButton";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const FreshchatScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = customStyles(theme);

  const openFAQ = () => {
    navigation.navigate(NAVIGATION_SCREENS.NEW_FAQ_SCREEN);
  };

  const openEmailSupportForm = () => {
    navigation.navigate(NAVIGATION_SCREENS.SUPPORT_SCREEN, { mode: "emailSupport" });
  };

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title="Help & Support" leftIcon="true" />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.iconContainer}>
              <SvgIcons.ChatSupport width={64} height={64} />
            </View>
            <CustomText variant="h2" style={styles.title}>
              Need Help?
            </CustomText>
            <CustomText variant="body1" style={styles.description}>
              Find answers to common questions or reach out to our support
              team.
            </CustomText>
          </View>

          {/* Action Buttons */}
          <GenericButton
            title="FAQ"
            onPress={openFAQ}
            cStyle={styles.faqButton}
          />

          <GenericButton
            title="Support"
            onPress={openEmailSupportForm}
            cStyle={styles.emailSupportButton}
          />

          {/* Info Note */}
          <View style={styles.noteContainer}>
            <SvgIcons.InfoNote width={16} height={16} />
            <CustomText variant="caption" style={styles.noteText}>
              Browse our FAQs for instant answers, or contact support for
              anything else.
            </CustomText>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const customStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
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
      backgroundColor: theme.colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    description: {
      color: theme.colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    faqButton: {
      marginBottom: 12,
    },
    // Last action before the info note, so it carries the larger gap.
    emailSupportButton: {
      marginBottom: 16,
    },
    noteContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 12,
      gap: 8,
    },
    noteText: {
      flex: 1,
      color: theme.colors.textSecondary,
    },
  });

export default FreshchatScreen;
