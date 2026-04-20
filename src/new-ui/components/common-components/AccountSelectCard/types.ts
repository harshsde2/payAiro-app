import React from 'react';

export interface IAccountSelectCardProps {
  icon: React.ReactNode;
  title: string;
  maskedAccount: string;
  selected: boolean;
  onPress: () => void;
}
