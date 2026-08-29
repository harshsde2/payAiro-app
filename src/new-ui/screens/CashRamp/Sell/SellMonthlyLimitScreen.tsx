import React, { useCallback } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { sellCashRampStyles } from "@new-ui/styles/screens/cashRamp/sellCashRampStyles";
import { SELL_MONTHLY_LIMIT_BODY, SELL_MONTHLY_LIMIT_TITLE } from "./sellFlowCopy";

const SellMonthlyLimitScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = sellCashRampStyles(theme);
  const navigation = useNavigation<any>();

  const onClose = useCallback(() => {
    if (navigation.canGoBack?.()) navigation.goBack();
  }, [navigation]);

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      backgroundColor={theme.colors.background}
      contentStyle={{ flex: 1 }}
    >
      <View style={styles.limitScreen}>
        <CustomText variant="h2" fontWeight="bold" color={theme.colors.text} style={styles.limitTitle}>
          {SELL_MONTHLY_LIMIT_TITLE}
        </CustomText>
        <CustomText variant="body" color={theme.colors.text} style={styles.limitBody}>
          {SELL_MONTHLY_LIMIT_BODY}
        </CustomText>
        <Button onPress={onClose}>Close</Button>
      </View>
    </ScreenWrapper>
  );
};

export default SellMonthlyLimitScreen;
