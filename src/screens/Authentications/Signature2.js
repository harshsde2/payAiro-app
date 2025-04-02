import {View, Text} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import Fonts from '../../constants/Fonts';
import UploadFile from '../../components/UploadFile';
import SignaturePad from '../../components/SignaturePad';
import {setKycStep, setWalletDataAuth} from '../../services/Auth';
import {getWallet, patchKyc} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setLogin,
  setSuccessMsg,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import {useDispatch} from 'react-redux';

export default function Signature2(props) {
  const {tokens} = useSelectorAction();

  const [isVisible, setisVisible] = useState(false);
  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const dispatch = useDispatch();

  const getWalletDetails = async accessToken => {
    const data = await getWallet(tokens?.access);
    dispatch(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };
  const [idProof1, setidProof1] = useState([]);
  const handleSignature = async () => {
    const payload3 = {
      signature: idProof1,
    };
    if (idProof1.length === 0) {
      useDispatchAction(setErrorMsg('Signature are Required!'));
      return;
    }
    const formData = new FormData();
    formData.append('signature', idProof1[0]);
    const datas = await patchKyc(formData, tokens?.access, true);
    if (datas) {
      useDispatchAction(setSuccessMsg('Signature Updated Successfully'));
      navigation.navigate('Dob2');
    } else {
      useDispatchAction(setErrorMsg('Something went wrong'));
    }
  };

  return (
    <CommonContainer style={{marginVertical: 80}}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}>
        <View style={{width: '80%', alignSelf: 'center'}}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              textAlign: 'center',
              fontSize: 30,
            }}>
            Draw your signature
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            Align horizontal select opacity plugin selection reesizing comment
            rectangle text.
          </Text>
        </View>
        <View style={{marginVertical: 40}}>
          <UploadFile
            label={'Id Proof 1'}
            selectedFile={result => setidProof1(result)}
            value={idProof1[0]?.name}
          />
          <SignaturePad
            onSelected={e => console.log(e)}
            isVisible={isVisible}
            onClose={() => setisVisible(false)}
          />
          <GenericButton
            title="Click to Draw your Signature"
            cStyle={{
              marginTop: 45,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#000',
            }}
            onPress={() => setisVisible(true)}
          />
          <GenericButton
            title="Next"
            cStyle={{marginTop: 45}}
            onPress={() => handleSignature()}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
