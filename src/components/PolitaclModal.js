import React, {useState} from 'react';
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
import {setBiometric} from '../services/Auth';

const PoliticalModal = ({isVisible, onClose, onConfirm}) => {
  const handleLearnMore = async () => {
    const url = 'https://bsaaml.ffiec.gov/manual/RisksAssociatedWithMoneyLaunderingAndTerroristFinancing/20';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
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
            Access Restricted
          </Text>
          <Text style={styles.descriptionText}>
            Based on your selection, you are identified as a Politically Exposed Person (PEP).
            Under U.S. regulatory and AML/BSA policies, Politically Exposed Persons are not permitted to use the PayAiro app at this time.{' '}
            <Text style={styles.linkText} onPress={handleLearnMore}>
              Learn more
            </Text>
          </Text>
          <GenericButton
            title="Close"
            cStyle={{marginTop: 25, width: '100%'}}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

export default PoliticalModal;

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
  descriptionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'grey',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  linkText: {
    color: '#4F378B',
    textDecorationLine: 'underline',
    fontFamily: Fonts.medium,
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
