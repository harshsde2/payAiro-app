import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigations/types';
import { NAVIGATION_SCREENS } from '@navigations/navigationConstants';
import { useTheme } from '@styles/ThemeContext';
import { forgotPasswordStyles } from '@styles/screens/auth/forgotPasswordStyles';
import CustomText from '@components/common-components/CustomText';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  typeof NAVIGATION_SCREENS.FORGOT_PASSWORD
>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = forgotPasswordStyles(theme);
  const [email, setEmail] = useState('');

  const handleVerify = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_VERIFICATION, { email, type: 'forgot' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <CustomText variant="h4">←</CustomText>
      </TouchableOpacity>

      <View style={styles.header}>
        <CustomText variant="h2" fontWeight="bold">Forgot Password</CustomText>
      </View>

      <View style={styles.content}>
        <CustomText variant="h3" fontWeight="bold" style={styles.title}>
          Forgot M-PIN
        </CustomText>
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.instructionText}>
          Enter your registered email address to reset your M-PIN.
        </CustomText>

        <View style={styles.inputContainer}>
          <CustomText variant="label" style={styles.label}>Email</CustomText>
          <View style={styles.inputWrapper}>
            <CustomText variant="body" style={styles.inputIcon}>@</CustomText>
            <TextInput
              style={styles.input}
              placeholder="e.g. john@email.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <CustomText variant="body" color={theme.colors.white} fontWeight="bold">
            Verify
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountLink}
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.CREATE_ACCOUNT)}
        >
          <CustomText variant="body" color={theme.colors.textSecondary}>
            Don't have Account?{' '}
          </CustomText>
          <CustomText variant="body" color={theme.colors.primary} fontWeight="medium">
            Create New
          </CustomText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;

