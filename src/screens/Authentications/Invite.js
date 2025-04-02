import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import Container from '../../HOC/Container';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import CommonContainer from '../../HOC/CommonContainer';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import {getKYC, getWallet} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import useDispatchAction from '../../hooks/useDispatchAction';
import {setLogin, setWalletData} from '../../redux/slices/authenticationSlice';
import {setWalletDataAuth} from '../../services/Auth';
import {useDispatch} from 'react-redux';
import KYCFailureModal from '../../components/KYCFailureModal';

export default function Invite() {
  const navigation = useNavigation();
  const {tokens} = useSelectorAction();
  const [first, setfirst] = useState('second');
  const [isVisible, setisVisible] = useState(false);
  useEffect(() => {
    getkycStep();
  }, []);

  const dispatch = useDispatch();
  const getWalletDetails = async () => {
    const data = await getWallet(tokens?.access);
    console.log(data);
    useDispatchAction(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    setfirst('first');
  };
  const getkycStep = async () => {
    Alert.alert();
    const kycData = await getKYC(tokens?.access);
    console.log(kycData, 'KYCDatataaatat');
    if (!kycData?.data?.is_varified) {
      setisVisible(true);
    }
  };
  return (
    <CommonContainer style={{marginVertical: 180}}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}>
        <View style={{width: '90%'}}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              textAlign: 'left',
              fontSize: 28,
            }}>
            Invite Friends and Get $5 Each{' '}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'left',
              marginTop: 5,
            }}>
            Make it easy to find friends, protect your account, and prevent spam
            by allowing AirPay App to access and store your contact list.
          </Text>
        </View>
        <GenericButton
          title={'Send Invite'}
          cStyle={{marginTop: 30}}
          onPress={() => {
            getWalletDetails();
          }}
        />
        <GenericButton
          title={'Skip'}
          cStyle={{backgroundColor: '#000', marginVertical: 10}}
          tStyle={{color: 'white'}}
          onPress={getWalletDetails}
        />
      </View>
    </CommonContainer>
  );
}
