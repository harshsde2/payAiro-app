import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigations/types';
import { NAVIGATION_SCREENS } from '@navigations/navigationConstants';
import { useDispatch } from 'react-redux';
import { setLogin } from '@redux/slices/authenticationSlice';
import { useTheme } from '@styles/ThemeContext';
import { loginStyles } from '@styles/screens/auth/loginStyles';
import CustomText from '@components/common-components/CustomText';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  typeof NAVIGATION_SCREENS.LOGIN
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = loginStyles(theme);
  const [email, setEmail] = useState('');
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);

  const handleProceed = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_VERIFICATION, { email, type: 'login' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <CustomText variant="h4">←</CustomText>
      </TouchableOpacity>

      <View style={styles.header}>
        <CustomText variant="h2" fontWeight="bold">Login Account</CustomText>
      </View>

      <View style={styles.content}>
        <CustomText variant="h3" fontWeight="bold" style={styles.welcomeText}>
          Welcome Back!
        </CustomText>
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.instructionText}>
          Enter your registered email address and M-PIN to login.
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

        <View style={styles.inputContainer}>
          <CustomText variant="label" style={styles.label}>M-PIN</CustomText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={theme.colors.textSecondary}
              value={mpin}
              onChangeText={setMpin}
              secureTextEntry={!showMpin}
              maxLength={4}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={() => setShowMpin(!showMpin)} style={styles.eyeIcon}>
              <CustomText variant="body">{showMpin ? '👁' : '👁'}</CustomText>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.FORGOT_PASSWORD)}
        >
          <CustomText variant="body" color={theme.colors.primary}>
            Forgot Password?
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
          <CustomText variant="body" color={theme.colors.white} fontWeight="bold">
            Proceed
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

export default LoginScreen;
