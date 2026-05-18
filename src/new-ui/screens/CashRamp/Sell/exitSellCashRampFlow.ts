import type { NavigationProp } from "@react-navigation/native";
import { CommonActions, StackActions } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import type { SellCashRampSession } from "./sellFlow.types";

const MAIN_TABS = "MainTabs";

const SELL_FLOW_SCREEN_NAMES = new Set<string>([
  NAVIGATION_SCREENS.NEW_CASH_RAMP_SELL_LOCATION_FINDER,
  NAVIGATION_SCREENS.NEW_CASH_SELL_ENTER_AMOUNT,
  NAVIGATION_SCREENS.NEW_CASH_SELL_SUMMARY,
  NAVIGATION_SCREENS.NEW_CASH_SELL_OTP,
  NAVIGATION_SCREENS.NEW_CASH_SELL_READY_CODE_WAITING,
  NAVIGATION_SCREENS.NEW_CASH_SELL_DAILY_LIMIT,
  NAVIGATION_SCREENS.NEW_CASH_SELL_MONTHLY_LIMIT,
  NAVIGATION_SCREENS.NEW_COMMON_ERROR,
]);

function buildCryptoDetailsParams(session: SellCashRampSession) {
  const code = String(session.cryptoCurrencyCode ?? "").toUpperCase();
  const available = Number(session.platformAvailableCrypto ?? 0);
  const price = Number(session.usdUnitPrice ?? 0);
  return {
    item: {
      asset: code,
      name: session.cryptoDisplayName ?? code,
      platform_balance: available,
      platform_available: available,
      rounded_balance: available,
      usd_value: available * price,
      usd_price: price,
      logo: session.logo ?? "",
      recent_activity: null,
      chain: session.chain,
      sourceWalletAddress: session.sourceWalletAddress,
    },
  };
}

/**
 * Leaves the sell-for-cash flow and removes sell screens from the stack.
 * Prefers popping back to Crypto Details (where the flow started).
 */
export function exitSellCashRampFlow(
  navigation: NavigationProp<Record<string, object | undefined>>,
  session?: SellCashRampSession | null
): void {
  const cryptoParams = session ? buildCryptoDetailsParams(session) : undefined;
  const nav = navigation as NavigationProp<Record<string, object | undefined>> & {
    popTo?: (name: string, params?: object) => void;
    getState?: () => { routes: { name: string }[]; index: number };
  };

  const routes = nav.getState?.()?.routes ?? [];
  const cryptoIndex = routes.findIndex((r) => r.name === NAVIGATION_SCREENS.CRYPTO_DETAILS);

  if (cryptoIndex >= 0) {
    if (typeof nav.popTo === "function") {
      nav.popTo(NAVIGATION_SCREENS.CRYPTO_DETAILS, cryptoParams);
      return;
    }
    const popCount = routes.length - 1 - cryptoIndex;
    if (popCount > 0) {
      navigation.dispatch(StackActions.pop(popCount));
    }
    return;
  }

  let trailingSellScreens = 0;
  for (let i = routes.length - 1; i >= 0; i -= 1) {
    if (SELL_FLOW_SCREEN_NAMES.has(routes[i].name)) {
      trailingSellScreens += 1;
    } else {
      break;
    }
  }
  if (trailingSellScreens > 0) {
    navigation.dispatch(StackActions.pop(trailingSellScreens));
    return;
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: MAIN_TABS }],
    })
  );
}
