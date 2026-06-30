import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper'
import CustomText from '@new-ui/components/common-components/CustomText'
import { useTheme } from '@new-ui/styles/ThemeContext'
import { AppIcon } from '@new-ui/assets/svgs'
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants'
import { showError } from 'utils/toast'
import {
  NotificationItem,
  NotificationCategory,
  isNotificationRead,
} from '@new-ui/types/notifications'
import {
  useNotificationsFeed,
  flattenNotifications,
  useMarkAllNotificationsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from 'query/hooks/useNotificationsFeed'

type NotificationIconType = 'wallet' | 'feature' | 'pending' | 'success' | 'info'

interface NotificationSection {
  title: string
  data: NotificationItem[]
}

/** Map a backend category to the screen's icon/colour styling. */
const categoryToIconType = (category?: string): NotificationIconType => {
  switch (category) {
    case 'transaction':
    case 'payment':
      return 'success'
    case 'account':
    case 'security':
      return 'info'
    case 'system':
    case 'promo':
      return 'feature'
    default:
      return 'pending'
  }
}

const ICON_BG: Record<NotificationIconType, string> = {
  wallet: '#E8F7EE',
  success: '#E8F7EE',
  feature: '#F2F2F7',
  info: '#F2F2F7',
  pending: '#FFF8E1',
}

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

const isToday = (iso?: string): boolean => {
  if (!iso) return false
  const d = new Date(iso)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Format an ISO date to the existing card style, e.g. "03 Apr. 25". */
const formatDate = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS[d.getMonth()]
  const year = String(d.getFullYear()).slice(-2)
  return `${day} ${month}. ${year}`
}

/** Set of valid navigation screen names for best-effort deep-link routing. */
const SCREEN_NAMES = new Set<string>(Object.values(NAVIGATION_SCREENS))

/**
 * Best-effort deep-link handler. Navigates to a known screen if the link maps to
 * one; opens http(s) links externally; otherwise no-ops.
 */
const handleDeepLink = (deepLink: string | null | undefined, navigation: any) => {
  if (!deepLink) return
  const link = deepLink.trim()
  if (!link) return

  if (/^https?:\/\//i.test(link)) {
    Linking.openURL(link).catch(() => {})
    return
  }

  // e.g. "NewNotificationScreen" or "payairo://NewSend" → take the last path segment
  const candidate = link.replace(/^[a-z]+:\/\//i, '').split(/[/?#]/).filter(Boolean).pop()
  if (candidate && SCREEN_NAMES.has(candidate)) {
    navigation.navigate(candidate as never)
  }
}

const NotificationScreen = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<any>()
  const styles = notificationStyles(theme)

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsFeed()

  const { mutate: markAllRead } = useMarkAllNotificationsRead()

  const { data: prefsResponse } = useNotificationPreferences()
  const { mutate: updatePrefs, isPending: isUpdatingPrefs } =
    useUpdateNotificationPreferences()

  // Local switch state, seeded once from the first successful preferences load.
  // After that the user's toggles win — we never overwrite them with server data.
  const serverPushEnabled = prefsResponse?.data?.push_enabled
  const [allowNotifications, setAllowNotifications] = useState(false)
  const prefsSeededRef = useRef(false)
  useEffect(() => {
    if (prefsSeededRef.current) return
    if (typeof serverPushEnabled === 'boolean') {
      prefsSeededRef.current = true
      setAllowNotifications(serverPushEnabled)
    }
  }, [serverPushEnabled])

  const items = useMemo(
    () => flattenNotifications(data?.pages),
    [data?.pages]
  )

  const sections = useMemo<NotificationSection[]>(() => {
    const today: NotificationItem[] = []
    const older: NotificationItem[] = []
    items.forEach((item) => (isToday(item.created_at) ? today : older).push(item))
    const result: NotificationSection[] = []
    if (today.length) result.push({ title: 'Today', data: today })
    if (older.length) result.push({ title: 'Older', data: older })
    return result
  }, [items])

  const hasUnread = useMemo(
    () => items.some((item) => !isNotificationRead(item)),
    [items]
  )

  // Opening the screen marks the whole feed read — no per-item tap required.
  // Fires once per mount, after the first load, when there is anything unread.
  const autoMarkedRef = useRef(false)
  useEffect(() => {
    if (autoMarkedRef.current || isLoading || !hasUnread) return
    autoMarkedRef.current = true
    markAllRead()
  }, [isLoading, hasUnread, markAllRead])

  const onToggle = useCallback(
    (value: boolean) => {
      setAllowNotifications(value) // optimistic
      updatePrefs(
        { push_enabled: value },
        {
          onError: () => {
            setAllowNotifications(!value) // revert
            showError(
              'Could not update notifications',
              'Please try again in a moment.'
            )
          },
        }
      )
    },
    [updatePrefs]
  )

  const onPressItem = useCallback(
    (item: NotificationItem) => {
      // Items are already marked read on screen open; tap just follows the deep link.
      handleDeepLink(item.deep_link, navigation)
    },
    [navigation]
  )

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderCard = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const iconType = categoryToIconType(item.category as NotificationCategory)
      const read = isNotificationRead(item)
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPressItem(item)}
          style={[styles.card, !read && styles.cardUnread]}
        >
          <View style={[styles.iconCircle, { backgroundColor: ICON_BG[iconType] }]}>
            {item.icon_url ? (
              <Image source={{ uri: item.icon_url }} style={styles.iconImage} />
            ) : (
              <NotificationIcon type={iconType} />
            )}
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              <CustomText variant="h5" size={16} fontWeight="semiBold" style={styles.cardTitle}>
                {item.title}
              </CustomText>
              <CustomText variant="caption" size={11} fontWeight="regular" color={theme.colors.textSecondary}>
                {formatDate(item.created_at)}
              </CustomText>
            </View>
            <CustomText
              variant="caption"
              size={12}
              fontWeight="light"
              color={theme.colors.textSecondary}
              numberOfLines={2}
            >
              {item.body}
            </CustomText>
          </View>
        </TouchableOpacity>
      )
    },
    [onPressItem, styles, theme.colors.textSecondary]
  )

  const renderSectionHeader = useCallback(
    ({ section }: { section: NotificationSection }) => (
      <View style={styles.sectionHeader}>
        <CustomText variant="h5" size={14} fontWeight="regular" color={theme.colors.greyDark}>
          {section.title}
        </CustomText>
      </View>
    ),
    [styles, theme.colors.greyDark]
  )

  const ListHeader = (
    <View style={styles.toggleRow}>
      <CustomText variant="h4" fontWeight="bold">Allow Notifications</CustomText>
      <Switch
        value={allowNotifications}
        onValueChange={onToggle}
        disabled={isUpdatingPrefs}
        trackColor={{ false: theme.colors.greyLight, true: theme.colors.primary }}
        thumbColor={theme.colors.white}
      />
    </View>
  )

  const renderEmpty = () => {
    if (isLoading) return null
    return (
      <View style={styles.emptyState}>
        <CustomText variant="h5" fontWeight="semiBold" color={theme.colors.greyDark}>
          {isError ? 'Could not load notifications' : 'No notifications yet'}
        </CustomText>
        {isError && (
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn} activeOpacity={0.7}>
            <CustomText variant="h5" size={14} fontWeight="semiBold" color={theme.colors.primary}>
              Tap to retry
            </CustomText>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <ScreenWrapper safeArea safeAreaEdges={['bottom']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={
          isLoading || isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.footerLoader}
            />
          ) : null
        }
      />
    </ScreenWrapper>
  )
}

const notificationStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
      paddingBottom: 32,
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
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.background,
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
    cardUnread: {
      borderColor: theme.colors.primary,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      flexShrink: 0,
      overflow: 'hidden',
    },
    iconImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['3xl'],
      gap: theme.spacing.sm,
    },
    retryBtn: {
      paddingVertical: theme.spacing.sm,
    },
    footerLoader: {
      marginVertical: theme.spacing.lg,
    },
  })

export default NotificationScreen
