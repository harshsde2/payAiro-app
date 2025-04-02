import {View, Text, Alert} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import Fonts from '../../constants/Fonts';
import {setKycStep, setWalletDataAuth} from '../../services/Auth';
import {getWallet, patchKyc} from '../../services/Services';
import {
  setErrorMsg,
  setLogin,
  setSuccessMsg,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import useDispatchAction from '../../hooks/useDispatchAction';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useDispatch} from 'react-redux';

export default function Address2() {
  const navigation = useNavigation();
  const {tokens} = useSelectorAction();

  // States for input fields
  const [residentialAddress, setResidentialAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [countryCode, setCountryCode] = useState({
    country: 'United States',
    code: '+1',
    flag_image_url: 'https://flagcdn.com/w320/us.png',
  });
  const [postalCode, setPostalCode] = useState('');
  const handleInputChange = setter => value => {
    setter(value);
  };

  const handleNext = async () => {
    if (
      !city.trim() ||
      !state.trim() ||
      !residentialAddress.trim() ||
      !postalCode.trim()
    ) {
      useDispatchAction(setErrorMsg('Fields cannot be empty!'));
      return;
    }
    const formData = new FormData();
    formData.append('city', city);
    formData.append('state', state);
    formData.append('street_address', residentialAddress);
    formData.append('zip_code', postalCode);
    formData.append('country', countryCode?.country);
    formData.append('step_count', '1');

    console.log(formData, 'formData');
    console.log(formData);
    const datas = await patchKyc(formData, tokens?.access, true);
    console.log('datatata', datas);
    if (datas) {
      await setKycStep('1');
      navigation.navigate('IDProof2');
      useDispatchAction(setSuccessMsg('Address Updated Successfully'));
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

    setTimeout(() => {
      navigation.replace('Dashboard');
    }, 1000);
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };
  return (
    <CommonContainer style={{marginVertical: 30}}>
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
            Address Details
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            Clip follower flows vector scale.
          </Text>
        </View>
        <View style={{marginVertical: 40}}>
          <TextInputField
            label="Residential Address"
            placeholder="Residential Address"
            value={residentialAddress}
            onChange={handleInputChange(setResidentialAddress)}
          />
          <TextInputField
            label="City/Town"
            placeholder="City/Town"
            value={city}
            onChange={handleInputChange(setCity)}
          />
          <TextInputField
            label="State"
            placeholder="State"
            value={state}
            onChange={handleInputChange(setState)}
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
              onChange={handleInputChange(setCountryCode)}
              cStyle={{width: '48%'}}
              onSelected={setCountryCode}
              isCountry={true}
            />
            <TextInputField
              label="Postal Code"
              placeholder="Postal Code"
              value={postalCode}
              onChange={handleInputChange(setPostalCode)}
              cStyle={{width: '48%'}}
            />
          </View>
          <GenericButton
            title="Next"
            cStyle={{marginTop: 45}}
            onPress={handleNext}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
