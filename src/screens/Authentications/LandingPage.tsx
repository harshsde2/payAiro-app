import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { ScreenContainer } from "HOC";
import AuthHeader from "tsx-components/AuthHeader";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import GenericButton from "components/GenericButton";
import { CustomText } from "tsx-components";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { appContent } from "utils/appContent";

const LandingPage = () => {
  const { theme } = useTheme();
  const styles = { ...useGlobalStyles(), ...customStyles(theme) };
  const navigation = useNavigation<any>();
  return (
    <ScreenContainer avoidKeyboard scrollable={true} padding={0}>
      <View style={{ flex: 1 }}>
        <AuthHeader showAuthLogo={true} />
      </View>
      <View style={[styles.whiteSheetContainer, { flex: 0,}]}>
        <View style={[styles.signinHeaderContainer,{width: '95%',paddingVertical: 20}]}>
          <CustomText
            variant={"h4"}
            size={20}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            {appContent.landingPage.title}
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            {appContent.landingPage.description}
          </CustomText>
        </View>
        <GenericButton
          cStyle={{ marginVertical: 10 }}
          onPress={() => {
            navigation.navigate(NAVIGATION_SCREENS.LOGIN);
          }}
          title={appContent.landingPage.signInButton}
        />
        <GenericButton
          cStyle={{ marginVertical: 10 }}
          onPress={() => {
            navigation.navigate(NAVIGATION_SCREENS.SIGNUP);
          }}
          title={appContent.landingPage.createAccountButton}
        />
        <CustomText
          variant="caption"
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_ONBOARDING)}
          style={[styles.signHeaderCaptionTextStyles, { marginTop: 12, color: theme.colors.palette.primary, textDecorationLine: "underline" }]}
        >
          Try new design (Onboarding)
        </CustomText>
        <CustomText
          variant="caption"
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.DEBUG_TEST)}
          style={[styles.signHeaderCaptionTextStyles, { marginTop: 16, color: theme.colors.palette.primary, textDecorationLine: "underline" }]}
        >
          Debug / Test (FCM token & device info)
        </CustomText>
      </View>
    </ScreenContainer>
  );
};

export default LandingPage;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    termsAndConditionContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      marginTop: theme?.spacing.spacing?.[4],
      width: "100%",
      gap: theme?.spacing.spacing?.[3],
    },
    contentContainer: {
      width: "100%",
      height: 500,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme?.spacing.spacing?.[8],
      borderTopStartRadius: theme?.spacing.spacing?.[8],
      padding: theme?.spacing.spacing?.[5],
      paddingVertical: theme?.spacing.spacing?.[10],
    },
    signinHeaderContainer: {
      width: "80%",
      alignSelf: "center",
      flex: 1,
    },
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
    },
    signHeaderCaptionTextStyles: {
      width: "100%",
      textAlign: "center",
      margin: 10,
    },
    fieldAndCheckboxContainer: {
      marginVertical: 30,
      flex: 1,
    },
    checkboxContainer: {
      paddingHorizontal: 10,
      marginVertical: 10,
    },
  });
