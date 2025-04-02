import {
  View,
  Text,
  Image,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGCopy, SVGCopy2, SVGLeftArrow} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';

export default function RequestMoney(props) {
  const {item} = props.route.params;
  const navigation = useNavigation();
  console.log(item);
  const copyToClipboard = (e, type) => {
    Clipboard.setString(e);

    // Display a success message
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${type} Copied Successfully`, ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      Alert.alert('Text copied to clipboard!');
    }
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle leftIcon={SVGLeftArrow} title={'Discover'} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}>
        {item?.profile_photo ? (
          <Image
            source={{
              uri: item?.profile_photo,
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 100,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
          />
        ) : (
          <View
            style={[
              {
                width: 120,
                height: 120,
                borderRadius: 100,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                alignSelf: 'center',
              },
              {backgroundColor: 'rgba(255, 37, 99, 1)'},
            ]}>
            <Text
              style={{
                color: '#000',
                fontSize: 35,
                fontFamily: Fonts.semibold,
              }}>
              {item.nickname?.charAt(0)?.toUpperCase() +
                item.nickname?.charAt(1)?.toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
            fontFamily: Fonts.semibold,
            marginTop: 20,
          }}>
          {item?.name?.trim() ||
            item?.nickname?.trim() ||
            item?.email?.trim() ||
            item?.username?.trim()}
        </Text>

        {item?.email.trim() && (
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              fontFamily: Fonts.regular,
              marginTop: 5,
              color: 'rgba(106, 106, 106, 1)',
            }}>
            {item?.email}
            <SvgXml
              xml={SVGCopy2}
              style={{paddingTop: 0}}
              onPress={() => copyToClipboard(item?.email, 'Email')}
            />
          </Text>
        )}
        {item?.username.trim() && (
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              fontFamily: Fonts.regular,
              marginTop: 5,
              color: 'rgba(106, 106, 106, 1)',
            }}>
            {item?.username}
            <SvgXml
              xml={SVGCopy2}
              style={{paddingTop: 0}}
              onPress={() => copyToClipboard(item?.username, 'Username')}
            />
          </Text>
        )}
        {item?.wallet_address.trim() && (
          <Text
            style={{
              textAlign: 'center',
              width: '100%',
              fontSize: 10,
              fontFamily: Fonts.regular,
              marginTop: 5,
              color: 'rgba(106, 106, 106, 1)',
            }}>
            {item?.wallet_address}
            <SvgXml
              xml={SVGCopy2}
              style={{paddingTop: 0}}
              onPress={() =>
                copyToClipboard(item?.wallet_address, 'Wallet Address')
              }
            />
          </Text>
        )}
        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(106, 106, 106, 1)',
            marginTop: 20,
          }}
        />
        <GenericButton
          title="Request Money"
          cStyle={{marginTop: 285}}
          onPress={() => {
            navigation.navigate(SCREENS.ScanPay, {
              sender:
                item?.email.trim() ||
                item?.username.trim() ||
                item?.wallet_address.trim(),
              type: 'requested',
            });
          }}
        />
        <GenericButton
          title={'Send Money'}
          cStyle={{backgroundColor: '#000', marginVertical: 10}}
          tStyle={{color: 'white'}}
          onPress={() =>
            navigation.navigate(SCREENS.ScanPay, {
              sender:
                item?.email.trim() ||
                item?.username.trim() ||
                item?.wallet_address.trim(),
              type: 'receive',
            })
          }
        />
      </View>
    </CommonHeaderv2>
  );
}
