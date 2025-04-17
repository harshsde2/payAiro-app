import {View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, BackHandler} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {SvgXml} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';

// Components
import {ScreenContainer} from '../../HOC';
import HeaderTitle from '../../components/HeaderTitle';
import CustomText from '../../tsx-components/CustomText';

// Constants & Services
import {SVGLeftArrow, SVGProfile2, SVGProfile3} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {getContacts} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useTheme} from '../../styles/ThemeContext';

export default function ContactScreen(props) {
  // Props & Hooks
  const {isVisble3} = props.route.params;
  const {tokens} = useSelectorAction();
  const navigation = useNavigation();
  const {theme} = useTheme();
  
  // State
  const [contactLists, setContactLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
  
  // Fetch contact list
  const getContactLists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getContacts(tokens?.access);
      
      if (response?.data) {
        setContactLists(response.data || []);
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
  
  // Load contacts on mount
  useEffect(() => {
    getContactLists();
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
            <Image source={{uri: item?.image}} style={styles(theme).avatar} />
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
  
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle 
        title="Discover" 
        leftIcon={SVGLeftArrow} 
        isBack={true}
        onPressLeft={handleGoBack}
      />
      
      <View style={styles(theme).container}>
        <View style={styles(theme).header}>
          <CustomText
            variant="h4"
            color={theme.colors.text.primary}>
            People
          </CustomText>
          
          <TouchableOpacity
            onPress={handleAddContact}
            style={styles(theme).addButton}>
            <CustomText
              variant="button"
              color={theme.colors.text.inverse}>
              + Add People
            </CustomText>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles(theme).scrollContent}>
          
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
        </ScrollView>
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
    backgroundColor: theme.colors.palette.grey100 + '12', // 7% opacity
    padding: theme.spacing.spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.palette.grey400 + '14', // 8% opacity
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
    backgroundColor: theme.colors.palette.green700,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: theme.colors.text.inverse,
    fontFamily: Fonts.semibold,
    fontSize: 16,
  },
  contactInfo: {
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
