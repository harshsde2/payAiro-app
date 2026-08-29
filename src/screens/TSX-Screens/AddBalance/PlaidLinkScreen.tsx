import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  LinkIOSPresentationStyle,
  LinkLogLevel,
  create,
  dismissLink,
  open,
} from 'react-native-plaid-link-sdk';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { usePlaidLinkToken, usePlaidAccessToken } from '../../../query/hooks/useBank';
import { PlaidLinkSuccess, PlaidLinkExit } from '../../../api/types';
import { ScreenContainer } from '../../../HOC';
import { CustomText } from '../../../utils/moduleAlias';
import CommonModal from '../../../tsx-components/modals/CommonModal';

interface PlaidLinkScreenProps {
  route?: {
    params?: {
      onSuccess?: () => void;
      onCancel?: () => void;
    };
  };
}

const PlaidLinkScreen: React.FC<PlaidLinkScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Query hooks
  const { data: linkTokenData, isLoading: isTokenLoading, error: tokenError, refetch } = usePlaidLinkToken();
  const { mutate: exchangeToken, isPending: isExchanging } = usePlaidAccessToken();

  const onSuccess = useCallback((publicToken: PlaidLinkSuccess) => {
    console.log('Plaid Link Success:', publicToken);

    try {
      // Parse the metadataJson string
      const metadata = publicToken?.metadata;
      const metadataJson = metadata?.metadataJson
        ? JSON.parse(metadata.metadataJson)
        : null;

      if (!metadataJson) {
        console.error('Invalid metadataJson structure');
        Alert.alert('Error', 'Invalid account data received');
        return;
      }

      const accountId = metadataJson?.account_id;
      console.log('Extracted Account ID:', accountId);
      console.log('Public Token ID:', publicToken.publicToken);

      if (!accountId) {
        Alert.alert('Error', 'No account ID found in response');
        return;
      }

      // Exchange public token for access token with additional collective details
      exchangeToken(
        {
          plaid_public_token: publicToken.publicToken,
          plaid_account_id: accountId,
          name: "plaid cybrid", // Default name as requested
        },
        {
          onSuccess: (response) => {
            console.log('Access token and collective details sent successfully:', response);
            Alert.alert(
              'Success',
              'Bank account connected successfully!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    dismissLink();
                    route?.params?.onSuccess?.();
                    navigation.goBack();
                  },
                },
              ]
            );
          },
          onError: (error) => {
            console.error('Error exchanging token and sending collective details:', JSON.stringify(error, null, 2));
            Alert.alert(
              'Error',
              'Failed to connect bank account. Please try again.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    dismissLink();
                    navigation.goBack();
                  },
                },
              ]
            );
          },
        }
      );
    } catch (error) {
      console.error('Error processing Plaid response:', error);
      Alert.alert('Error', 'Failed to process bank account data');
    }
  }, [exchangeToken, navigation, route?.params?.onSuccess]);

  const onExit = useCallback((exit: PlaidLinkExit) => {
    console.log('Plaid Link Exit:', exit);
    
    if (exit.error) {
      Alert.alert('Error', exit.error.display_message || 'An error occurred');
    }
    
    dismissLink();
    navigation.goBack();
  }, [navigation]);

  const handleOpenPlaidLink = useCallback(() => {
    if (!linkTokenData?.data?.plaid_link_token) {
      Alert.alert('Error', 'No link token available');
      return;
    }

    const config = {
      token: linkTokenData.data.plaid_link_token,
      onSuccess,
      onExit,
      iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
      logLevel: LinkLogLevel.ERROR,
    };

    try {
      create(config as any);
      open(config as any);
    } catch (error) {
      console.error('Error opening Plaid Link:', error);
      Alert.alert('Error', 'Failed to open bank selection');
    }
  }, [linkTokenData, onSuccess, onExit]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCancel = useCallback(() => {
    route?.params?.onCancel?.();
    navigation.goBack();
  }, [navigation, route?.params?.onCancel]);

  // Show loading state while fetching token
  if (isTokenLoading) {
    return (
      <ScreenContainer>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.background} />
          <CustomText style={[styles.loadingText, { color: theme.colors.text }]}>
            Preparing bank connection...
          </CustomText>
        </View>
      </ScreenContainer>
    );
  }

  // Show error state if token fetch failed
  if (tokenError) {
    return (
      <ScreenContainer>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <CustomText style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Failed to prepare bank connection
          </CustomText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.background }]}
            onPress={handleRetry}
          >
            <CustomText style={[styles.buttonText, { color: theme.colors.text }]}>
              Retry
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={handleCancel}
          >
            <CustomText style={[styles.cancelButtonText, { color: theme.colors.border }]}>
              Cancel
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <CustomText style={[styles.title, { color: theme.colors.text }]}>
            Connect Your Bank Account
          </CustomText>
          
          <CustomText style={[styles.description, { color: theme.colors.textSecondary }]}>
            Securely connect your bank account using Plaid to enable transfers and view your balance.
          </CustomText>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <CustomText style={[styles.featureText, { color: theme.colors.text }]}>
                • Secure bank-level encryption
              </CustomText>
            </View>
            <View style={styles.featureItem}>
              <CustomText style={[styles.featureText, { color: theme.colors.text }]}>
                • Read-only access to your accounts
              </CustomText>
            </View>
            <View style={styles.featureItem}>
              <CustomText style={[styles.featureText, { color: theme.colors.text }]}>
                • Support for 11,000+ financial institutions
              </CustomText>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.connectButton,
              { backgroundColor: theme.colors.background },
              isExchanging && styles.disabledButton
            ]}
            onPress={handleOpenPlaidLink}
            disabled={isExchanging}
          >
            {isExchanging ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <CustomText style={[styles.buttonText, { color: theme.colors.text }]}>
                Connect Bank Account
              </CustomText>
            )}
          </TouchableOpacity>

          {isExchanging && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
              <CustomText style={[styles.processingText, { color: theme.colors.textSecondary }]}>
                Connecting your bank account...
              </CustomText>
            </View>
          )}

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={handleCancel}
          >
            <CustomText style={[styles.cancelButtonText, { color: theme.colors.border }]}>
              Cancel
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
  connectButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default PlaidLinkScreen;
