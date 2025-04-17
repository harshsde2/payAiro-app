import {View, Text, TouchableOpacity, Alert} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import Fonts from '../../constants/Fonts';
import UploadFile from '../../components/UploadFile';
import SignaturePad from '../../components/SignaturePad';
import useSelectorAction from '../../hooks/useSelectorAction';
import {getWallet, patchKyc} from '../../services/Services';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setLogin,
  setSuccessMsg,
  setUserData,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {
  setKycStep,
  setToken,
  setUser,
  setWalletDataAuth,
} from '../../services/Auth';
import {useDispatch} from 'react-redux';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';

export default function Dob2(props) {
  // const {payload4} = props.route.params;
  const {tokens, userData} = useSelectorAction();
  const [isVisible, setisVisible] = useState(false);
  const [name, setname] = useState('');

  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const [date, setdate] = useState('');
  // const handleDob = async () => {
  //   navigation.navigate(SCREENS.PayTag, {
  //     payload4,
  //   });
  // };
  const [open, setOpen] = useState(false);
  const handlePayTag = async () => {
    if (date.length === 0) {
      useDispatchAction(setErrorMsg('Date of birth are Required!'));
      return;
    }
    const formData = new FormData();
    formData.append('poi_id', '12333');
    formData.append('name', 'Rahul');
    const datas = await patchKyc(formData, tokens?.access, true);
    console.log(datas, 'datats');
    if (datas) {
      useDispatchAction(setSuccessMsg('KYC Submitted Successfully'));
      navigation.navigate(NAVIGATION_SCREENS.NEW_DASHBOARD);
    } else {
      useDispatchAction(setErrorMsg('Something went wrong'));
    }
  };
  const dispatch = useDispatch();

  const getWalletDetails = async accessToken => {
    const data = await getWallet(tokens?.access);
    dispatch(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };
  // const handlePayTag = async () => {
  //   console.log(payload4, 'payload');
  //   const formData = new FormData();
  //   formData.append('city', payload4?.city);
  //   formData.append('name', payload4?.name);
  //   formData.append('state', payload4?.state);
  //   formData.append('street_address', payload4?.street_address);
  //   formData.append('zip_code', payload4?.zip_code);
  //   formData.append('country', payload4?.countryCode?.country);
  //   formData.append('poi_id', '');
  //   formData.append('poi_doc', payload4?.idProof1[0]);
  //   formData.append('mobile_number', userData?.mobile_number);
  //   formData.append('selfimage', {});
  //   formData.append('step_count', 0);
  //   formData.append('address_pov', payload4?.idProof2[0]);
  //   formData.append('email', userData?.email);
  //   formData.append('signature', payload4?.signature[0]);
  //   console.log(formData, 'formData');
  //   const datas = await patchKyc(formData, tokens?.access, true);
  //   console.log(datas, tokens, true);
  //   if (datas) {
  //     setUser(datas?.data);
  //     await setKycStep('5');

  //     setToken(tokens);
  //     useDispatchAction(setUserData(datas?.data));
  //     navigation.navigate(SCREENS.Pincode);
  //   }
  // };
  return (
    <CommonContainer style={{marginVertical: 130}}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}>
        <View style={{width: '80%', alignSelf: 'center'}}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              textAlign: 'center',
              fontSize: 30,
            }}>
            What's your date of birth.
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            This should match the name on your government ID.
          </Text>
        </View>
        <View style={{marginVertical: 40}}>
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{
              borderRadius: 30,
              borderWidth: 1,
              borderColor: '#6A6A6A33',
              padding: 15,
            }}>
            <Text
              style={{
                paddingRight: 10,
                paddingLeft: 15,
                fontFamily: Fonts.semibold,
                width: '90%',
                color: '#6A6A6A',
              }}>
              {date === ''
                ? ' MM/DD/YY'
                : moment(date ?? new Date()).format('MM/DD/YY')}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            mode="date"
            open={open}
            date={new Date()}
            onConfirm={date => {
              setOpen(false);
              setdate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
          <GenericButton
            title="Next"
            cStyle={{marginTop: 25}}
            onPress={() => handlePayTag()}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
