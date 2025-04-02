import {View, Text, TouchableOpacity} from 'react-native';
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
import Loader from '../../components/Loader';
import DocumentModal from '../../components/DocumentModal';
import {SVGDropDown} from '../../constants/images';

export default function IDProof(props) {
  const {payload} = props.route.params;
  const {tokens} = useSelectorAction();
  const [name, setname] = useState('');
  const [ssm, setssm] = useState('');

  const navigation = useNavigation();
  const [countryCode, setcountryCode] = useState({
    country: 'India',
    code: '+91',
    flag_image_url: 'https://flagcdn.com/w320/in.png',
  });
  const [idProof1, setidProof1] = useState([]);
  const [idProof2, setidProof2] = useState([]);
  const dispatch = useDispatch();
  const [spin, setspin] = useState(false);
  const [isVisible, setisVisible] = useState(false);
  const [poi, setpov] = useState('');

  const getWalletDetails = async accessToken => {
    const data = await getWallet(tokens?.access);
    dispatch(setWalletData(data?.data));
    setWalletDataAuth(data?.data);
    dispatch(setLogin(true));
    useDispatchAction(setSuccessMsg('Logged In Successfully'));
  };
  const handleIdProof = async () => {
    setspin(true);

    await setKycStep('2');
    if (idProof1.length === 0 || idProof2.length === 0) {
      useDispatchAction(setErrorMsg('ID Proofs are Required!'));
      return;
    }
    try {
      const formData2 = new FormData();
      formData2.append('poi_doc', idProof1[0]);
      formData2.append('address_pov', idProof2[0]);
      formData2.append('step_count', '2');
      formData2.append('poi', poi);
      formData2.append('ssm', ssm);
      let payload2 = {
        poi_doc: idProof1[0],
        address_pov: idProof2[0],
        poi,
        ssm,
      };
      navigation.navigate(SCREENS.Signature, {
        payload: {
          ...payload,
          poi_doc: idProof1[0],
          address_pov: idProof2[0],
          poi,
          ssm,
        },
      });
      setspin(false);

      return;

      const datas = await patchKyc(formData, tokens?.access, true);

      if (datas) {
        useDispatchAction(setSuccessMsg('ID Proof Updated Successfully'));

        navigation.navigate(SCREENS.Signature);
      } else {
        useDispatchAction(setErrorMsg('Something went wrong'));
      }
      setspin(false);
    } catch (error) {
      console.log(error, 'error');
      useDispatchAction(
        setErrorMsg('Invalid Document , Try To Upload Correct Document'),
      );

      setspin(false);
    }
    setspin(false);
  };

  return (
    <CommonContainer style={{marginVertical: 80}}>
      <Loader spin={spin} />
      <DocumentModal
        isVisible={isVisible}
        onClose={() => {
          setisVisible(false);
        }}
        onSelect={e => {
          setpov(e);
          setisVisible(false);
        }}
      />
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
          <TouchableOpacity onPress={() => setisVisible(true)}>
            <TextInputField
              label="Select document type"
              placeholder={'Select document type'}
              value={poi}
              editable={false}
              icon={SVGDropDown}
              isIcon={true}
            />
          </TouchableOpacity>
          {poi !== '' && (
            <UploadFile
              label={'Upload Front'}
              selectedFile={result => setidProof1(result)}
              value={idProof1[0]?.name}
              type={'image'}
            />
          )}
          {poi !== '' && (
            <UploadFile
              label={'Upload Back'}
              selectedFile={result => setidProof2(result)}
              value={idProof2[0]?.name}
              type={'image'}
            />
          )}
          {poi !== '' && (
            <TextInputField
              label="SSM"
              placeholder="Enter SSM"
              value={ssm}
              keyboardType={'numeric'}
              onChange={setssm}
            />
          )}
          <GenericButton
            title="Next"
            cStyle={{marginTop: 45}}
            onPress={handleIdProof}
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
