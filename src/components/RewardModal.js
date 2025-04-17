import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import {SvgXml} from 'react-native-svg';
import Fonts from '../constants/Fonts';
import {SVGCross, SVGDollersRewards} from '../constants/images';
import useSelectorAction from '../hooks/useSelectorAction';
import GenericButton from './GenericButton';

const RewardModal = ({isVisible, onClose}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <SvgXml
          xml={SVGCross}
          style={{alignSelf: 'flex-end', position: 'absolute', top: 20}}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <SvgXml xml={SVGDollersRewards} style={{alignSelf: 'center'}} />

          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.regular,
              color: 'rgba(255, 255, 255, 1)',
              textAlign: 'center',
              marginTop: 30,
            }}>
            A rewarding welcome to the world of effortless finance with PayAiro.{' '}
          </Text>
          <GenericButton
            onPress={onClose}
            title={'Start Exploring'}
            cStyle={{
              borderWidth: 1,
              borderColor: '#fff',
              width: '60%',
              alignSelf: 'center',
              marginVertical: 20,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default RewardModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'transparent',
    width: '90%',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    // height: '40%',
    // marginTop: 500,
    // flex: 1,
    // position: 'absolute',
    borderRadius: 30,
  },

  headerText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'rgba(29, 29, 29, 1)',
    textAlign: 'center',
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
