import React, { useCallback } from "react";
import { View } from "react-native";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { Button } from "@new-ui/components/common-components/layout";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { commonErrorStyles } from "@new-ui/styles/screens/auth/commonErrorStyles";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import type { CommonErrorScreenParams } from "@new-ui/navigationTypes";

const CommonErrorScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = commonErrorStyles(theme);
  const {
    title,
    description,
    primaryButtonLabel = "Close",
    dismissAction = "resetToCreateAccount",
  } = route.params as CommonErrorScreenParams;

  const onClose = useCallback(() => {
    if (dismissAction === "goBack") {
      if (navigation.canGoBack?.()) {
        navigation.goBack();
      }
      return;
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT }],
      })
    );
  }, [dismissAction, navigation]);

  return (
    <ScreenWrapper
      gradient="none"
      backgroundColor="rgba(0,0,0,0.45)"
      contentStyle={{ flex: 1, justifyContent: "flex-end" }}
    >
      <View style={styles.card}>
        <CustomText variant="h2" fontWeight="bold" style={styles.title}>
          {title}
        </CustomText>
        <CustomText variant="body" style={styles.description}>
          {description}
        </CustomText>
        <Button onPress={onClose}>{primaryButtonLabel}</Button>
      </View>
    </ScreenWrapper>
  );
};

export default CommonErrorScreen;
