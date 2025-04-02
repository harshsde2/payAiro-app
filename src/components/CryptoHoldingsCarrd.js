import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {SVGEth} from '../constants/images';
import {useNavigation} from '@react-navigation/native';

export default function CryptoHoldingsCarrd({item}) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('HoldingsScreen', {
          item,
        })
      }
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}>
        {item && (
          <Image
            source={{
              uri: item?.logo,
            }}
            style={{
              width: 40,
              height: 40,
              marginRight: 5,
              resizeMode: 'contain',
            }}
          />
        )}
        <View style={{marginHorizontal: 5, width: '85%'}}>
          <Text
            style={{
              color: 'rgba(106, 106, 106, 1)',
              fontSize: 14,
              fontFamily: Fonts.semibold,
            }}>
            {item?.network?.toUpperCase()}/
            <Text style={{fontSize: 11, fontFamily: Fonts.regular}}>
              {item?.currency?.toUpperCase()}
            </Text>
          </Text>
          <Text
            style={{
              color: 'green',
              fontSize: 10,
              fontFamily: Fonts.semibold,
            }}>
            {item?.price?.buy} USD
          </Text>
        </View>
      </View>

      {/* <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '40%',
        }}>
        <Text
          style={{
            color: 'rgba(106, 106, 106, 1)',
            fontSize: 14,
            fontFamily: Fonts.semibold,
            marginHorizontal: 9,
          }}>
          50.01
        </Text>
        <TouchableOpacity
          style={{
            paddingVertical: 7,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: item?.loss ? 'red' : 'rgba(23, 161, 11, 1)',
            width: '40%',
          }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 12,
              fontFamily: Fonts.semibold,
              textAlign: 'center',
            }}>
            13.47%
          </Text>
        </TouchableOpacity>
      </View> */}
    </TouchableOpacity>
  );
}
