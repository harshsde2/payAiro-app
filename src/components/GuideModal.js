import React, {useState} from 'react';
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
import {
  SVGAdd2,
  SVGArrow,
  SVGArrow2,
  SVGBamkAdd,
  SVGGuide1,
  SVGNewBank,
  SVGReceive,
} from '../constants/images';
import {setGuide} from '../services/Auth';
import useDispatchAction from '../hooks/useDispatchAction';
import {setGuides} from '../redux/slices/authenticationSlice';

const GuideModal = ({isVisible, onClose, onConfirm}) => {
  const navigation = useNavigation();
  const [steps, setsteps] = useState('1');

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {steps === '2' && (
          <View style={{position: 'absolute', top: 320}}>
            <SvgXml
              xml={SVGAdd2}
              style={{alignSelf: 'flex-end', marginTop: 20, marginRight: 15}}
            />
            <SvgXml
              xml={SVGArrow}
              style={{alignSelf: 'center', marginTop: 20}}
            />
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                marginHorizontal: 70,
                marginTop: 50,
              }}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device{' '}
            </Text>
          </View>
        )}
        {steps === '1' && (
          <View style={{position: 'absolute', top: 150}}>
            <SvgXml
              xml={SVGGuide1}
              style={{alignSelf: 'center', marginTop: 20}}
            />
            <SvgXml
              xml={SVGArrow}
              style={{alignSelf: 'center', marginTop: 20}}
            />
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                marginHorizontal: 70,
                marginTop: 50,
              }}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device{' '}
            </Text>
          </View>
        )}

        {steps === '3' && (
          <View style={{position: 'absolute', top: 270}}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                marginHorizontal: 70,
                marginTop: 50,
              }}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device{' '}
            </Text>
            <SvgXml
              xml={SVGArrow2}
              style={{alignSelf: 'center', marginTop: 20}}
            />

            <SvgXml
              xml={SVGNewBank}
              style={{alignSelf: 'flex-start', marginTop: 20, marginLeft: 15}}
            />
          </View>
        )}

        {steps === '4' && (
          <View style={{position: 'absolute', top: 320}}>
            <SvgXml
              xml={SVGReceive}
              style={{alignSelf: 'flex-start', marginTop: 20, marginLeft: 100}}
            />
            <SvgXml
              xml={SVGArrow2}
              style={{alignSelf: 'center', marginTop: 20}}
            />

            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                marginHorizontal: 70,
                marginTop: 50,
              }}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device{' '}
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            bottom: 30,
            width: '80%',
          }}>
          {
            <GenericButton
              onPress={async () => {
                if (steps === '3') {
                  await setGuide(true);
                  useDispatchAction(setGuides(true));
                  onClose();
                } else {
                  setsteps((Number(steps) + 1).toString());
                }
              }}
              cStyle={{width: '40%'}}
              title={'Next'}
            />
          }
          {steps !== '4' && (
            <TouchableOpacity>
              <Text
                style={{
                  color: '#fff',
                  textAlign: 'right',
                  fontFamily: Fonts.bold,
                }}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default GuideModal;

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
    height: '50%',
    marginTop: 500,
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
