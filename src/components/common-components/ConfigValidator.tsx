/**
 * Config Validator Component
 * 
 * Validates environment configuration at app startup and displays errors
 * if configuration is invalid. This component should be rendered early
 * in the app lifecycle, ideally in App.tsx or index.js.
 * 
 * @module components/common-components/ConfigValidator
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { EnvConfig, isStaging } from '../../config/env.config';

/**
 * Props for ConfigValidator component
 */
interface IConfigValidatorProps {
  /**
   * If true, shows environment banner in staging builds
   * @default true
   */
  showBanner?: boolean;
  
  /**
   * Children to render if validation passes
   */
  children: React.ReactNode;
  
  /**
   * Custom error component to display on validation failure
   */
  errorComponent?: React.ComponentType<{ error: Error }>;
}

/**
 * ConfigValidator Component
 * 
 * Validates environment configuration and renders children if valid.
 * Displays error UI if configuration is invalid.
 */
const ConfigValidator: React.FC<IConfigValidatorProps> = ({
  showBanner = true,
  children,
  errorComponent: ErrorComponent,
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Validate configuration
    try {
      // Access EnvConfig to trigger validation
      // If config is invalid, the module will throw during import/load
      const apiUrl = EnvConfig.API_BASE_URL;
      const envName = EnvConfig.ENV_NAME;
      
      // Additional runtime validation
      if (!apiUrl || apiUrl.trim().length === 0) {
        throw new Error('API_BASE_URL is not configured');
      }
      
      if (!envName || envName.trim().length === 0) {
        throw new Error('ENV_NAME is not configured');
      }
      
      setIsValid(true);
      
      // Log environment info in development
      if (__DEV__ && EnvConfig.ENABLE_LOGGING) {
        console.log('[ConfigValidator] Configuration validated successfully:', {
          ENV_NAME: envName,
          ENV_TYPE: EnvConfig.ENV_TYPE,
          API_BASE_URL: apiUrl,
        });
      }
    } catch (err) {
      const validationError = err instanceof Error 
        ? err 
        : new Error('Unknown configuration error');
      
      setError(validationError);
      setIsValid(false);
      
      console.error('[ConfigValidator] Configuration validation failed:', validationError);
    }
  }, []);

  // Show loading state while validating
  if (isValid === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Validating configuration...</Text>
      </View>
    );
  }

  // Show error state if validation failed
  if (isValid === false && error) {
    if (ErrorComponent) {
      return <ErrorComponent error={error} />;
    }
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Configuration Error</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <Text style={styles.errorHint}>
          Please check your .env file and ensure all required variables are set.
        </Text>
      </View>
    );
  }

  // Render children with optional environment banner
  return (
    <>
      {children}
      {showBanner && isStaging() && EnvConfig.SHOW_ENV_BANNER && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {EnvConfig.ENV_NAME.toUpperCase()} ENVIRONMENT
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF9500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 9999,
    alignItems: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ConfigValidator;