import {View, Text} from 'react-native';
import React from 'react';
import {SvgXml} from 'react-native-svg';
import {SVGLoggo, SVGNotification, SVGProfile} from '../constants/images';
import Fonts from '../constants/Fonts';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../constants/SCREENS';

export default function Header({name}) {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginTop: 20,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}>
        <SvgXml xml={SVGLoggo} />
        <View style={{marginHorizontal: 10}}>
          <Text
            style={{fontFamily: Fonts.regular, color: 'rgba(29, 29, 29, 1)'}}>
            Welcome Back,
          </Text>
          <Text
            style={{
              fontFamily: Fonts.semibold,
              color: 'rgba(29, 29, 29, 1)',
              fontSize: 20,
            }}>
            {name ?? ' Daniel Hamilton'}
          </Text>
        </View>
      </View>
      <SvgXml
        xml={SVGNotification}
        onPress={() => navigation.navigate(SCREENS.Notification)}
      />
    </View>
  );
}
