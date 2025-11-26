import { TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface ITextInputProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  height?: number;
  width?: string | number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  showLeftSeparator?: boolean;
  showRightSeparator?: boolean;
}

