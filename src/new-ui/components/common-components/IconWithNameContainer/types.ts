import { StyleProp, ViewStyle } from 'react-native';

export interface IIconWithNameContainerProps {
  style?: StyleProp<ViewStyle>;
  icon: React.ReactNode;
  name: string;
  iconSize?: number;
  onPress?: () => void;
}
