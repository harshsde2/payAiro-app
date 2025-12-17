/**
 * Environment Configuration Test Screen
 * 
 * This component displays the current environment configuration values.
 * Use this to verify that react-native-config is working correctly.
 * 
 * IMPORTANT: Remove or disable this component in production builds!
 * 
 * @module components/common-components/EnvConfigTestScreen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { EnvConfig, isStaging, isProduction, getApiBaseUrl } from '../../config/env.config';
import Config from 'react-native-config';

/**
 * Test Screen Component
 * Displays all environment configuration values
 */
const EnvConfigTestScreen: React.FC = () => {
  const handleTestApiUrl = () => {
    const apiUrl = getApiBaseUrl();
    console.log('[EnvConfig Test] API Base URL:', apiUrl);
    alert(`API Base URL: ${apiUrl}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Environment Configuration Test</Text>
        <Text style={styles.subtitle}>
          Verify that react-native-config is working correctly
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environment Info</Text>
        <ConfigRow label="ENV_NAME" value={EnvConfig.ENV_NAME} />
        <ConfigRow label="ENV_TYPE" value={EnvConfig.ENV_TYPE} />
        <ConfigRow
          label="Is Staging"
          value={isStaging() ? 'Yes ✅' : 'No'}
        />
        <ConfigRow
          label="Is Production"
          value={isProduction() ? 'Yes ✅' : 'No'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <ConfigRow label="API_BASE_URL" value={EnvConfig.API_BASE_URL} />
        <ConfigRow label="API_TIMEOUT" value={`${EnvConfig.API_TIMEOUT}ms`} />
        <ConfigRow label="API_RETRY_COUNT" value={String(EnvConfig.API_RETRY_COUNT)} />
        <ConfigRow label="API_RETRY_DELAY" value={`${EnvConfig.API_RETRY_DELAY}ms`} />
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleTestApiUrl}
        >
          <Text style={styles.buttonText}>Test API URL Helper</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Configuration</Text>
        <ConfigRow label="APP_NAME" value={EnvConfig.APP_NAME} />
        <ConfigRow label="APP_DISPLAY_NAME" value={EnvConfig.APP_DISPLAY_NAME} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Flags</Text>
        <ConfigRow
          label="ENABLE_LOGGING"
          value={EnvConfig.ENABLE_LOGGING ? 'Enabled ✅' : 'Disabled'}
        />
        <ConfigRow
          label="ENABLE_ERROR_TRACKING"
          value={EnvConfig.ENABLE_ERROR_TRACKING ? 'Enabled ✅' : 'Disabled'}
        />
        <ConfigRow
          label="ENABLE_ANALYTICS"
          value={EnvConfig.ENABLE_ANALYTICS ? 'Enabled ✅' : 'Disabled'}
        />
        <ConfigRow
          label="SHOW_ENV_BANNER"
          value={EnvConfig.SHOW_ENV_BANNER ? 'Yes ✅' : 'No'}
        />
        <ConfigRow
          label="ALLOW_DEV_TOOLS"
          value={EnvConfig.ALLOW_DEV_TOOLS ? 'Yes ✅' : 'No'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>External Links</Text>
        <ConfigRow label="PRIVACY_POLICY_URL" value={EnvConfig.PRIVACY_POLICY_URL} />
        <ConfigRow
          label="TERMS_AND_CONDITIONS_URL"
          value={EnvConfig.TERMS_AND_CONDITIONS_URL}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Raw Config (react-native-config)</Text>
        <ConfigRow
          label="API_BASE_URL (raw)"
          value={(Config as any).API_BASE_URL || 'Not found'}
        />
        <ConfigRow
          label="ENV_NAME (raw)"
          value={(Config as any).ENV_NAME || 'Not found'}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ✅ If all values are displayed correctly, your environment configuration is working!
        </Text>
        <Text style={styles.footerText}>
          ❌ If values are missing or incorrect, check:
        </Text>
        <Text style={styles.footerText}>
          1. .env.staging or .env.production file exists
        </Text>
        <Text style={styles.footerText}>
          2. Pod install was run (cd ios && pod install)
        </Text>
        <Text style={styles.footerText}>
          3. Build configuration matches Podfile ENVFILES mapping
        </Text>
      </View>
    </ScrollView>
  );
};

/**
 * Configuration Row Component
 */
interface IConfigRowProps {
  label: string;
  value: string;
}

const ConfigRow: React.FC<IConfigRowProps> = ({ label, value }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    flex: 1,
    marginRight: 12,
  },
  value: {
    fontSize: 14,
    color: '#000000',
    flex: 2,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default EnvConfigTestScreen;