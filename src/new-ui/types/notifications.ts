// Types for the FastAPI in-app notifications API.
// Source of truth: "PayAiro · Notifications API" Postman collection.
// All endpoints return the standard envelope: { ok, message, data }.

export type NotificationCategory =
  | 'transaction'
  | 'account'
  | 'security'
  | 'payment'
  | 'contact'
  | 'system'
  | 'promo';

/** A single notification row as returned by GET /api/v1/notifications/. */
export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  category?: NotificationCategory | string;
  event_type?: string;
  image_url?: string | null;
  file_url?: string | null;
  icon_url?: string | null;
  deep_link?: string | null;
  data?: Record<string, unknown> | null;
  created_at?: string;
  // Backend may use either `read` or `is_read` — tolerate both.
  read?: boolean;
  is_read?: boolean;
  read_at?: string | null;
}

export interface NotificationsListResponse {
  ok?: boolean;
  message?: string;
  data?: {
    items?: NotificationItem[];
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface UnreadCountResponse {
  ok?: boolean;
  message?: string;
  data?: {
    count?: number;
    by_category?: Partial<Record<NotificationCategory, number>>;
  };
}

export interface MarkReadResponse {
  ok?: boolean;
  message?: string;
  data?: {
    updated?: number;
  };
}

/** Per-user push category toggles (PUT supports partial updates). */
export interface NotificationPreferences {
  push_enabled?: boolean;
  transactions_enabled?: boolean;
  account_enabled?: boolean;
  payment_enabled?: boolean;
  security_enabled?: boolean;
  contact_enabled?: boolean;
  system_enabled?: boolean;
  marketing_enabled?: boolean;
}

/**
 * GET/PUT `notifications/preferences/` — the toggles come back NESTED under
 * `data.preferences` (not flat on `data`), e.g.
 * `{ ok, message, data: { preferences: { push_enabled: true, ... } } }`.
 */
export interface PreferencesResponse {
  ok?: boolean;
  message?: string;
  data?: {
    preferences?: NotificationPreferences & { updated_at?: string };
  };
}

/** Filters accepted by the notifications list endpoint. */
export interface NotificationsFeedFilters {
  unread?: boolean;
  category?: NotificationCategory | string;
  event_type?: string;
}

/** True when a notification has been read, regardless of which field the API used. */
export const isNotificationRead = (item: NotificationItem): boolean =>
  item.read === true || item.is_read === true;
