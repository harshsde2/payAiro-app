/**
 * Payment Request Types
 */
export interface IPaymentRequestPayload {
  amount: string;
  recipient_email_or_wallet_public_key: string;
}

export interface IPaymentRequestResponse {
  id: string;
  amount: string;
  recipient_email_or_wallet_public_key: string;
  status: string;
  created_at: string;
}

/**
 * Pending Payment Request Types
 */
export interface IUserDetails {
  name: string;
  username: string;
  email: string;
  phone_number: string;
  profile_photo: string | null;
  wallet_address: string;
}

export interface IRequestDetails {
  amount: number;
  status: string;
  request_id: string;
  created_at: string;
}

export interface IReceivedPendingRequest {
  requester_details: IUserDetails;
  request_details: IRequestDetails;
}

export interface ISentPendingRequest {
  recipient_details: IUserDetails;
  request_details: IRequestDetails;
}

export interface IPendingPaymentRequestsResponse {
  received_pending_requests: IReceivedPendingRequest[];
  sent_pending_requests: ISentPendingRequest[];
}
