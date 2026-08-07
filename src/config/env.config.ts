/**
 * Environment Configuration Module
 * 
 * Provides type-safe access to environment variables with validation and error handling.
 * All environment variables are loaded from .env files using react-native-config.
 * 
 * @module config/env.config
 */

import Config from 'react-native-config';

// ========================================
// Type Definitions
// ========================================

/**
 * Configuration values interface
 * All required and optional environment variables are typed here
 */
export interface IEnvConfig {
  // API Configuration
  API_BASE_URL: string;
  /** Base URL for the new FastAPI user service (OTP/profile/address). */
  USER_API_BASE_URL?: string;
  API_TIMEOUT: number;
  
  // Environment Info
  ENV_NAME: string;
  ENV_TYPE: 'testing' | 'production' | 'development';
  
  // Feature Flags
  ENABLE_LOGGING: boolean;
  ENABLE_ERROR_TRACKING: boolean;
  ENABLE_ANALYTICS: boolean;
  
  // External Links
  PRIVACY_POLICY_URL: string;
  TERMS_AND_CONDITIONS_URL: string;
  /** State-specific regulatory disclosures page (Coinme Legal / Acknowledgment screens). */
  STATE_DISCLOSURES_URL: string;
  
  // App Configuration
  APP_NAME: string;
  APP_DISPLAY_NAME: string;
  
  // Network Configuration
  API_RETRY_COUNT: number;
  API_RETRY_DELAY: number;
  
  // Development Settings
  SHOW_ENV_BANNER: boolean;
  ALLOW_DEV_TOOLS: boolean;
  
  // Version Update Settings
  ENABLE_VERSION_TEST_MODE?: boolean;
  TEST_VERSION_OVERRIDE?: string;
  TEST_FORCE_UPDATE?: boolean;
  FORCE_UPDATE_ENABLED?: boolean; // true = force all updates (blocking), false = optional (dismissible)
  IOS_APP_STORE_ID?: string; // Numeric App Store ID, powers the iOS store-URL fallback/redirect
  ANDROID_PACKAGE_NAME?: string; // Play Store package name (defaults to com.payairo)

  // Wert Checkout Settings (non-secret values only)
  WERT_CHECKOUT_PAGE_BASE_URL?: string;
  WERT_PARTNER_ID?: string;
  WERT_WIDGET_ORIGIN?: string;
}

/**
 * Required environment variables that must be present
 */
const REQUIRED_VARS: (keyof IEnvConfig)[] = [
  'API_BASE_URL',
  'ENV_NAME',
  'ENV_TYPE',
  'PRIVACY_POLICY_URL',
  'TERMS_AND_CONDITIONS_URL',
  'STATE_DISCLOSURES_URL',
  'APP_NAME',
  'APP_DISPLAY_NAME',
];

/**
 * Optional environment variables with their default values
 */
const OPTIONAL_VARS: Partial<Record<keyof IEnvConfig, any>> = {
  API_TIMEOUT: 30000,
  ENABLE_LOGGING: false,
  ENABLE_ERROR_TRACKING: true,
  ENABLE_ANALYTICS: false,
  API_RETRY_COUNT: 3,
  API_RETRY_DELAY: 1000,
  SHOW_ENV_BANNER: false,
  ALLOW_DEV_TOOLS: false,
  ENABLE_VERSION_TEST_MODE: false,
  TEST_VERSION_OVERRIDE: undefined,
  TEST_FORCE_UPDATE: false,
  FORCE_UPDATE_ENABLED: false, // Default: optional (dismissible) updates. Set true to force.
  IOS_APP_STORE_ID: undefined,
  ANDROID_PACKAGE_NAME: 'com.payairo',
  WERT_CHECKOUT_PAGE_BASE_URL: undefined,
  WERT_PARTNER_ID: undefined,
  WERT_WIDGET_ORIGIN: undefined,
  USER_API_BASE_URL: undefined,
};

// ========================================
// Validation Utilities
// ========================================

/**
 * Type guard to check if a value is a valid environment type
 */
