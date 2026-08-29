import { View, Text, StyleSheet } from "react-native";
import React, { FC } from "react";
import { Theme, useTheme } from "styles";
import { useTheme as useNewUITheme } from "@new-ui/styles/ThemeContext";
import CustomText from "./CustomText";

interface KYCBadgeProps {
  status: "Pending" | "Verified" | "Rejected";
}

const KYCBadge: FC<KYCBadgeProps> = ({ status }) => {
  const { theme } = useTheme();
  // Legacy theme still supplies spacing/typography; colours come from the new-ui
  // theme so this follows the user's Appearance choice.
  const { theme: ui } = useNewUITheme();
  const styles = customStyles(theme);
  // The legacy theme carried a kycStatusLight/Dark map; the new-ui theme expresses the same
  // three states with its status tokens.
  const tone = {
    Pending: { fill: ui.colors.warningSurface, accent: ui.colors.warning },
    Verified: { fill: ui.colors.successSurface, accent: ui.colors.success },
    Rejected: { fill: ui.colors.errorSurface, accent: ui.colors.error },
  }[status] ?? { fill: ui.colors.surface, accent: ui.colors.textSecondary };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tone.fill,
          //   borderColor: tone.accent,
          //   borderWidth: 1 / 2,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: tone.accent,
          },
        ]}
      />
      <CustomText
        size={9}
        color={tone.accent}
        variant="body1"
        fontWeight="semiBold"
      >
        {`KYC ${status}`}
      </CustomText>
    </View>
  );
};

export default KYCBadge;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: "red",
      //   width: 110,
      paddingHorizontal: 10,
      // marginHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 5,
      borderRadius: theme.spacing.spacing[5],
      //   height: 50,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 10,
    },
  });
