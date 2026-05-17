export type FinalizeResult = "success" | "failed";

export async function finalizeCashRampTransaction(_args: {
  transactionRef: string;
}): Promise<FinalizeResult> {
  await new Promise((r) => setTimeout(r, 800));
  return "success";
}

export type CashRampPurchaseReceipt = {
  transactionId: string;
  completedAt: Date;
  paymentMethod: string;
  totalLabel: string;
};

export function buildReceiptFromTemplate(args: {
  fiat: string;
  amount: number;
  transactionRef: string;
}): CashRampPurchaseReceipt {
  return {
    transactionId: args.transactionRef || "—",
    completedAt: new Date(),
    paymentMethod: "Cash",
    totalLabel: `${args.fiat} ${args.amount.toFixed(2)}`,
  };
}
