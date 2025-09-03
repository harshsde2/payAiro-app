import React, { FC, useRef } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SvgXml } from "react-native-svg";
import { Theme } from "styles";
import { useTheme } from "styles/ThemeContext";
import { SVGSearchIcon } from "../constants/images";
import { SvgIcons } from "constants/svgs";

interface CustomSearchTextInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showClearButton?: boolean;
  onClearPress?: () => void;
}

const CustomSearchTextInput: FC<CustomSearchTextInputProps> = ({
  value,
  onChangeText,
  placeholder = "Search Name or Payairo tag...",
  autoFocus = false,
  showClearButton = true,
  onClearPress,
  ...rest
}) => {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const focusAnimation = useSharedValue(0);

  const handleFocus = () => {
    focusAnimation.value = withTiming(1, { duration: 300 });
  };

  const handleBlur = () => {
    focusAnimation.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: focusAnimation.value
        ? theme.colors.palette.green200
        : theme.colors.palette.green200,
      backgroundColor: theme.colors.palette.green100, // always light green
    };
  });

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <SvgIcons.SearchIcon width={25} height={25} style={styles.iconLeft} />
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.palette.green900}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // keyboardType='default'
        autoFocus={autoFocus}
        {...rest}
      />
    </Animated.View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 999, // full pill
      paddingHorizontal: 16,
      height: 50,
      marginVertical: 10,
      // flex:1
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.palette.green900,
      fontFamily: theme.typography.fontFamily.montserrat,
      paddingHorizontal: 10,
    },
    iconLeft: {
      marginRight: 10,
    },
    iconRight: {
      marginLeft: 8,
    },
  });

export default CustomSearchTextInput;
