import { View, Text, StyleSheet } from "react-native";
import React, { FC } from "react";
import { Theme, useTheme } from "styles";
import CustomText from "./CustomText";

interface KYCBadgeProps {
  status: "Pending" | "Verified" | "Rejected";
}

const KYCBadge: FC<KYCBadgeProps> = ({ status }) => {
  const { theme } = useTheme();
  const styles = customStyles(theme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.kycStatusLight[status],
          //   borderColor: theme.colors.kycStatusDark[status],
          //   borderWidth: 1 / 2,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: theme.colors.kycStatusDark[status],
          },
        ]}
      />
      <CustomText
        size={12}
        color={theme.colors.kycStatusDark[status]}
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
      marginHorizontal: 10,
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
