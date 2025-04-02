import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';

export default function HeaderTitle2({title, leftIcon, rightIcon, isBack}) {
  const navigation = useNavigation();
  return (
    <View
      style={{
        padding: 10,
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <SvgXml xml={leftIcon} />
      </TouchableOpacity>

      <Text
        style={{
          fontFamily: Fonts.semibold,
          color: 'rgba(44, 106, 63, 1)',
          fontSize: 18,
          textAlign: 'center',
        }}>
        {title}
      </Text>

      <SvgXml
        xml={rightIcon}
        onPress={() => {
          if (isBack) {
            navigation.goBack();
          }
        }}
      />
    </View>
  );
}
