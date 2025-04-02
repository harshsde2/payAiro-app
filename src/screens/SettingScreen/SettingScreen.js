import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomNavigation from '../../components/BottomNavigation';
import Container from '../../HOC/Container';
import {SvgXml} from 'react-native-svg';
import {
  SVGLog,
  SVGLoggo,
  SVGLogo2,
  SVGPro,
  SVGProfile,
  SVGRefer,
  SVGRightIcon,
} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {SETTINGS_LISTS} from '../../constants/constant';
import {useNavigation} from '@react-navigation/native';
import LogoutModal from '../../components/LogoutModal';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setLogin,
  setTokens,
  setUserData,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import {
  setKYCAcceopted,
  setKycStep,
  setPin,
  setUser,
  setWalletDataAuth,
} from '../../services/Auth';
import useSelectorAction from '../../hooks/useSelectorAction';
import {getKYC} from '../../services/Services';

export default function SettingScreen() {
  const {tokens} = useSelectorAction();
  const navigation = useNavigation();
  const [isVisible, setisVisible] = useState(false);
  const {walletData} = useSelectorAction();
  const [kycStep, setkycStep] = useState('');
  useEffect(() => {
    getkycStep();
  }, []);

  const getkycStep = async () => {
    const kycData = await getKYC(tokens?.access);
    if (kycData?.data?.step_count) {
      setkycStep(kycData?.data);
    }
  };
  return (
    <Container>
      <BottomNavigation />
      <LogoutModal
        isVisible={isVisible}
        onCancel={() => setisVisible(false)}
        onClose={async () => {
          useDispatchAction(setUserData(null));
          useDispatchAction(setTokens(null));
          useDispatchAction(setWalletData(null));
          await setUser(null);
          setWalletDataAuth(null);
          setisVisible(false);
          useDispatchAction(setLogin(false));
          setPin(null);
          setKYCAcceopted(null);
        }}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              margin: 30,
              marginTop: 40,
            }}>
            <View
              style={[
                styles.circle,
                {backgroundColor: 'rgba(255, 172, 37, 1)'},
              ]}>
              {kycStep?.selfimage ? (
                <Image
                  source={{
                    uri: kycStep?.selfimage.includes('https://api.payairo.com')
                      ? kycStep?.selfimage
                      : 'https://api.payairo.com' + kycStep?.selfimage,
                  }}
                  style={styles.image}
                />
              ) : (
                <Text style={{...styles.initials, color: '#000'}}>
                  {walletData?.name?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
            <Text
              style={{
                color: '#000',
                marginLeft: 10,
                fontFamily: Fonts.semibold,
                fontSize: 18,
              }}>
              {walletData?.name}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 0,
            }}>
            <Text
              style={{
                color: '#000',
                marginLeft: 10,
                fontFamily: Fonts.bold,
                fontSize: 26,
                marginBottom: 20,
              }}>
              My Account
            </Text>
            {SETTINGS_LISTS.map((i, k) => (
              <TouchableOpacity
                disabled={i.isDisvled}
                onPress={() => {
                  if (i.name === 'Logout') {
                    setisVisible(true);
                    return;
                  }

                  navigation.navigate(i.route);
                }}
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
                  marginBottom: i.name === 'Logout' ? 100 : 5,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    margin: 5,
                  }}>
                  <SvgXml xml={i.icon} />
                  <Text
                    style={{
                      color: 'rgba(29, 29, 29, 1)',
                      marginLeft: 10,
                      fontSize: 16,
                      fontFamily: Fonts.regular,
                    }}>
                    {i?.name}
                  </Text>
                </View>
                {i?.name === 'KYC' ? (
                  <Text
                    style={{
                      textAlign: 'right',
                      fontFamily: Fonts.bold,
                      marginLeft: 40,
                      color: kycStep === '4' ? 'green' : 'orange',
                    }}>
                    {kycStep === '4' ? 'Verified' : 'Pending'}
                  </Text>
                ) : null}
                <SvgXml xml={SVGRightIcon} style={{marginRight: 20}} />
              </TouchableOpacity>
            ))}

            <SvgXml
              xml={SVGRefer}
              style={{marginBottom: 130, alignSelf: 'center'}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

export const styles = StyleSheet.create({
  circle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#000',
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
