import React, {useEffect, useState} from 'react';
import {
  Image,
  Modal,
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
import {SvgXml} from 'react-native-svg';
import {SVGWith} from '../constants/images';
import {getBalanceCrypto} from '../services/Services';
import useSelectorAction from '../hooks/useSelectorAction';

const WithdrawModal = ({isVisible, onClose, onCancel}) => {
  const navigation = useNavigation();
  const {tokens} = useSelectorAction();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: Fonts.bold,
              color: 'black',
              textAlign: 'left',
              marginVertical: 10,
            }}>
            Select Method
          </Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChooseCurrency');
              onClose();
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <SvgXml xml={SVGWith} />
            <View style={{marginLeft: 10}}>
              <Text
                style={{
                  color: 'black',
                  fontFamily: Fonts.semibold,
                  fontSize: 16,
                }}>
                Withdraw
              </Text>
              <Text
                style={{
                  color: 'rgba(106, 106, 106, 1)',
                  fontFamily: Fonts.regular,
                  fontSize: 12,
                }}>
                Send to a known crypto address via crypto network
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChooseCurrency');
              onClose();
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <SvgXml xml={SVGWith} />
            <View style={{marginLeft: 10}}>
              <Text
                style={{
                  color: 'black',
                  fontFamily: Fonts.semibold,
                  fontSize: 16,
                }}>
                Sell Crypto
              </Text>
              <Text
                style={{
                  color: 'rgba(106, 106, 106, 1)',
                  fontFamily: Fonts.regular,
                  fontSize: 12,
                }}>
                Sell cryoto to your Financial account{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WithdrawModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    height: '40%',
    marginTop: 550,
    flex: 1,
  },
  headerText: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: 'rgba(29, 29, 29, 1)',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
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
