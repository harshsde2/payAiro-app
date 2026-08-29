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
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper'
import CustomText from '@new-ui/components/common-components/CustomText'
import { useTheme } from '@new-ui/styles/ThemeContext'
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants'
import { showError } from 'utils/toast'
import { formatShortDate } from 'utils/dateUtils'
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
// Icon/tint mapping lives beside the screen so the detail popup renders the tapped item
// exactly like its card.
import { categoryToIconType, getIconBg, NotificationIcon } from './notificationVisuals'
import NotificationDetailModal from './NotificationDetailModal'

interface NotificationSection {
  title: string
  data: NotificationItem[]
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

/** Format an ISO date to the existing card style, e.g. "03 Apr. 25". */
const formatDate = (iso?: string): string => formatShortDate(iso)

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

  // Crypto Request (P2P): "payairo://requests/42" → request detail with id param.
  const requestMatch = link.match(/requests\/(\d+)/i)
  if (requestMatch) {
    navigation.navigate(NAVIGATION_SCREENS.NEW_CRYPTO_REQUEST_DETAIL as never, {
      id: Number(requestMatch[1]),
    } as never)
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

  // The API nests the toggles under `data.preferences` — reading `data.push_enabled`
  // always yielded undefined, so the seed below never ran and the switch fell back to
  // its `false` default on every remount even when the server had push enabled.
  const serverPushEnabled = prefsResponse?.data?.preferences?.push_enabled

  // Server value is the source of truth; `localOverride` only holds the optimistic
  // value while a toggle is in flight, so returning to the screen always reflects
  // the persisted state instead of a stale local default.
  const [localOverride, setLocalOverride] = useState<boolean | null>(null)
  const allowNotifications = localOverride ?? serverPushEnabled ?? false

  /** The notification whose detail popup is open; `null` when closed. */
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null)

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
      setLocalOverride(value) // optimistic
      updatePrefs(
        { push_enabled: value },
        {
          // Drop the override once the refetched preferences are authoritative.
          onSuccess: () => setLocalOverride(null),
          onError: () => {
            setLocalOverride(null) // revert to the server value
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

  const onPressItem = useCallback((item: NotificationItem) => {
    // Items are already marked read on screen open; tap opens the detail popup, which
    // carries the deep link on its action button.
    setSelectedNotification(item)
  }, [])

  const onCloseDetail = useCallback(() => setSelectedNotification(null), [])

  const onOpenDetailLink = useCallback(
    (item: NotificationItem) => {
      // Close first: navigating out from under an open RN modal leaves the overlay
      // stranded on top of the destination screen.
      setSelectedNotification(null)
      handleDeepLink(item.deep_link, navigation)
    },
    [navigation]
  )

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderCard = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const iconType = categoryToIconType(item.category as NotificationCategory, item.event_type)
      const read = isNotificationRead(item)
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPressItem(item)}
          style={[styles.card, !read && styles.cardUnread]}
        >
          <View style={[styles.iconCircle, { backgroundColor: getIconBg(theme)[iconType] }]}>
            {item.icon_url ? (
              <Image source={{ uri: item.icon_url }} style={styles.iconImage} />
            ) : (
              <NotificationIcon type={iconType} color={theme.colors.text} />
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
        // greyLight (#F5F5F5) is near-white and vanished against the card — greyLight2
        // (#CCCCCC) reads as a real "off" track. ios_backgroundColor is required or iOS
        // renders its own default grey behind the track and ignores trackColor.false.
        trackColor={{ false: theme.colors.greyLight2, true: theme.colors.primary }}
        ios_backgroundColor={theme.colors.greyLight2}
        thumbColor={theme.colors.onPrimary}
        // Android's switch renders noticeably smaller than iOS's — nudge it up to match.
        style={Platform.OS === 'android' ? styles.androidSwitch : undefined}
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
        // ListHeaderComponent={ListHeader}
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

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={onCloseDetail}
        onOpenLink={onOpenDetailLink}
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
    androidSwitch: {
      transform: [{ scaleX: 1.15 }, { scaleY: 1.15 }],
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
      backgroundColor: theme.colors.surfaceElevated,
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
