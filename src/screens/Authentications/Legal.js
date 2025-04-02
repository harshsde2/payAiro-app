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
import {setKycStep} from '../../services/Auth';

export default function Legal(props) {
  const {payload3} = props.route.params;

  const [isVisible, setisVisible] = useState(false);
  const [name, setname] = useState('');

  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const [legalName, setlegalName] = useState('');
  const handleLegal = async () => {
    const payload4 = {
      ...payload3,
      name: name + ' ' + legalName,
    };
    await setKycStep('4');
    console.log(payload4);
    navigation.navigate(SCREENS.Dob, {
      payload4,
    });
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
            What's your legal name?{' '}
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
          <TextInputField
            placeholder={'John'}
            label={'Legal first name'}
            value={name}
            onChange={setname}
          />
          <TextInputField
            placeholder={'Wick'}
            label={'Legal last name'}
            value={legalName}
            onChange={setlegalName}
          />

          <GenericButton
            title="Next"
            cStyle={{marginTop: 25}}
            onPress={() => handleLegal()}
          />
          <GenericButton
            title={'Skip'}
            cStyle={{backgroundColor: '#000', marginVertical: 10}}
            tStyle={{color: 'white'}}
            onPress={() => handleLegal()}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
