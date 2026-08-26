import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import { sendContactsListStyles } from '@new-ui/styles/components/sendContactsListStyles';
import { useFastApiUsersSearch } from 'query/hooks';
import {
  getUserContactAvatar,
  getUserContactDisplayName,
  IUserContact,
  useUserContacts,
} from 'query/hooks/useContact';
import { useDebounce } from 'hooks/useDebounce';
import { isTopupUser } from 'utils/userIdentity';

export interface ISendContactItem {
  uuid: string;
  nickname: string;
  username: string;
  email: string;
  profile_photo: string | null;
}

export interface ISendContactsListProps {
  searchQuery: string;
  selectedId?: string | null;
  limit?: number;
  onSelect: (contact: ISendContactItem) => void;
  onProfilePress?: (contact: ISendContactItem) => void;
}

const dedupeByUuid = (items: ISendContactItem[]): ISendContactItem[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.uuid || seen.has(item.uuid)) return false;
    seen.add(item.uuid);
    return true;
  });
};

// The PayAiro tag is the primary key a send resolves against, so it also drives the
// ordering of the suggestion list: exact tag → tag prefix → tag substring → anything that
// only matched on name/email. Ties keep their incoming order (API relevance / saved order).
const tagMatchRank = (contact: ISendContactItem, needle: string): number => {
  const tag = contact.username.trim().toLowerCase();
  if (!tag || !needle) return 3;
  if (tag === needle) return 0;
  if (tag.startsWith(needle)) return 1;
  if (tag.includes(needle)) return 2;
  return 3;
};

const sortByTagMatch = (
  items: ISendContactItem[],
  needle: string
): ISendContactItem[] => {
  if (!needle) return items;
  return items
    .map((item, index) => ({ item, index, rank: tagMatchRank(item, needle) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ item }) => item);
};

const toSendContact = (contact: IUserContact): ISendContactItem => {
  // `contact_user_id` is the target user's id; `id` is only the contact-list row id.
  const uuid = String(contact.contact_user_id ?? contact.id ?? contact.username ?? '');
  const username = contact.username?.trim() ?? '';
  return {
    uuid,
    nickname: getUserContactDisplayName(contact),
    username,
    email: contact.email?.trim() ?? '',
    profile_photo: getUserContactAvatar(contact),
  };
};

