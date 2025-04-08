/**
 * Example file showing how to use the theme in a component
 * This is just for reference, not used in the actual app
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeContext';

const ThemeUsageExample = () => {
  // Get current theme using the hook
  const { theme, toggleTheme, themeMode } = useTheme();
  
  // Access theme properties in your component
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme Example</Text>
      
      <View style={styles.card}>
        <Text style={styles.subtitle}>Current Theme: {themeMode}</Text>
        <Text style={styles.bodyText}>
          This is an example of how to use the theme in your components.
          Notice how the styling adapts to the current theme.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={toggleTheme}
      >
        <Text style={styles.buttonText}>Toggle Theme</Text>
      </TouchableOpacity>
      
      <View style={styles.colorSwatch}>
        {/* Display green palette colors */}
        {Object.entries(theme.colors.palette)
          .filter(([key]) => key.includes('green'))
          .map(([key, value]) => (
            <View 
              key={key} 
              style={[styles.swatch, { backgroundColor: value }]}
            >
              <Text style={styles.swatchText}>{key}</Text>
            </View>
          ))
        }
      </View>
    </View>
  );
};

// Create styles based on the current theme
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.layout.screenPadding,
  },
  title: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  bodyText: {
    ...theme.typography.textStyles.body1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    padding: theme.spacing.layout.cardPadding,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: theme.colors.button.primary.background,
    paddingVertical: theme.spacing.layout.buttonPadding.vertical,
    paddingHorizontal: theme.spacing.layout.buttonPadding.horizontal,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.button.primary.text,
  },
  colorSwatch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: theme.spacing.md,
  },
  swatch: {
    width: 80,
    height: 80,
    margin: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  swatchText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
});

export default ThemeUsageExample; 