import type { NavigationProp } from "@react-navigation/native";
import {
  isCashOnRampActivity,
  type RecentActivityItem,
} from "new-ui/components/common-components/RecentActivityCard/types";
import {
  buildCashRampBarcodeParamsFromHistory,
  mapCashOnRampToUnified,
  resolveCashOnRampDisplayStatus,
} from "new-ui/components/common-components/RecentActivityCard/cashOnRampActivity";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { mapRecentActivityToUnified } from "./mapRecentActivityToUnified";

export function navigateFromRecentActivity(
  item: RecentActivityItem,
  navigation: NavigationProp<Record<string, object | undefined>>
): void {
  if (!isCashOnRampActivity(item)) {
    navigation.navigate(NAVIGATION_SCREENS.NEW_TRANSACTION_DETAILS as never, {
      transactionData: mapRecentActivityToUnified(item),
    } as never);
    return;
  }

  const display = resolveCashOnRampDisplayStatus(item);
  if (display.kind === "expired") return;

  if (display.kind === "created") {
    navigation.navigate(
      NAVIGATION_SCREENS.NEW_CASH_RAMP_BARCODE as never,
      buildCashRampBarcodeParamsFromHistory(item) as never
    );
    return;
  }

  navigation.navigate(NAVIGATION_SCREENS.NEW_TRANSACTION_DETAILS as never, {
    transactionData: mapCashOnRampToUnified(item),
  } as never);
}
