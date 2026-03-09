import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { onboardingStyles } from "@new-ui/styles/screens/auth/onboardingStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { GridBackground } from "@new-ui/components/skia-components";
import { AppIcon } from "@new-ui/assets/svgs";
import { OnboardingScreenNavigationProp } from "@new-ui/screens/Auth/types";
import { Button } from "@new-ui/components/common-components/layout";

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = onboardingStyles(theme);

  return (
    <ScreenWrapper
      safeArea
      scrollable
      // padding={theme.spacing.base}
      contentStyle={styles.contentContainer}
      gradient="linear"
      gradientColors={[
        theme.colors.greenLight2,
        theme.colors.white,
        theme.colors.greenLight2,
        theme.colors.greenLight1,
        theme.colors.tertiary,
        theme.colors.greenLight1,
        theme.colors.greenLight2,
        theme.colors.white,
      ]}
      gradientStart={{ x: 1, y: 0 }}
      gradientEnd={{ x: 0, y: 1 }}
      backgroundElement={<GridBackground />}
    >
      <View style={styles.logoContainer}>
        <AppIcon.LogoWithName />
      </View>

      <View style={styles.graphicsContainer}>
        <AppIcon.NewOnBoarding />
      </View>

      <View style={styles.textContainer}>
        <CustomText
          variant="h2"
          fontWeight='bold'
          color={theme.colors.black}
          style={[styles.headline]}
        >
          Fast, Secure & Effortless Payments
        </CustomText>
        <CustomText
          variant='h6'
          fontWeight='medium'
          color={theme.colors.primary}
          style={styles.subtitle}
        >
          Make Every Payment Fast, Secure & Effortlessly. Get Started!
        </CustomText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT)}
          color={theme.colors.white}
          textStyle={{ color: theme.colors.black }}
        >
          Create Account
        </Button>
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_LOGIN)}
        >
          <CustomText fontFamily='inter' variant='label' color={theme.colors.text}>
            Already have Account?{" "}
          </CustomText>
          <CustomText
            variant='label'
            color={theme.colors.primary}
            fontWeight="medium"
            fontFamily='inter'
          >
            Sign In
          </CustomText>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default OnboardingScreen;
