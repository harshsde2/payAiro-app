import React, { useMemo } from 'react';
import { Modal, Pressable, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { dashboardHeaderStyles } from '@new-ui/styles/components/dashboardHeaderStyles';

type ScreenKey = keyof typeof NAVIGATION_SCREENS;

interface IDashboardMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenKey) => void;
  unreadCount?: number;
}

const DashboardMenuModal: React.FC<IDashboardMenuModalProps> = ({
  visible,
  onClose,
  onNavigate,
  unreadCount,
}) => {
  const { theme } = useTheme();
  const styles = dashboardHeaderStyles(theme) as any;

  const unreadLabel =
    typeof unreadCount === 'number' && unreadCount > 0
      ? unreadCount > 99
        ? '99+'
        : String(unreadCount)
      : undefined;

  const menuItems = useMemo(
    () => [
      {
        key: 'notification' as const,
        label: 'Notification',
        icon: <AppIcon.Notification width={18} height={18} />,
        screen: 'NOTIFICATION' as ScreenKey,
        badgeLabel: unreadLabel,
      },
      {
        key: 'profile' as const,
        label: 'Profile Details',
        icon: <AppIcon.User width={18} height={18} />,
        screen: 'NEW_PERSONAL' as ScreenKey,
      },
      // {
      //   key: 'settings' as const,
      //   label: 'Settings',
      //   icon: <AppIcon.Settings width={18} height={18} />,
      //   screen: 'SETTING_SCREEN' as ScreenKey,
      // },
      {
        key: 'support' as const,
        label: 'Support',
        icon: <AppIcon.Headphones width={18} height={18} />,
        screen: 'SUPPORT_SCREEN' as ScreenKey,
      },
      {
        key: 'about' as const,
        label: 'About',
        icon: <AppIcon.HelpCircle width={18} height={18} />,
        screen: 'COMING_SOON' as ScreenKey,
      },
    ],
    [unreadLabel]
  );

  const handlePress = (screen: ScreenKey) => {
    onNavigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.menuBackdrop} onPress={onClose}>
        <View style={styles.menuCardWrapper}>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.white }]}>
            {menuItems.map((item: any) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => handlePress(item.screen)}
              >
                <View style={styles.menuItemLeft}>
                  {item.icon}
                  <CustomText variant="body" style={styles.menuItemText}>
                    {item.label}
                  </CustomText>
                </View>
                <View style={styles.menuRight}>
                  {item.badgeLabel ? (
                    <View style={styles.menuBadge}>
                      <CustomText variant="caption" style={styles.menuBadgeText}>
                        {item.badgeLabel}
                      </CustomText>
                    </View>
                  ) : null}
                  <AppIcon.ChevronRight width={16} height={16} />
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handlePress('LOGIN')}
            >
              <View style={styles.menuItemLeft}>
                <AppIcon.LogOut width={18} height={18} />
                <CustomText
                  variant="body"
                  style={[styles.menuItemText, { color: theme.colors.error }]}
                >
                  Logout
                </CustomText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default DashboardMenuModal;

