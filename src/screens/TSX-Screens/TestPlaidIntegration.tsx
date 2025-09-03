import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import { ScreenContainer } from '../../HOC';
import { CustomText } from '../../utils/moduleAlias';
import PlaidLinkButton from '../../tsx-components/PlaidLinkButton';
import { usePlaidLink } from '../../hooks/usePlaidLink';
import { useQueryClient } from '@tanstack/react-query';

const TestPlaidIntegration: React.FC = () => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Example 1: Using the PlaidLinkButton component
  const handleSuccess = () => {
    Alert.alert(
      'Success!',
      'Bank account connected successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Refresh bank accounts data
            queryClient.invalidateQueries({ queryKey: ['bank'] });
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert('Cancelled', 'Bank connection was cancelled by user.');
  };

  // Example 2: Using the usePlaidLink hook
  const { openPlaidLink } = usePlaidLink({
    onSuccess: () => {
      Alert.alert('Success!', 'Bank account connected using hook!');
      queryClient.invalidateQueries({ queryKey: ['bank'] });
    },
    onCancel: () => {
      Alert.alert('Cancelled', 'Bank connection was cancelled.');
    },
  });

  return (
    <ScreenContainer>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <CustomText style={[styles.title, { color: theme.colors.text }]}>
          Plaid Integration Test
        </CustomText>

        <CustomText style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          This screen demonstrates different ways to integrate Plaid Link in your app.
        </CustomText>

        {/* Example 1: Primary Button */}
        <View style={styles.section}>
          <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Primary Button
          </CustomText>
          <PlaidLinkButton
            title="Connect Bank Account (Primary)"
            variant="primary"
            size="large"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            style={styles.button}
          />
        </View>

        {/* Example 2: Outline Button */}
        <View style={styles.section}>
          <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Outline Button
          </CustomText>
          <PlaidLinkButton
            title="+ Add External Bank"
            variant="outline"
            size="medium"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            style={[styles.button, { borderColor: theme.colors.outline }]}
          />
        </View>

        {/* Example 3: Small Button */}
        <View style={styles.section}>
          <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Small Button
          </CustomText>
          <PlaidLinkButton
            title="Link Bank"
            variant="secondary"
            size="small"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            style={styles.button}
          />
        </View>

        {/* Example 4: Using Hook */}
        <View style={styles.section}>
          <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Using usePlaidLink Hook
          </CustomText>
          <CustomText style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            This example uses the usePlaidLink hook instead of the button component.
          </CustomText>
          <PlaidLinkButton
            title="Connect via Hook"
            variant="outline"
            size="medium"
            onPress={openPlaidLink}
            style={[styles.button, { borderColor: theme.colors.outline }]}
          />
        </View>

        {/* Example 5: Disabled State */}
        <View style={styles.section}>
          <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Disabled State
          </CustomText>
          <PlaidLinkButton
            title="Disabled Button"
            variant="primary"
            size="medium"
            disabled={true}
            style={styles.button}
          />
        </View>

        {/* Example 6: Loading State */}
        <View style={styles.section}>
          <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Loading State
          </CustomText>
          <PlaidLinkButton
            title="Loading..."
            variant="primary"
            size="medium"
            loading={true}
            style={styles.button}
          />
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            How to Use
          </CustomText>
          <CustomText style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
            1. Import PlaidLinkButton or usePlaidLink hook
          </CustomText>
          <CustomText style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
            2. Add the component to your screen
          </CustomText>
          <CustomText style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
            3. Handle success/cancel callbacks
          </CustomText>
          <CustomText style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
            4. Refresh your data after successful connection
          </CustomText>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default TestPlaidIntegration;
