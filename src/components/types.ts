import { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";

export interface InputProps extends TextInputProps {
  countryCode?: any;
  value: string;
  onChange?: (text: any) => void;
  placeholder?: string;
  onSelected?: ((value: any) => void | undefined) | any;
  label?: string;
  cStyle?: StyleProp<ViewStyle>;
  isCountry?: boolean;
  isIcon?: boolean | null;
  isMultiLine?: boolean;
  icon?: string;
  iStyle?: StyleProp<TextStyle>;
  editable?: boolean;
  lStyle?: StyleProp<TextStyle>;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "ascii-capable"
    | "numbers-and-punctuation"
    | "url"
    | "number-pad"
    | "name-phone-pad"
    | "decimal-pad"
    | "twitter"
    | "web-search";
  maxLength?: number;
  required?: boolean;
  info?: boolean;
  onInfoPress?: () => void;
}

export interface GenericButtonProps {
  isLoading?: boolean;
  title: string;
  onPress: () => void;
  cStyle?: object; // Use StyleProp<ViewStyle> for React Native
  tStyle?: object; // Use StyleProp<TextStyle> for React Native
  disabled?: boolean;
  icon?: string | any;
  showLoader?: boolean;
}

export interface UploadFileProps {
  selectedFile: (files: any[]) => void;
  value: string;
  placeholder?: string;
  label: string;
  type: "image" | "document";
}

export interface FileObject {
  fileCopyUri: string | null;
  name: string;
  size: number;
  height: number;
  originalPath: string;
  type: string;
  uri: string;
}
