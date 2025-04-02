import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';

export default function GenericButton({
  title,
  onPress,
  cStyle,
  tStyle,
  disabled,
  icon,
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: 'rgba(44, 106, 63, 1)',
        borderRadius: 30,
        padding: 18,
        ...cStyle,
      }}>
      <Text
        style={{
          textAlign: icon ? 'left' : 'center',
          color: '#fff',
          fontFamily: Fonts.bold,
          ...tStyle,
        }}>
        {title}
      </Text>
      {icon && <SvgXml xml={icon} />}
    </TouchableOpacity>
  );
}
