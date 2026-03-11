import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';

const BACKGROUND_COLOR = 'rgba(255, 255, 255, 0.8)';

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

const createStyles = (theme: { spacing?: { base?: number }; radius?: { xl?: number } }) =>
  StyleSheet.create({
    container: {
      backgroundColor: BACKGROUND_COLOR,
      padding: theme.spacing?.base ?? 16,
      paddingTop: 0,
      marginBottom: 80,
      borderRadius: theme.radius?.xl ?? 16,
      width: '100%',
    },
  });

export default DashboardCardWrapper;
