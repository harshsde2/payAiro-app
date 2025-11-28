export interface ISentTransaction {
  id: string;
  amount: number;
  timestamp: string;
  status: string;
  note: string | null;
  order_id: string | null;
  currency: string;
  category: string;
  recipient: string;
  sender: string;
  recipient_username: string;
  sender_username: string;
  final_amount: string;
  sender_profile_photo: string | null;
  recipient_profile_photo: string | null;
}

export interface INewTransactionDetailsProps {
  route: {
    params: {
      transactionData: ISentTransaction;
    };
  };
}

