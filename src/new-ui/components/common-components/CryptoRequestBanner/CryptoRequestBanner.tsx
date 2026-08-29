import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useCryptoRequestHistory } from "query/hooks/useCryptoRequest";

/**
 * Banner shown above the Activity list when the user has pending crypto
 * requests — in **either** direction (incoming to pay, or ones they sent).
 * Tapping it opens the Requests list. Renders nothing when there are none.
 */
const CryptoRequestBanner: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { data } = useCryptoRequestHistory("all", "PENDING", 50, {
    // Gentle safety-net poll so the banner stays fresh even without a push.
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const items = data?.data?.items ?? [];
  const count = items.length;
  if (count <= 0) return null;

  const incomingCount = items.filter((r) => r.direction === "received").length;
  const styles = makeStyles(theme);
  const subtitle =
    incomingCount > 0
      ? incomingCount === 1
        ? "1 request is waiting for you to pay."
        : `${incomingCount} requests are waiting for you to pay.`
      : count === 1
        ? "1 request you sent is pending."
        : `${count} requests you sent are pending.`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.banner}
      onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_CRYPTO_REQUESTS)}
      accessibilityRole="button"
      accessibilityLabel="View pending crypto requests"
    >
      <View style={styles.iconCircle}>
        <AppIcon.Clock width={20} height={20} color={theme.colors.primary} />
      </View>
      <View style={styles.textWrap}>
        <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text}>
          {count === 1 ? "Pending request" : "Pending requests"}
        </CustomText>
        <CustomText
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          {subtitle}
        </CustomText>
      </View>
      <AppIcon.ChevronRight width={16} height={16} color={theme.colors.greyDark} />
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.greyLight,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      marginHorizontal: 15,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.greenLight2,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrap: {
      flex: 1,
    },
    subtitle: {
      marginTop: 2,
    },
  });

export default CryptoRequestBanner;
