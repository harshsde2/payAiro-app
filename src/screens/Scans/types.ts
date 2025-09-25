// Local types for the ScanPay screen

export type ScanType =
  | "request"
  | "requested"
  | "receive"
  | "merchantSend"
  | "receiveMerchent"
  | "crypto"
  | "widthdraw";

export interface IRequestDetails {
  request_id?: string;
  amount?: number | string;
}

export interface ISender {
  address?: string;
  amount?: number | string;
  order_id?: string;
  orderID?: string;
  qrtype?: string;
  request_details?: IRequestDetails;
  requester_details?: unknown;
}

export interface IBank {
  bank_type?: string;
  account_type?: string;
  account_number?: string;
}

export interface IScanPayRouteParams {
  type: ScanType;
  sender: ISender | string;
  bank?: IBank;
}

export interface IScanPayProps {
  route: {
    params: IScanPayRouteParams;
  };
}

export type PinScreenRef = {
  checkUserPin: () => void;
};


