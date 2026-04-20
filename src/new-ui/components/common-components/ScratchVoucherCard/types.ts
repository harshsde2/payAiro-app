export interface IRedeemedData {
  discount: string;
  description: string;
  code: string;
}

export interface IScratchVoucherCardProps {
  points: number;
  onPress: () => void;
  redeemed?: boolean;
  redeemedData?: IRedeemedData;
}
