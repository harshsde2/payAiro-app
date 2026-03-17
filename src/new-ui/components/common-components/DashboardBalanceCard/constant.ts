import React from "react";
import { AppIcon } from "new-ui/assets/svgs/index";

export type DashboardActionScreen =
  | "ADD_BALANCE"
  | "NEW_SEND"
  | "RECEIVE"
  | "WITHDRAW_BALANCE";

export interface IDashboardActionConfig {
  icon: React.ComponentType<{
    width?: number;
    height?: number;
    color?: string;
  }>;
  name: string;
  screen: DashboardActionScreen;
  params?: Record<string, unknown>;
  requiresExternalAccount?: boolean;
}

export const DASHBOARD_BALANCE_CARD_CONSTANTS: IDashboardActionConfig[] = [
  {
    icon: AppIcon.Send,
    name: "Send",
    screen: "NEW_SEND",
    params: { requested: false },
  },
  { icon: AppIcon.Receive, name: "Receive", screen: "RECEIVE" },
  { icon: AppIcon.AddBalance, name: "Add Balance", screen: "ADD_BALANCE" },
  {
    icon: AppIcon.Withdraw,
    name: "Withdraw",
    screen: "WITHDRAW_BALANCE",
    requiresExternalAccount: true,
  },
];
