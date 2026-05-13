import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export async function getDeviceFingerprint(): Promise<string> {
  try {
    const id = await DeviceInfo.getUniqueId();
    if (id && typeof id === "string") return id;
  } catch {
    // fall through
  }
  return `dev-${Platform.OS}-${Date.now().toString(36)}`;
}
