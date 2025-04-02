import {View, Text} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import Fonts from '../../constants/Fonts';
import UploadFile from '../../components/UploadFile';
import {setKycStep, setWalletDataAuth} from '../../services/Auth';
import {
  setErrorMsg,
  setLogin,
  setSuccessMsg,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import useDispatchAction from '../../hooks/useDispatchAction';
import {getWallet, patchKyc} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useDispatch} from 'react-redux';

export default function IDProof2(props) {
  const {tokens} = useSelectorAction();
  const [name, setname] = useState('');
  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const [idProof1, setidProof1] = useState([]);
  const [idProof2, setidProof2] = useState([]);
  const dispatch = useDispatch();

  const getWalletDetails = async accessToken => {
    const data = await getWallet(tokens?.access);
    dispatch(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };
  const handleIdProof = async () => {
    await setKycStep('2');
    if (idProof1.length === 0 || idProof2.length === 0) {
      useDispatchAction(setErrorMsg('ID Proofs are Required!'));
      return;
    }
    const formData = new FormData();
    formData.append('poi_doc', idProof1[0]);
    formData.append('address_pov', idProof2[0]);
    const datas = await patchKyc(formData, tokens?.access, true);
    if (datas) {
      useDispatchAction(setSuccessMsg('ID Proof Updated Successfully'));

      navigation.navigate('Signature2');
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
            Upload your ID Proof
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              textAlign: 'center',
              marginTop: 5,
            }}>
            Align horizontal select opacity plugin selection reesizing comment
            rectangle text.{' '}
          </Text>
        </View>
        <View style={{marginVertical: 40}}>
          <UploadFile
            label={'Id Proof 1'}
            selectedFile={result => setidProof1(result)}
            value={idProof1[0]?.name}
          />
          <UploadFile
            label={'Id Proof 2'}
            selectedFile={result => setidProof2(result)}
            value={idProof2[0]?.name}
          />

          <GenericButton
            title="Next"
            cStyle={{marginTop: 45}}
            onPress={handleIdProof}
          />
        </View>
      </View>
    </CommonContainer>
  );
}
