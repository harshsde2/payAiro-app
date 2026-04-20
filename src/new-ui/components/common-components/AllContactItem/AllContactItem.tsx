import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { allContactItemStyles } from '@new-ui/styles/components/allContactItemStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { IAllContactItemProps } from './types';

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const AllContactItem: React.FC<IAllContactItemProps> = ({ name, address, imageUri, onPress }) => {
  const { theme } = useTheme();
  const styles = allContactItemStyles(theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarCircle}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
        ) : (
          <CustomText style={styles.initials}>{getInitials(name)}</CustomText>
        )}
      </View>
      <View style={styles.textContainer}>
        <CustomText variant="h5" fontWeight="semiBold" size={15}>{name}</CustomText>
        <CustomText variant="caption" fontWeight="regular" size={12} color={theme.colors.textSecondary}>
          {address}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default AllContactItem;
