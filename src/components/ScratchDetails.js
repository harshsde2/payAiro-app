import {View, Text} from 'react-native';
import React from 'react';
import HeaderTitle from './HeaderTitle';
import {SVGCross, SVGOla, SVGVo} from '../constants/images';
import CommonHeaderv2 from '../HOC/CommonHeaderv2';
import {SvgXml} from 'react-native-svg';
import Fonts from '../constants/Fonts';
import GenericButton from './GenericButton';

export default function ScratchDetails() {
  return (
    <CommonHeaderv2>
      <HeaderTitle rightIcon={SVGCross} isBack={true} />
      <SvgXml xml={SVGVo} style={{alignSelf: 'center'}} />

      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 100,
          //   height: 400,
        }}>
        <SvgXml xml={SVGOla} />
        <Text
          style={{
            color: 'rgba(106, 106, 106, 1)',
            fontFamily: Fonts.regular,
            fontSize: 20,
            marginVertical: 10,
          }}>
          Congrats! you have $5.25 off your Ola outstation rides
        </Text>
        <GenericButton
          title={'Copy and redeem Now'}
          cStyle={{marginVertical: 20}}
        />
      </View>
    </CommonHeaderv2>
  );
}
