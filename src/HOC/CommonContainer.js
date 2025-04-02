import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import React from 'react';
import Container from './Container';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

export default function CommonContainer({children, style}) {
  return (
    <Container bgColor={'rgba(243, 251, 244, 1)'}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,

          // opacity: 0.9
        }}>
        <Image
          source={require('../../assets/images/payAero.png')}
          style={{
            width: 200,
            height: 100,
            resizeMode: 'contain',
            alignSelf: 'center',
            marginVertical: 130,
            ...style,
          }}
        />
        {children}
      </KeyboardAwareScrollView>
    </Container>
  );
}
