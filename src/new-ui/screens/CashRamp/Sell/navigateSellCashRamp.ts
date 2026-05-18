import type { NavigationProp } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import type { SellCashRampEntryParams } from "./sellFlow.types";
import { checkSellSaleLimits } from "./sellLimitChecks";

export async function navigateToSellCashRampFlow(
  navigation: NavigationProp<Record<string, object | undefined>>,
  entry: SellCashRampEntryParams
): Promise<void> {
  const limit = await checkSellSaleLimits();
  if (limit === "daily") {
    navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_SELL_DAILY_LIMIT as never);
    return;
  }
  if (limit === "monthly") {
    navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_SELL_MONTHLY_LIMIT as never);
    return;
  }
  navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_RAMP_SELL_LOCATION_FINDER as never, entry as never);
}
