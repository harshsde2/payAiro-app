export interface INewDashboardCardProps {
  viewType?: 'payairo' | 'crypto';
  balance: number;
  userId: string;
  onToggleVisibility?: () => void;
  onQRCodePress?: () => void;
  isBalanceVisible?: boolean;
  onRequestShowBalance?: () => void; // Callback to trigger PIN verification when user wants to show balance
}

