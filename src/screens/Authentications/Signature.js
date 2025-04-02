import {View, Text, Platform} from 'react-native';
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
import RNFS from 'react-native-fs';

import {
  setErrorMsg,
  setLogin,
  setSuccessMsg,
  setWalletData,
} from '../../redux/slices/authenticationSlice';
import {useDispatch} from 'react-redux';
import Loader from '../../components/Loader';

export default function Signature(props) {
  const {payload} = props.route.params;

  const {tokens} = useSelectorAction();
  const [idProof2, setidProof2] = useState(null);
  const [isVisible, setisVisible] = useState(false);
  const navigation = useNavigation();
  const [spin, setspin] = useState(false);

  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const dispatch = useDispatch();
  const handleSignatureType = async base64String => {
    try {
      let base64 = base64String.replace('data:image/png;base64,', '');
      const fileName = `${Date.now()}.png`;

      // creates a file in temporary directory to delete later
      const path = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, base64, 'base64');

      const image = {
        uri: Platform.OS == 'ios' ? path : 'file://' + path,
        name: fileName,
        type: 'image/png',
      };
      setidProof2(image);
    } catch (error) {
      console.log(error);
    }
  };
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
    if (idProof1.length === 0 && !idProof2) {
      useDispatchAction(setErrorMsg('Signature are Required!'));
      return;
    }
    try {
      setspin(true);

      const formData3 = new FormData();
      formData3.append('signature', idProof2 ?? idProof1[0]);
      navigation.navigate(SCREENS.Dob, {
        payload: {...payload, signature: idProof2 ?? idProof1[0]},
      });
      setspin(false);

      const datas = await patchKyc(formData, tokens?.access, true);
      if (datas) {
        useDispatchAction(setSuccessMsg('Signature Updated Successfully'));
        navigation.navigate(SCREENS.Dob);
      } else {
        useDispatchAction(setErrorMsg('Something went wrong'));
      }
      setspin(false);
    } catch (error) {
      setspin(false);

      // useDispatchAction(
      //   setErrorMsg('Entity Too Large , Try To Upload Small File'),
      // );
    }
    setspin(false);
  };

  return (
    <CommonContainer style={{marginVertical: 80}}>
      <Loader spin={spin} />
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
            type="image"
          />
          <SignaturePad
            onSelected={e => handleSignatureType(e)}
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
          {/* <GenericButton
            title={'Skip'}
            cStyle={{backgroundColor: '#000', marginVertical: 10}}
            tStyle={{color: 'white'}}
            onPress={getWalletDetails}
          /> */}
        </View>
      </View>
    </CommonContainer>
  );
}
