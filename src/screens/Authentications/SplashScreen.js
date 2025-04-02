import {View, Text, Image} from 'react-native';
import React from 'react';
import {SvgXml} from 'react-native-svg';
import {SVGLoggo, SVGLogo3} from '../../constants/images';

export default function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
      }}>
      <Image
        source={require('../../../assets/images/payAero.png')}
        style={{
          width: 200,
          height: 100,
          resizeMode: 'contain',
          alignSelf: 'center',
        }}
      />
    </View>
  );
}
