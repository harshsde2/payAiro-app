/**
 * TypeScript declarations for react-native-config
 * 
 * This file provides type safety and autocompletion for environment variables
 * loaded from .env files via react-native-config.
 * 
 * @module react-native-config
 */

declare module 'react-native-config' {
  /**
   * Native configuration interface
   * Maps to variables defined in .env files
   */
  export interface NativeConfig {
    /** Allow any .env key; known keys are listed below for autocomplete. */
    [key: string]: string | undefined;

    // API Configuration
    API_BASE_URL?: string;
    /** FastAPI base (users, Coinme trade, etc.) — no trailing slash. */
    USER_API_BASE_URL?: string;
    API_TIMEOUT?: string;
    
    // Environment Info
    ENV_NAME?: string;
    ENV_TYPE?: string;
    
    // Feature Flags
    ENABLE_LOGGING?: string;
    ENABLE_ERROR_TRACKING?: string;
    ENABLE_ANALYTICS?: string;
    
    // External Links
    PRIVACY_POLICY_URL?: string;
    TERMS_AND_CONDITIONS_URL?: string;
    
    // App Configuration
    APP_NAME?: string;
    APP_DISPLAY_NAME?: string;
    
    // Network Configuration
    API_RETRY_COUNT?: string;
    API_RETRY_DELAY?: string;
    
    // Development Settings
    SHOW_ENV_BANNER?: string;
    ALLOW_DEV_TOOLS?: string;

    // Coinme Risk SDK (iOS + Android native bridge)
    COINME_CLIENT_ID?: string;
    COINME_PARTNER_ID?: string;
    /** "test" | "prod"; falls back to `__DEV__ ? "test" : "prod"`. */
    COINME_MODE?: string;
  }

  /**
   * Configuration object with all environment variables
   */
  export const Config: NativeConfig;
  
  /**
   * Default export
   */
  export default Config;
}