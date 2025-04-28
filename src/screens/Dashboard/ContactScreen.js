import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, BackHandler } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

// Components
import { ScreenContainer } from '../../HOC';
import HeaderTitle from '../../components/HeaderTitle';
import CustomText from '../../tsx-components/CustomText';

// Constants & Services
import { SVGAddIcon, SVGInvitePeople, SVGLeftArrow, SVGProfile2, SVGProfile3 } from '../../constants/images';
import Fonts from '../../constants/Fonts';
import { getContacts } from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import { useTheme } from '../../styles/ThemeContext';
import CustomSearchTextInput from 'tsx-components/CustomSearchTextInput';

import Contacts from 'react-native-contacts';
import { PermissionsAndroid, Platform } from 'react-native';


export default function ContactScreen(props) {
  // Props & Hooks
  const { isVisble3 } = props.route.params;
  const { tokens } = useSelectorAction();
  const navigation = useNavigation();
  const { theme } = useTheme();

  // State
  const [contactLists, setContactLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contactError, setContactError] = useState(null);
  const [searchText, setSearchText] = useState('')
  const [fullContactList, setFullContactList] = useState([]);
  const [deviceContacts, setDeviceContacts] = useState([]);



  // Handle back navigation
  const handleGoBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log('Cannot go back, no screens in history');
        BackHandler.exitApp();
      }
    } catch (err) {
      console.log('Navigation error:', err);
    }
  }, [navigation]);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleGoBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [handleGoBack]);

  useEffect(() => {
    if (!searchText.trim()) {
      setContactLists(fullContactList);
    } else {
      const filtered = fullContactList.filter(contact => {
        const name = getContactName(contact).toLowerCase();
        const search = searchText.trim().toLowerCase();
        return name.includes(search);
      });
      setContactLists(filtered);
    }
  }, [searchText, fullContactList, getContactName]);

  // Fetch contact list
  const getContactLists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getContacts(tokens?.access);

      if (response?.data) {
        // setContactLists(response.data || []);
        setFullContactList(response.data || []); // backup full data
        setContactLists(response.data || []);    // display filtered data
      } else {
        setError('Failed to load contacts');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('An error occurred while loading contacts');
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  const fetchDeviceContacts = async () => {
    try {
      setIsContactLoading(true)
      setContactError(null);
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'This app would like to view your contacts.',
            buttonPositive: 'Please accept bare mortal',
          },
        );

        // console.log('permission =>', permission);
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Contacts permission denied');
          setError('Contacts permission denied');
          return;
        }
      }

      const contacts = await Contacts.getAll();
      // console.log('Device Contacts:', contacts);
      setDeviceContacts(contacts);
      setIsContactLoading(false)

    } catch (error) {
      setError('Failed to load contacts');
      console.error('Error fetching device contacts:', error);
    }
  };


  // Load contacts on mount
  useEffect(() => {
    getContactLists();
    fetchDeviceContacts();
  }, [getContactLists]);

  // Navigate to add contact screen
  const handleAddContact = useCallback(() => {
    navigation.navigate('AddContact');
  }, [navigation]);

  // Navigate to contact details screen
  const handleContactPress = useCallback((item) => {
    navigation.navigate('ContactTx', {
      item,
      isVisble3,
    });
  }, [navigation, isVisble3]);

  // Get contact display name
  const getContactName = useCallback((contact) => {
    return (
      contact?.name?.trim() ||
      contact?.nickname?.trim() ||
      contact?.email?.trim() ||
      contact?.username?.trim() ||
      'Unknown'
    );
  }, []);

  // Get contact initials for avatar
  const getContactInitials = useCallback((contact) => {
    const name = getContactName(contact);
    return name.charAt(0).toUpperCase() + (name.charAt(1)?.toUpperCase() || '');
  }, [getContactName]);

  // Render contact item
  const renderContactItem = useCallback((item, index) => (
    <TouchableOpacity
      key={`contact-${index}`}
      onPress={() => handleContactPress(item)}
      style={styles(theme).contactItem}>
      <View style={styles(theme).contactLeftSection}>
        <View style={styles(theme).avatarContainer}>
          {item?.image ? (
            <Image source={{ uri: item?.image }} style={styles(theme).avatar} />
          ) : (
            <Text style={styles(theme).initials}>
              {getContactInitials(item)}
            </Text>
          )}
        </View>
        <View style={styles(theme).contactInfo}>
          <CustomText
            variant="subtitle1"
            color={theme.colors.text.primary}
            style={styles(theme).contactName}>
            {getContactName(item)}
          </CustomText>
          {item?.messages?.content && (
            <CustomText
              variant="body2"
              color={theme.colors.text.secondary}
              numberOfLines={1}
              style={styles(theme).messagePreview}>
              {item.messages.content}
            </CustomText>
          )}
        </View>
      </View>

      {item?.unread_count > 0 && (
        <View style={styles(theme).unreadBadge}>
          <CustomText
            variant="caption"
            color={theme.colors.text.inverse}>
            {item.unread_count}
          </CustomText>
        </View>
      )}
    </TouchableOpacity>
  ), [theme, handleContactPress, getContactName, getContactInitials]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles(theme).emptyState}>
      <CustomText
        variant="body1"
        color={theme.colors.text.secondary}
        style={styles(theme).emptyStateText}>
        No contacts found
      </CustomText>
    </View>
  ), [theme]);
  // Render empty state
  const renderEmptyContactState = useCallback(() => (
    <View style={styles(theme).emptyState}>
      <CustomText
        variant="body1"
        color={theme.colors.text.secondary}
        style={styles(theme).emptyStateText}>
        No contacts found
      </CustomText>
    </View>
  ), [theme]);

  return (
    <ScreenContainer scrollable padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle
        title="Discover"
        leftIcon={SVGLeftArrow}
        isBack={true}
        onPressLeft={handleGoBack}
      />
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <CustomSearchTextInput
          placeholderTextColor={theme.colors.palette.green700}
          placeholder={'Search Name or Payairo tag...'}
          onChangeText={setSearchText}
          value={searchText}
        // style={{ backgroundColor:'red'}}
        />
      </View>
      <View style={styles(theme).container}>
        <View style={{ width: '100%', paddingHorizontal: 5, marginVertical: 10 }}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleAddContact} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginVertical: 5 }}>
            <SvgXml xml={SVGAddIcon} width={45} height={45} style={styles.iconLeft} />
            <CustomText
              variant={'subtitle1'}
              style={{ marginLeft: 10 }}
            >
              New Contact
            </CustomText>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginVertical: 5 }}>
            <SvgXml xml={SVGInvitePeople} width={45} height={45} style={styles.iconLeft} />
            <CustomText
              variant={'subtitle1'}
              style={{ marginLeft: 10 }}
            >
              Invite People
            </CustomText>
          </View>
        </View>
        <View style={styles(theme).header}>
          <CustomText
            variant="h4"
            color={theme.colors.text.primary}>
            Recent Contacts
          </CustomText>

          {/* <TouchableOpacity
            onPress={handleAddContact}
            style={styles(theme).addButton}>
            <CustomText
              variant="button"
              color={theme.colors.text.inverse}>
              + Add People
            </CustomText>
          </TouchableOpacity> */}
        </View>

        <View>

          {isLoading ? (
            <View style={styles(theme).loadingState}>
              <CustomText
                variant="body1"
                color={theme.colors.text.secondary}>
                Loading contacts...
              </CustomText>
            </View>
          ) : error ? (
            <View style={styles(theme).errorState}>
              <CustomText
                variant="body1"
                color={theme.colors.error}>
                {error}
              </CustomText>
              <TouchableOpacity
                style={styles(theme).retryButton}
                onPress={getContactLists}>
                <CustomText
                  variant="button"
                  color={theme.colors.text.inverse}>
                  Retry
                </CustomText>
              </TouchableOpacity>
            </View>
          ) : contactLists.length > 0 ? (
            contactLists.map(renderContactItem)
          ) : (
            renderEmptyState()
          )}
        </View>

        <View>

          {isContactLoading ? (
            <View style={styles(theme).loadingState}>
              <CustomText
                variant="body1"
                color={theme.colors.text.secondary}>
                Loading All contacts...
              </CustomText>
            </View>
          ) : contactError ? (
            <View style={styles(theme).errorState}>
              <CustomText
                variant="body1"
                color={theme.colors.error}>
                {error}
              </CustomText>
              <TouchableOpacity
                style={styles(theme).retryButton}
                onPress={getContactLists}>
                <CustomText
                  variant="button"
                  color={theme.colors.text.inverse}>
                  Retry
                </CustomText>
              </TouchableOpacity>
            </View>
          ) :
            <>
              {deviceContacts.length > 0 && (
                <>
                  <View style={styles(theme).header}>
                    <CustomText variant="h4" color={theme.colors.text.primary}>
                      All Contacts
                    </CustomText>
                  </View>

                  {deviceContacts.map((contact, index) => (
                    <TouchableOpacity
                      key={`device-contact-${index}`}
                      style={styles(theme).contactItem}
                      activeOpacity={0.8}
                      onPress={() => {
                        // You can do invite/send message/open contact screen
                      }}
                    >
                      <View style={styles(theme).contactLeftSection}>

                        <View style={styles(theme).avatarContainer}>
                          <Text style={styles(theme).initials}>
                            {contact.givenName?.charAt(0)?.toUpperCase() || 'U'}
                          </Text>
                        </View>
                        <View style={styles(theme).contactInfo}>
                          <CustomText variant="subtitle1" color={theme.colors.text.primary}>
                            {contact.givenName} {contact.familyName}
                          </CustomText>
                          {contact.phoneNumbers?.[0]?.number && (
                            <CustomText variant="body2" color={theme.colors.text.secondary}>
                              {contact.phoneNumbers[0].number}
                            </CustomText>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={handleAddContact}
                          style={styles(theme).addButton}>
                          <CustomText
                            variant="button"
                            color={theme.colors.text.inverse}>
                            + Invite
                          </CustomText>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )
              }
            </>
          }
        </View>


      </View>
    </ScreenContainer>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.palette.white,
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: theme.spacing.layout.screenPadding,
    marginTop: theme.spacing.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.spacing.md,
  },
  addButton: {
    backgroundColor: theme.colors.palette.green700,
    paddingVertical: theme.spacing.spacing.xs,
    paddingHorizontal: theme.spacing.spacing.sm,
    borderRadius: 30,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.palette.grey250, // 7% opacity
    padding: theme.spacing.spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.palette.grey800 + '18', // 8% opacity
    marginVertical: theme.spacing.spacing.xs,
  },
  contactLeftSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.palette.green200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: theme.colors.palette.green700,
    fontFamily: Fonts.semibold,
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
    marginLeft: theme.spacing.spacing.sm,
  },
  contactName: {
    marginBottom: theme.spacing.spacing.xxs,
  },
  messagePreview: {
    maxWidth: 200,
  },
  unreadBadge: {
    backgroundColor: theme.colors.palette.green700,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.spacing.xl,
  },
  emptyStateText: {
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.spacing.xl,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.spacing.xl,
  },
  retryButton: {
    marginTop: theme.spacing.spacing.md,
    backgroundColor: theme.colors.palette.green600,
    paddingVertical: theme.spacing.spacing.xs,
    paddingHorizontal: theme.spacing.spacing.md,
    borderRadius: 8,
  },
});
