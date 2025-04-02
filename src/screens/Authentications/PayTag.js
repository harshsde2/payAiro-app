import {View, Text} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import Fonts from '../../constants/Fonts';
import UploadFile from '../../components/UploadFile';
import SignaturePad from '../../components/SignaturePad';
import useDispatchAction from '../../hooks/useDispatchAction';
import {setUserData} from '../../redux/slices/authenticationSlice';
import {patchKyc} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {setToken, setUser} from '../../services/Auth';

export default function PayTag(props) {
  const {payload4} = props.route.params;
  const {tokens, userData} = useSelectorAction();

  const [isVisible, setisVisible] = useState(false);
  const [name, setname] = useState('');

  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const [username, setUserName] = useState('');
  const handlePayTag = async () => {
    console.log(payload4, 'payload');
    const formData = new FormData();
    formData.append('city', payload4?.city);
    formData.append('name', payload4?.name);
    formData.append('state', payload4?.state);
    formData.append('street_address', payload4?.street_address);
    formData.append('zip_code', payload4?.zip_code);
    formData.append('country', payload4?.countryCode?.country);
    formData.append('poi_id', '');
    formData.append('poi_doc', payload4?.idProof1[0]);
    formData.append('mobile_number', userData?.mobile_number);
    formData.append('selfimage', {});
    formData.append('step_count', 0);
    formData.append('address_pov', payload4?.idProof2[0]);
    formData.append('email', userData?.email);
    formData.append('signature', payload4?.signature[0]);
    formData.append('usernames', username);
    console.log(formData, 'formData');
    const datas = await patchKyc(datas, tokens?.access, true);
    console.log(datas, tokens, true);
    if (datas) {
      setUser(datas?.data);
      setToken(tokens);
      useDispatchAction(setUserData(datas?.data));
      navigation.navigate(SCREENS.Pincode);
    }
  };
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
            Choose a $Paytag
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            Incorrect date of birth will impact access to most features on
            Airpay App.{' '}
          </Text>
        </View>
        <View style={{marginVertical: 40}}>
          <TextInputField
            placeholder={'Enter card number'}
            label={'Yourname@crypto.com'}
            value={username}
            onChange={setUserName}
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
