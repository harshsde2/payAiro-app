import { View, Text, TouchableOpacity, Image, StyleSheet, BackHandler, FlatList } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

// Components
import { ScreenContainer } from '../../HOC';
import HeaderTitle from '../../components/HeaderTitle';
import CustomText from '../../tsx-components/CustomText';
import CustomSearchTextInput from 'tsx-components/CustomSearchTextInput';

// Constants & Services
import { SVGAddIcon, SVGInvitePeople, SVGLeftArrow } from '../../constants/images';
import Fonts from '../../constants/Fonts';
import { getContacts } from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import { useTheme } from '../../styles/ThemeContext';
import { useDeviceContacts } from 'query/hooks';
import { removeItem, STORAGE_KEYS } from 'storage/mmkv';
import { useRecentContacts } from 'query/hooks/useRecentContacts';

export default function ContactScreen(props) {
  const { isVisble3 } = props.route.params;
  const { tokens } = useSelectorAction();
  const navigation = useNavigation();
  const { theme } = useTheme();

  // const [contactLists, setContactLists] = useState([]);
  const [fullContactList, setFullContactList] = useState([]);
  const [searchText, setSearchText] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  const { data: deviceContacts = [], isLoading: isDeviceLoading, contactError } = useDeviceContacts();
  const { data, isLoading: isLoading, error } = useRecentContacts();
  const contactLists = data?.data || [];
  // console.log(' ContactScreen contactLists -->',JSON.stringify(data,null,2))

  // Back Handler
  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      BackHandler.exitApp();
    }
  }, [navigation]);

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  //     handleGoBack();
  //     return true;
  //   });
  //   return () => backHandler.remove();
  // }, [handleGoBack]);

  
  const getContactLists = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getContacts(tokens?.access);
      // console.log("response =>",JSON.stringify(response,null,2))
      if (response?.data) {
        setFullContactList(response.data || []);
        setContactLists(response.data || []);
      } else {
        setError('Failed to load contacts');
      }
    } catch (err) {
      console.error('Fetching error:', err);
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  // useEffect(() => {
  //   getContactLists();
  // }, [getContactLists]);

  // useEffect(() => {
  //   if (!searchText.trim()) {
  //     setContactLists(fullContactList);
  //   } else {
  //     const filtered = fullContactList.filter(contact =>
  //       (contact?.name || contact?.nickname || contact?.email || contact?.username || '').toLowerCase()
  //         .includes(searchText.trim().toLowerCase())
  //     );
  //     setContactLists(filtered);
  //   }
  // }, [searchText, fullContactList]);

  const handleAddContact = useCallback(() => {
    navigation.navigate('AddContact');
  }, [navigation]);

  const handleContactPress = useCallback((item) => {
    navigation.navigate('ContactTx', { item, isVisble3 });
  }, [navigation, isVisble3]);


  // console.log("contactLists =>",JSON.stringify(contactLists,null,2))

  const renderRecentContact = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleContactPress(item)}
      style={styles(theme).contactItem}>
      <View style={styles(theme).contactLeftSection}>
        <View style={styles(theme).avatarContainer}>
          {item?.image ? (
            <Image source={{ uri: item.image }} style={styles(theme).avatar} />
          ) : (
            <Text style={styles(theme).initials}>
              {(item?.name?.[0] || 'U').toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles(theme).contactInfo}>
          <CustomText variant="subtitle1" color={theme.colors.text.primary}>
            {item?.nickname || 'Unknown'}
          </CustomText>
          {item?.messages?.content && (
            <CustomText variant="body2" color={theme.colors.text.secondary} numberOfLines={1}>
              {item.messages.content}
            </CustomText>
          )}
        </View>
      </View>
      {item?.unread_count > 0 && (
        <View style={styles(theme).unreadBadge}>
          <CustomText variant="caption" color={theme.colors.text.inverse}>
            {item.unread_count}
          </CustomText>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDeviceContact = ({ item }) => (
    <TouchableOpacity
      style={styles(theme).contactItem}
      activeOpacity={0.8}
      onPress={() => { /* Handle invite action */ }}>
      <View style={styles(theme).contactLeftSection}>
        <View style={styles(theme).avatarContainer}>
          <Text style={styles(theme).initials}>
            {(item?.name?.[0] || 'U').toUpperCase()}
          </Text>
        </View>
        <View style={styles(theme).contactInfo}>
          <CustomText variant="subtitle1" color={theme.colors.text.primary}>
            {item.name}
          </CustomText>
          {item.phoneNumber && (
            <CustomText variant="body2" color={theme.colors.text.secondary}>
              {item.phoneNumber}
            </CustomText>
          )}
        </View>
        <TouchableOpacity onPress={handleAddContact} style={styles(theme).addButton}>
          <CustomText variant="button" color={theme.colors.text.inverse}>
            + Invite
          </CustomText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle
        title="Discover"
        leftIcon={SVGLeftArrow}
        isBack
        onPressLeft={handleGoBack}
      />
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <CustomSearchTextInput
          placeholder="Search Name or Payairo tag..."
          placeholderTextColor={theme.colors.palette.green700}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>
      <View style={styles(theme).container}>
        {isDeviceLoading ? (
          <Text>Loading device contacts...</Text>
        ) : (
          <FlatList
            removeClippedSubviews={true}
            ListHeaderComponent={
              <View>
                <View style={{ width: '100%', paddingHorizontal: 5, marginVertical: 10 }}>
                  <TouchableOpacity onPress={handleAddContact} activeOpacity={0.7} style={styles(theme).actionButton}>
                    <SvgXml xml={SVGAddIcon} width={45} height={45} />
                    <CustomText variant="subtitle1" style={{ marginLeft: 10 }}>
                      New Contact
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{
                    removeItem(STORAGE_KEYS.RECENT_CONTACTS)
                  }} activeOpacity={0.7} style={styles(theme).actionButton}>
                    <SvgXml xml={SVGAddIcon} width={45} height={45} />
                    <CustomText variant="subtitle1" style={{ marginLeft: 10 }}>
                      remove data
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7} style={styles(theme).actionButton}>
                    <SvgXml xml={SVGInvitePeople} width={45} height={45} />
                    <CustomText variant="subtitle1" style={{ marginLeft: 10 }}>
                      Invite People
                    </CustomText>
                  </TouchableOpacity>
                </View>

                {/* Recent Contacts */}
                <View style={styles(theme).header}>
                  <CustomText variant="h4" color={theme.colors.text.primary}>
                    Recent Contacts
                  </CustomText>
                </View>
                {isLoading ? (
                  <Text>Loading...</Text>
                ) : error ? (
                  <Text>{error}</Text>
                ) : (
                  <FlatList
                    data={contactLists}
                    keyExtractor={(item, index) => `recent-${index}`}
                    renderItem={renderRecentContact}
                    ListEmptyComponent={<Text>No recent contacts</Text>}
                  />
                )}
                <View style={styles(theme).header}>
                  <CustomText variant="h4" color={theme.colors.text.primary}>
                    All Contacts
                  </CustomText>
                </View>
              </View>}
            data={deviceContacts}
            keyExtractor={(item, index) => `device-${index}`}
            renderItem={renderDeviceContact}
            ListEmptyComponent={<Text>No device contacts found</Text>}
          />
        )}
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
    marginTop: theme.spacing.spacing[0],
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: theme.colors.palette.grey250,
  },
  contactLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.palette.green200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  initials: {
    color: theme.colors.palette.green700,
    fontFamily: Fonts.semibold,
    fontSize: 18,
  },
  contactInfo: {
    marginLeft: 10,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: theme.colors.palette.green700,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  addButton: {
    backgroundColor: theme.colors.palette.green700,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
});
