import React, { FC } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";
import { Theme, useTheme } from "styles";
import CustomText from "./CustomText";

interface AddAndLinkAccountCardProps extends TouchableOpacityProps {
  onAddPress?: () => void; // optional callback for button press
  title?: string;
  description?: string;
  buttonText?: string;
}

const AddAndLinkAccountCard: FC<AddAndLinkAccountCardProps> = ({
  style,
  onAddPress,
  title,
  description,
  buttonText,
  ...rest
}) => {
  const { theme } = useTheme();
  const styles = customStyles(theme);

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={{ width: "100%", justifyContent: "flex-start" }}>
        <View style={{}}>
          <CustomText variant="h4" size={16} fontWeight="semiBold">
            {title}
          </CustomText>
          <CustomText size={11}>{description}</CustomText>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          justifyContent: "flex-end",
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          {...rest}
        >
          <CustomText variant="body2" fontWeight="semiBold" color={"white"}>
            + {buttonText}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddAndLinkAccountCard;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    cardContainer: {
      //   flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.palette.green700,
      borderStyle: "dashed",
      borderRadius: theme.spacing.spacing[4],
      padding: theme.spacing.spacing[3],
      marginHorizontal: theme.spacing.spacing[1],
      backgroundColor: theme.colors.palette.white,

      //   height: 120,
      width: 250, // or a fixed width like 250 if needed
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.palette.grey400 || "#6A6A6A",
      marginTop: 4,
    },
    addButton: {
      backgroundColor: theme.colors.palette.green700,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      width: 150,
      marginVertical: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "500",
    },
  });
