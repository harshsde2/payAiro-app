import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import CommonContainer from '../../HOC/CommonContainer';
import {
  sendOTP,
  verify,
  getKYC,
  getWallet,
  addFcm,
} from '../../services/Services';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setLogin,
  setSuccessMsg,
  setTokens,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import {setToken, setWalletDataAuth} from '../../services/Auth';
import {useDispatch} from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import useSelectorAction from '../../hooks/useSelectorAction';

export default function ConfirmOTP(props) {
  let deviceId = DeviceInfo.getDeviceId();
  const {fcmToken} = useSelectorAction();
  const {email} = props.route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // OTP array
  const inputs = useRef([]); // Refs for the input fields
  const [countdown, setCountdown] = useState(60);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendEnabled(true);
    }
  }, [countdown]);

  const handleResend = () => {
    if (resendEnabled) {
      setCountdown(60);
      setResendEnabled(false);
      resendOTP();
    }
  };

  const handleOtpChange = (text, index) => {
    if (/^[0-9]$/.test(text) || text === '') {
      // Only allow numbers or empty text
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to the next input if a number is entered
      if (text && index < otp.length - 1) {
        inputs.current[index + 1]?.focus();
      }

      // Move to the previous input if backspace is pressed and field is empty
      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace') {
      if (otp[index] === '') {
        // Move to the previous input if current is empty
        if (index > 0) {
          inputs.current[index - 1]?.focus();
        }
      } else {
        // Clear the current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const resendOTP = async () => {
    const data = await sendOTP({email});
    if (data?.status) {
      useDispatchAction(setSuccessMsg('OTP has been sent to email'));
    } else {
      useDispatchAction(setErrorMsg('Something went wrong'));
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setIsVerifying(false);
      useDispatchAction(setErrorMsg('OTP Should Be 6 Digits'));
      return;
    }
    try {
      const data = await verify({email, otp: enteredOtp});
      if (data?.status) {
        const kycData = await getKYC(data?.data?.data?.access);
        console.log(kycData, 'KycData');
        const formData = new FormData();
        formData.append('fcm_token', fcmToken);
        formData.append('device_id', deviceId);
        const fcmData = await addFcm(formData, data?.data?.data?.access);
        useDispatchAction(setTokens(data?.data?.data));
        await setToken(data?.data?.data);

        useDispatchAction(setSuccessMsg('OTP Verified Successfully'));
        if (kycData?.data?.is_varified) {
          getWalletDetails(data?.data?.data?.access);
        } else {
          navigation.navigate(SCREENS.Name, {
            email,
            data: data?.data,
          });
        }
      } else {
        useDispatchAction(setErrorMsg('Invalid OTP. Please Try Again.'));
      }
      setIsVerifying(false);
    } catch (error) {
      console.log(error);
      setIsVerifying(false);
    }
  };

  const getWalletDetails = async accessToken => {
    const data = await getWallet(accessToken);
    dispatch(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <CommonContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm OTP</Text>
        <Text style={styles.subtitle}>
          Enter OTP we just sent to your email address.
        </Text>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((_, index) => (
            <TextInput
              key={index}
              style={[styles.otpInput, otp[index] && styles.otpInputActive]}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={({nativeEvent}) =>
                handleKeyPress(nativeEvent.key, index)
              }
              ref={input => (inputs.current[index] = input)} // Assign ref dynamically
              value={otp[index]}
            />
          ))}
        </View>

        {/* Verify Button */}

        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity
          style={{marginTop: 5, marginBottom: 20}}
          disabled={!resendEnabled}
          onPress={handleResend}>
          <Text style={styles.resendButton}>
            {resendEnabled
              ? 'Resend OTP'
              : `Resend OTP in ${countdown} seconds`}
          </Text>
        </TouchableOpacity>
        <GenericButton
          title={isVerifying ? 'Verifying...' : 'Verify'}
          cStyle={{
            width: '100%',
            backgroundColor: isOtpComplete ? 'rgba(44, 106, 63, 1)' : '#ccc',
          }}
          onPress={handleVerify}
          disabled={!isOtpComplete || isVerifying}
        />
      </View>
    </CommonContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    paddingVertical: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    textAlign: 'center',
    fontSize: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c6c6c',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  otpInputActive: {
    borderColor: '#B1FF84',
    borderWidth: 2,
  },
  resendText: {
    color: '#000',
    fontFamily: Fonts.regular,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 30,
  },
  resendButton: {
    color: '#000',
    fontFamily: Fonts.bold,
  },
});
