import React, { useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "styles/ThemeContext";
import { CustomText } from "tsx-components";
import { useUserSearch } from "query/hooks";
import { useDebounce } from "hooks/useDebounce";
import { contactSuggestionStyles } from "./styles";
import {
  IContactSuggestionProps,
  IContactSuggestionItemProps,
  IContactItem,
} from "./types";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useNavigation } from "@react-navigation/native";

const ANIMATION_DURATION = 200;
const DEFAULT_MAX_SUGGESTIONS = 5;
const DEFAULT_MIN_CHARACTERS = 1;
const DEFAULT_DEBOUNCE_DELAY = 300;

/**
 * Individual contact suggestion item with highlight support
 */
const ContactSuggestionItem: React.FC<IContactSuggestionItemProps> = React.memo(
  ({ contact, onPress, searchQuery, isLast }) => {
    const { theme } = useTheme();
    const styles = contactSuggestionStyles(theme);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const navigation = useNavigation<any>();
    // console.log("ContactSuggestionItem - contact:", contact);
    const userDetails = {
      username: contact.username,
      profile_photo: contact.profile_photo,
      identifier: contact.username,
    }

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 5,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 5,
      }).start();
    }, [scaleAnim]);

    const handlePress = useCallback(() => {
      Keyboard.dismiss();
      onPress(contact);
    }, [contact, onPress]);

    const displayName = contact.nickname || contact.username || contact.email;
    const initial = displayName?.[0]?.toUpperCase() || "?";

    // Highlight matching text
    const getHighlightedText = useCallback(
      (text: string) => {
        if (!searchQuery || !text) return text;
        const lowerText = text.toLowerCase();
        const lowerQuery = searchQuery.toLowerCase();
        const matchIndex = lowerText.indexOf(lowerQuery);

        if (matchIndex === -1) return text;

        return (
          <>
            {text.substring(0, matchIndex)}
            <CustomText
              variant="subtitle2"
              color={theme.colors.palette.green700}
              fontWeight="bold"
            >
              {text.substring(matchIndex, matchIndex + searchQuery.length)}
            </CustomText>
            {text.substring(matchIndex + searchQuery.length)}
          </>
        );
      },
      [searchQuery, theme.colors.palette.green700]
    );


    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.suggestionItem, isLast && styles.suggestionItemLast]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <TouchableOpacity onPress={() => navigation.navigate(NAVIGATION_SCREENS.USER_PROFILE, { userDetails })} style={styles.avatarContainer}>
            <CustomText
              variant="subtitle1"
              color={theme.colors.palette.green700}
              fontWeight="semiBold"
            >
              {initial}
            </CustomText>
          </TouchableOpacity>
          <View style={styles.contactInfo}>
            <CustomText
              variant="subtitle2"
              color={theme.colors.text.primary}
              numberOfLines={1}
            >
              {getHighlightedText(displayName)}
            </CustomText>
            {contact.username && contact.nickname && (
              <CustomText
                variant="caption"
                color={theme.colors.text.secondary}
                numberOfLines={1}
              >
                {contact.username}
              </CustomText>
            )}
            {contact.email && !contact.username && (
              <CustomText
                variant="caption"
                color={theme.colors.text.secondary}
                numberOfLines={1}
              >
                {contact.email}
              </CustomText>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

ContactSuggestionItem.displayName = "ContactSuggestionItem";

/**
 * ContactSuggestion - A reusable autocomplete dropdown for contacts
 *
 * Features:
 * - Debounced search for performance
 * - Animated show/hide transitions
 * - Keyboard dismiss on selection
 * - Text highlighting for search matches
 * - Customizable max suggestions and min characters
 * - Empty state and loading indicators
 */
// Height per item for calculating container height
const ITEM_HEIGHT = 64;
const CONTAINER_PADDING = 16;
const MAX_VISIBLE_ITEMS = 6;

const ContactSuggestion: React.FC<IContactSuggestionProps> = ({
  searchQuery,
  onContactSelect,
  isVisible,
  containerStyle,
  maxSuggestions = DEFAULT_MAX_SUGGESTIONS,
  minCharacters = DEFAULT_MIN_CHARACTERS,
  debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  emptyPlaceholder = "No contacts found",
  showLoading = true,
}) => {
  const { theme } = useTheme();
  const styles = contactSuggestionStyles(theme);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  // Debounced search query for performance
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  // Fetch contacts using the new user-search API hook
  const { data, isLoading } = useUserSearch(
    debouncedQuery,
    minCharacters,
    1,
    20
  );

  // Map API response to IContactItem format
  const filteredContacts = useMemo<IContactItem[]>(() => {
    if (!debouncedQuery || debouncedQuery.length < minCharacters) {
      return [];
    }

    const users = data?.data?.data ?? [];
    
    // Debug logs
    console.log("ContactSuggestion - debouncedQuery:", debouncedQuery);
    console.log("ContactSuggestion - API data:", JSON.stringify(data, null, 2));
    console.log("ContactSuggestion - users array length:", users.length);

    const mappedContacts: IContactItem[] = users.map((user) => ({
      uuid: user.email || user.mobile_number || "",
      mobileno: user.mobile_number || "",
      email: user.email || "",
      wallet_address: "",
      nickname: `${user.name || ""} ${user.lastname || ""}`.trim() || user.usernames || "",
      username: user.usernames || "",
      profile_photo: user.profile_photo,
    }));

    console.log("ContactSuggestion - mappedContacts length:", mappedContacts.length);

    return mappedContacts.slice(0, maxSuggestions);
  }, [data, debouncedQuery, maxSuggestions, minCharacters]);

  // Should show the dropdown - use debouncedQuery for consistency
  const shouldShow =
    isVisible &&
    debouncedQuery.length >= minCharacters &&
    (filteredContacts.length > 0 || isLoading);

  // Debug log
  console.log("ContactSuggestion - shouldShow:", shouldShow, {
    isVisible,
    debouncedQueryLength: debouncedQuery.length,
    minCharacters,
    filteredContactsLength: filteredContacts.length,
    isLoading,
  });

  // Animation effect for show/hide
  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShow, fadeAnim, slideAnim]);

  // Handle contact selection
  const handleContactSelect = useCallback(
    (contact: IContactItem) => {
      onContactSelect(contact);
    },
    [onContactSelect]
  );

  // Don't render if not visible - keep showing while user is typing
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {showLoading && isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={theme.colors.palette.green700}
          />
          <CustomText
            variant="caption"
            color={theme.colors.text.secondary}
            style={styles.loadingText}
          >
            Searching...
          </CustomText>
        </View>
      ) : filteredContacts.length > 0 ? (
        <View
          style={[
            styles.listWrapper,
            {
              height: Math.min(
                filteredContacts.length * ITEM_HEIGHT + CONTAINER_PADDING,
                MAX_VISIBLE_ITEMS * ITEM_HEIGHT + CONTAINER_PADDING
              ),
            },
          ]}
        >
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            bounces={false}
          >
            {filteredContacts.map((contact, index) => (
              <ContactSuggestionItem
                key={contact.uuid || contact.wallet_address || index}
                contact={contact}
                onPress={handleContactSelect}
                searchQuery={debouncedQuery}
                isLast={index === filteredContacts.length - 1}
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <CustomText variant="body2" color={theme.colors.text.secondary}>
            {emptyPlaceholder}
          </CustomText>
        </View>
      )}
    </Animated.View>
  );
};

export default React.memo(ContactSuggestion);
