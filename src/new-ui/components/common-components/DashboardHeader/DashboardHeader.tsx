import React, { useCallback } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { dashboardHeaderStyles } from '@new-ui/styles/components/dashboardHeaderStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import GlassyWrapper from '@new-ui/components/common-components/GlassyWrapper';
import { AppIcon } from '@new-ui/assets/svgs';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { showSuccess } from 'utils/toast';
import { IDashboardHeaderProps } from './types';

const getInitials = (name: string): string => {
  if (!name) return '';
  const names = name.trim().split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const DashboardHeader: React.FC<IDashboardHeaderProps> = ({
  style,
  onMenuPress,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = dashboardHeaderStyles(theme);

  const { walletData } = useSelector((state: any) => state.authenticationSlice);

  const profilePhotoUri = walletData?.profile_photo
    ? walletData.profile_photo.replace(/^http:\/\//i, 'https://')
    : null;

  const userName = walletData?.name || '';

  const handleProfilePress = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL as never);
  }, [navigation]);

  const handleMenuPress = useCallback(() => {
    onMenuPress?.();
  }, [onMenuPress]);

  const handleCopyUsername = useCallback(() => {
    const username = walletData?.username;
    if (username) {
      Clipboard.setString(username);
      showSuccess('Copied!', 'PayAiro Tag copied to clipboard');
    }
  }, [walletData?.username]);

  const MenuIcon = AppIcon.MoreVertical;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          {profilePhotoUri ? (
            <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(userName)}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <CustomText variant="h4" style={styles.nameText}>
            {capitalizeFirstLetter(userName)}
          </CustomText>
          <TouchableOpacity
            style={styles.usernameContainer}
            onPress={handleCopyUsername}
            activeOpacity={0.7}
          >
            <CustomText variant="bodySmall" style={styles.welcomeText}>{walletData?.username}</CustomText>
            <AppIcon.Copygreen width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={handleMenuPress}
        activeOpacity={0.7}
      >
        <GlassyWrapper
          style={styles.menuButtonGlassy}
          borderRadius={20}
          blurAmount={25}
          blurType="light"
          overlayOpacity={0.12}
          borderWidth={1}
          borderColor="rgba(255, 255, 255, 0.6)"
        >
          <MenuIcon width={25} height={25} />
        </GlassyWrapper>
      </TouchableOpacity>
    </View>
  );
};

export default DashboardHeader;
