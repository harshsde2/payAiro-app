export interface INewDashboardCardProps {
  viewType?: 'payairo' | 'crypto';
  balance: number;
  userId: string;
  onToggleVisibility?: () => void;
  onQRCodePress?: () => void;
  isBalanceVisible: boolean;
}

