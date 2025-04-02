import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import React, {useState} from 'react';
import Container from '../../HOC/Container';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGAlert,
  SVGLeftArrow,
  SVGMail,
  SVGNoti,
  SVGPhone,
  SVGRightIcon,
  SVGTele,
  SVGWhatsApp,
} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {SvgXml} from 'react-native-svg';

export default function AlertScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabled1, setIsEnabled1] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [isEnabled3, setIsEnabled3] = useState(false);
  const [isEnabled4, setIsEnabled4] = useState(false);
  const [isEnabled5, setIsEnabled5] = useState(false);

  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <HeaderTitle title={'Alerts'} leftIcon={SVGLeftArrow} />
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}>
            <Text
              style={{
                fontSize: 22,
                fontFamily: Fonts.semibold,
                marginBottom: 14,
              }}>
              Medium of communication
            </Text>

            <TouchableOpacity
              style={{
                borderRadius: 40,
                borderWidth: 1,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderColor: 'rgba(106, 106, 106, 0.08)',
                padding: -20,
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
                  margin: 5,
                }}>
                <SvgXml xml={SVGPhone} />
                <Text
                  style={{
                    color: 'rgba(29, 29, 29, 1)',
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: Fonts.regular,
                  }}>
                  Phone Number
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: 'rgba(243, 243, 243, 1)',
                  true: 'rgba(226, 241, 227, 1)',
                }}
                thumbColor={isEnabled2 ? 'rgba(44, 106, 63, 1)' : '#000'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsEnabled2(state => !state)}
                value={isEnabled2}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderRadius: 40,
                borderWidth: 1,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderColor: 'rgba(106, 106, 106, 0.08)',
                padding: -20,
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
                  margin: 5,
                }}>
                <SvgXml xml={SVGMail} />
                <Text
                  style={{
                    color: 'rgba(29, 29, 29, 1)',
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: Fonts.regular,
                  }}>
                  Email
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: 'rgba(243, 243, 243, 1)',
                  true: 'rgba(226, 241, 227, 1)',
                }}
                thumbColor={isEnabled1 ? 'rgba(44, 106, 63, 1)' : '#000'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsEnabled1(state => !state)}
                value={isEnabled1}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderRadius: 40,
                borderWidth: 1,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderColor: 'rgba(106, 106, 106, 0.08)',
                padding: -20,
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
                  margin: 5,
                }}>
                <SvgXml xml={SVGWhatsApp} />
                <Text
                  style={{
                    color: 'rgba(29, 29, 29, 1)',
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: Fonts.regular,
                  }}>
                  Whatsapp
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: 'rgba(243, 243, 243, 1)',
                  true: 'rgba(226, 241, 227, 1)',
                }}
                thumbColor={isEnabled ? 'rgba(44, 106, 63, 1)' : '#000'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsEnabled(state => !state)}
                value={isEnabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderRadius: 40,
                borderWidth: 1,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderColor: 'rgba(106, 106, 106, 0.08)',
                padding: -20,
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
                  margin: 5,
                }}>
                <SvgXml xml={SVGTele} />
                <Text
                  style={{
                    color: 'rgba(29, 29, 29, 1)',
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: Fonts.regular,
                  }}>
                  Telegram
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: 'rgba(243, 243, 243, 1)',
                  true: 'rgba(226, 241, 227, 1)',
                }}
                thumbColor={isEnabled3 ? 'rgba(44, 106, 63, 1)' : '#000'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsEnabled3(state => !state)}
                value={isEnabled3}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderRadius: 40,
                borderWidth: 1,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderColor: 'rgba(106, 106, 106, 0.08)',
                padding: -20,
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
                  margin: 5,
                }}>
                <SvgXml xml={SVGAlert} />
                <Text
                  style={{
                    color: 'rgba(29, 29, 29, 1)',
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: Fonts.regular,
                  }}>
                  Push Alert
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: 'rgba(243, 243, 243, 1)',
                  true: 'rgba(226, 241, 227, 1)',
                }}
                thumbColor={isEnabled4 ? 'rgba(44, 106, 63, 1)' : '#000'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsEnabled4(state => !state)}
                value={isEnabled4}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
