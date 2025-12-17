/**
 * Type definitions for environment configuration
 * 
 * @module config/types
 */

/**
 * Environment type identifiers
 */
export type EnvironmentType = 'testing' | 'production' | 'development';

/**
 * Configuration interface exported for use in other modules
 */
export interface IEnvConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENV_NAME: string;
  ENV_TYPE: EnvironmentType;
  ENABLE_LOGGING: boolean;
  ENABLE_ERROR_TRACKING: boolean;
  ENABLE_ANALYTICS: boolean;
  PRIVACY_POLICY_URL: string;
  TERMS_AND_CONDITIONS_URL: string;
  APP_NAME: string;
  APP_DISPLAY_NAME: string;
  API_RETRY_COUNT: number;
  API_RETRY_DELAY: number;
  SHOW_ENV_BANNER: boolean;
  ALLOW_DEV_TOOLS: boolean;
}