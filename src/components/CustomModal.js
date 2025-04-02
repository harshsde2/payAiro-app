import React, {useEffect, useState} from 'react';
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
import {CARD_TYPE} from '../constants/constant';
import {SvgXml} from 'react-native-svg';
import {SVGCross, SVGCross2, SVGKYC} from '../constants/images';
import {getKYC} from '../services/Services';

const CustomModal = ({isVisible, onClose, onCancel}) => {
  const {biometricAvailable} = useSelectorAction();
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const [enableBiometric, setenableBiometric] = useState(biometricAvailable);
  const navigation = useNavigation();
  return (
    // <Modal visible={isVisible} transparent={true} animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <View style={{width: '70%'}}>
            <Text style={styles.headerText}>
              We are building something exciting for you Stay Tuned!
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.regular,
                color: 'rgba(255, 255, 255, 1)',
                textAlign: 'left',
                marginBottom: 10,
                marginTop: 10,
                opacity: 0.7,
              }}>
              Connection plugin italic overflow invite background text select.{' '}
            </Text>
          </View>

          <SvgXml xml={SVGCross2} onPress={onClose} />
        </View>
      </View>
    </View>
    // </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  modalContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    right: 0,
    left: 0,
    zIndex: 4000,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(44, 106, 63, 1)',
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
    // flexDirection: 'row',
  },

  headerText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: 'white',
    textAlign: 'left',
    // marginBottom: 10,
    // marginTop: 15,
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
