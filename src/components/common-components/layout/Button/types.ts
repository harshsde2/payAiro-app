import { TouchableOpacityProps, StyleProp, ViewStyle, TextStyle, DimensionValue } from 'react-native';

export interface IButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  color?: string;
  loading?: boolean;
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
}

