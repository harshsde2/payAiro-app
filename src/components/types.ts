import { ReactNode } from "react";
import { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";

// Crypto Transaction Types
export interface CryptoTransactionData {
  id: number;
  usd_amount: string;
  trade_id: string;
  account_id: string | null;
  amount: string;
  final_amount: string;
  Transaction_fee_persentage: string;
  from_currency: string;
  to_currency: string;
  network: string;
  status: string;
  created_at: string;
  type: 'buy' | 'sell' | 'send' | 'receive' | 'withdrawal';
  icon: string;
  user: string;
}

export interface CryptoTransactionCardProps {
  item: CryptoTransactionData;
  onPress?: () => void;
}

// Transaction Status Types
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'success' | 'error';

// Transaction Type Types
export type TransactionType = 'buy' | 'sell' | 'send' | 'receive';

// Amount Colors for different transaction types
export interface AmountColors {
  usdColor: string;
  cryptoColor: string;
}

export interface InputProps extends TextInputProps {
  countryCode?: any;
  value: string;
  onChange: (text: any) => void;
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
  rightIcon?: string;
  onRightIconClick?: () => void;
  onInfoPress?: () => void;
  rightIconComponent?:string;
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
  style?: StyleProp<ViewStyle>;
  boxStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
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