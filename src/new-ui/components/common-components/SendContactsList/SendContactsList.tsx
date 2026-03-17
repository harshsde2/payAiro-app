import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import { sendContactsListStyles } from '@new-ui/styles/components/sendContactsListStyles';
import { useUserSearch } from 'query/hooks';
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
}

const SendContactsList: React.FC<ISendContactsListProps> = ({
  searchQuery,
  selectedId,
  limit = 4,
  onSelect,
}) => {
  const { theme } = useTheme();
  const styles = sendContactsListStyles(theme);

  const debounced = useDebounce(searchQuery, 300);

  // Always hit the user-search API by falling back to a generic query
  const trimmed = debounced.trim();
  const hasQuery = trimmed.length > 0;
  const effectiveQuery = hasQuery ? trimmed : 'a';

  const { data } = useUserSearch(
    effectiveQuery,
    1,
    1,
    20
  );

  const contacts: ISendContactItem[] = useMemo(() => {
    const users = data?.data?.data ?? [];
    return users
      .map((user: any) => ({
        uuid: user.email || user.mobile_number || '',
        nickname:
          `${user.name || ''} ${user.lastname || ''}`.trim() ||
          user.usernames ||
          '',
        username: user.usernames || '',
        email: user.email || '',
        profile_photo: user.profile_photo || null,
      }))
      .slice(0, limit);
  }, [data, limit]);

  const profilePhotoUri = (uri?: string | null) =>
    uri ? uri.replace(/^http:\/\//i, 'https://') : null;

  const getDisplayTag = (item: ISendContactItem): string => {
    const base = item.username || item.email || '';
    if (!base) return '';
    if (base.length <= 12) return base;
    return `${base.slice(0, 4)}...${base.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      {contacts.map(contact => {
        const uri = profilePhotoUri(contact.profile_photo);

        return (
          <TouchableOpacity
            key={contact.uuid}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onSelect(contact)}
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
            <View style={styles.nameAndTag}>
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
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SendContactsList;

