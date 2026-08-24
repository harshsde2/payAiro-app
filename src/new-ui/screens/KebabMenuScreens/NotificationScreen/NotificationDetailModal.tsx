import React, { useMemo } from 'react'
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomText from '@new-ui/components/common-components/CustomText'
import Button from '@new-ui/components/common-components/layout/Button'
import { useTheme } from '@new-ui/styles/ThemeContext'
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles'
import type { ITheme } from '@new-ui/styles/themes/themeTypes'
import { AppIcon } from '@new-ui/assets/svgs'
import { formatReceiptDateTime } from 'utils/dateUtils'
import type { NotificationItem } from '@new-ui/types/notifications'
import {
  buildDataRows,
  categoryToIconType,
  ICON_BG,
  NotificationIcon,
  prettifyKey,
} from './notificationVisuals'

type NotificationDetailModalProps = {
  /** The tapped notification. `null` keeps the modal closed. */
  notification: NotificationItem | null
  onClose: () => void
  /** Invoked when the user takes the notification's action (its deep link). */
  onOpenLink: (notification: NotificationItem) => void
}

/**
 * Almost every notification carries SOME `deep_link`, but for most (system notices,
 * "added you to contacts", …) it resolves to nothing the user can act on — an action
 * button there is just a confusing second way to close the popup. Only a link that
 * lands on a real destination earns one; everything else gets a plain Close.
 */
const actionLabelFor = (notification: NotificationItem): string | null => {
  const link = notification.deep_link?.trim()
  if (!link) return null
  if (/requests\/\d+/i.test(link)) return 'View Request'
  return null
}

/**
 * Detail popup for a single notification, in the app's standard modal style (same shell as
 * AddDebitCardModal / InfoModal: centered ✕ above a bottom-anchored card, tap-outside to
 * dismiss). The feed card truncates the body to two lines — this shows the whole thing,
 * plus the timestamp and whatever primitives the backend put in `data`.
 */
const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  onClose,
  onOpenLink,
}) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const styles = addBalanceStyles(theme)
  const local = useMemo(() => makeStyles(theme), [theme])

  const dataRows = useMemo(
    () => buildDataRows(notification?.data),
    [notification?.data]
  )

  if (!notification) return null

  const iconType = categoryToIconType(notification.category, notification.event_type)
  const timestamp = formatReceiptDateTime(notification.created_at)
  const category = notification.category ? prettifyKey(String(notification.category)) : ''
  const actionLabel = actionLabelFor(notification)

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[
          styles.modalBackdrop,
          {
            paddingTop: insets.top + theme.spacing.sm,
            paddingBottom: Math.max(insets.bottom, theme.spacing.md),
          },
        ]}
        onPress={onClose}
      >
        <View style={styles.modalCloseRow}>
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* stopPropagation so taps inside the card don't fall through to the backdrop. */}
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={[local.iconCircle, { backgroundColor: ICON_BG[iconType] }]}>
            {notification.icon_url ? (
              <Image source={{ uri: notification.icon_url }} style={local.iconImage} />
            ) : (
              <NotificationIcon type={iconType} size={28} />
            )}
          </View>

          <CustomText variant="h5" fontWeight="bold" align="center">
            {notification.title}
          </CustomText>

          {timestamp ? (
            <CustomText
              variant="caption"
              size={12}
              color={theme.colors.textSecondary}
              align="center"
              style={local.timestamp}
            >
              {timestamp}
            </CustomText>
          ) : null}

          {category ? (
            <View style={local.categoryPill}>
              <CustomText variant="caption" size={11} fontWeight="semiBold" color={theme.colors.primary}>
                {category}
              </CustomText>
            </View>
          ) : null}

          <ScrollView
            style={local.scroll}
            contentContainerStyle={local.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <CustomText
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
              style={local.body}
            >
              {notification.body}
            </CustomText>

            {dataRows.length > 0 ? (
              <View style={local.detailsCard}>
                {dataRows.map((row, index) => (
                  <View
                    key={row.label}
                    style={[local.detailRow, index === dataRows.length - 1 && local.detailRowLast]}
                  >
                    <CustomText
                      variant="caption"
                      size={12}
                      color={theme.colors.textSecondary}
                      style={local.detailLabel}
                    >
                      {row.label}
                    </CustomText>
                    <CustomText
                      variant="caption"
                      size={12}
                      fontWeight="semiBold"
                      style={local.detailValue}
                    >
                      {row.value}
                    </CustomText>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View style={local.buttonWrap}>
            <Button onPress={actionLabel ? () => onOpenLink(notification) : onClose}>
              {actionLabel ?? 'Close'}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    iconCircle: {
      alignSelf: 'center',
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
    },
    iconImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    timestamp: {
      marginTop: theme.spacing.xs,
    },
    categoryPill: {
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: theme.colors.primaryLight,
    },
    // flexShrink (no flexGrow) so a short notification keeps the card compact and a long
    // one scrolls inside the card instead of pushing the button off screen.
    scroll: {
      flexShrink: 1,
      marginTop: theme.spacing.md,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xs,
    },
    body: {
      lineHeight: 22,
    },
    detailsCard: {
      marginTop: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    detailLabel: {
      flex: 1,
    },
    detailValue: {
      flex: 1.2,
      textAlign: 'right',
    },
    buttonWrap: {
      marginTop: theme.spacing.lg,
    },
  })

export default NotificationDetailModal
