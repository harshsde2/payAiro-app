import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';

export interface IDashboardCardWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const DashboardCardWrapper: React.FC<IDashboardCardWrapperProps> = ({
  children,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return <View style={[styles.container, style]}>{children}</View>;
};

const createStyles = (theme: {
  spacing?: { base?: number };
  radius?: { xl?: number };
  colors?: { glassTint?: string };
}) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors?.glassTint ?? 'rgba(255, 255, 255, 0.6)',
      padding: theme.spacing?.base ?? 16,
      paddingTop: 0,
      marginBottom: 80,
      borderRadius: theme.radius?.xl ?? 16,
      width: '100%',
    },
  });

export default DashboardCardWrapper;
