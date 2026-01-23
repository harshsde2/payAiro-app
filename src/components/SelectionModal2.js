import React from 'react';
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
import useSelectorAction from '../hooks/useSelectorAction';

const SelectionModal2 = ({isVisible, onClose, timeframe, settimeframe}) => {
  const navigation = useNavigation();
  const {walletData, networkLists, selectedCrypto} = useSelectorAction();

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
              color: 'white',
              textAlign: 'center',
              marginBottom: 40,
            }}>
            Select Week/Month/Year
          </Text>

          <View style={styles.timeframeSelector}>
            {['week', 'month', 'year'].map(tf => (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.timeframeButton,
                  timeframe.toLowerCase() === tf &&
                    styles.selectedTimeframeButton,
                ]}
                onPress={() => {
                  settimeframe(tf);

                  onClose();
                }}>
                <Text
                  style={[
                    styles.timeframeText,
                    timeframe === tf && styles.selectedTimeframeText,
                  ]}>
                  {tf.charAt(0)?.toUpperCase() + tf.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SelectionModal2;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#000',
    width: '100%',
    borderTopEndRadius: 40,
    borderTopStartRadius: 40,
    padding: 20,
    elevation: 8,
    height: '50%',
    marginTop: 400,
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
  timeframeSelector: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeframeButton: {
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 30,
    marginVertical: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  selectedTimeframeButton: {
    backgroundColor: 'rgba(44, 106, 63, 1)',
    borderWidth: 0,
  },
  timeframeText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#fff',
    textAlign: 'center',
  },
  selectedTimeframeText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#000',
    textAlign: 'center',
  },
});
