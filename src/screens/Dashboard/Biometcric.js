import {View, Text, Linking, Platform} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import ReactNativeBiometrics from 'react-native-biometrics';
import {setBiometric} from '../../services/Auth';
import {setBiometricAvailable} from '../../redux/slices/authenticationSlice';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useNavigation} from '@react-navigation/native';
import useDispatchAction from '../../hooks/useDispatchAction';

export default function Biometcric() {
  const {biometricAvailable} = useSelectorAction();
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const navigation = useNavigation();
  const [enableBiometric, setenableBiometric] = useState(biometricAvailable);
  const checkBiometrics = async val => {
    try {
      const {biometryType, available} = await rnBiometrics.isSensorAvailable();
      if (available) {
        if (biometryType) {
          console.log(biometryType, 'biometryType');
          await authenticateWithBiometrics(val);
        } else {
          Alert.alert('Enable Biometric', 'Allow Biometric to setup', [
            {title: 'Cancel', onPress: () => console.log('ok')},
            {title: 'Allow', onPress: () => openSettings()},
          ]);
        }
      } else {
        Alert.alert('Enable Biometric', 'Allow Biometric to setup', [
          {title: 'Cancel', onPress: () => console.log('ok')},
          {title: 'Allow', onPress: () => openSettings()},
        ]);
      }
    } catch (error) {
      Alert.alert('Enable Biometric', 'Allow Biometric to setup', [
        {title: 'Cancel', onPress: () => console.log('ok')},
        {title: 'Allow', onPress: () => openSettings()},
      ]);
    }
  };

  const authenticateWithBiometrics = async val => {
    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate With PayAiro',
      });

      if (success) {
        console.log('Biometric authentication successful', val);
        setenableBiometric(val);
        setBiometric(val);
        useDispatchAction(setBiometricAvailable(val));
        navigation.navigate('SuccesScreen');
        // onCfm();
        // Proceed with secure action after successful authentication
      } else {
        Alert.alert('Enable Biometric', 'Allow Biometric to setup', [
          {title: 'Cancel', onPress: () => console.log('ok')},
          {title: 'Allow', onPress: () => openSettings()},
        ]);
      }
    } catch (error) {
      Alert.alert('Enable Biometric', 'Allow Biometric to setup', [
        {title: 'Cancel', onPress: () => console.log('ok')},
        {title: 'Allow', onPress: () => openSettings()},
      ]);
    }
  };
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      // setErrorMessage('Biometric settings not supported on this platform.');
    }
  };
  return (
    <CommonContainer style={{marginTop: 200}}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: Fonts.semibold,
            fontSize: 18,
          }}>
          Enable Your Biometric
        </Text>

        <GenericButton
          title="Enable your biometric"
          cStyle={{marginTop: 45}}
          onPress={checkBiometrics}
        />
        <GenericButton
          title={'Skip'}
          cStyle={{backgroundColor: '#000', marginVertical: 10}}
          tStyle={{color: 'white'}}
          onPress={() => navigation.navigate('SuccesScreen')}
        />
      </View>
    </CommonContainer>
  );
}
