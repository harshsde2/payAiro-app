import { Platform } from "react-native";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  type PermissionStatus,
} from "react-native-permissions";

export type CoinmeRiskLocationPermissionStatus = PermissionStatus;

function getLocationPermission() {
  return Platform.OS === "ios"
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
}

function isSatisfied(status: PermissionStatus): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

/**
 * Ensures location is requested before Coinme Risk `cardlinking` so Sardine can
 * collect location signals. Never throws; callers continue the Risk flow on denial.
 */
export async function ensureCoinmeRiskLocationPermission(): Promise<{
  status: CoinmeRiskLocationPermissionStatus;
}> {
  const permission = getLocationPermission();

  try {
    const current = await check(permission);
    if (isSatisfied(current)) {
      return { status: current };
    }

    const requested = await request(permission);
    return { status: requested };
  } catch {
    return { status: RESULTS.UNAVAILABLE };
  }
}
