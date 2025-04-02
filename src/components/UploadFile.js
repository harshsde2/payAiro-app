import {View, Text, TextInput} from 'react-native';
import React, {useState} from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {SVGUpload} from '../constants/images';
import DocumentPicker from 'react-native-document-picker';
import useDispatchAction from '../hooks/useDispatchAction';
import {setErrorMsg, setSuccessMsg} from '../redux/slices/authenticationSlice';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import GalleryModal from './GalaryModal';
import {askCameraPremission, checkCameraPremission} from '../helper/Permission';

export default function UploadFile({
  selectedFile,
  value,
  placeholder,
  label,
  type,
}) {
  const maxFileSize = 2 * 1024 * 1024; // 2 MB in bytes
  const [selfie, setselfie] = useState(null);
  const [isvisible, setisvisible] = useState(false);

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
          response.assets.map(i => {
            setselfie({
              fileCopyUri: null,
              name: i?.fileName,
              size: i?.fileSize,
              height: 4080,
              originalPath: i?.originalPath,
              type: i?.type,
              uri: i?.uri,
            });
            selectedFile([
              {
                fileCopyUri: null,
                name: i?.fileName,
                size: i?.fileSize,
                height: 4080,
                originalPath: i?.originalPath,
                type: i?.type,
                uri: i?.uri,
              },
            ]);
          });
        }
      }
    });
  };

  const handleUpload = async () => {
    const result = await DocumentPicker.pick({
      type: [
        DocumentPicker.types.pdf,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
      ],
    });
    console.log(result, 'result');
    if (result[0].size > maxFileSize) {
      useDispatchAction(setErrorMsg('File Size should be less or 2MB'));
    } else {
      selectedFile(result);
      useDispatchAction(setSuccessMsg('File Uploaded Successfully'));
    }
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
          response.assets.map(i => {
            setselfie({
              fileCopyUri: null,
              name: i?.fileName,
              size: i?.fileSize,
              height: 4080,
              originalPath: i?.originalPath,
              type: i?.type,
              uri: i?.uri,
            });
            selectedFile([
              {
                fileCopyUri: null,
                name: i?.fileName,
                size: i?.fileSize,
                height: 4080,
                originalPath: i?.originalPath,
                type: i?.type,
                uri: i?.uri,
              },
            ]);
          });
        }
      }
    });
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
  return (
    <View>
      <GalleryModal
        isVisible={isvisible}
        onConfirm={e => {
          if (e === 'gallery') {
            chooseImages();
          } else {
            checkCam();
          }
          setisvisible(false);
        }}
        onClose={() => setisvisible(false)}
      />
      <Text style={{fontFamily: Fonts.bold, padding: 10}}>{label}</Text>
      <View
        style={{
          borderRadius: 30,
          borderWidth: 1,
          borderColor: '#6A6A6A33',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 5,
        }}>
        <Text
          numberOfLines={1}
          style={{
            color: '#6A6A6A',
            paddingRight: 10,
            paddingLeft: 15,
            fontFamily: Fonts.semibold,
            width: '60%',
          }}>
          {value
            ? value
            : type === 'image'
            ? 'Tap to upload (.png,.jpg)'
            : 'Tap to upload (.pdf)'}
        </Text>
        <SvgXml
          xml={SVGUpload}
          style={{marginRight: 9}}
          onPress={() =>
            type === 'image' ? setisvisible(true) : handleUpload()
          }
        />
      </View>
    </View>
  );
}
