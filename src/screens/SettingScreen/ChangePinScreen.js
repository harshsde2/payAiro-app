import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Container from '../../HOC/Container';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';

const PinInput = ({value, setValue, nextRef}) => {
  return (
    <TextInput
      style={styles.pinInput}
      keyboardType="numeric"
      maxLength={1}
      value={value}
      onChangeText={text => {
        setValue(text);
        if (text && nextRef) nextRef.current.focus();
      }}
    />
  );
};

const ChangePinScreen = () => {
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const newPinRefs = [useRef(), useRef(), useRef(), useRef()];
  const confirmPinRefs = [useRef(), useRef(), useRef(), useRef()];

  const isPinMatched =
    newPin.join('') === confirmPin.join('') && newPin.join('') !== '';

  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <HeaderTitle title={'Set Pin'} leftIcon={SVGLeftArrow} />
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}>
            <Text style={styles.title}>Change Your Pin</Text>
            <Text style={styles.subtitle}>
              To set up your <Text style={styles.bold}>PIN</Text> create a{' '}
              <Text style={styles.bold}>4 digit code</Text> then confirm it
              below.
            </Text>

            {/* Current PIN Input */}
            <Text style={styles.label}>Enter current PIN</Text>
            <View style={styles.pinContainer}>
              {currentPin.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.pinInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={val => {
                    let tempPin = [...currentPin];
                    tempPin[index] = val;
                    setCurrentPin(tempPin);
                    if (val && pinRefs[index + 1])
                      pinRefs[index + 1].current.focus();
                  }}
                  ref={pinRefs[index]}
                />
              ))}
            </View>

            {/* New PIN Input */}
            <Text style={styles.label}>Enter new PIN</Text>
            <View style={styles.pinContainer}>
              {newPin.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.pinInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={val => {
                    let tempPin = [...newPin];
                    tempPin[index] = val;
                    setNewPin(tempPin);
                    if (val && newPinRefs[index + 1])
                      newPinRefs[index + 1].current.focus();
                  }}
                  ref={newPinRefs[index]}
                />
              ))}
            </View>

            {/* Confirm New PIN Input */}
            <Text style={styles.label}>Confirm new PIN</Text>
            <View style={styles.pinContainer}>
              {confirmPin.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.pinInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={val => {
                    let tempPin = [...confirmPin];
                    tempPin[index] = val;
                    setConfirmPin(tempPin);
                    if (val && confirmPinRefs[index + 1])
                      confirmPinRefs[index + 1].current.focus();
                  }}
                  ref={confirmPinRefs[index]}
                />
              ))}
            </View>
          </View>
          <GenericButton
            title={'Save PIN'}
            cStyle={{width: '90%', alignSelf: 'center'}}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.semibold,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontFamily: Fonts.regular,
    color: 'black',
  },
  bold: {
    fontFamily: Fonts.semibold,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: 5,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pinInput: {
    width: 70,
    height: 60,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(0, 119, 4, 0.4)',
    textAlign: 'center',
    fontSize: 22,
    backgroundColor: 'rgba(0, 119, 4, 0.07)',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  successText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePinScreen;
