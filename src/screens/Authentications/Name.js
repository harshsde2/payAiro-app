import {View, Text, Alert} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import Fonts from '../../constants/Fonts';
import {patchUser} from '../../services/Services';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setSuccessMsg,
  setUserData,
} from '../../redux/slices/authenticationSlice';

export default function Name(props) {
  const {email, data} = props.route.params;

  const [name, setname] = useState('');
  const [uname, setuname] = useState('');
  const [phone, setphone] = useState('');
  const [fname, setfname] = useState('');
  const [lname, setlname] = useState('');

  const [countryCode, setCountryCode] = useState({
    country: 'United States',
    code: '+1',
    flag_image_url: 'https://flagcdn.com/w320/us.png',
  });
  const navigation = useNavigation();
  const handleName = async () => {
    if (fname.length === 0 || uname.length === 0) {
      useDispatchAction(setErrorMsg('Fields cannot be empty'));
      return;
    }
    if (phone.length < 10) {
      useDispatchAction(setErrorMsg('Phone Number Must be 10 digit'));
      return;
    }
    // const payload = {
    //   email,
    //   mobile_number: phone,
    //   name: fname + ' ' + lname,
    //   profile_photo: null,
    //   usernames: uname?.toLowerCase(),
    // };
    const payload = new FormData();
    payload.append('name', fname);
    payload.append('mobile_number', '+1' + phone);
    payload.append('usernames', uname);
    payload.append('lastname', lname);

    try {
      const datas = await patchUser(payload, data?.data?.access, true);

      useDispatchAction(setUserData(datas?.data?.data));
      if (datas && datas?.status) {
        useDispatchAction(
          setSuccessMsg('Name & Payairo Has Been Updated Successfully'),
        );
        navigation.navigate(SCREENS.Address);
      } else {
        useDispatchAction(setErrorMsg('Username Already Exists'));
      }
    } catch (error) {
      console.log(error.data.data.error, 'errorsss');
      useDispatchAction(setErrorMsg(error.data.data.error));
    }
  };

  return (
    <CommonContainer style={{marginVertical: 170}}>
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
            Fill your details
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            Align horizontal select opacity plugin selection reesizing comment
            rectangle text.{' '}
          </Text>
        </View>
        <View style={{marginVertical: 40}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <TextInputField
              label="First Name"
              placeholder={'Your First Name'}
              value={fname}
              cStyle={{width: '48%'}}
              onChange={setfname}
            />
            <TextInputField
              label="Last Name"
              placeholder={'Your Last Name'}
              value={lname}
              cStyle={{width: '48%'}}
              onChange={setlname}
            />
          </View>
          <TextInputField
            label="Payairo Tag"
            placeholder={'Create Payairo Tag'}
            value={uname}
            onChange={setuname}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <TextInputField
              countryCode={countryCode}
              label="Country"
              placeholder="Country"
              value={countryCode.country}
              cStyle={{width: '38%'}}
              // onSelected={setCountryCode}
              isCountry={true}
              editable={true}
            />
            <TextInputField
              label="Phone Number"
              placeholder="Phone Number"
              value={phone}
              onChange={setphone}
              keyboardType="numeric"
              cStyle={{width: '60%'}}
              maxLength={10}
            />
          </View>
          <GenericButton
            title="Next"
            cStyle={{marginTop: 45}}
            // onPress={() => navigation.navigate(SCREENS.Address)}
            onPress={handleName}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