function isValidEnvType(value: string): value is IEnvConfig['ENV_TYPE'] {
  return ['testing', 'production', 'development'].includes(value);
}

/**
 * Validates and converts a string to a number
 * @param value - The string value to convert
 * @param defaultValue - Default value if conversion fails
 * @param varName - Variable name for error messages
 * @returns The converted number
 */
function parseNumber(
  value: string | undefined,
  defaultValue: number,
  varName: string
): number {
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    if (__DEV__) {
      console.warn(
        `[EnvConfig] Invalid number value for ${varName}: "${value}". Using default: ${defaultValue}`
      );
    }
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Validates and converts a string to a boolean
 * @param value - The string value to convert
 * @param defaultValue - Default value if conversion fails
 * @param varName - Variable name for error messages
 * @returns The converted boolean
 */
function parseBoolean(
  value: string | undefined,
  defaultValue: boolean,
  varName: string
): boolean {
  if (!value) return defaultValue;
  
  const lowerValue = value.toLowerCase().trim();
  
  if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
    return true;
  }
  
  if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
    return false;
  }
  
  if (__DEV__) {
    console.warn(
      `[EnvConfig] Invalid boolean value for ${varName}: "${value}". Using default: ${defaultValue}`
    );
  }
  
  return defaultValue;
}

/**
 * Validates that a required environment variable exists
 * @param value - The value to validate
 * @param varName - The name of the variable
 * @throws Error if value is missing or empty
 */
