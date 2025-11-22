import React from 'react';
import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@styles/ThemeContext';
import { headingStyles } from '@styles/components/headingStyles';
import { textStyles } from '@styles/components/textStyles';
import { ICustomTextProps, FontWeight } from './types';

const CustomText: React.FC<ICustomTextProps> = ({
  children,
  style,
  variant = 'body',
  fontWeight,
  color,
  size,
  align,
  fontFamily,
  useThemeColor = true,
  ...props
}) => {
  const { theme } = useTheme();
  const headings = headingStyles(theme);
  const texts = textStyles(theme);

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

    return theme.typography.fontFamily.regular;
  };

  const getTextColor = (): string => {
    if (color) return color;

    if (useThemeColor) {
      return theme.colors.text;
    }

    return theme.colors.text;
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return headings.h1;
      case 'h2':
        return headings.h2;
      case 'h3':
        return headings.h3;
      case 'h4':
        return headings.h4;
      case 'h5':
        return headings.h5;
      case 'h6':
        return headings.h6;
      case 'body':
        return texts.body;
      case 'bodySmall':
        return texts.bodySmall;
      case 'bodyLarge':
        return texts.bodyLarge;
      case 'caption':
        return texts.caption;
      case 'label':
        return texts.label;
      default:
        return texts.body;
    }
  };

  const textStyle: StyleProp<TextStyle> = [
    getVariantStyle(),
    { color: getTextColor() },
    fontWeight ? { fontFamily: getFontFamily(fontWeight) } : undefined,
    size !== undefined ? { fontSize: size } : undefined,
    align ? { textAlign: align } : undefined,
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;

