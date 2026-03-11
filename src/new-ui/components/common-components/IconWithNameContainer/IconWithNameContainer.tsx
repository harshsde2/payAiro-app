import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { IIconWithNameContainerProps } from './types';
import iconWithNameContainerStyles from '@new-ui/styles/components/iconWithNameContainerStyles';

const IconWithNameContainer: React.FC<IIconWithNameContainerProps> = ({
  icon,
  name,
  iconSize = 48,
  style,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = iconWithNameContainerStyles(theme);

  const content = (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>{icon}</View>
      <Text style={styles.name}>{name}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default IconWithNameContainer;