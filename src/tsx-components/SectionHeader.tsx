import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity, TextStyle } from "react-native";
import { useTheme } from "../styles/ThemeContext";
import CustomText from "./CustomText";

interface SectionHeaderProps {
  title?: string;
  titleStyle?: TextStyle;
  actionText?: string;
  onActionPress?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  titleStyle,
  actionText,
  onActionPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // console.log("SectionHeader =>",actionText)

  return (
    <View style={styles.container}>
      <CustomText
        variant="h4"
        fontWeight="bold"
        style={[styles.title, titleStyle]}
      >
        {title}
      </CustomText>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <CustomText
            variant="button"
            color={theme.colors.palette.primary}
            style={styles.actionText}
          >
            {actionText}
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.spacing.sm,
      marginTop: theme.spacing.spacing.md,
    },
    title: {
      color: theme.colors.text.primary,
    },
    actionText: {
      fontSize: theme.typography.fontSize.sm,
    },
  });

export default memo(SectionHeader);
