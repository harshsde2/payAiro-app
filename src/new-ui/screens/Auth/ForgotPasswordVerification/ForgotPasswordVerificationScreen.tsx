import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useDispatch } from 'react-redux';
import { setLogin } from 'redux/slices/authenticationSlice';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { forgotPasswordVerificationStyles } from '@new-ui/styles/screens/auth/forgotPasswordVerificationStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import {
  ForgotPasswordVerificationScreenNavigationProp,
  ForgotPasswordVerificationScreenRouteProp,
} from '@new-ui/screens/Auth/types';

const ForgotPasswordVerificationScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordVerificationScreenNavigationProp>();
  const route = useRoute<ForgotPasswordVerificationScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = forgotPasswordVerificationStyles(theme);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [timer, setTimer] = useState(60);
  const email = route.params?.email || 'email@gmail.com';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    dispatch(setLogin(true));
  };

  const handleResend = () => {
    setTimer(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          Verification
        </CustomText>
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.instructionText}>
          Enter 6-digit verification code and create new M-PIN.
        </CustomText>

        <View style={styles.inputContainer}>
          <CustomText variant="label" style={styles.label}>Email OTP</CustomText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={theme.colors.textSecondary}
              value={otp}
              onChangeText={setOtp}
              secureTextEntry={!showOtp}
              maxLength={6}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={() => setShowOtp(!showOtp)} style={styles.eyeIcon}>
              <CustomText variant="body">{showOtp ? '👁' : '👁'}</CustomText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <CustomText variant="label" style={styles.label}>New PIN</CustomText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={theme.colors.textSecondary}
              value={newPin}
              onChangeText={setNewPin}
              secureTextEntry={!showPin}
              maxLength={4}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.eyeIcon}>
              <CustomText variant="body">{showPin ? '👁' : '👁'}</CustomText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resendContainer}>
          <CustomText variant="bodySmall" color={theme.colors.textSecondary}>
            Resend{' '}
          </CustomText>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <CustomText
              variant="bodySmall"
              color={timer > 0 ? theme.colors.textSecondary : theme.colors.primary}
            >
              {formatTime(timer)}
            </CustomText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <CustomText variant="body" color={theme.colors.white} fontWeight="bold">
            Submit
          </CustomText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordVerificationScreen;

