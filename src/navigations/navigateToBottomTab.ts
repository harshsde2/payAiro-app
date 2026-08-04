import type { NavigationProp } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "./navigationConstants";

export const MAIN_TABS = "MainTabs" as const;

type BottomTabScreenName =
  | typeof NAVIGATION_SCREENS.NEW_DASHBOARD
  | typeof NAVIGATION_SCREENS.SCANS
  | typeof NAVIGATION_SCREENS.NEW_ACTIVITY_SCREEN
  | typeof NAVIGATION_SCREENS.SETTING_SCREEN
  | "CryptoTab";

/**
 * Navigate to a screen inside BottomTabNavigator from AppStack (or any parent).
 * NewSend, Receive, etc. live on AppStack; Scans and other tabs live under MainTabs.
 */
export function navigateToBottomTabScreen(
  navigation: NavigationProp<Record<string, object | undefined>>,
  screenName: BottomTabScreenName,
  params?: object
): void {
  navigation.navigate(MAIN_TABS, {
    screen: screenName,
    params,
  });
}
