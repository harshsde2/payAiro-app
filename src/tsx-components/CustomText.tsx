import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../styles/ThemeContext';

type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold';
type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'button' | 'caption';

interface CustomTextProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: TextVariant;
  fontWeight?: FontWeight;
  color?: string;
  size?: number;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  fontFamily?: string;
  useThemeColor?: boolean;
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  style,
  variant,
  fontWeight,
  color,
  size,
  align,
  fontFamily,
  useThemeColor = true,
  ...props
}) => {
  const { theme } = useTheme();

  // Helper function to get the font family based on weight
  const getFontFamily = (weight?: FontWeight): string => {
    if (fontFamily) return fontFamily;
    
    if (weight) {
      switch (weight) {
        case 'regular':
          return theme.typography.fontFamily.regular;
        case 'medium':
          return theme.typography.fontFamily.medium;
        case 'semiBold':
          return theme.typography.fontFamily.semiBold;
        case 'bold':
          return theme.typography.fontFamily.bold;
        default:
          return theme.typography.fontFamily.regular;
      }
    }

    // If variant is provided, use the font family from the theme's text styles
    if (variant && theme.typography.textStyles[variant]) {
      return theme.typography.textStyles[variant].fontFamily;
    }

    return theme.typography.fontFamily.regular;
  };

  // Get theme-based color if not explicitly provided
  const getTextColor = (): string | undefined => {
    // If color is explicitly provided, use it (highest priority)
    if (color) return color;
    
    // If useThemeColor flag is true, use appropriate theme color
    if (useThemeColor) {
      return theme.colors.text.primary;
    }
    
    // Default to current theme's primary text color
    return theme.colors.text.primary;
  };

  // Merge styles in the correct order of precedence
  const textStyle: StyleProp<TextStyle> = [
    // Default styles
    styles.text,
    
    // Variant styles from theme
    variant && theme.typography.textStyles[variant],
    
    // Get theme-based color
    { color: getTextColor() },
    
    // Explicit props override variant styles
    fontWeight && { fontFamily: getFontFamily(fontWeight) },
    size && { fontSize: size },
    align && { textAlign: align },
    
    // User provided style overrides everything
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    // Default text styles
  },
});

export default CustomText; 