import { StyleProp, ViewStyle } from 'react-native';

export interface IRewardBalanceCardProps {
  title: string;
  balance: number;
  subtitle?: string;
  subtitleColor?: string;
  onSubtitlePress?: () => void;
  onChevronPress?: () => void;
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
}
