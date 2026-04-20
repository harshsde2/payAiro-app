import React, { useState } from 'react'
import { View, Switch, TouchableOpacity, StyleSheet } from 'react-native'
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper'
import CustomText from '@new-ui/components/common-components/CustomText'
import { useTheme } from '@new-ui/styles/ThemeContext'
import { AppIcon } from '@new-ui/assets/svgs'

type NotificationIconType = 'wallet' | 'feature' | 'pending' | 'success' | 'info'

interface INotificationItem {
  id: string
  title: string
  description: string
  date: string
  iconBg: string
  iconType: NotificationIconType
}

const TODAY_NOTIFICATIONS: INotificationItem[] = [
  {
    id: '1',
    title: 'Wallet Top Up',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidi...',
    date: '03 Apr. 25',
    iconBg: '#E8F7EE',
    iconType: 'wallet',
  },
  {
    id: '2',
    title: 'New Feature Update',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidi...',
    date: '03 Apr. 25',
    iconBg: '#F2F2F7',
    iconType: 'feature',
  },
  {
    id: '3',
    title: 'Payment Pending',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidi...',
    date: '03 Apr. 25',
    iconBg: '#FFF8E1',
    iconType: 'pending',
  },
]

const OLDER_NOTIFICATIONS: INotificationItem[] = [
  {
    id: '4',
    title: 'Transaction Successful',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidi...',
    date: '03 Apr. 25',
    iconBg: '#E8F7EE',
    iconType: 'success',
  },
  {
    id: '5',
    title: 'New Feature Update',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidi...',
    date: '03 Apr. 25',
    iconBg: '#F2F2F7',
    iconType: 'info',
  },
  {
    id: '6',
    title: 'Payment Pending',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidi...',
    date: '03 Apr. 25',
    iconBg: '#FFF8E1',
    iconType: 'pending',
  },
]

const NotificationIcon: React.FC<{ type: NotificationIconType }> = ({ type }) => {
  switch (type) {
    case 'wallet':   return <AppIcon.AddBalance width={24} height={24} />
    case 'feature':  return <AppIcon.Notification width={24} height={24} />
    case 'pending':  return <AppIcon.HelpCircle width={24} height={24} />
    case 'success':  return <AppIcon.TickCheckedBox width={24} height={24} />
    case 'info':     return <AppIcon.HelpCircle width={24} height={24} />
    default:         return null
  }
}

const NotificationScreen = () => {
  const { theme } = useTheme()
  const [allowNotifications, setAllowNotifications] = useState(false)
  const styles = notificationStyles(theme)

  const renderCard = (item: INotificationItem) => (
    <View key={item.id} style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
        <NotificationIcon type={item.iconType} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <CustomText variant="h5" size={16} fontWeight="semiBold" style={styles.cardTitle}>
            {item.title}
          </CustomText>
          <CustomText variant="caption" size={11} fontWeight="regular" color={theme.colors.textSecondary}>
            {item.date}
          </CustomText>
        </View>
        <CustomText
          variant="caption"
          size={12}
          fontWeight='light'
          color={theme.colors.textSecondary}
          numberOfLines={2}
        >
          {item.description}
        </CustomText>
      </View>
    </View>
  )

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      contentStyle={{ flexGrow: 1, paddingBottom: 32 }}
    >
      <View style={styles.container}>
        <View style={styles.toggleRow}>
          <CustomText variant="h4" fontWeight="bold">Allow Notifications</CustomText>
          <Switch
            value={allowNotifications}
            onValueChange={setAllowNotifications}
            trackColor={{ false: theme.colors.greyLight, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.sectionHeader}>
          <CustomText variant="h5" size={14} fontWeight="regular" color={theme.colors.greyDark}>
            Today
          </CustomText>
          <TouchableOpacity activeOpacity={0.7}>
            <CustomText variant="h5" size={14} fontWeight="semiBold" color={theme.colors.primary}>
              Mark all Read
            </CustomText>
          </TouchableOpacity>
        </View>

        {TODAY_NOTIFICATIONS.map(renderCard)}

        <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
          <CustomText variant="h5" size={14} fontWeight="regular" color={theme.colors.greyDark}>
            Older
          </CustomText>
        </View>

        {OLDER_NOTIFICATIONS.map(renderCard)}
      </View>
    </ScreenWrapper>
  )
}

const notificationStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing['3xl'],
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      flexShrink: 0,
    },
    cardContent: {
      flex: 1,
      gap: 4,
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
      
    },
    cardTitle: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
  })

export default NotificationScreen
