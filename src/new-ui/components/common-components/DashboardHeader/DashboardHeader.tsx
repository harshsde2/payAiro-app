import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { dashboardHeaderStyles } from '@new-ui/styles/components/dashboardHeaderStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import GlassyWrapper from '@new-ui/components/common-components/GlassyWrapper';
import { AppIcon } from '@new-ui/assets/svgs';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { showSuccess } from 'utils/toast';
import { IDashboardHeaderProps } from './types';
import DashboardMenuModal from '@new-ui/components/common-components/DashboardHeader/DashboardMenuModal';
import { useUnreadNotificationCount } from 'query/hooks/useNotificationsFeed';

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
  const styles = dashboardHeaderStyles(theme) as any;
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const { userData, usersMe } = useSelector((state: any) => state.authenticationSlice);

  // The uploaded avatar comes back on /users/me as `profile.avatar_url` — check it first
  // (same resolution order as ProfileScreen) so the header updates after an avatar upload.
  const rawProfilePhoto =
    usersMe?.profile?.avatar_url ||
    userData?.profile_photo ||
    userData?.profile?.photo;
  const profilePhotoUri = rawProfilePhoto
    ? String(rawProfilePhoto).replace(/^http:\/\//i, 'https://')
    : null;

  const userName =
    userData?.name ||
    [
      userData?.first_name ? String(userData.first_name) : '',
      userData?.last_name ? String(userData.last_name) : '',
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    '';

  const username = userData?.username || '';

  const handleProfilePress = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL as never);
  }, [navigation]);

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
    onMenuPress?.();
  }, [onMenuPress]);

  const handleSupportPress = useCallback(() => {
    navigation.navigate(
      NAVIGATION_SCREENS.SUPPORT_SCREEN as never,
      { mode: 'emailSupport' } as never
    );
  }, [navigation]);

  const closeMenu = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  const handleNavigate = useCallback(
    (routeName: (typeof NAVIGATION_SCREENS)[keyof typeof NAVIGATION_SCREENS]) => {
      closeMenu();
      if (!routeName) return;

      const stackNavigation = navigation.getParent() ?? navigation;
      stackNavigation.dispatch(
        CommonActions.navigate({
          name: routeName,
        })
      );
    },
    [closeMenu, navigation]
  );

  const handleCopyUsername = useCallback(() => {
    if (username) {
      Clipboard.setString(username);
      showSuccess('Copied!', 'PayAiro Tag copied to clipboard');
    }
  }, [username]);

  const MenuIcon = AppIcon.MoreVertical;

  const { data: unreadData } = useUnreadNotificationCount(true);

  const unreadCountRaw = unreadData?.data?.count;
  const unreadCount =
    typeof unreadCountRaw === 'number' && unreadCountRaw > 0 ? unreadCountRaw : 0;

  // console.log("unreadCount =>", unreadCount);
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
            <CustomText variant="bodySmall" style={styles.welcomeText}>
              {username}
            </CustomText>
            <AppIcon.Copygreen width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleSupportPress}
          activeOpacity={0.7}
        >
          <GlassyWrapper
            style={styles.menuButtonGlassy}
            borderRadius={20}
            blurAmount={25}
            overlayOpacity={0.12}
            borderWidth={1}
          >
            <View style={styles.menuIconWrapper}>
              <AppIcon.Headphones width={22} height={22} color={theme.colors.text} />
            </View>
          </GlassyWrapper>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuPress}
          activeOpacity={0.7}
        >
          <GlassyWrapper
            style={styles.menuButtonGlassy}
            borderRadius={20}
            blurAmount={25}
            overlayOpacity={0.12}
            borderWidth={1}
          >
            <View style={styles.menuIconWrapper}>
              <MenuIcon width={25} height={25} color={theme.colors.text} />
            </View>
          </GlassyWrapper>
              {unreadCount > 0 && (
                <View style={styles.menuIconDot} />
              )}
        </TouchableOpacity>
      </View>

      <DashboardMenuModal
        visible={isMenuVisible}
        onClose={closeMenu}
        onNavigate={handleNavigate}
        unreadCount={unreadCount}
      />
    </View>
  );
};

export default DashboardHeader;
