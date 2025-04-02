import React, {useState} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Fonts from '../constants/Fonts';
import GenericButton from './GenericButton';
import {SCREENS} from '../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import useSelectorAction from '../hooks/useSelectorAction';
import AssetsCards from './AssetsCards';
import useDispatchAction from '../hooks/useDispatchAction';
import {
  setDefaultValue,
  setSeletedCrypto,
} from '../redux/slices/authenticationSlice';
import {SvgXml} from 'react-native-svg';
import {SVGUSD} from '../constants/images';

const SelectionModal = ({isVisible, onClose, onSelected, data, type}) => {
  const {bankBalance} = useSelectorAction();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    useDispatchAction(setDefaultValue(isEnabled));
  };
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
              fontSize: 18,
              fontFamily: Fonts.bold,
              color: '#000',
              textAlign: 'center',
              marginBottom: 40,
            }}>
            Select Your Bank
          </Text>
          <ScrollView>
            {data &&
              data.length > 0 &&
              data.map((item, key) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelected(item);
                    onClose();
                  }}
                  key={key}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    backgroundColor: 'rgba(217, 217, 217, 0.07)',
                    borderWidth: 1,
                    borderColor: 'rgba(106, 106, 106, 0.08)',
                    borderRadius: 10,
                    padding: 10,
                    margin: 5,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                    <SvgXml xml={SVGUSD} width={40} height={40} />
                    <View style={{marginHorizontal: 10, width: '40%'}}>
                      <Text
                        style={{
                          fontFamily: Fonts.semibold,
                          textTransform: 'capitalize',
                          color: 'black',
                          fontSize: 12,
                        }}>
                        {item?.bank_name ?? item?.name} (
                        {item?.account_type ?? 'External'})
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: Fonts.semibold,
                          color: 'rgba(106, 106, 106, 1)',
                          fontSize: 10,
                        }}>
                        {item?.account_number ?? item?.account_id}
                      </Text>
                    </View>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: Fonts.semibold,
                      color: 'rgba(106, 106, 106, 1)',
                      fontSize: 10,
                      // width: '53%',
                      // marginRight÷: 10,
                    }}>
                    Balance:{' '}
                    {item?.balances?.available
                      ? item?.balances?.available
                      : item?.account_type === 'rothIra'
                      ? bankBalance?.roth_ira_account?.usd
                      : item?.account_type === 'traditionalIra'
                      ? bankBalance?.traditional_ira_account?.usd
                      : bankBalance?.bank_account?.usd}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
          {/* <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <SvgXml xml={SVGUSDT} width={40} height={40} />
              <View>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: Fonts.semibold,
                    marginLeft: 10,
                    fontSize: 14,
                  }}>
                  USDT
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: Fonts.semibold,
                    marginLeft: 10,
                    fontSize: 12,
                  }}>
                  Tether
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{false: '#767577', true: '#B1FF84'}}
              thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View> */}
        </View>
      </View>
    </Modal>
  );
};

export default SelectionModal;

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
    borderTopEndRadius: 40,
    borderTopStartRadius: 40,
    padding: 20,
    elevation: 8,
    height: '60%',
    marginTop: 350,
    flex: 1,
  },
  headerText: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: '#fff',
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
