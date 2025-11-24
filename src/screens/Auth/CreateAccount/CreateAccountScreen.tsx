import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigations/types';
import { NAVIGATION_SCREENS } from '@navigations/navigationConstants';
import { useTheme } from '@styles/ThemeContext';
import { createAccountStyles } from '@styles/screens/auth/createAccountStyles';
import CustomText from '@components/common-components/CustomText';
import { TextInput, Button } from '@components/common-components/layout';
import { AppIcon } from '@assets/svgs';
import ScreenWrapper from '@components/common-components/ScreenWrapper';

type CreateAccountScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  typeof NAVIGATION_SCREENS.CREATE_ACCOUNT
>;

const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = createAccountStyles(theme);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePatriot, setAgreePatriot] = useState(false);

  const handleVerify = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_VERIFICATION, { email, type: 'signup' });
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom', 'left', 'right']}
      scrollable
      contentStyle={styles.content}
    >
      <CustomText variant="h3" fontWeight='semiBold' style={styles.welcomeText}>
        Welcome
      </CustomText>
      <CustomText variant='label' size={14} color={theme.colors.textSecondary} style={styles.instructionText}>
        Enter your name, email address and referral code(if any) to create account.
      </CustomText>

      <View style={styles.inputContainer}>
        <TextInput
          label="Full Name"
          placeholder="e.g. John Carter"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          leftIcon={<AppIcon.Mail />}
          placeholder="e.g. john@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Referral Code (If Any)"
          placeholder="ASD435M-XC"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreeTerms(!agreeTerms)}
        >
          <View style={[styles.checkboxBox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <CustomText variant="body" color={theme.colors.white}>✓</CustomText>}
          </View>
          <CustomText variant="bodySmall" style={styles.checkboxText}>
            I agree with the{' '}
            <CustomText variant="bodySmall" color={theme.colors.primary}>terms & conditions</CustomText>
            {' '}and{' '}
            <CustomText variant="bodySmall" color={theme.colors.primary}>privacy policy</CustomText>
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreePatriot(!agreePatriot)}
        >
          <View style={[styles.checkboxBox, agreePatriot && styles.checkboxChecked]}>
            {agreePatriot && <CustomText variant="body" color={theme.colors.white}>✓</CustomText>}
          </View>
          <CustomText variant="bodySmall" style={styles.checkboxText}>
            By clicking the button you agree with the{' '}
            <CustomText variant="bodySmall" color={theme.colors.primary}>Patriot Act</CustomText>
            {' '}and{' '}
            <CustomText variant="bodySmall" color={theme.colors.primary}>e-Sign Disclosure</CustomText>
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button
        onPress={handleVerify}
        disabled={!agreeTerms || !agreePatriot}
        style={styles.verifyButton}
      >
        Verify
      </Button>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate(NAVIGATION_SCREENS.LOGIN)}
      >
        <CustomText variant="body" color={theme.colors.textSecondary}>
          Already have Account?{' '}
        </CustomText>
        <CustomText variant="body" color={theme.colors.primary} fontWeight="medium">
          Login
        </CustomText>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default CreateAccountScreen;

