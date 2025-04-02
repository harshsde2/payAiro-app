import React, {useState} from 'react';
import {View, Text, Alert} from 'react-native';
import Container from '../../HOC/Container';
import PincodeKeypad from '../../components/PincodeKeypad';
import {SvgXml} from 'react-native-svg';
import {SVGProfile} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import {confirmPayment, sendPayAero} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import moment from 'moment';

export default function Pincode2({onPress, pinTxt, isNotDecimals}) {
  const [amount, setAmount] = useState('');
  console.log(pinTxt, 'fffffff');

  const handleKeyPress = key => {
    console.log(amount + key);
    if ((key + amount).length === 4) {
      onPress(amount + key, pinTxt === 'Create your pin' ? true : false);
      setAmount('');
      return;
    }
    setAmount(prev => {
      if (key === '.') {
        // Prevent multiple decimals
        return prev.includes('.') ? prev : prev + key;
      }
      return prev + key;
    });
  };

  const handleBackspace = () => {
    setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : ''));
  };

  return (
    <View style={{height: 1000}}>
      <Container>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontFamily: Fonts.bold,
            marginTop: 30,
            fontSize: 30,
          }}>
          {pinTxt}
        </Text>
        {/* Display the amount */}
        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 100,
          }}>
          <Text style={{color: 'white', fontSize: 72, fontFamily: Fonts.bold}}>
            {amount.length === 0 ? '* * * *' : amount}
          </Text>
        </View>

        {/* Pincode Keypad */}
        <PincodeKeypad
          isNotDecimals={isNotDecimals}
          isTransparent={true}
          handleBackspace={handleBackspace}
          handleKeyPress={handleKeyPress}
        />
      </Container>
    </View>
  );
}
