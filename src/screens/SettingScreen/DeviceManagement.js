import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import React from 'react';
import Container from '../../HOC/Container';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGIOS,
  SVGLeftArrow,
  SVGLocks,
  SVGWindows,
} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {SvgXml} from 'react-native-svg';

export default function DeviceManagement() {
  const LINKED_DEVICES = [
    {
      icon: SVGWindows,
      name: 'Windows',
      subtitle: 'Last active today at 02:23 PM',
    },
    {
      icon: SVGIOS,
      name: 'MacOs',
      subtitle: 'Last active today at 02:23 PM',
    },
    {
      icon: SVGIOS,
      name: 'Iphone',
      subtitle: 'Last active today at 02:23 PM',
    },
  ];
  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <HeaderTitle title={'Linked Device'} leftIcon={SVGLeftArrow} />
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
                fontSize: 24,
                textAlign: 'center',
              }}>
              Use on other device
            </Text>

            <Text
              style={{
                color: 'rgba(106, 106, 106, 1)',
                fontFamily: Fonts.regular,
                fontSize: 14,
                textAlign: 'center',
                marginTop: 5,
              }}>
              You can link other devices to this account, including Windows, Mac
              and Web. Learn more{' '}
            </Text>

            <GenericButton
              title={'Link Device'}
              cStyle={{borderRadius: 14, marginTop: 40}}
            />

            <Text
              style={{
                color: 'black',
                fontFamily: Fonts.semibold,
                fontSize: 16,
                marginVertical: 20,
              }}>
              Linked Device
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(245, 245, 245, 1)',
                borderRadius: 20,
              }}>
              {LINKED_DEVICES.map((i, k) => (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    padding: 10,
                  }}>
                  <SvgXml xml={SVGWindows} />
                  <View style={{marginLeft: 10}}>
                    <Text
                      style={{
                        color: 'black',
                        fontFamily: Fonts.semibold,
                        fontSize: 16,
                      }}>
                      {i?.name}
                    </Text>
                    <Text
                      style={{
                        color: 'rgba(106, 106, 106, 1)',
                        fontFamily: Fonts.regular,
                        fontSize: 10,
                      }}>
                      Last active today at 02:23 PM
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <Text
              style={{
                color: 'rgba(29, 29, 29, 1)',
                fontSize: 12,
                marginTop: 12,
                fontFamily: Fonts.semibold,
              }}>
              <SvgXml xml={SVGLocks} /> Your personal messages are end-to-end
              encrypted on all of your devices.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