const SendContactsList: React.FC<ISendContactsListProps> = ({
  searchQuery,
  selectedId,
  limit = 4,
  onSelect,
  onProfilePress,
}) => {
  const { theme } = useTheme();
  const styles = sendContactsListStyles(theme);

  const trimmedInput = searchQuery.trim();
  const isSearching = trimmedInput.length > 0;

  const debouncedInput = useDebounce(trimmedInput, 300);
  // Clearing the field must drop back to saved contacts instantly, without waiting out the
  // debounce — so the search query is gated on the live input, not the debounced one.
  const searchTerm = isSearching ? debouncedInput : '';

  // Saved contacts: the default suggestions shown before the user types anything. Cached by
  // React Query (shared with the dashboard), so re-entering this screen renders them instantly.
  const { data: userContactsData, isLoading: isSavedLoading } = useUserContacts();

  const savedContacts: ISendContactItem[] = useMemo(() => {
    const contacts = userContactsData?.contacts ?? [];
    return dedupeByUuid(
      contacts
        .map(toSendContact)
        // A send needs a PayAiro tag to resolve against — phone/email-only contacts can't be
        // verified by the send flow, so they aren't offered as suggestions here.
        .filter((contact) => !!contact.username)
    );
  }, [userContactsData]);

  const apiLimit = Math.min(Math.max(limit, 1), 25);
  const { data, isFetching, isPlaceholderData } = useFastApiUsersSearch(
    searchTerm,
    apiLimit,
    1
  );

  const searchResults: ISendContactItem[] = useMemo(() => {
    if (!isSearching) return [];
    const needle = trimmedInput.toLowerCase();
    const users = data?.data?.users ?? [];
    // Only PayAiro (on-platform) users can be sent to from here — hide external users
    // (is_external === true). Missing/undefined is treated as internal.
    const mapped = users
      .filter((user) => user.is_external !== true)
      .map((user) => {
        const displayName =
          `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const tagOrUsername =
          (user.payairo_tag?.trim() || user.username || '').trim();
        return {
          uuid: String(user.id),
          nickname: displayName || tagOrUsername,
          username: tagOrUsername,
          email: '',
          profile_photo: user.avatar_url ?? null,
        };
      });
    return sortByTagMatch(mapped, needle);
  }, [data, isSearching, trimmedInput]);

  // Instant local matches over the already-loaded saved contacts. They fill the list on the
  // very first keystroke, before any search request has come back, so the switch from
  // "suggestions" to "results" never flashes an empty box or a spinner.
  const localMatches: ISendContactItem[] = useMemo(() => {
    if (!isSearching) return [];
    const needle = trimmedInput.toLowerCase();
    const matched = savedContacts.filter((contact) =>
      [contact.nickname, contact.username, contact.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
    return sortByTagMatch(matched, needle);
  }, [isSearching, savedContacts, trimmedInput]);

  // The search has "settled" only once the debounce has caught up with the input and the
  // request for that exact term has finished. Until then results are provisional.
  const isSearchSettled =
    isSearching &&
    debouncedInput === trimmedInput &&
    !isFetching &&
    !isPlaceholderData;

  const contacts: ISendContactItem[] = useMemo(() => {
    if (!isSearching) return savedContacts.slice(0, limit);
    if (isSearchSettled) return searchResults.slice(0, limit);
    // In flight: prefer whatever the previous search returned (kept by React Query),
    // otherwise fall back to the local matches so the list stays populated.
    const provisional = searchResults.length > 0 ? searchResults : localMatches;
    return provisional.slice(0, limit);
  }, [
    isSearching,
    isSearchSettled,
    limit,
    localMatches,
    savedContacts,
    searchResults,
  ]);

  const profilePhotoUri = (uri?: string | null) =>
    uri ? uri.replace(/^http:\/\//i, 'https://') : null;

  const getDisplayTag = (item: ISendContactItem): string => {
    const base = item.username || item.email || '';
    if (!base) return '';
    if (base.length <= 35) return base;
    return `${base.slice(0, 4)}...${base.slice(-4)}`;
  };

  // A spinner only ever replaces the list when there is genuinely nothing to show — an
  // in-flight search over an already-populated list leaves the rows in place.
  const showLoading =
    contacts.length === 0 && (isSearching ? !isSearchSettled : isSavedLoading);
  const showSearchNotFound =
    isSearching && isSearchSettled && contacts.length === 0;
  const showNoSavedContacts =
    !isSearching && !isSavedLoading && contacts.length === 0;

  if (showLoading) {
    return (
      <View style={[styles.container, { paddingVertical: theme.spacing.lg, alignItems: 'center' }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (showSearchNotFound) {
    return (
      <View style={[styles.container, { paddingVertical: theme.spacing.lg, alignItems: 'center' }]}>
        <CustomText variant="body" size={14} color={theme.colors.greyDark} align="center">
          No PayAiro user found for "{trimmedInput}"
        </CustomText>
      </View>
    );
  }

  if (showNoSavedContacts) {
    return (
      <View style={[styles.container, { paddingVertical: theme.spacing.lg, alignItems: 'center' }]}>
        <CustomText variant="body" size={14} color={theme.colors.greyDark} align="center">
          No saved contacts yet. Search by PayAiro Tag to send.
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {contacts.map(contact => {
        const uri = profilePhotoUri(contact.profile_photo);
        // Topup (cash-in shadow) accounts have no profile to show — avatar tap is disabled.
        const isTopup = isTopupUser(contact.username);

        return (
          <View
            key={contact.uuid}
            style={styles.card}
          >
            <TouchableOpacity
              activeOpacity={isTopup ? 1 : 0.8}
              disabled={isTopup}
              onPress={() => onProfilePress?.(contact)}
            >
              <View style={styles.avatar}>
                {uri ? (
                  <Image source={{ uri }} style={styles.avatarImage} />
                ) : (
                  <CustomText
                    fontWeight="semiBold"
                    size={16}
                    align="center"
                  >
                    {(contact.nickname || contact.username || '?')
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </CustomText>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nameAndTag}
              activeOpacity={0.8}
              onPress={() => onSelect(contact)}
            >
              <CustomText
                fontWeight="semiBold"
                size={14}
                style={styles.nameText}
                >
                {getDisplayTag(contact)}
              </CustomText>
              <CustomText
                variant="caption"
                size={12}
                style={styles.tagText}
                >
                {contact.nickname || contact.username || contact.email}
              </CustomText>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default SendContactsList;
