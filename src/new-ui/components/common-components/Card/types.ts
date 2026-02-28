import { ViewProps, StyleProp, ViewStyle } from 'react-native';

export interface ICardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

