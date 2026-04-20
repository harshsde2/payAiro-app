import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { recentContactItemStyles } from '@new-ui/styles/components/recentContactItemStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { IRecentContactItemProps } from './types';

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const RecentContactItem: React.FC<IRecentContactItemProps> = ({ name, imageUri, onPress }) => {
  const { theme } = useTheme();
  const styles = recentContactItemStyles(theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarCircle}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
        ) : (
          <CustomText style={styles.initials}>{getInitials(name)}</CustomText>
        )}
      </View>
      <CustomText style={styles.name} numberOfLines={1}>{name}</CustomText>
    </TouchableOpacity>
  );
};

export default RecentContactItem;
