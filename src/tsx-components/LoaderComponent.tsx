import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewProps,
  ViewStyle,
} from "react-native";
import React, { FC } from "react";
import { Theme, useTheme } from "styles";

interface LoaderComponentProps extends ViewProps {
  loaderSize?: "small" | "large";
  loaderColor?: string;
  styles?: ViewStyle[] | ViewStyle;
}

const LoaderComponent: FC<LoaderComponentProps> = ({
  style,
  loaderColor = "#fff",
  loaderSize = "small",
}) => {
  const { theme } = useTheme();
  const styles = customStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={loaderSize} color={loaderColor} />
    </View>
  );
};

export default LoaderComponent;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
