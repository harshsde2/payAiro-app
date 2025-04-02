import {View, Text} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGBank1, SVGBank2, SVGLeftArrow, SVGUSD} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';
import TextInputField from '../../components/TextInputField';

export default function SelectBankScreen() {
  const VBANK_LISTS = ['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'INDUS Bank'];
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Select Bank'} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
          //   height: 400,
        }}>
        <Text
          style={{
            color: 'black',
            fontFamily: Fonts.semibold,
            fontSize: 20,
            margin: 6,
          }}>
          Select Bank
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            alignItems: 'center',
            alignSelf: 'center',
            marginVertical: 6,
          }}>
          {VBANK_LISTS.map((i, k) => (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                backgroundColor: 'rgba(247, 247, 247, 1)',
                borderRadius: 20,
                padding: 20,
                width: '45%',
                marginHorizontal: 5,
                marginVertical: 5,
              }}>
              <SvgXml xml={SVGUSD} />
              <Text
                style={{
                  color: 'black',
                  fontFamily: Fonts.semibold,
                  marginLeft: 10,
                }}>
                {i}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </CommonHeaderv2>
  );
}
