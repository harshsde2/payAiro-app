import {View, Text, Image, Pressable} from 'react-native';
import React, {useState} from 'react';
import Fonts from '../constants/Fonts';

export default function AssetsCards({item, isSelected, onPress, type}) {
  if (type === 'select') {
    return (
      <>
        <Pressable
          onPress={() => {
            if (isSelected) {
              onPress(item);
            }
          }}
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
            <Image
              source={{
                uri: item?.tokens[0]?.image,
              }}
              style={{width: 35, height: 35}}
            />
            <View style={{marginLeft: 20}}>
              <Text style={{color: '#fff', fontFamily: Fonts.semibold}}>
                {item?.blockchain}
              </Text>
              <Text
                style={{
                  color: 'rgba(167, 167, 167, 1)',
                  fontFamily: Fonts.regular,
                  fontSize: 12,
                }}>
                {item?.tokens[0]?.name}
              </Text>
            </View>
          </View>
          <View style={{marginRight: 10}}>
            <Text
              style={{
                color: '#fff',
                textAlign: 'right',
                fontFamily: Fonts.semibold,
              }}>
              {item?.tokens[0]?.symbol}
            </Text>
          </View>
        </Pressable>
      </>
    );
  }
  return (
    <>
      <Pressable
        onPress={() => {
          if (isSelected) {
            onPress(item);
          }
        }}
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
          <Image
            source={{
              uri: item?.iconUrl,
            }}
            style={{width: 35, height: 35}}
          />
          <View style={{marginLeft: 20}}>
            <Text style={{color: '#fff', fontFamily: Fonts.semibold}}>
              {item?.assetType?.toUpperCase()}
            </Text>
            <Text
              style={{
                color: 'rgba(167, 167, 167, 1)',
                fontFamily: Fonts.regular,
                fontSize: 12,
              }}>
              {item?.assetType?.includes('btc')
                ? 'Bitcoin'
                : item?.assetType?.includes('eth')
                ? 'Ethereum'
                : item?.assetType?.includes('pol')
                ? 'Polygon'
                : 'Ethereum'}
            </Text>
          </View>
        </View>
        <View style={{marginRight: 10}}>
          <Text
            style={{
              color: '#fff',
              textAlign: 'right',
              fontFamily: Fonts.semibold,
            }}>
            {Number(item?.disbursable).toFixed(3)}
          </Text>
          <Text
            style={{
              color: 'rgba(167, 167, 167, 1)',
              fontFamily: Fonts.semibold,
              fontSize: 12,
            }}>
            {Number(item?.usd).toFixed(3)} USDT
          </Text>
        </View>
      </Pressable>
    </>
  );
}
