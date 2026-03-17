import { ViewStyle, StyleProp } from "react-native";

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

export interface IContactSuggestionProps {
  searchQuery: string;
  onContactSelect: (contact: IContactItem) => void;
  isVisible: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  maxSuggestions?: number;
  minCharacters?: number;
  debounceDelay?: number;
  emptyPlaceholder?: string;
  showLoading?: boolean;
  mode?: 'dropdown' | 'list';
   selectedContactUuid?: string;
}

export interface IContactSuggestionItemProps {
  contact: IContactItem;
  onPress: (contact: IContactItem) => void;
  searchQuery: string;
  isLast: boolean;
  selected?: boolean;
}

