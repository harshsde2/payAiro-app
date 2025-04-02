import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Clipboard,
  ToastAndroid,
  Alert,
  Platform,
} from 'react-native';
import React, {useRef} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGCopy, SVGLeftArrow} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import TextInputField from '../../components/TextInputField';
import {SvgXml} from 'react-native-svg';
import useSelectorAction from '../../hooks/useSelectorAction';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';

export default function ReceiveToken() {
  const {walletData} = useSelectorAction();
  const {selectedCrypto, networkLists, tokens} = useSelectorAction();

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
      ToastAndroid.show('Wallet Address Copied', ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      Alert.alert('Text copied to clipboard!');
    }
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Receive Token'} leftIcon={SVGLeftArrow} />
      <Text
        style={{
          textAlign: 'center',
          color: '#000',
          fontSize: 14,
          fontFamily: Fonts.regular,
          marginTop: 60,
        }}>
        Available Token{' '}
      </Text>
      <Text
        style={{
          textAlign: 'center',
          color: '#000',
          fontSize: 42,
          fontFamily: Fonts.bold,
        }}>
        {Number(selectedCrypto?.balance).toFixed(5)}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(44, 106, 63, 1)',
          paddingHorizontal: 5,
          paddingTop: 5,
          paddingBottom: 8,
          width: '30%',
          borderRadius: 40,
          alignSelf: 'center',
          marginVertical: 8,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#fff',
            fontFamily: Fonts.semibold,
          }}>
          $ {Number(selectedCrypto?.balance_in_tether).toFixed(5)}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 30,
        }}>
        <ViewShot
          ref={viewShotRef}
          options={{format: 'png', quality: 0.9}}
          style={{
            alignSelf: 'center',
            marginTop: 20,
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 20,
            elevation: 3,
          }}>
          <QRCode value={walletData?.wallet_public_key} size={200} />
        </ViewShot>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            borderRadius: 40,
            borderWidth: 1,
            borderColor: 'rgba(106, 106, 106, 0.12)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 7,
            marginVertical: 70,
            backgroundColor: 'rgba(106, 106, 106, 0.12)',
          }}>
          <TextInput
            value={walletData?.wallet_public_key}
            style={{
              color: '#000',
              fontFamily: Fonts.semibold,
              width: '80%',
              fontSize: 10,
            }}
          />

          <SvgXml
            xml={SVGCopy}
            style={{marginRight: 1}}
            onPress={() => copyToClipboard(walletData?.wallet_public_key)}
          />
        </View>
      </View>
    </CommonHeaderv2>
  );
}
