import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextStyle,
} from "react-native";
import React, { FC } from "react";
import Fonts from "../constants/Fonts";
import { SvgXml } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../styles/ThemeContext";
import { Theme } from "styles";
import { SVGAuthLogo, SVGLeftArrow } from "constants/images";

interface AuthHeaderProps {
  title?: string;
  leftIcon?: string;
  rightIcon?: string;
  isBack?: boolean;
  onPressLeft?: () => void;
  onPressRight?: () => void; // <-- optional
  titleStyle?: TextStyle; // <-- optional
  showAuthLogo?: Boolean;
  header?: Boolean;
}

const AuthHeader: FC<AuthHeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  isBack = true,
  onPressLeft,
  onPressRight,
  titleStyle,
  showAuthLogo,
  header = false,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Default handlers
  const handleLeftPress = () => {
    if (onPressLeft) {
      onPressLeft();
    } else if (isBack) {
      navigation.goBack();
    }
  };

  const handleRightPress = () => {
    if (onPressRight) {
      onPressRight();
    } else if (isBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles(theme).headerContainer}>
      {header && (
        <View style={styles(theme).headerContent}>
          <TouchableOpacity
            style={styles(theme).leftButton}
            onPress={handleLeftPress}
            accessibilityRole="button"
            accessibilityLabel="Back button"
          >
            <SvgXml width={60} height={60} xml={SVGLeftArrow} />
          </TouchableOpacity>
          <Text style={[styles(theme).title, titleStyle]}>{title}</Text>
        </View>
      )}
      {showAuthLogo && (
        <View
          style={[
            {
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flex: 1,
            },
          ]}
        >
          <SvgXml xml={SVGAuthLogo} />
        </View>
      )}
    </View>
  );
};
export default AuthHeader;

const styles = (theme: Theme) =>
  StyleSheet.create({
    headerContainer: {
      width: "100%",
      height: 200,
      zIndex: 10,
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor:'red'
    },
    headerContent: {
      // flex: 1,
      height: 60,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // backgroundColor: 'green',
      // paddingHorizontal: theme?.spacing?.layout?.screenPadding || 16,
      // minHeight: 60,
    },
    leftButton: {
      // backgroundColor:'yellow',
      // width: '20%',
      // paddingVertical: 8,
      // paddingLeft: 8,
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: 60,
    },
    rightButton: {
      width: "20%",
      paddingVertical: 8,
      justifyContent: "center",
      alignItems: "flex-end",
      minHeight: 60,
    },
    spacer: {
      width: "20%",
    },
    title: {
      flex: 1,
      fontFamily: Fonts.semibold,
      color: theme?.colors?.text?.primary || "#000",
      fontSize: 18,
      textAlign: "center",
    },
  });
