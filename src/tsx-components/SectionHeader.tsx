import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity, TextStyle } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from '@new-ui/styles/ThemeContext';

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
        style={[styles.title, titleStyle]}
      >
        {title}
      </CustomText>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <CustomText
            variant="body"
            color={'#838383'}
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
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    title: {
      color: theme.colors.black,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.lg,
    },
    actionText: {
      fontSize: theme.typography.fontSize.sm,
    },
  });

export default memo(SectionHeader);
