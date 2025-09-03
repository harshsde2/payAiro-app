import { ViewStyle } from "react-native";
import { ViewProps } from "react-native-svg/lib/typescript/fabric/utils";

export interface ITabItem {
  id: number;
  title: string;
}

export interface IIRAPortfolioItem {
  id: number;
  label: string;
  value: string;
}

export interface IPrices {
  buy: number;
  sell: number;
}

export interface IAssetData {
  id: number;
  name: string;
  symbol: string;
  amount: string | any;
  fortress_id: number | null;
  quantity: number;
  currency_type: string;
  price_per_token: string | any;
  status: string;
  asset_type: string;
  logo: string | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  video: string | null;
  description: string;
  created_at: string;
  images: (string | null)[] | any;
  usernames: string;
}

export interface ICryptoItemProps {
  network: string;
  currency: string;
  price: IPrices;
  logo: string;
}

export interface IRenderCryptoComponentProps extends ViewProps {
  containerStyles?: ViewStyle;
  textContainerStyles?: ViewStyle;
  item?: ICryptoItemProps;
}

export interface IRenderStocksComponentProps extends ViewProps {
  containerStyles?: ViewStyle;
  textContainerStyles?: ViewStyle;
  item?: IAssetData;
}

export interface IHoldingsData {
  holdings: IAssetData[];
}

export interface IAllIRAHoldingsResponse {
  data: IHoldingsData;
}

export interface ICryptoPricesResponse {
  data: ICryptoItemProps[];
}

export interface IBankBalance {
  bank_account: { 
    usd: number;
    eth?: number;
    [key: string]: number | undefined;
  };
  roth_ira_account: { 
    usd: number;
    eth?: number;
    [key: string]: number | undefined;
  };
  traditional_ira_account: { 
    usd: number;
    eth?: number;
    [key: string]: number | undefined;
  };
}

export interface ICryptoBalance {
  currency: string;
  amount: number;
  accountType: 'all' | 'roth_ira_account' | 'traditional_ira_account' | 'bank_account';
}

export interface IBankAccount {
  account_type: string;
}

export interface ISectionData {
  title: string;
  type: string;
  data: any[];
  renderComponent: React.ComponentType<any>;
  onActionPress: () => void;
}

export const VIEW_TYPE = {
  owned: "owned",
  rwa: "rwa",
} as const;

export type ViewType = typeof VIEW_TYPE[keyof typeof VIEW_TYPE];
