import React from 'react';

export type AmountType = 'positive' | 'negative' | 'crypto';

export interface IStatementTransactionItemProps {
  icon: React.ReactNode;
  title: string;
  datetime: string;
  amount: string;
  amountType: AmountType;
  onPress?: () => void;
}
