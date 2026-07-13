import React from "react";
import { AppIcon } from "new-ui/assets/svgs/index";

export type DashboardActionScreen =
  | "NEW_ADD_BALANCE"
  | "NEW_SEND"
  | "NEW_PERSONAL"
  | "WITHDRAW_BALANCE"
  | "CRYPTO_WITHDRAW";

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
  /** Opens the Receive QR bottom sheet in-place instead of navigating. */
  opensReceiveSheet?: boolean;
}

export const DASHBOARD_BALANCE_CARD_CONSTANTS: IDashboardActionConfig[] = [
  {
    icon: AppIcon.Send,
    name: "Send",
    screen: "NEW_SEND",
    params: { requested: false },
  },
  { icon: AppIcon.Receive, name: "Receive", screen: 'NEW_PERSONAL', opensReceiveSheet: true },
  { icon: AppIcon.AddBalance, name: "Add Balance", screen: "NEW_ADD_BALANCE" },
  {
    icon: AppIcon.Withdraw,
    name: "Withdraw",
    screen: "CRYPTO_WITHDRAW",
  },
];
