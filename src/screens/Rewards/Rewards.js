import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Container from '../../HOC/Container';
import HeaderTitle from '../../components/HeaderTitle';
import Rewards2 from '../../components/Rewards2';
import BottomNavigation from '../../components/BottomNavigation';
import {useIsFocused} from '@react-navigation/native';
import useDispatchAction from '../../hooks/useDispatchAction';
import {setActiveTab} from '../../redux/slices/authenticationSlice';
import Fonts from '../../constants/Fonts';

export default function Rewards() {
  const isFoucused = useIsFocused();
  const [activeTab, setactiveTab] = useState('1');

  useEffect(() => {
    if (isFoucused) {
      useDispatchAction(setActiveTab('4'));
    }
  }, [isFoucused]);
  return (
    <Container>
      <BottomNavigation />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <HeaderTitle title={'Offer & Rewards'} />
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
              paddingBottom: 100,
            }}>
            {activeTab === '1' && (
              <>
                <Rewards2 />
                <Rewards2 />
                <Rewards2 />
                <Rewards2 />
              </>
            )}
            {activeTab === '2' && (
              <>
                <Image
                  source={require('../../../assets/images/coupn1.png')}
                  style={{resizeMode: 'contain', width: '100%', height: 140}}
                />
                <Image
                  source={require('../../../assets/images/coupn2.png')}
                  style={{resizeMode: 'contain', width: '100%', height: 140}}
                />
                <Image
                  source={require('../../../assets/images/coupn3.png')}
                  style={{resizeMode: 'contain', width: '100%', height: 140}}
                />
                <Image
                  source={require('../../../assets/images/coupn4.png')}
                  style={{resizeMode: 'contain', width: '100%', height: 140}}
                />
                <Image
                  source={require('../../../assets/images/coupn5.png')}
                  style={{resizeMode: 'contain', width: '100%', height: 140}}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
