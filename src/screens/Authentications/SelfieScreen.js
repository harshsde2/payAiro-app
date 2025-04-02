import {View, Text, Image, Alert} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setSuccessMsg,
} from '../../redux/slices/authenticationSlice';
import moment from 'moment';
import {patchKyc} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {SCREENS} from '../../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../components/Loader';
import {
  askCameraPremission,
  checkCameraPremission,
} from '../../helper/Permission';

export default function SelfieScreen(props) {
  const {payload} = props.route.params;
  console.log(payload, 'payloads');
  const {tokens, userData} = useSelectorAction();

  const [selfie, setselfie] = useState(null);
  const navigation = useNavigation();
  console.log(selfie, 'selfie===>>>>');
  const [spin, setspin] = useState(false);

  const handleImage = async () => {
    try {
      if (!selfie) {
        useDispatchAction(setErrorMsg('Selfie is Required!'));
        return;
      }
      setspin(true);
      const formData = new FormData();
      // Append the selfie image
      formData.append('selfimage', {
        uri: selfie.uri,
        name: selfie.name || `selfie_${Date.now()}.jpg`,
        type: selfie.type || 'image/jpeg',
      });

      formData.append('city', payload?.city);
      formData.append('state', payload?.state);
      formData.append('street_address', payload?.residentialAddress);
      formData.append('zip_code', payload?.postalCode);
      formData.append('country', 'US');
      formData.append('poi_id', '32324234');
      formData.append('poi_doc', payload?.poi_doc);
      formData.append('step_count', 0);
      formData.append('address_pov', payload?.address_pov);
      formData.append('signature', payload?.signature);
      formData.append('ssn', payload?.ssm);
      formData.append('dob', payload?.dob);

      // Call API with merged form data
      const response = await patchKyc(formData, tokens?.access, true);
      console.log(response, 'response');
      if (response) {
        useDispatchAction(setSuccessMsg('KYC Updated Successfully'));
        navigation.navigate(SCREENS.Pincode);
      } else {
        useDispatchAction(setErrorMsg('Something went wrong'));
      }
    } catch (error) {
      console.log('Error uploading selfie:', error.data.data.details.errors);
      useDispatchAction(
        setErrorMsg(Object.values(error?.data?.data?.details?.errors)[0][0]) ??
          'Something went wrong',
      );
    }
  };

  const checkCam = name => {
    checkCameraPremission()
      .then(res => {
        if (res) {
          openCameras();
        } else {
          askCameraPremission()
            .then(res => {
              console.log(res, 'res');
              if (res) {
                openCameras();
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  };
  const openCameras = async () => {
    console.log('cool');
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
      noData: true,
    };

    await launchCamera(options, response => {
      if (response.didCancel) {
        console.log('Image picker canceled');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        console.log('responce,response', response);
        if (response.assets?.length > 0) {
          response.assets.map(i =>
            setselfie({
              fileCopyUri: null,
              name: i?.fileName,
              size: i?.fileSize,
              height: 4080,
              originalPath: i?.originalPath,
              type: i?.type,
              uri: i?.uri,
            }),
          );
        }
      }
    });
  };

  const chooseImages = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
      noData: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Image picker canceled');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        console.log('resp', response);
        if (response.assets?.length > 0) {
          console.log(response.assets, 'respaoaskamd');
          response.assets.map(i =>
            setselfie({
              fileCopyUri: null,
              name: i?.fileName,
              size: i?.fileSize,
              height: 4080,
              originalPath: i?.originalPath,
              type: i?.type,
              uri: i?.uri,
            }),
          );
        }
      }
    });
  };

  return (
    <CommonContainer style={{marginTop: 180}}>
      <Loader spin={spin} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}>
        <Text
          style={{
            fontFamily: Fonts.bold,
            textAlign: 'center',
            fontSize: 30,
          }}>
          Upload or Take Your Selfie
        </Text>
        {selfie && (
          <Image
            source={{
              uri: selfie?.uri,
            }}
            style={{
              width: 120,
              height: 120,
              alignSelf: 'center',
              borderRadius: 20,
            }}
          />
        )}
        <GenericButton
          title={'Choose From Gallery'}
          cStyle={{marginTop: 50, marginBottom: 15}}
          onPress={chooseImages}
        />
        <GenericButton title={'Open Camera'} onPress={checkCam} />
        <GenericButton
          title={'Next'}
          cStyle={{
            width: '100%',
            backgroundColor: selfie ? 'rgba(44, 106, 63, 1)' : '#ccc',
            marginTop: 15,
          }}
          onPress={handleImage}
          disabled={!selfie ? true : false}
        />
      </View>
    </CommonContainer>
  );
}
