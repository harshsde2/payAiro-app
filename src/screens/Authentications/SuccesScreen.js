import {View, Text} from 'react-native';
import React, {useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import {SvgXml} from 'react-native-svg';
import {SVGSucc} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import {addBank, addBank2, getKYC, getWallet} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setLogin,
  setSuccessMsg,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import {setWalletDataAuth} from '../../services/Auth';
import {useDispatch} from 'react-redux';
import KYCFailureModal from '../../components/KYCFailureModal';

export default function SuccesScreen() {
  const {tokens} = useSelectorAction();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isVisible, setisVisible] = useState(false);

  const getWalletDetails = async () => {
    const data1 = await addBank(tokens?.access);
    const data2 = await addBank2(tokens?.access);
    console.log('bankAdded===>>>', data1);
    const data = await getWallet(tokens?.access);
    console.log(data);
    useDispatchAction(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };
  const getkycStep = async () => {
    const kycData = await getKYC(tokens?.access);
    console.log(kycData, 'KYCDatataaatat');
    if (!kycData?.data?.is_varified) {
      setisVisible(true);
    }
  };
  return (
    <CommonHeaderv2>
      <SvgXml
        xml={SVGSucc}
        style={{alignSelf: 'center', marginVertical: 140}}
      />
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
            color: 'black',
            fontFamily: Fonts.bold,
            fontSize: 26,
          }}>
          Your account has been created Successfully!
        </Text>
        <Text
          style={{
            color: 'rgba(106, 106, 106, 0.75)',
            fontFamily: Fonts.regular,
            fontSize: 14,
            marginVertical: 20,
          }}>
          Object outline undo layer arrange. Image object vector follower
          component main.{' '}
        </Text>
        <GenericButton title={'Send Invite'} onPress={getWalletDetails} />
      </View>
    </CommonHeaderv2>
  );
}
