import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../styles/ThemeContext";
import CustomText from "../../../tsx-components/CustomText";
import { SvgIcons } from "../../../constants/svgs";

const pointsInstructions = [
  "Earn 2 points for every $1 on crypto buy and sell transactions.",
  "Points are earned on all eligible crypto buy and sell transactions.",
  "Use your points to unlock scratch vouchers.",
  "Scratch each voucher to reveal a reward.",
  "Rewards are added directly to your PayAiro account.",
  "Rewards can be used for eligible crypto buy and sell transactions.",
  "Users can earn up to $100 in total rewards.",
  "Points have no cash value until redeemed.",
  "Terms and conditions apply.",
];

const HowToEarnPoints = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const screenHeight = Dimensions.get("window").height;
  const maxModalHeight = screenHeight * 0.5;
  const headerHeight = 60; // Approximate header height
  const padding = theme.spacing.spacing[5] * 2; // Top and bottom padding
  const scrollViewHeight = maxModalHeight - headerHeight - padding - 20; // 20 for margins

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles(theme).modalOverlay}>
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={handleClose}
      />
      <View style={styles(theme, screenHeight).modalContainer}>
        <View style={styles(theme, screenHeight).headerContainer}>
          <CustomText
            variant="h3"
            fontWeight="bold"
            color={theme.colors.text.primary}
            style={styles(theme, screenHeight).title}
          >
            How to Earn points:
          </CustomText>
          <TouchableOpacity onPress={handleClose} style={styles(theme, screenHeight).closeButton}>
            <SvgIcons.CrossIcon width={54} height={54} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={[styles(theme, screenHeight).scrollView, { height: scrollViewHeight }]}
          contentContainerStyle={styles(theme, screenHeight).scrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {pointsInstructions.map((instruction, index) => (
            <View key={index} style={styles(theme, screenHeight).listItem}>
              <CustomText
                variant="body1"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
                style={styles(theme, screenHeight).numberText}
              >
                {index + 1}.
              </CustomText>
              <CustomText
                variant="body1"
                color={theme.colors.text.primary}
                style={styles(theme, screenHeight).instructionText}
              >
                {instruction}
              </CustomText>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = (theme: any, screenHeight?: number) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "90%",
      maxHeight: screenHeight ? screenHeight * 0.5 : "50%",
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      padding: theme.spacing.spacing[5],
      justifyContent: "flex-start",
      flexDirection: "column",
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[4],
    },
    title: {
      flex: 1,
      fontSize: 20,
    },
    closeButton: {
      padding: theme.spacing.spacing[1],
    },
    scrollView: {
      width: "100%",
    },
    scrollContent: {
      paddingBottom: theme.spacing.spacing[2],
    },
    listItem: {
      flexDirection: "row",
      marginBottom: theme.spacing.spacing[3],
      alignItems: "flex-start",
    },
    numberText: {
      marginRight: theme.spacing.spacing[2],
      minWidth: 24,
      fontSize: 14,
    },
    instructionText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 24,
    },
  });

export default HowToEarnPoints