import { RouteProp } from '@react-navigation/native';
import { ISendScreenRouteParams } from 'screens/Dashboard/types';

export type SendRouteProp = RouteProp<
  { Send: ISendScreenRouteParams },
  'Send'
>;

export interface INewSendProps {
  route: SendRouteProp;
}

export interface IEnterAmountRouteParams {
  type?: 'requested' | 'receive';
  sender: string;
  bank?: any;
}

export type EnterAmountRouteProp = RouteProp<
  { EnterAmount: IEnterAmountRouteParams },
  'EnterAmount'
>;

export interface IEnterAmountProps {
  route: EnterAmountRouteProp;
}


