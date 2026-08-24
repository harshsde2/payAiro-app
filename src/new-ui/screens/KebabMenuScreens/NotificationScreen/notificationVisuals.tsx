import React from 'react'
import { AppIcon } from '@new-ui/assets/svgs'

/**
 * Icon + tint used for a notification, shared by the feed card and the detail popup so
 * the item the user tapped looks the same in both places.
 */
export type NotificationIconType =
  | 'wallet'
  | 'feature'
  | 'pending'
  | 'success'
  | 'contact'
  | 'security'
  | 'account'

/**
 * Map a backend category to the screen's icon/colour styling.
 *
 * Every category resolves to something that describes what happened — a bell for a
 * notice, a person for a contact, a clock for something still pending. The fallback is
 * the bell (a generic notification), never a question mark: "?" reads as "we don't know
 * what this is", which is never the message we want to send about the user's money.
 */
export const categoryToIconType = (
  category?: string,
  eventType?: string
): NotificationIconType => {
  // Crypto Request (P2P): an incoming request is "pending"; a fulfilled one is a success.
  if (eventType === 'CRYPTO_REQUEST_RECEIVED') return 'pending'
  if (eventType === 'CRYPTO_REQUEST_FULFILLED') return 'success'
  switch (category) {
    case 'transaction':
    case 'payment':
      return 'success'
    case 'contact':
      return 'contact'
    case 'security':
      return 'security'
    case 'account':
      return 'account'
    case 'system':
    case 'promo':
      return 'feature'
    default:
      return 'feature'
  }
}

export const ICON_BG: Record<NotificationIconType, string> = {
  wallet: '#E8F7EE',
  success: '#E8F7EE',
  contact: '#E8F7EE',
  feature: '#F2F2F7',
  security: '#F2F2F7',
  account: '#F2F2F7',
  pending: '#FFF8E1',
}

export const NotificationIcon: React.FC<{
  type: NotificationIconType
  size?: number
}> = ({ type, size = 24 }) => {
  switch (type) {
    case 'wallet':
      return <AppIcon.AddBalance width={size} height={size} />
    case 'success':
      return <AppIcon.TickCheckedBox width={size} height={size} />
    case 'contact':
      return <AppIcon.AddContact width={size} height={size} />
    case 'security':
      return <AppIcon.Privacy width={size} height={size} />
    case 'account':
      return <AppIcon.User width={size} height={size} />
    case 'pending':
      return <AppIcon.Clock width={size} height={size} />
    case 'feature':
    default:
      return <AppIcon.Notification width={size} height={size} />
  }
}

/** "payment_status" → "Payment Status", for rendering the free-form `data` payload. */
export const prettifyKey = (key: string): string =>
  key
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Flatten the notification's `data` payload into displayable rows. Only primitives are
 * shown — nested objects/arrays are backend plumbing, not something to render raw — and
 * keys already presented elsewhere in the popup are skipped.
 */
const HIDDEN_DATA_KEYS = new Set([
  'title',
  'body',
  'deep_link',
  'deeplink',
  'icon_url',
  'image_url',
  'file_url',
  'category',
  'event_type',
])

export const buildDataRows = (
  data?: Record<string, unknown> | null,
  limit = 8
): { label: string; value: string }[] => {
  if (!data || typeof data !== 'object') return []
  const rows: { label: string; value: string }[] = []
  for (const [key, raw] of Object.entries(data)) {
    if (rows.length >= limit) break
    if (HIDDEN_DATA_KEYS.has(key.toLowerCase())) continue
    if (raw === null || raw === undefined) continue
    const isPrimitive =
      typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean'
    if (!isPrimitive) continue
    const value = String(raw).trim()
    if (!value) continue
    rows.push({ label: prettifyKey(key), value })
  }
  return rows
}
