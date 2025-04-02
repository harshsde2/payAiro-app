import React, {useState} from 'react';
import {View, Text} from 'react-native';
import Container from '../../HOC/Container';
import PincodeKeypad from '../../components/PincodeKeypad';
import Fonts from '../../constants/Fonts';

export default function PincodeScreen({onPress, pinTxt, isNotDecimals}) {
  const [pin, setPin] = useState('');

  const handleKeyPress = key => {
    if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);

      // If PIN reaches 4 digits, trigger the onPress function
      if (newPin.length === 4) {
        onPress(newPin, pinTxt === 'Create your pin');
        setTimeout(() => setPin(''), 500); // Clear PIN after a short delay
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <View style={{height: '100%'}}>
      <Container>
        <Text
          style={{
            color: '#000',
            textAlign: 'center',
            fontFamily: Fonts.bold,
            marginTop: 30,
            fontSize: 30,
          }}>
          {pinTxt}
        </Text>

        {/* Display masked PIN */}
        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 100,
          }}>
          <Text
            style={{
              color: '#000',
              fontSize: 72,
              fontFamily: Fonts.bold,
              letterSpacing: 10,
            }}>
            {pin.length === 0 ? '* * * *' : '*'.repeat(pin.length)}
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
