import {View, Text, Image} from 'react-native';
import React from 'react';
import {SvgXml} from 'react-native-svg';
import {SVGProfile, SVGProfile2} from '../constants/images';
import Fonts from '../constants/Fonts';
import GenericButton from './GenericButton';

export default function RequestPayCard({
  onPress,
  item,
  amount,
  isSentRequest,
  onCancel,
}) {
  console.log(item, 'itemsmsmsmssmsm');
  return (
    <>
      <View
        style={{
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
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: 35,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              },
              {backgroundColor: 'rgba(255, 37, 99, 1)'},
            ]}>
            <Text
              style={{
                color: '#000',
                fontSize: 16,
                fontFamily: Fonts.semibold,
              }}>
              {item?.project_name?.charAt(0)?.toUpperCase() ??
                item?.requester_details?.username?.charAt(0)?.toUpperCase() ??
                item?.requester_details?.email?.charAt(0)?.toUpperCase() ??
                item?.requester_details?.wallet_address
                  ?.charAt(0)
                  .toUpperCase() ??
                item?.recipient_details?.username?.charAt(0)?.toUpperCase() ??
                item?.recipient_details?.email?.charAt(0)?.toUpperCase() ??
                item?.recipient_details?.wallet_address
                  ?.charAt(0)
                  ?.toUpperCase()}
            </Text>
          </View>
          <View style={{marginLeft: 10}}>
            <Text style={{fontFamily: Fonts.semibold, fontSize: 14}}>
              {item?.project_name ??
                item?.requester_details?.username ??
                item?.requester_details?.email ??
                item?.requester_details?.wallet_address ??
                item?.recipient_details?.username ??
                item?.recipient_details?.email ??
                item?.recipient_details?.wallet_address}
            </Text>
            <Text
              style={{fontFamily: Fonts.regular, fontSize: 12, marginTop: 5}}>
              ${item?.amount ?? amount} requested
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {!isSentRequest && (
            <GenericButton
              title={'Pay'}
              cStyle={{paddingTop: 11, paddingHorizontal: 30, marginRight: 5}}
              onPress={onPress}
            />
          )}
          <GenericButton
            title={'Cancel'}
            cStyle={{
              paddingTop: 11,
              paddingHorizontal: 20,
              backgroundColor: 'red',
            }}
            tStyle={{color: '#fff'}}
            onPress={onCancel}
          />
        </View>
      </View>
      <View
        style={{
          borderBottomWidth: 1,
          marginVertical: 7,
          borderColor: 'rgba(224, 224, 224, 1)',
        }}
      />
    </>
  );
}
