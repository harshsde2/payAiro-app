import React, { useMemo, useState } from 'react';
import { Modal, Pressable, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from '@new-ui/components/common-components/layout';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { dashboardHeaderStyles } from '@new-ui/styles/components/dashboardHeaderStyles';
import { performAppLogout } from 'utils/performAppLogout';

type AppRouteName = (typeof NAVIGATION_SCREENS)[keyof typeof NAVIGATION_SCREENS];

interface IDashboardMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (routeName: AppRouteName) => void;
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
        routeName: NAVIGATION_SCREENS.NEW_NOTIFICATION_SCREEN,
        badgeLabel: unreadLabel,
      },
      {
        key: 'profile' as const,
        label: 'Profile Details',
        icon: <AppIcon.User width={18} height={18} />,
        routeName: NAVIGATION_SCREENS.NEW_PERSONAL,
      },
      {
        key: 'paymentMethods' as const,
        label: 'Payment method',
        icon: <AppIcon.DebitCard width={18} height={18} />,
        routeName: NAVIGATION_SCREENS.PAYMENT_METHODS_SCREEN,
      },
      {
        key: 'transactionLimit' as const,
        label: 'Transaction limit',
        icon: <AppIcon.TransactionLimit width={18} height={18} />,
        routeName: NAVIGATION_SCREENS.TRANSACTION_LIMIT_SCREEN,
      },
      {
        key: 'rewards' as const,
        label: 'Rewards and Referrals',
        icon: <AppIcon.RewardsIcon width={18} height={18} />,
        routeName: NAVIGATION_SCREENS.NEW_REWARDS_AND_REFERRALS_SCREEN,
      },
      {
        key: 'bankStatement' as const,
        label: 'Bank Statement',
        icon: <AppIcon.BankStatement width={18} height={18} />,
        routeName: NAVIGATION_SCREENS.NEW_BANK_STATEMENT_SCREEN,
      },
      {
        key: 'settings' as const,
        label: 'Settings',
        icon: <AppIcon.Settings width={18} height={18} />,
        routeName: NAVIGATION_SCREENS.NEW_SETTINGS_SCREEN,
      },
      {
        key: 'support' as const,
        label: 'Support',
        icon: <AppIcon.Headphones width={18} height={18} />,
        routeName: NAVIGATION_SCREENS.SUPPORT_SCREEN,
      },
      // 'About' omitted: no route/screen yet.
    ],
    [unreadLabel]
  );

  const handlePress = (routeName: AppRouteName) => {
    onNavigate(routeName);
  };

  const handleLogoutPress = () => {
    onClose();
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await performAppLogout();
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
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
                onPress={() => handlePress(item.routeName)}
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
              onPress={handleLogoutPress}
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

    <Modal
      visible={showLogoutConfirm}
      transparent
      animationType="slide"
      onRequestClose={handleLogoutCancel}
    >
      <Pressable style={logoutModalStyles.backdrop} onPress={handleLogoutCancel}>
        <Pressable style={[logoutModalStyles.sheet, { backgroundColor: theme.colors.white }]} onPress={() => {}}>
          <CustomText variant="h4" fontWeight="bold" style={logoutModalStyles.title}>
            Logout
          </CustomText>

          <View style={logoutModalStyles.warningBox}>
            <AppIcon.AlertTriangle width={20} height={20} />
            <CustomText
              variant="body"
              size={14}
              fontWeight="regular"
              color="#8B6914"
              style={logoutModalStyles.warningText}
            >
              This will remove all accounts and clear all data from the app.
            </CustomText>
          </View>

          <View style={logoutModalStyles.buttonRow}>
            <Button
              color={theme.colors.primary}
              // borderRadius={999}
              // height={52}
              style={{ flex: 1 }}
              onPress={handleLogoutCancel}
            >
              Cancel
            </Button>

            <Button
              color={theme.colors.error}
              // borderRadius={999}
              // height={52}
              style={{ flex: 1 }}
              onPress={handleLogoutConfirm}
            >
              Logout
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
    </>
  );
};

const logoutModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 15,
  },
  sheet: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    flex: 1,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default DashboardMenuModal;

