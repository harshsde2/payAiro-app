import React, { useCallback } from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { contactsListStyles } from '@new-ui/styles/components/contactsListStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { IContactsListProps, IContactItem } from './types';

const getInitials = (item: IContactItem): string => {
  const name = item?.nickname || item?.username || '';
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getDisplayName = (item: IContactItem): string =>
  item?.nickname ?? item?.username ?? '';

const ContactsList: React.FC<IContactsListProps> = ({ data = [] }) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = contactsListStyles(theme);
  const AddIcon = AppIcon.Add;

  const handleAddContact = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.ADD_CONTACT as never);
  }, [navigation]);

  const handleContactPress = useCallback(
    (item: IContactItem) => {
      navigation.navigate(NAVIGATION_SCREENS.SEND as never, {
        requested: false,
        sender: item?.username?.trim() ?? null,
      });
    },
    [navigation]
  );

  const profilePhotoUri = (uri?: string) =>
    uri ? uri.replace(/^http:\/\//i, 'https://') : null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Add Contact - first item */}
      <TouchableOpacity
        style={styles.addContactContainer}
        onPress={handleAddContact}
        activeOpacity={0.7}
      >
        <AddIcon width={56} height={56} />
        <CustomText style={styles.name}>Add Contact</CustomText>
      </TouchableOpacity>

      {/* Contact items */}
      {data.map((item, index) => {
        const uri = profilePhotoUri(item?.image);
        const key = `contact-${item?._id || item?.username || item?.email || index}`;

        return (
          <TouchableOpacity
            key={key}
            style={styles.item}
            onPress={() => handleContactPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.contactCircle}>
              {uri ? (
                <Image source={{ uri }} style={styles.contactImage} />
              ) : (
                <CustomText style={styles.initials}>{getInitials(item)}</CustomText>
              )}
            </View>
            <CustomText style={styles.name} numberOfLines={1}>
              {getDisplayName(item)}
            </CustomText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default ContactsList;
