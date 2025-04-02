import {View, Text} from 'react-native';
import React from 'react';
import GenericButton from './GenericButton';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {SVGReward} from '../constants/images';

export default function Rewards2() {
  return (
    <View
      style={{
        borderRadius: 10,
        backgroundColor: 'rgba(255, 234, 177, 0.7)',
        padding: 20,
        width: '100%',
        marginHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
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
          <SvgXml xml={SVGReward} />
        </View>
        <View style={{marginLeft: 10}}>
          <Text
            style={{
              //   textAlign: 'center',
              fontFamily: Fonts.semibold,
              //   marginBottom: 10,
            }}>
            Reffral
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: Fonts.semibold,
              marginBottom: 10,
              fontSize: 12,
            }}>
            Earned $115 from Referral
          </Text>
        </View>
      </View>

      <GenericButton
        title={'Explore '}
        cStyle={{
          backgroundColor: '#000',
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
        tStyle={{color: 'white'}}
      />
    </View>
  );
}
