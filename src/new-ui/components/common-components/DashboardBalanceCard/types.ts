import { StyleProp, ViewStyle } from 'react-native';

export interface IBankBalance {
  platform_balance?: number;
  platform_available?: number;
  bank_account?: { usd?: number };
}

export interface IAggregatedCryptoBalances {
  usd_value_available?: number;
}

export interface IDashboardBalanceCardProps {
  style?: StyleProp<ViewStyle>;
  userId: string;
  bankBalance?: IBankBalance | null;
  aggregatedCryptoBalances?: IAggregatedCryptoBalances | null;
  onToggleVisibility?: () => void;
  onQRCodePress?: () => void;
  onAccountDetailsPress?: () => void;
  isBalanceVisible?: boolean;
  onRefreshBalance?: () => Promise<void>;
  isRefreshing?: boolean;
}
