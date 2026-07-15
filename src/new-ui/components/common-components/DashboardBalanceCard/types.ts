import { StyleProp, ViewStyle } from 'react-native';

export interface IDashboardBalanceCardProps {
  style?: StyleProp<ViewStyle>;
  /** Label shown above the balance, e.g. "Payairo Balance" or "Total Crypto Balance". */
  title: string;
  /** Optional small caption shown below the title, e.g. "This is your Stablecoin balance". */
  subtitle?: string;
  /** USD value to display. */
  balance: number;
  onRefreshBalance?: () => Promise<void>;
  isRefreshing?: boolean;
  /** Send/Receive/Add Balance/Withdraw row. Defaults to true (shown). */
  showActionButtons?: boolean;
  /** Height of the white container. */
  whiteContainerHeight?: number;
}
