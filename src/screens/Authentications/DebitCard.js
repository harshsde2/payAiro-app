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
import {getWallet} from '../../services/Services';
import {
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import {setWalletDataAuth} from '../../services/Auth';
import useDispatchAction from '../../hooks/useDispatchAction';
import { showSuccess } from '../../utils/toast';
import {useDispatch} from 'react-redux';

export default function DebitCard(props) {
  const [isVisible, setisVisible] = useState(false);

  const [name, setname] = useState('');

  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const [idProof1, setidProof1] = useState([]);
  const dispatch = useDispatch();

  const getWalletDetails = async accessToken => {
    const data = await getWallet(tokens?.access);
    dispatch(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    showSuccess('Logged In Successfully');
  };
  return (
    <CommonContainer style={{marginVertical: 80}}>
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
            Debit card Detail
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            Linking an external account allows you to move money in and out of
            your PayAiro App balance.
          </Text>
        </View>
        <View style={{marginVertical: 40}}>
          <TextInputField
            placeholder={'Yourname@crypto.com'}
            label={'Enter card number'}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              marginVertical: 10,
            }}>
            <TextInputField
              label="MM/YY"
              placeholder={'12/28'}
              value={name}
              onChange={setname}
              cStyle={{width: '48%'}}
            />
            <TextInputField
              label="CVV"
              placeholder={'282'}
              value={name}
              onChange={setname}
              cStyle={{width: '48%'}}
            />
          </View>
          <GenericButton
            title="Next"
            cStyle={{marginTop: 25}}
            onPress={() => {
              navigation.navigate(SCREENS.Dob);
            }}
          />
          <GenericButton
            title={'Skip'}
            cStyle={{backgroundColor: '#000', marginVertical: 10}}
            tStyle={{color: 'white'}}
            onPress={getWalletDetails}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
