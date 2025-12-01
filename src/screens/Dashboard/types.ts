export type PeriodOption = "week" | "month" | "custom";

export type TransactionType = "all" | "debit" | "credit";

export interface IPeriodOption {
  key: PeriodOption;
  label: string;
}

export interface ITransactionItem {
  amount: string;
  datetime: string;
  sender: string;
  status: string;
  type: "credit" | "debit";
  option?: string;
  transaction_id?: string;
}

export interface IStatementDetailsRouteParams {
  data: ITransactionItem[];
}

