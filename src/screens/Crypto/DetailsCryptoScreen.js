import {View, Text} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {SVGLeftArrow, SVGSearch} from '../../constants/images';
import {WebView} from 'react-native-webview';

export default function DetailsCryptoScreen(props) {
  const {url} = props.route.params;

  return (
    <CommonHeaderv2>
      <HeaderTitle2
        title={'Crypto Details'}
        leftIcon={SVGLeftArrow}
        rightIcon={SVGSearch}
      />
      <WebView source={{uri: url}} style={{flex: 1}} />
    </CommonHeaderv2>
  );
}
