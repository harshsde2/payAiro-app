import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import GenericButton from './GenericButton';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {SVGReward} from '../constants/images';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../constants/SCREENS';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';

export default function Rewards({item}) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(item?.route ?? NAVIGATION_SCREENS.SCRATCH)}
      style={{
        borderRadius: 10,
        backgroundColor: item?.bgColor ?? 'rgba(255, 234, 177, 0.7)',
        padding: 20,
        width: '30%',
        marginHorizontal: 5,
      }}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 35,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#fff',
          alignSelf: 'center',
        }}>
        <SvgXml xml={item?.icon ?? SVGReward} />
      </View>

      <Text
        style={{
          textAlign: 'center',
          fontFamily: Fonts.semibold,
          marginBottom: 10,
        }}>
        {item?.name ?? 'Rewards'}
      </Text>

      <GenericButton
        title={'Explore '}
        cStyle={{backgroundColor: '#000', padding: 5}}
        tStyle={{color: 'white', fontSize: 10}}
        disabled={true}
      />
    </TouchableOpacity>
  );
}
