import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';

export default function HeaderTitle({title, leftIcon, rightIcon, isBack}) {
  const navigation = useNavigation();
  return (
    <View
      style={{
        padding: 20,
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      {leftIcon ? (
        <TouchableOpacity
          style={{width: '33%'}}
          onPress={() => navigation.goBack()}>
          <SvgXml xml={leftIcon} />
        </TouchableOpacity>
      ) : (
        <View style={{width: '33%'}} />
      )}
      <Text
        style={{
          fontFamily: Fonts.semibold,
          color: '#000',
          fontSize: 18,
          textAlign: 'center',
        }}>
        {title}
      </Text>
      {rightIcon ? (
        <SvgXml
          xml={rightIcon}
          onPress={() => {
            if (isBack) {
              navigation.goBack();
            }
          }}
        />
      ) : (
        <View style={{width: '33%'}} />
      )}
    </View>
  );
}
