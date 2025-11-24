import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@styles/ThemeContext';
import { cardStyles } from '@styles/components/cardStyles';
import { ICardProps } from './types';

const Card: React.FC<ICardProps> = ({
  children,
  style,
  backgroundColor,
  padding,
  borderRadius,
  borderWidth,
  borderColor,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = cardStyles(theme);

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    backgroundColor ? { backgroundColor } : undefined,
    padding !== undefined ? { padding } : undefined,
    borderRadius !== undefined ? { borderRadius } : undefined,
    borderWidth !== undefined ? { borderWidth } : undefined,
    borderColor ? { borderColor } : undefined,
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

export default Card;

