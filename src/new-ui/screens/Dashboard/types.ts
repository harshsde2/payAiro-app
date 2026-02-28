export interface IContact {
  id: string;
  name: string;
  image?: string;
  isAddButton?: boolean;
}

export interface ICryptoAsset {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  iconBgColor: string;
}

export interface IQuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}
