import React, {useState, useEffect} from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Fonts from '../constants/Fonts';
import GenericButton from './GenericButton';
import {SCREENS} from '../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import ReactNativeBiometrics from 'react-native-biometrics';
import useSelectorAction from '../hooks/useSelectorAction';
import {setBiometricAvailable} from '../redux/slices/authenticationSlice';
import useDispatchAction from '../hooks/useDispatchAction';
import {setBiometric, getBiometric} from '../services/Auth';

const BiometricModal = ({isVisible, onClose, onCancel}) => {
  const {biometricAvailable} = useSelectorAction();
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [enableBiometric, setenableBiometric] = useState(biometricAvailable);
  const [currentBiometricStatus, setCurrentBiometricStatus] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkCurrentBiometricStatus();
    }
  }, [isVisible]);

  const checkCurrentBiometricStatus = async () => {
    try {
      const biometricData = await getBiometric();
      setCurrentBiometricStatus(biometricData === true);
    } catch (error) {
      console.log('Error getting biometric status:', error);
      setCurrentBiometricStatus(false);
    }
  };
  const checkBiometrics = async (action) => {
    try {
      const {biometryType, available} = await rnBiometrics.isSensorAvailable();
      if (available) {
        if (biometryType) {
          console.log(biometryType, 'biometryType');
          await authenticateWithBiometrics(action);
        } else {
          Alert.alert('Biometric Not Available', 'Please enable biometric authentication in your device settings', [
            {title: 'Cancel', onPress: () => console.log('ok')},
            {title: 'Settings', onPress: () => openSettings()},
          ]);
        }
      } else {
        Alert.alert('Biometric Not Available', 'Please enable biometric authentication in your device settings', [
          {title: 'Cancel', onPress: () => console.log('ok')},
          {title: 'Settings', onPress: () => openSettings()},
        ]);
      }
    } catch (error) {
      Alert.alert('Biometric Not Available', 'Please enable biometric authentication in your device settings', [
        {title: 'Cancel', onPress: () => console.log('ok')},
        {title: 'Settings', onPress: () => openSettings()},
      ]);
    }
  };

  const authenticateWithBiometrics = async (action) => {
    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: `Authenticate to ${action} App Lock`,
      });

      if (success) {
        const newStatus = action === 'Enable' ? true : false;
        console.log('Biometric authentication successful', newStatus);
        setenableBiometric(newStatus);
        setBiometric(newStatus);
        useDispatchAction(setBiometricAvailable(newStatus));
        onCancel();
        Alert.alert(
          'Success',
          `App Lock ${action.toLowerCase()}d successfully`,
          [{title: 'OK', onPress: () => console.log('ok')}]
        );
      } else {
        Alert.alert('Authentication Failed', 'Please try again', [
          {title: 'OK', onPress: () => console.log('ok')},
        ]);
      }
    } catch (error) {
      Alert.alert('Authentication Failed', 'Please try again', [
        {title: 'OK', onPress: () => console.log('ok')},
      ]);
    }
  };

  const handleDisableBiometric = async () => {
    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to Disable App Lock',
      });

      if (success) {
        console.log('Biometric authentication successful for disable');
        setenableBiometric(false);
        setBiometric(false);
        useDispatchAction(setBiometricAvailable(false));
        onCancel();
        Alert.alert(
          'Success',
          'App Lock disabled successfully',
          [{title: 'OK', onPress: () => console.log('ok')}]
        );
      } else {
        Alert.alert('Authentication Failed', 'Please try again', [
          {title: 'OK', onPress: () => console.log('ok')},
        ]);
      }
    } catch (error) {
      Alert.alert('Authentication Failed', 'Please try again', [
        {title: 'OK', onPress: () => console.log('ok')},
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
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.headerText}>
            App Lock Settings
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: Fonts.medium,
              color: '#333',
              textAlign: 'center',
              marginBottom: 10,
            }}>
            Current Status: {currentBiometricStatus ? 'Enabled' : 'Disabled'}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.regular,
              color: 'grey',
              textAlign: 'center',
              marginBottom: 20,
            }}>
            {currentBiometricStatus 
              ? 'App Lock is currently enabled. You can disable it by authenticating.'
              : 'Enable App Lock to secure your app with biometric authentication.'
            }
          </Text>
          <View style={{flexDirection: 'row'}}>
            <GenericButton
              title={`Cancel`}
              cStyle={{marginTop: 25, width: '30%', marginRight: 5}}
              onPress={() => {
                onCancel();
              }}
            />
            {currentBiometricStatus ? (
              <GenericButton
                title={'Disable'}
                cStyle={{backgroundColor: '#ff4444', marginTop: 25, width: '65%'}}
                tStyle={{color: 'white'}}
                onPress={handleDisableBiometric}
              />
            ) : (
              <GenericButton
                title={'Enable'}
                cStyle={{backgroundColor: '#000', marginTop: 25, width: '65%'}}
                tStyle={{color: 'white'}}
                onPress={() => checkBiometrics('Enable')}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BiometricModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    // height: '40%',
    // marginTop: 500,
    // flex: 1,
    position: 'absolute',
    borderRadius: 30,
  },

  headerText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'rgba(29, 29, 29, 1)',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#333',
    marginVertical: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 5,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: '#4F378B',
    borderColor: '#4F378B',
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 10,
    flex: 0.4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
  applyButton: {
    backgroundColor: '#4F378B',
    padding: 10,
    borderRadius: 10,
    flex: 0.4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
});
