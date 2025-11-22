import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "@navigations/navigationConstants";
import { useTheme } from "@styles/ThemeContext";
import { onboardingStyles } from "@styles/screens/auth/onboardingStyles";
import CustomText from "@components/common-components/CustomText";
import ScreenWrapper from "@components/common-components/ScreenWrapper";
import { GridBackground } from "@components/skia-components";
import { AppIcon } from "@assets/svgs";
import { OnboardingScreenNavigationProp } from "./types";
import { Button } from "@components/common-components/layout";

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = onboardingStyles(theme);

  return (
    <ScreenWrapper
      safeArea
      scrollable
      padding={theme.spacing.base}
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
        <AppIcon.OnBoardingImage />
      </View>

      <View style={styles.textContainer}>
        <CustomText
          variant="h2"
          fontWeight="bold"
          color={theme.colors.black}
          style={styles.headline}
        >
          Fast, Secure & Effortless Payments
        </CustomText>
        <CustomText
          variant='h6'
          color={theme.colors.primary}
          style={styles.subtitle}
        >
          Make Every Payment Fast, Secure & Effortlessly. Get Started!
        </CustomText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.CREATE_ACCOUNT)}
          color={theme.colors.white}
          textStyle={{ color: theme.colors.black }}
        >
          Create Account
        </Button>
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.LOGIN)}
        >
          <CustomText variant='label' color={theme.colors.text}>
            Already have Account?{" "}
          </CustomText>
          <CustomText
            variant='label'
            color={theme.colors.primary}
            fontWeight="medium"
          >
            Login
          </CustomText>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default OnboardingScreen;
