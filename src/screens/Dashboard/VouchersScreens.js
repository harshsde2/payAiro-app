import {View, Text} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGLeftArrow,
  SVGRef,
  SVGRefer,
  SVGVouchers2,
} from '../../constants/images';
import {SvgXml} from 'react-native-svg';

export default function VouchersScreens() {
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Vouchers'} leftIcon={SVGLeftArrow} />
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
        <SvgXml xml={SVGRefer} style={{alignSelf: 'center'}} />
      </View>
    </CommonHeaderv2>
  );
}
