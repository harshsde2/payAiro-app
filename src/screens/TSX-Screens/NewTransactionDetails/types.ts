import { IUnifiedTransaction } from "../UnifiedTransactions/types";

export interface INewTransactionDetailsProps {
  route: {
    params: {
      transactionData: IUnifiedTransaction;
    };
  };
}
