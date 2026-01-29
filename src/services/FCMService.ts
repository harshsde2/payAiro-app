/**
 * FCM Service - Core Firebase Cloud Messaging Service
 * Handles FCM token management for push notifications (Android)
 */

import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { IFCMServiceOptions } from "../types/fcm.types";

class FCMService {
  private static instance: FCMService;
  private tokenCache: string | null = null;
  private deviceIdCache: string | null = null;
  private isInitialized = false;
  private options: IFCMServiceOptions = {};
  private tokenRefreshUnsubscribe: (() => void) | null = null;

  /**
   * Get singleton instance of FCM Service
   */
  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Initialize FCM Service - Call this once in App.js
   * @param options - Optional callbacks for token events
   * @returns FCM token or null if failed
   */
  async initialize(options?: IFCMServiceOptions): Promise<string | null> {

    if (this.isInitialized && this.tokenCache) {
      return this.tokenCache;
    }

    this.options = options || {};

    try {
      // Register device for remote messages (iOS only)
      if (Platform.OS === "ios") {
        await messaging().registerDeviceForRemoteMessages();
      }

      // Request permission first
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        console.log("[FCMService] Permission not granted");
        return null;
      }

      // Get FCM token
      const token = await messaging().getToken();
      this.tokenCache = token;
      this.isInitialized = true;

      console.log("[FCMService] Token received:", token?.substring(0, 20) + "...");

      // Callback if provided
      if (token && this.options.onTokenReceived) {
        this.options.onTokenReceived(token);
      }

      // Setup token refresh listener
      this.setupTokenRefreshListener();

      // Cache device ID
      await this.getDeviceId();

      return token;
    } catch (error) {
      console.error("[FCMService] Initialization error:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      return null;
    }
  }

  /**
   * Get current FCM token (fetches fresh if needed)
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.tokenCache = token;
      return token;
    } catch (error) {
      console.error("[FCMService] Error getting token:", error);
      return this.tokenCache; // Return cached token if fresh fetch fails
    }
  }

  /**
   * Get cached token (synchronous)
   */
  getCachedToken(): string | null {
    return this.tokenCache;
  }

  /**
   * Get device unique ID
   */
  async getDeviceId(): Promise<string> {
    if (this.deviceIdCache) {
      return this.deviceIdCache;
    }

    try {
      const deviceId = await DeviceInfo.getUniqueId();
      this.deviceIdCache = deviceId;
      return deviceId;
    } catch (error) {
      console.error("[FCMService] Error getting device ID:", error);
      // Fallback to a random ID if device ID fails
      const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      this.deviceIdCache = fallbackId;
      return fallbackId;
    }
  }

  /**
   * Request notification permission
   * @returns true if permission granted
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log("[FCMService] Permission status:", enabled ? "granted" : "denied");
      return enabled;
    } catch (error) {
      console.error("[FCMService] Permission request error:", error);
      return false;
    }
  }

  /**
   * Setup token refresh listener
   */
  private setupTokenRefreshListener(): void {
    // Remove existing listener if any
    if (this.tokenRefreshUnsubscribe) {
      this.tokenRefreshUnsubscribe();
    }

    this.tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (newToken) => {
      console.log("[FCMService] Token refreshed:", newToken?.substring(0, 20) + "...");
      this.tokenCache = newToken;

      if (this.options.onTokenRefresh) {
        this.options.onTokenRefresh(newToken);
      }
    });
  }

  /**
   * Clear cached data (call on logout)
   */
  clearCache(): void {
    this.tokenCache = null;
    this.isInitialized = false;
    console.log("[FCMService] Cache cleared");
  }

  /**
   * Cleanup listeners (call on app unmount)
   */
  cleanup(): void {
    if (this.tokenRefreshUnsubscribe) {
      this.tokenRefreshUnsubscribe();
      this.tokenRefreshUnsubscribe = null;
    }
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export default FCMService;
