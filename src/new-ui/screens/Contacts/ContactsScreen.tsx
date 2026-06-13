import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useTheme } from '@new-ui/styles/ThemeContext';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import ContactActionRow from '@new-ui/components/common-components/ContactActionRow';
import RecentContactItem from '@new-ui/components/common-components/RecentContactItem';
import AllContactItem from '@new-ui/components/common-components/AllContactItem';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { contactsScreenStyles } from '@new-ui/styles/screens/contacts/contactsScreenStyles';
import DashboardSection from 'tsx-components/DashboardSection';
import {
  getUserContactAvatar,
  getUserContactDisplayName,
  getUserContactSendIdentifier,
  IUserContact,
  useDeviceContacts,
  useUserContacts,
} from 'query/hooks/useContact';
import { User } from 'api/types';

const ContactsScreen = () => {
  const { theme } = useTheme();
  const styles = contactsScreenStyles(theme);
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  const {
    data: userContactsData,
    isLoading: isUserContactsLoading,
    isError: isUserContactsError,
  } = useUserContacts();

  const {
    data: deviceContactsData,
    isLoading: isDeviceContactsLoading,
    isError: isDeviceContactsError,
    error: deviceContactsError,
  } = useDeviceContacts();

  const savedContacts = userContactsData?.contacts ?? [];
  const deviceContacts = deviceContactsData?.data ?? [];

  const searchLower = search.trim().toLowerCase();

  const filteredRecent = useMemo(() => {
    if (!searchLower) return savedContacts;
    return savedContacts.filter((contact) => {
      const haystack = [
        getUserContactDisplayName(contact),
        contact.username,
        contact.email,
        contact.contact_phone,
        contact.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(searchLower);
    });
  }, [savedContacts, searchLower]);

  const filteredDevice = useMemo(() => {
    if (!searchLower) return deviceContacts;
    return deviceContacts.filter((contact) => {
      const haystack = [contact.name, contact.phoneNumber, contact.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(searchLower);
    });
  }, [deviceContacts, searchLower]);

  const handleRecentContactPress = useCallback(
    (contact: IUserContact) => {
      const sender = getUserContactSendIdentifier(contact);
      if (!sender) return;
      navigation.navigate(NAVIGATION_SCREENS.NEW_SEND as never, {
        requested: false,
        sender,
      });
    },
    [navigation]
  );

  const getDeviceContactSubtitle = (contact: User): string => {
    return contact.phoneNumber?.trim() || contact.email?.trim() || '';
  };

  const deviceContactsErrorMessage =
    deviceContactsError instanceof Error &&
    deviceContactsError.message.includes('denied')
      ? 'Permission to access contacts was denied.'
      : null;

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      contentStyle={{ flexGrow: 1, paddingBottom: 32 }}
    >
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ContactActionRow
          icon={<AppIcon.AddContact width={26} height={26} color={theme.colors.white} />}
          title="New contacts"
          subtitle="Add contact to your PayAiro"
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_ADD_CONTACT_SCREEN as never)}
        />

        <ContactActionRow
          icon={<AppIcon.Invite width={26} height={26} color={theme.colors.white} />}
          title="Invite People"
          subtitle="Invite people to PayAiro to transact payments"
          onPress={() => {}}
        />

        <DashboardSection title="Recent">
          {isUserContactsLoading ? (
            <View style={styles.sectionLoader}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : isUserContactsError ? (
            <CustomText variant="caption" color={theme.colors.textSecondary}>
              Unable to load saved contacts.
            </CustomText>
          ) : filteredRecent.length === 0 ? (
            <CustomText variant="caption" color={theme.colors.textSecondary}>
              No saved contacts yet.
            </CustomText>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
            >
              {filteredRecent.map((contact, index) => {
                const contactKey = String(contact.id ?? contact.username ?? index);
                return (
                  <RecentContactItem
                    key={contactKey}
                    name={getUserContactDisplayName(contact)}
                    imageUri={getUserContactAvatar(contact) ?? undefined}
                    onPress={() => handleRecentContactPress(contact)}
                  />
                );
              })}
            </ScrollView>
          )}
        </DashboardSection>

        <DashboardSection title="All Contacts">
          {isDeviceContactsLoading ? (
            <View style={styles.sectionLoader}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : isDeviceContactsError ? (
            <CustomText variant="caption" color={theme.colors.textSecondary}>
              {deviceContactsErrorMessage ?? 'Unable to load device contacts.'}
            </CustomText>
          ) : filteredDevice.length === 0 ? (
            <CustomText variant="caption" color={theme.colors.textSecondary}>
              No device contacts found.
            </CustomText>
          ) : (
            <View style={styles.allContactsGap}>
              {filteredDevice.map((contact, index) => {
                const contactKey = String(contact.id ?? contact.name ?? index);
                return (
                  <AllContactItem
                    key={contactKey}
                    name={contact.name ?? 'Unknown'}
                    address={getDeviceContactSubtitle(contact)}
                    onPress={() => {}}
                  />
                );
              })}
            </View>
          )}
        </DashboardSection>
      </View>
    </ScreenWrapper>
  );
};

export default ContactsScreen;
