import { NavigationProp } from '@react-navigation/native';

export interface IQRCodeEvent {
  nativeEvent: {
    codeStringValue: string;
  };
}

export interface IScanPayParams {
  type: 'request' | 'merchantSend' | 'receive' | 'receiveMerchent';
  sender: string | object;
}

export type ScansNavigationProp = NavigationProp<any>;
