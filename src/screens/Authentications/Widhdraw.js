import {View, Text} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGBack,
  SVGBank,
  SVGBit,
  SVGDownArrow,
  SVGLeftArrow,
} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';

export default function Widhdraw() {
  const navigation = useNavigation();
  return (
    <CommonHeaderv2>
      <HeaderTitle title={''} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}>
        <View
          style={{
            padding: 15,
            borderRadius: 30,
            backgroundColor: 'rgba(106, 106, 106, 0.12)',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View>
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 16,
                  color: '#000',
                }}>
                DBS Bank Limited
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 14,
                  color: 'rgba(106, 106, 106, 0.7)',
                  marginTop: 3,
                }}>
                $265,56.00 Limit
              </Text>
            </View>
            <SvgXml xml={SVGBit} />
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              marginVertical: 10,
              borderBottomColor: 'rgba(106, 106, 106, 0.12)',
            }}
          />
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontFamily: Fonts.bold,
              fontSize: 36,
              marginVertical: 30,
            }}>
            $1584
          </Text>
        </View>

        <View
          style={{
            padding: 15,
            borderRadius: 20,
            backgroundColor: '#000',
            marginVertical: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <SvgXml xml={SVGBank} />
              <View style={{marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 16,
                    color: '#fff',
                  }}>
                  DBS Bank Limited
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 14,
                    color: '#fff',
                    marginTop: 3,
                  }}>
                  $265,56.00 Limit
                </Text>
              </View>
            </View>
            <SvgXml xml={SVGDownArrow} />
          </View>
        </View>

        <GenericButton
          title={'Withdraw'}
          cStyle={{marginTop: 200}}
          onPress={() => navigation.navigate('SuccesScreen')}
        />
      </View>
    </CommonHeaderv2>
  );
}
