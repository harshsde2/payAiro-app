import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigations/types';
import { NAVIGATION_SCREENS } from '@navigations/navigationConstants';
import { useDispatch } from 'react-redux';
import { setLogin } from '@redux/slices/authenticationSlice';
import { useTheme } from '@styles/ThemeContext';
import { otpVerificationStyles } from '@styles/screens/auth/otpVerificationStyles';
import CustomText from '@components/common-components/CustomText';

type OTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  typeof NAVIGATION_SCREENS.OTP_VERIFICATION
>;

type OTPVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  typeof NAVIGATION_SCREENS.OTP_VERIFICATION
>;

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = otpVerificationStyles(theme);
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const email = route.params?.email || 'email@gmail.com';
  const type = route.params?.type || 'signup';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (type === 'login' || type === 'signup') {
      dispatch(setLogin(true));
    } else if (type === 'forgot') {
      navigation.navigate(NAVIGATION_SCREENS.FORGOT_PASSWORD_VERIFICATION, { email });
    }
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
        <CustomText variant="h2" fontWeight="bold">OTP Verification</CustomText>
      </View>

      <View style={styles.content}>
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.instructionText}>
          Enter 6-digit verification code, send on {email}
        </CustomText>

        <View style={styles.inputContainer}>
          <CustomText variant="label" style={styles.label}>Email OTP</CustomText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="••••••"
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

export default OTPVerificationScreen;

