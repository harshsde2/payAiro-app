import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Theme, useTheme } from "styles";
import { useCommonAddBalanceStyles } from "./Styles";
import { ScreenContainer } from "HOC";

const AddBalance = () => {
  const { theme } = useTheme();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };
  return (
    <ScreenContainer scrollable padding={0}>
      <Text>AddBalance</Text>
    </ScreenContainer>
  );
};

export default AddBalance;

const customStyles = (theme: Theme) => StyleSheet.create({});
