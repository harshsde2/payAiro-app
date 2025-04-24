import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import Container from '../../HOC/Container';
import Fonts from '../../constants/Fonts';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import { SvgXml } from 'react-native-svg';
import {
  SVGCheckboxChecked,
  SVGChecked,
  SVGUnChecked,
} from '../../constants/images';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../../constants/SCREENS';
import CommonContainer from '../../HOC/CommonContainer';
import { sendOTP } from '../../services/Services';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setSuccessMsg,
} from '../../redux/slices/authenticationSlice';
import PoliticalModal from '../../components/PolitaclModal';

export default function Login() {
  const [phone, setphone] = useState('');
  const [checked, setchecked] = useState(false);
  const [checked1, setchecked1] = useState(false);
  const [checked2, setchecked2] = useState(false);
  const [isvisible, setisvisible] = useState(false);

  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'United States',
    code: '+1',
    flag_image_url: 'https://flagcdn.com/w320/us.png',
  });
  const [email, setemail] = useState('');
  const [isLoading, setisLoading] = useState('');
  const handleRegister = async () => {
    if (!email.trim()) {
      useDispatchAction(setErrorMsg('Fields cannot be empty'));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      useDispatchAction(setErrorMsg('Please enter valid email address'));
      return;
    }
    if (!checked) {
      useDispatchAction(setErrorMsg('Terms & Conditions are required'));
      return;
    }
    console.log({ email: email.toLowerCase() });
    try {
      const data = await sendOTP({ email: email.trim().toLowerCase() });
      console.log(data);
      if (data?.status && data) {
        useDispatchAction(setSuccessMsg('OTP has been sent to email'));
        navigation.navigate(SCREENS.OTP, {
          email,
        });
      } else {
        useDispatchAction(setErrorMsg('Email Address Already Exists'));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <CommonContainer>
      <PoliticalModal
        isVisible={isvisible}
        onConfirm={status => {
          setchecked1(status);
          setisvisible(false);
        }}
        onClose={() => setisvisible(false)}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}>
        <View style={{ width: '80%', alignSelf: 'center' }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              textAlign: 'center',
              fontSize: 36,
            }}>
            Sign In
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            Securely access your crypto portfolio with ease. Simplify login now!
          </Text>
        </View>
        <View style={{ marginVertical: 30 }}>
          {/* <TextInputField
            countryCode={countryCode}
            placeholder={'1234567890'}
            value={phone}
            onChange={setphone}
            onSelected={setcountryCode}
            label="Enter your email or phone no"
          /> */}

          <TextInputField
            placeholder={'joe@gmail.com'}
            value={email}
            onChange={setemail}
            label="Enter your email"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setchecked(state => !state)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
              marginTop: 10,
            }}>
            <TouchableOpacity
              disabled
              style={{
                padding: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >

              <SvgXml
                xml={checked ? SVGChecked : SVGUnChecked}
                // style={{ marginTop: 2, marginRight: 5, }}
                width={15}
                height={15}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: 'rgba(109, 109, 109, 1)',
                fontFamily: Fonts.regular,
                textAlign: 'left',
                fontSize: 12,
              }}>
              By clicking the button you agree with the{' '}
              <Text style={{ color: '#000', fontFamily: Fonts.bold }}>
                terms & conditions and privacy policy
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}

            onPress={() => setisvisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
              marginTop: 10,
            }}>
            <TouchableOpacity
              disabled
              activeOpacity={1}
              style={{
                padding: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SvgXml
                // onPress={() => setisvisible(true)}
                xml={checked1 ? SVGChecked : SVGUnChecked}
                // style={{ marginTop: 2, marginRight: 5 }}
                width={15}
                height={15}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: 'rgba(109, 109, 109, 1)',
                fontFamily: Fonts.regular,
                textAlign: 'left',
                fontSize: 12,

              }}>
              Are you politically exposed person?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setchecked2(state => !state)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
              marginTop: 10,
            }}>
            <TouchableOpacity
              disabled
              activeOpacity={1}
              style={{
                padding: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SvgXml
                xml={checked2 ? SVGChecked : SVGUnChecked}
                // style={{ marginTop: 2, marginRight: 5 }}
                width={15}
                height={15}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: 'rgba(109, 109, 109, 1)',
                fontFamily: Fonts.regular,
                textAlign: 'left',
                fontSize: 12,
              }}>
              by clicking the button you agree with the
              <Text style={{ color: '#000', fontFamily: Fonts.bold }}>
                {` terms & conditions`}
              </Text>
            </Text>
          </TouchableOpacity>
          <GenericButton
            title="Next"
            cStyle={{ marginTop: 35 }}
            onPress={handleRegister}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
