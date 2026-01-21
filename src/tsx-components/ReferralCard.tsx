import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Theme, useTheme } from "styles";
import CustomText from "./CustomText";
import GenericButton from "components/GenericButton";
import { SvgIcons } from "constants/svgs";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const ReferralCard = () => {
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <CustomText
          variant="h4"
          fontFamily={theme.typography.fontFamily.montserratBold}
          color={theme.colors.palette.white}
        >
          Earn $5 for every referral
        </CustomText>
        <CustomText variant="caption" color={theme.colors.palette.grey400}>
          Share your referral link with friends. When they sign up and make their
          first transaction, you both earn $5!
        </CustomText>
        <GenericButton
          title="Refer & Earn"
          onPress={() => {
            navigation.navigate(NAVIGATION_SCREENS.REFERRAL_SCREEN);
          }}
        />
      </View>
      <View style={styles.rightSection}>
        <SvgIcons.ReferAndEarn />
      </View>
    </View>
  );
};

export default ReferralCard;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.palette.black,
      padding: 20,
      borderRadius: 28,
      width: "100%",
      marginVertical: 10,
      flexDirection: "row",
    },
    leftSection: {
      flex: 1,
    //   backgroundColor: "green",
      gap: 10,
    },
    rightSection: {
      // flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.palette.grey400,
    },
  });
