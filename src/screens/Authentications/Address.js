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
import Loader from '../../components/Loader';

export default function Address() {
  const navigation = useNavigation();
  const {tokens} = useSelectorAction();
  const [spin, setspin] = useState(false);

  // States for input fields
  const [residentialAddress, setResidentialAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [locality, setLocality] = useState('');

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
      !postalCode.trim() ||
      !locality.trim()
    ) {
      useDispatchAction(setErrorMsg('Fields cannot be empty!'));
      return;
    }
    if (postalCode?.length < 5) {
      useDispatchAction(
        setErrorMsg('Postal Code cannot be less than 5 digit!'),
      );
      return;
    }
    try {
      setspin(true);
      const formData = new FormData();
      formData.append('city', city);
      formData.append('state', state);
      formData.append('street_address', residentialAddress);
      formData.append('zip_code', postalCode);
      formData.append('country', 'US');
      formData.append('step_count', '1');
      formData.append('address2', locality);

      console.log(formData, 'formData');
      console.log(formData);

      navigation.navigate(SCREENS.IDProof, {
        payload: {
          city,
          state,
          residentialAddress,
          postalCode,
          countryCode,
          locality,
        },
      });
      setspin(false);
      return;
      const datas = await patchKyc(formData, tokens?.access, true);
      console.log('datatata', datas);
      if (datas) {
        await setKycStep('1');
        navigation.navigate(SCREENS.IDProof);
        useDispatchAction(setSuccessMsg('Address Updated Successfully'));
      } else {
        useDispatchAction(setErrorMsg('Something went wrong'));
      }
      setspin(false);
    } catch (error) {
      setspin(false);
      console.log(error);
      useDispatchAction(setErrorMsg('Something went wrong'));
    }
    setspin(false);
  };
  const dispatch = useDispatch();
  const getWalletDetails = async accessToken => {
    const data = await getWallet(tokens?.access);
    dispatch(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };
  return (
    <CommonContainer style={{marginVertical: 30}}>
      <Loader spin={spin} />
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
            label="Locality"
            placeholder="Locality"
            value={locality}
            onChange={handleInputChange(setLocality)}
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
              keyboardType="numeric"
              placeholder="Postal Code"
              value={postalCode}
              onChange={handleInputChange(setPostalCode)}
              cStyle={{width: '48%'}}
              maxLength={5}
            />
          </View>
          <GenericButton
            title="Next"
            cStyle={{marginTop: 45}}
            onPress={handleNext}
          />
          {/* <GenericButton
            title={'Skip'}
            cStyle={{backgroundColor: '#000', marginVertical: 10}}
            tStyle={{color: 'white'}}
            onPress={getWalletDetails}
          /> */}
        </View>
      </View>
    </CommonContainer>
  );
}