function validateRequired(value: string | undefined, varName: string): void {
  if (!value || value.trim().length === 0) {
    const errorMessage = `[EnvConfig] Required environment variable "${varName}" is missing or empty.`;
    
    if (__DEV__) {
      console.error(errorMessage);
      console.error('Please check your .env file and ensure all required variables are set.');
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Validates URL format
 * @param url - The URL string to validate
 * @param varName - The name of the variable for error messages
 * @returns The validated URL string
 */
function validateUrl(url: string, varName: string): string {
  try {
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error(`URL must start with http:// or https://`);
    }
    
    // Attempt to construct URL object to validate format
    new URL(url);
    return url;
  } catch (error) {
    const errorMessage = `[EnvConfig] Invalid URL format for "${varName}": ${url}`;
    
    if (__DEV__) {
      console.error(errorMessage);
    }
    
    // In production, we might want to throw or use a fallback
    // For now, we'll return the URL as-is and log the warning
    if (__DEV__) {
      throw new Error(errorMessage);
    }
    
    return url;
  }
}

// ========================================
// Configuration Loading & Validation
// ========================================

/**
 * Validates all required environment variables at startup
 * @throws Error if any required variables are missing
 */
function validateConfig(): void {
  const missingVars: string[] = [];
  
  // Check all required variables
  for (const varName of REQUIRED_VARS) {
    const value = (Config as any)[varName];
    if (!value || String(value).trim().length === 0) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    const errorMessage = `[EnvConfig] Missing required environment variables: ${missingVars.join(', ')}`;
    
    console.error(errorMessage);
    console.error('Please ensure your .env file contains all required variables.');
    
    throw new Error(errorMessage);
  }
}

/**
 * Builds the configuration object with type conversions and defaults
 * @returns The fully typed configuration object
 */
function buildConfig(): IEnvConfig {
  // Validate required variables first
  validateConfig();
  
  // Get ENV_TYPE and validate it
  const envTypeValue = (Config as any).ENV_TYPE;
  if (!isValidEnvType(envTypeValue)) {
    const errorMessage = `[EnvConfig] Invalid ENV_TYPE: "${envTypeValue}". Must be one of: testing, production, development`;
    
    if (__DEV__) {
      console.error(errorMessage);
    }
    
    throw new Error(errorMessage);
  }
  
  // Build configuration with type conversions
  const config: IEnvConfig = {
    // Required variables (validated above)
    API_BASE_URL: validateUrl((Config as any).API_BASE_URL, 'API_BASE_URL'),
    USER_API_BASE_URL: (Config as any).USER_API_BASE_URL
      ? validateUrl((Config as any).USER_API_BASE_URL, 'USER_API_BASE_URL')
      : undefined,
    ENV_NAME: String((Config as any).ENV_NAME).trim(),
    ENV_TYPE: envTypeValue,
    PRIVACY_POLICY_URL: validateUrl(
      (Config as any).PRIVACY_POLICY_URL,
      'PRIVACY_POLICY_URL'
    ),
    TERMS_AND_CONDITIONS_URL: validateUrl(
      (Config as any).TERMS_AND_CONDITIONS_URL,
      'TERMS_AND_CONDITIONS_URL'
    ),
    STATE_DISCLOSURES_URL: validateUrl(
      (Config as any).STATE_DISCLOSURES_URL,
      'STATE_DISCLOSURES_URL'
    ),
    APP_NAME: String((Config as any).APP_NAME).trim(),
    APP_DISPLAY_NAME: String((Config as any).APP_DISPLAY_NAME).trim(),
    
    // Optional variables with defaults
    API_TIMEOUT: parseNumber(
      (Config as any).API_TIMEOUT,
      OPTIONAL_VARS.API_TIMEOUT as number,
      'API_TIMEOUT'
    ),
    ENABLE_LOGGING: parseBoolean(
      (Config as any).ENABLE_LOGGING,
      OPTIONAL_VARS.ENABLE_LOGGING as boolean,
      'ENABLE_LOGGING'
    ),
    ENABLE_ERROR_TRACKING: parseBoolean(
      (Config as any).ENABLE_ERROR_TRACKING,
      OPTIONAL_VARS.ENABLE_ERROR_TRACKING as boolean,
      'ENABLE_ERROR_TRACKING'
    ),
    ENABLE_ANALYTICS: parseBoolean(
      (Config as any).ENABLE_ANALYTICS,
      OPTIONAL_VARS.ENABLE_ANALYTICS as boolean,
      'ENABLE_ANALYTICS'
    ),
    API_RETRY_COUNT: parseNumber(
      (Config as any).API_RETRY_COUNT,
      OPTIONAL_VARS.API_RETRY_COUNT as number,
      'API_RETRY_COUNT'
    ),
    API_RETRY_DELAY: parseNumber(
      (Config as any).API_RETRY_DELAY,
      OPTIONAL_VARS.API_RETRY_DELAY as number,
      'API_RETRY_DELAY'
    ),
    SHOW_ENV_BANNER: parseBoolean(
      (Config as any).SHOW_ENV_BANNER,
      OPTIONAL_VARS.SHOW_ENV_BANNER as boolean,
      'SHOW_ENV_BANNER'
    ),
    ALLOW_DEV_TOOLS: parseBoolean(
      (Config as any).ALLOW_DEV_TOOLS,
      OPTIONAL_VARS.ALLOW_DEV_TOOLS as boolean,
      'ALLOW_DEV_TOOLS'
    ),
    ENABLE_VERSION_TEST_MODE: parseBoolean(
      (Config as any).ENABLE_VERSION_TEST_MODE,
      OPTIONAL_VARS.ENABLE_VERSION_TEST_MODE as boolean,
      'ENABLE_VERSION_TEST_MODE'
    ),
    TEST_VERSION_OVERRIDE: (Config as any).TEST_VERSION_OVERRIDE
      ? String((Config as any).TEST_VERSION_OVERRIDE).trim()
      : undefined,
    TEST_FORCE_UPDATE: parseBoolean(
      (Config as any).TEST_FORCE_UPDATE,
      OPTIONAL_VARS.TEST_FORCE_UPDATE as boolean,
      'TEST_FORCE_UPDATE'
    ),
    FORCE_UPDATE_ENABLED: parseBoolean(
      (Config as any).FORCE_UPDATE_ENABLED,
      OPTIONAL_VARS.FORCE_UPDATE_ENABLED as boolean,
      'FORCE_UPDATE_ENABLED'
    ),
    IOS_APP_STORE_ID: (Config as any).IOS_APP_STORE_ID
      ? String((Config as any).IOS_APP_STORE_ID).trim()
      : undefined,
    ANDROID_PACKAGE_NAME: (Config as any).ANDROID_PACKAGE_NAME
      ? String((Config as any).ANDROID_PACKAGE_NAME).trim()
      : (OPTIONAL_VARS.ANDROID_PACKAGE_NAME as string),
    WERT_CHECKOUT_PAGE_BASE_URL: (Config as any).WERT_CHECKOUT_PAGE_BASE_URL
      ? String((Config as any).WERT_CHECKOUT_PAGE_BASE_URL).trim()
      : undefined,
    WERT_PARTNER_ID: (Config as any).WERT_PARTNER_ID
      ? String((Config as any).WERT_PARTNER_ID).trim()
      : undefined,
    WERT_WIDGET_ORIGIN: (Config as any).WERT_WIDGET_ORIGIN
      ? String((Config as any).WERT_WIDGET_ORIGIN).trim()
      : undefined,
  };
  
  return config;
}

// ========================================
// Exported Configuration
// ========================================

/**
 * Validated and type-safe environment configuration
 * This object is created once at module load time and validated immediately
 */
let appConfig: IEnvConfig;

try {
  // Check if Config is available from react-native-config
  if (!Config || typeof Config !== 'object') {
    const errorMessage = '[EnvConfig] react-native-config is not properly linked. Config object is undefined. Please ensure the native module is properly linked and rebuild the app.';
    console.error(errorMessage);
    console.error('[EnvConfig] To fix this issue:');
    console.error('  1. Clean build: cd android && ./gradlew clean');
    console.error('  2. Clear Metro cache: npm start -- --reset-cache');
    console.error('  3. Rebuild the app completely');
    throw new Error(errorMessage);
  }
  
  appConfig = buildConfig();
  
  // Log configuration in development mode only
  if (__DEV__ && appConfig.ENABLE_LOGGING) {
    console.log('[EnvConfig] Configuration loaded successfully:', {
      ENV_NAME: appConfig.ENV_NAME,
      ENV_TYPE: appConfig.ENV_TYPE,
      API_BASE_URL: appConfig.API_BASE_URL,
      ENABLE_LOGGING: appConfig.ENABLE_LOGGING,
    });
  }
} catch (error) {
  // In production, we might want to use fallback values
  // For now, we'll let the error propagate to prevent the app from starting with invalid config
  console.error('[EnvConfig] Failed to load configuration:', error);
  
  // Re-throw to prevent app from starting with invalid configuration
  throw error;
}

/**
 * Exported configuration object
 * Use this to access environment variables throughout your app
 */
export const EnvConfig: IEnvConfig = appConfig;

/**
 * Helper to check if current environment is production
 * @returns true if running in production environment
 */
export function isProduction(): boolean {
  return EnvConfig.ENV_TYPE === 'production';
}

/**
 * Helper to check if current environment is staging/testing
 * @returns true if running in staging/testing environment
 */
export function isStaging(): boolean {
  return EnvConfig.ENV_TYPE === 'testing';
}

/**
 * Helper to check if current environment is development
 * @returns true if running in development environment
 */
export function isDevelopment(): boolean {
  return EnvConfig.ENV_TYPE === 'development';
}

/**
 * Get the base API URL without trailing slash
 * @returns The base API URL
 */
export function getApiBaseUrl(): string {
  return EnvConfig.API_BASE_URL.replace(/\/+$/, '');
}

/**
 * Get the base user-service API URL without trailing slash.
 * @throws Error if `USER_API_BASE_URL` is not configured.
 */
export function getUserApiBaseUrl(): string {
  if (!EnvConfig.USER_API_BASE_URL) {
    const msg =
      "[EnvConfig] USER_API_BASE_URL is missing. Add it to your .env files to enable FastAPI auth/profile calls.";
    console.error(msg);
    throw new Error(msg);
  }

  return EnvConfig.USER_API_BASE_URL.replace(/\/+$/, '');
}

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (with or without leading slash)
 * @returns The full API URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

// Default export for convenience
export default EnvConfig;