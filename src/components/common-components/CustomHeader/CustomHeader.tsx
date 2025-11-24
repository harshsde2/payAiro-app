import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@styles/ThemeContext';
import { customHeaderStyles } from '@styles/components/customHeaderStyles';
import CustomText from '@components/common-components/CustomText';
import { AppIcon } from '@assets/svgs';
import { ICustomHeaderProps } from './types';

const formatScreenTitle = (routeName: string): string => {
  const title = routeName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => {
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return title;
};

const CustomHeader: React.FC<ICustomHeaderProps> = ({
  route,
  navigation,
  title,
  showBackButton,
  rightButton,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = customHeaderStyles(theme);
  const canGoBack = navigation.canGoBack();
  const shouldShowBackButton = showBackButton !== undefined ? showBackButton : canGoBack;
  const displayTitle = title || (route?.name ? formatScreenTitle(route.name) : '');

  const handleBackPress = () => {
    if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleRightButtonPress = () => {
    if (rightButton?.onPress) {
      rightButton.onPress();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.contentWrapper, { paddingVertical: theme.spacing.xs }]}>
        {shouldShowBackButton ? (
          <TouchableOpacity
            style={styles.leftButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <AppIcon.ArrowLeft width={24} height={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.leftButton} />
        )}

        <View style={styles.titleContainer}>
          <CustomText variant="h4" fontWeight='semiBold' numberOfLines={1}>
            {displayTitle}
          </CustomText>
        </View>

        {rightButton ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={handleRightButtonPress}
            activeOpacity={0.7}
          >
            {rightButton.icon || <View />}
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>
    </View>
  );
};

export default CustomHeader;

