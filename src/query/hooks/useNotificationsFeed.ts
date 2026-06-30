import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { USER_AUTH } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';
import {
  MarkReadResponse,
  NotificationItem,
  NotificationPreferences,
  NotificationsFeedFilters,
  NotificationsListResponse,
  PreferencesResponse,
  UnreadCountResponse,
} from '@new-ui/types/notifications';

const DEFAULT_PAGE_SIZE = 25;

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters: NotificationsFeedFilters) =>
    [...notificationKeys.all, 'list', filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
  // Kept under a separate root so feed invalidations (e.g. mark-all-read)
  // never trigger a preferences refetch.
  preferences: () => ['notificationPreferences'] as const,
};

const buildListUrl = (
  limit: number,
  offset: number,
  filters: NotificationsFeedFilters
): string => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (filters.unread) params.set('unread', '1');
  if (filters.category) params.set('category', String(filters.category));
  if (filters.event_type) params.set('event_type', filters.event_type);
  return `${USER_AUTH.NOTIFICATIONS}?${params.toString()}`;
};

/**
 * Paginated in-app notification feed (newest first). Offset paging: each page
 * advances the offset by `limit` while a full page is returned.
 */
export function useNotificationsFeed(
  filters: NotificationsFeedFilters = {},
  limit: number = DEFAULT_PAGE_SIZE
) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list({ ...filters }),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) =>
      await userApiClient.get<NotificationsListResponse>(
        buildListUrl(limit, pageParam as number, filters)
      ),
    getNextPageParam: (lastPage, allPages) => {
      const items = lastPage?.data?.items ?? [];
      if (items.length < limit) return undefined;
      return allPages.length * limit;
    },
    staleTime: 0,
  });
}

/** Flatten infinite-query pages into a single notifications array. */
export const flattenNotifications = (
  pages?: NotificationsListResponse[]
): NotificationItem[] =>
  (pages ?? []).flatMap((page) => page?.data?.items ?? []);

/** Unread count for the bell badge. */
export function useUnreadNotificationCount(enabled: boolean = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () =>
      await userApiClient.get<UnreadCountResponse>(
        USER_AUTH.NOTIFICATIONS_UNREAD_COUNT
      ),
    staleTime: 0,
    enabled,
  });
}

/** Mark a single notification read. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) =>
      await userApiClient.post<MarkReadResponse>(
        USER_AUTH.NOTIFICATION_MARK_READ(id),
        {}
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);
    },
  });
}

/** Mark all unread notifications read. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await userApiClient.post<MarkReadResponse>(
        USER_AUTH.NOTIFICATIONS_MARK_READ,
        { all: true }
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);
    },
  });
}

/** Per-user push preferences. GET creates a default row on first call. */
export function useNotificationPreferences(enabled: boolean = true) {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: async () =>
      await userApiClient.get<PreferencesResponse>(
        USER_AUTH.NOTIFICATIONS_PREFERENCES
      ),
    staleTime: 10_000,
    enabled,
  });
}

/** Partial update of push preferences (e.g. { push_enabled: false }). */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NotificationPreferences) =>
      await userApiClient.put<PreferencesResponse>(
        USER_AUTH.NOTIFICATIONS_PREFERENCES,
        payload
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
  });
}
