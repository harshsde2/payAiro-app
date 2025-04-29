import {
  View,
  Text,
  TextInput,
  ToastAndroid,
  Alert,
  Clipboard,
} from 'react-native';
import React, {useRef} from 'react';
import Container from '../../HOC/Container';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGCopy,
  SVGLeftArrow,
  SVGReceives,
  SVGShare2,
} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import useSelectorAction from '../../hooks/useSelectorAction';
import QRCode from 'react-native-qrcode-svg';
import Fonts from '../../constants/Fonts';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';

export default function Receive() {
  const navigation = useNavigation();
  const {walletData} = useSelectorAction();
  const viewShotRef = useRef(null);
  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const shareOptions = {
        title: 'Wallet Address',
        message: `
        Use following credentials
        Wallet Address:  ${walletData?.wallet_public_key} 
        Payairo Tag : ${walletData?.username} 
        Email: ${walletData?.account_email}  
        or scan QR to send crypto`,
        url: uri,
        type: 'image/png',
      };
      const res = await Share.open(shareOptions);
      console.log('Share result:', res);
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const copyToClipboard = e => {
    Clipboard.setString(e);

    // Display a success message
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied to Clipboard', ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      Alert.alert('Text copied to clipboard!');
    }
  };
  return (
    <Container>
      <HeaderTitle leftIcon={SVGLeftArrow} title={'QR Code'} />

      <View
        style={{
          alignSelf: 'center',
          marginTop: 30,
          backgroundColor: '#000',
          padding: 20,
          borderRadius: 20,
        }}>
        <ViewShot ref={viewShotRef} options={{format: 'png', quality: 0.9}}>
          <QRCode value={walletData?.username} size={200} />
        </ViewShot>
      </View>
      <Text
        style={{
          color: 'rgba(169, 168, 168, 1)',
          fontFamily: Fonts.regular,
          textAlign: 'center',
          marginTop: 5,
        }}>
        Scan address to Receive payment
      </Text>
      <View
        style={{
          width: '90%',
          alignSelf: 'center',
          borderRadius: 40,
          borderWidth: 1,
          backgroundColor: '#000',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 7,
          marginTop: 100,
        }}>
        <TextInput
          editable={false}
          value={walletData?.username}
          style={{
            color: '#fff',
            fontFamily: Fonts.semibold,
            width: '85%',
            fontSize: 16,
            textAlign: 'left',
          }}
        />
        <SvgXml
          xml={SVGCopy}
          style={{marginRight: 1}}
          onPress={() => copyToClipboard(walletData?.username)}
        />
      </View>
      <GenericButton
        title={'Share'}
        cStyle={{
          backgroundColor: 'black',
          borderWidth: 1,
          borderColor: 'white',
          margin: 20,
          marginTop: 80,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        icon={SVGShare2}
        tStyle={{color: 'white'}}
        onPress={handleShare}
      />

      <GenericButton
        title={'Request Payment'}
        cStyle={{
          marginHorizontal: 20,
        }}
        onPress={() =>
          navigation.navigate(NAVIGATION_SCREENS.SEND, {
            requested: true,
            type: 'requested',
          })
        }
      />
    </Container>
  );
}
