import React from 'react';
import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { headingStyles } from '@new-ui/styles/components/headingStyles';
import { textStyles } from '@new-ui/styles/components/textStyles';
import { ICustomTextProps, FontWeight, FontFamily } from './types';

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

  const getFontFamily = (family?: FontFamily, weight?: FontWeight): string => {
    const selectedFamily = family || 'poppins';
    const selectedWeight = weight || 'regular';

    if (selectedFamily === 'inter') {
      switch (selectedWeight) {
        case 'regular':
          return theme.typography.fontFamily.interRegular;
        case 'medium':
          return theme.typography.fontFamily.interMedium;
        case 'semiBold':
          return theme.typography.fontFamily.interSemiBold;
        case 'bold':
          return theme.typography.fontFamily.interBold;
        default:
          return theme.typography.fontFamily.interRegular;
      }
    }

    switch (selectedWeight) {
      case 'thin':
        return theme.typography.fontFamily.poppinsThin;
      case 'extraLight':
        return theme.typography.fontFamily.poppinsExtraLight;
      case 'light':
        return theme.typography.fontFamily.poppinsLight;
      case 'regular':
        return theme.typography.fontFamily.poppinsRegular;
      case 'medium':
        return theme.typography.fontFamily.poppinsMedium;
      case 'semiBold':
        return theme.typography.fontFamily.poppinsSemiBold;
      case 'bold':
        return theme.typography.fontFamily.poppinsBold;
      case 'extraBold':
        return theme.typography.fontFamily.poppinsExtraBold;
      case 'black':
        return theme.typography.fontFamily.poppinsBlack;
      default:
        return theme.typography.fontFamily.poppinsRegular;
    }
  };

  const getTextColor = (): string => {
    if (color) return color;

    if (useThemeColor) {
      return theme.colors.text;
    }

    return theme.colors.text;
  };

  const getVariantStyle = () => {
    const variantStyle = (() => {
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
    })();

    if (fontWeight || fontFamily) {
      const { fontFamily: _, ...styleWithoutFontFamily } = variantStyle;
      return styleWithoutFontFamily;
    }

    return variantStyle;
  };

  const getRNFontWeight = (weight?: FontWeight): TextStyle['fontWeight'] => {
    if (!weight) return undefined;

    const themeWeights = theme.typography.fontWeight;

    switch (weight) {
      case 'thin':
        return '100';
      case 'extraLight':
        return '200';
      case 'light':
        return '300';
      case 'regular':
        return themeWeights.regular;
      case 'medium':
        return themeWeights.medium;
      case 'semiBold':
        return themeWeights.semiBold;
      case 'bold':
        return themeWeights.bold;
      case 'extraBold':
        return '800';
      case 'black':
        return '900';
      default:
        return themeWeights.regular;
    }
  };

  const textStyle: StyleProp<TextStyle> = [
    getVariantStyle(),
    { color: getTextColor() },
    fontWeight || fontFamily ? { fontFamily: getFontFamily(fontFamily, fontWeight) } : undefined,
    fontWeight ? { fontWeight: getRNFontWeight(fontWeight) } : undefined,
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

