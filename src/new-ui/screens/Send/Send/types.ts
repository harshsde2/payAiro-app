import { RouteProp } from '@react-navigation/native';
import { ISendScreenRouteParams } from 'screens/Dashboard/types';
import type { FundingSource } from '../EnterAmount/enterAmount.types';
import { ISendContactItem } from 'new-ui/components/common-components/SendContactsList';
import type { IReceivedPendingRequest } from 'query/hooks/types';

export type SendRouteProp = RouteProp<
  { Send: ISendScreenRouteParams },
  'Send'
>;

export interface INewSendProps {
  route: SendRouteProp;
}

export interface IEnterAmountRouteParams {
  type?: 'send' | 'request' | 'requested';
  recipient_identifier?: string;
  selectedContact?: ISendContactItem;
  request_data?: IReceivedPendingRequest;
}

export type EnterAmountRouteProp = RouteProp<
  { EnterAmount: IEnterAmountRouteParams },
  'EnterAmount'
>;

export interface IEnterAmountProps {
  route: EnterAmountRouteProp;
}


