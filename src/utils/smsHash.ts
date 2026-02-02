// Common utility for SMS hash (used for Android OTP auto-read)
import { Platform } from "react-native";
import { getHash } from "react-native-otp-verify";
import { getItem, setItem, STORAGE_KEYS } from "storage/mmkv";

/**
 * Gets the SMS Retriever API hash for Android
 * This hash is required in the SMS message for auto-reading OTP on Android
 * 
 * The hash is cached in local storage since it doesn't change for the app.
 * It will first check storage, and only fetch from native if not found.
 * 
 * @returns Promise<string> - The app hash string (empty for iOS or on error)
 * 
 * @example
 * const hash = await getSmsHash();
 * // Use hash in API payload: { phone: "9310435251", location: "india", hash: hash }
 */
export const getSmsHash = async (): Promise<string> => {
  // SMS Retriever API is only available on Android
  if (Platform.OS !== "android") {
    return "";
  }

  // Check if hash is already stored in local storage
  const storedHash = getItem(STORAGE_KEYS.SMS_HASH);
  if (storedHash) {
    console.log("SMS Hash retrieved from storage:", storedHash);
    return storedHash;
  }

  // Fetch hash from native module if not in storage
  try {
    const hashArray = await getHash();
    // getHash returns an array of hashes (usually just one)
    const hash = hashArray?.[0] || "";
    
    if (hash) {
      // Store in local storage for future use
      setItem(STORAGE_KEYS.SMS_HASH, hash);
      console.log("SMS Hash fetched and stored:", hash);
    }
    
    return hash;
  } catch (error) {
    console.log("Error getting SMS hash:", error);
    return "";
  }
};

/**
 * Type for the SMS hash
 */
export type SmsHash = string;
