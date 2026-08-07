import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import { sendContactsListStyles } from '@new-ui/styles/components/sendContactsListStyles';
import { useFastApiUsersSearch } from 'query/hooks';
import { useDebounce } from 'hooks/useDebounce';

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

const SendContactsList: React.FC<ISendContactsListProps> = ({
  searchQuery,
  selectedId,
  limit = 4,
  onSelect,
  onProfilePress,
}) => {
  const { theme } = useTheme();
  const styles = sendContactsListStyles(theme);

  const debounced = useDebounce(searchQuery, 300);

  // Always hit the user-search API by falling back to a generic query
  const trimmed = debounced.trim();
  const hasQuery = trimmed.length > 0;
  const effectiveQuery = hasQuery ? trimmed : 'a';

  const apiLimit = Math.min(Math.max(limit, 1), 25);
  const { data, isLoading, isFetching } = useFastApiUsersSearch(effectiveQuery, apiLimit, 1);

  const contacts: ISendContactItem[] = useMemo(() => {
    const users = data?.data?.users ?? [];
    // Only PayAiro (on-platform) users can be sent to from here — hide external users
    // (is_external === true). Missing/undefined is treated as internal.
    return users
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
  }, [data]);

  const profilePhotoUri = (uri?: string | null) =>
    uri ? uri.replace(/^http:\/\//i, 'https://') : null;

  const getDisplayTag = (item: ISendContactItem): string => {
    const base = item.username || item.email || '';
    if (!base) return '';
    if (base.length <= 12) return base;
    return `${base.slice(0, 4)}...${base.slice(-4)}`;
  };

  // Only surface "not found" once the user has actually typed a query (the empty-input
  // case searches a generic fallback for default suggestions, which shouldn't read as "not found").
  const showLoading = hasQuery && (isLoading || isFetching) && contacts.length === 0;
  const showNotFound = hasQuery && !isLoading && !isFetching && contacts.length === 0;

  if (showLoading) {
    return (
      <View style={[styles.container, { paddingVertical: theme.spacing.lg, alignItems: 'center' }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (showNotFound) {
    return (
      <View style={[styles.container, { paddingVertical: theme.spacing.lg, alignItems: 'center' }]}>
        <CustomText variant="body" size={14} color={theme.colors.greyDark} align="center">
          No PayAiro user found for "{trimmed}"
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {contacts.map(contact => {
        const uri = profilePhotoUri(contact.profile_photo);

        return (
          <View
            key={contact.uuid}
            style={styles.card}
          >
            <TouchableOpacity
              activeOpacity={0.8}
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
                {contact.nickname || contact.username || contact.email}
              </CustomText>
              <CustomText
                variant="caption"
                size={12}
                style={styles.tagText}
              >
                {getDisplayTag(contact)}
              </CustomText>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default SendContactsList;

