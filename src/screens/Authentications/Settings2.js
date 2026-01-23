import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from 'HOC';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import BiometricModal from '../../components/BiometricModal';
import HeaderTitle from '../../components/HeaderTitle';
import Fonts from '../../constants/Fonts';
import { SECURITY_LISTS } from '../../constants/constant';
import {
  SVGLeftArrow,
  SVGRightIcon
} from '../../constants/images';
import useSelectorAction from '../../hooks/useSelectorAction';
import {
  getBiometric,
  getPin,
  setPin
} from '../../services/Auth';
import { getKYC, patchPin } from '../../services/Services';
import { showError, showSuccess } from '../../utils/toast';


export default function Settings2() {
  const {tokens} = useSelectorAction();
  const navigation = useNavigation();
  const [isVisible, setisVisible] = useState(false);
  const {walletData} = useSelectorAction();
  const [kycStep, setkycStep] = useState('');
  const [showPin, setshowPin] = useState(false);
  const [pinTxt, setpinTxt] = useState('Enter your Old Pin');
  const [showPinOld, setshowPinOld] = useState(false);
  const [isConfirm, setisConfirm] = useState(false);
  const [pinOld, setpinOld] = useState('');
  const [biometricStatus, setBiometricStatus] = useState(false);

  const kycStatus = useSelector((s) => s.authenticationSlice?.kycStatus);

  console.log(kycStatus, 'kycStatus');
  useEffect(() => {
    getkycStep();
    getBiometricStatus();
  }, []);

  const getBiometricStatus = async () => {
    try {
      const biometricData = await getBiometric();
      setBiometricStatus(biometricData === true);
    } catch (error) {
      console.log('Error getting biometric status:', error);
      setBiometricStatus(false);
    }
  };

  const getkycStep = async () => {
    const kycData = await getKYC(tokens?.access);
    if (kycData?.data?.step_count) {
      setkycStep(kycData?.data?.step_count?.toString());
    }
  };
  return (
    <ScreenContainer padding={0} >
      <BiometricModal
        isVisible={isVisible}
        onCancel={() => {
          setisVisible(false);
          getBiometricStatus(); // Refresh status when modal closes
        }}
        onClose={() => console.log('object')}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <HeaderTitle title="Security & Privacy" leftIcon={SVGLeftArrow} />
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}>
            <Text
              style={{
                color: '#000',
                marginLeft: 10,
                fontFamily: Fonts.bold,
                fontSize: 26,
                marginBottom: 20,
              }}>
              Settings
            </Text>

            {SECURITY_LISTS.map((i, k) => (
              <TouchableOpacity
                key={k}
                onPress={() => {
                  if (i.name === 'App Lock') {
                    setisVisible(true);
                    return;
                  }
                  if (i.name === 'Change Pin') {
                    if(kycStatus?.state === 'approved' || kycStatus?.status == true) {
                      navigation.navigate(NAVIGATION_SCREENS.CHANGE_PIN_SCREEN);
                    } else {
                      showError('KYC is Pending');
                    }
                    return;
                  }
                  if (i.name === 'Forgot Pin') {
                    navigation.navigate(NAVIGATION_SCREENS.FORGOT_PIN_SCREEN);
                    return;
                  }
                  if (i.name === 'Transaction Pin') {
                    setshowPinOld(true);
                    return;
                  }
                  if (i.name === 'KYC' && kycStep !== '4') {
                    let route = '';
                    switch (kycStep) {
                      case '1':
                        route = 'Address2';
                        break;
                      case '2':
                        route = 'Signature2';
                        break;
                      case '3':
                        route = 'Dob2';
                        break;
                      default:
                        break;
                    }
                    navigation.navigate(route);
                    return;
                  }
                  navigation.navigate(i.route);
                }}
                style={{
                  borderRadius: 40,
                  borderWidth: 1,
                  backgroundColor: 'rgba(217, 217, 217, 0.07)',
                  borderColor: 'rgba(106, 106, 106, 0.08)',
                  padding: -10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginVertical: 5,
                  marginBottom: i.name === 'Logout' ? 100 : 5,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    margin: 10,
                  }}>
                  <SvgXml xml={i.icon} />
                  <Text
                    style={{
                      color: 'rgba(29, 29, 29, 1)',
                      marginLeft: 10,
                      fontSize: 16,
                      fontFamily: Fonts.regular,
                    }}>
                    {i?.name}
                  </Text>
                </View>
                {i?.name === 'KYC' ? (
                  <Text
                    style={{
                      textAlign: 'right',
                      fontFamily: Fonts.bold,
                      marginLeft: 40,
                      color: kycStep === '4' ? 'green' : 'orange',
                    }}>
                    {kycStep === '4' ? 'Verified' : 'Pending'}
                  </Text>
                ) : i?.name === 'App Lock' ? (
                  <Text
                    style={{
                      textAlign: 'right',
                      fontFamily: Fonts.bold,
                      marginLeft: 40,
                      color: biometricStatus ? 'green' : 'grey',
                    }}>
                    {biometricStatus ? 'Enabled' : 'Disabled'}
                  </Text>
                ) : null}
                <SvgXml xml={SVGRightIcon} style={{marginRight: 20}} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {showPinOld ? (
          <PincodeScreen
            pinTxt={pinTxt}
            onPress={async (e, f) => {
              const pin = await getPin();
              if (pin === e) {
                setshowPinOld(false);
                setpinTxt('Create your pin');
                setpinOld(e);
                setshowPin(true);
              } else {
                showError('Old Pin not matched , Try Again');
              }
            }}
          />
        ) : null}
        {showPin && (
          <Pincode2
            pinTxt={pinTxt}
            onPress={async (e, f) => {
              setshowPin(false);
              console.log(f, 'fffffff');
              if (!f) {
                if (e !== isConfirm) {
                  showError('Pin not matched , Try Again');
                  setpinTxt('Confirm your pin');
                  setshowPin(true);
                  return;
                }
                const formData = new FormData();
                formData.append('new_pin', e);
                formData.append('old_pin', pinOld);
                const data = await patchPin(formData, tokens?.access);
                console.log(data, 'datata');
                if (data && data?.status) {
                  setPin(e);
                  setshowPin(false);
                  setpinTxt('Enter your Old Pin');
                  showSuccess('Transaction Pin updated successfully');
                } else {
                  showError('Something Went Wrong');
                }
              } else {
                setisConfirm(e);
                setpinTxt('Confirm Your Pin');
                setshowPin(f);
              }
            }}
          />
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

export const styles = StyleSheet.create({
  circle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#000',
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
