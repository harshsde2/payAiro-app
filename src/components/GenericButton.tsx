import { SvgIcons } from "constants/svgs";
import React, { FC } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import { GenericButtonProps } from "./types";

const GenericButton: FC<GenericButtonProps> = ({
  isLoading,
  title,
  onPress,
  cStyle,
  tStyle,
  disabled,
  icon,
  showLoader,
}) => {
  const { theme } = useTheme();
  const styles = customStyles(theme);

  // console.log("is loading. =>",isLoading)
  return (
    <TouchableOpacity
      disabled={!!disabled}
      onPress={onPress}
      style={{
        width: "100%",
        backgroundColor: theme?.colors.palette.green700,
        borderRadius: 30,
        padding: 10,
        opacity: disabled ? 0.7 : 1,
        ...cStyle,
      }}
    >
      {!showLoader && (
        <View style={[styles.flexbox]}>
          <CustomText
            variant={"button"}
            color={theme.colors.palette.white}
            style={[tStyle]}
          >
            {title}
          </CustomText>
          {icon && <SvgIcons.Copy />}
        </View>
      )}

      {showLoader && (
        <View style={[styles.flexbox]}>
          {!isLoading ? (
            <CustomText
              variant={"button"}
              color={theme.colors.palette.white}
              style={{}}
            >
              {title}
            </CustomText>
          ) : (
            <ActivityIndicator
              size={"small"}
              color={theme?.colors?.palette?.white}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default GenericButton;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    flexbox: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
  });
