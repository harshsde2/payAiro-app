import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useTheme } from '@new-ui/styles/ThemeContext';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import ContactActionRow from '@new-ui/components/common-components/ContactActionRow';
import RecentContactItem from '@new-ui/components/common-components/RecentContactItem';
import AllContactItem from '@new-ui/components/common-components/AllContactItem';
import { AppIcon } from '@new-ui/assets/svgs';
import { contactsScreenStyles } from '@new-ui/styles/screens/contacts/contactsScreenStyles';
import DashboardSection from 'tsx-components/DashboardSection';

const RECENT_CONTACTS = [
  { id: '1', name: 'Kevin', imageUri: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Lyda', imageUri: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', name: 'Marry', imageUri: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { id: '4', name: 'Evelyn', imageUri: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: '5', name: 'Mike', imageUri: 'https://randomuser.me/api/portraits/men/11.jpg' },
];

const ALL_CONTACTS = [
  { id: '1', name: 'Eddie Lake', address: '3g78pk...sd42', imageUri: 'https://randomuser.me/api/portraits/women/50.jpg' },
  { id: '2', name: 'John Frank', address: '3g78pk...sd42', imageUri: 'https://randomuser.me/api/portraits/women/55.jpg' },
  { id: '3', name: 'Lory De', address: '3g78pk...sd42', imageUri: 'https://randomuser.me/api/portraits/men/60.jpg' },
  { id: '4', name: 'Samsun', address: '3g78pk...sd42', imageUri: 'https://randomuser.me/api/portraits/women/70.jpg' },
];

const ContactsScreen = () => {
  const { theme } = useTheme();
  const styles = contactsScreenStyles(theme);
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  const filteredAll = ALL_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRecent = RECENT_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScrollContent}
          >
            {filteredRecent.map(contact => (
              <RecentContactItem
                key={contact.id}
                name={contact.name}
                imageUri={contact.imageUri}
                onPress={() => {}}
              />
            ))}
          </ScrollView>
        </DashboardSection>

        <DashboardSection title="All Contacts">
          <View style={styles.allContactsGap}>
            {filteredAll.map(contact => (
              <AllContactItem
                key={contact.id}
                name={contact.name}
                address={contact.address}
                imageUri={contact.imageUri}
                onPress={() => {}}
              />
            ))}
          </View>
        </DashboardSection>
      </View>
    </ScreenWrapper>
  );
};

export default ContactsScreen;
