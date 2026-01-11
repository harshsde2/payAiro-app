import { ViewStyle, StyleProp } from "react-native";

/**
 * Interface for contact item from API
 */
export interface IContactItem {
  uuid: string;
  mobileno: string;
  email: string;
  wallet_address: string;
  nickname: string;
  username: string;
  profile_photo: string | null;
  unread_count?: number;
}

/**
 * Props for ContactSuggestion component
 */
export interface IContactSuggestionProps {
  /** Current search query to filter contacts */
  searchQuery: string;
  /** Callback when a contact is selected */
  onContactSelect: (contact: IContactItem) => void;
  /** Whether the suggestion list should be visible */
  isVisible: boolean;
  /** Optional custom style for the container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Maximum number of suggestions to show */
  maxSuggestions?: number;
  /** Minimum characters required to show suggestions */
  minCharacters?: number;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Optional placeholder text when no results found */
  emptyPlaceholder?: string;
  /** Whether to show loading indicator */
  showLoading?: boolean;
}

/**
 * Props for individual suggestion item
 */
export interface IContactSuggestionItemProps {
  contact: IContactItem;
  onPress: (contact: IContactItem) => void;
  searchQuery: string;
  isLast: boolean;
}
