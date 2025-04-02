import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {SVGCross} from '../constants/images';
import useSelectorAction from '../hooks/useSelectorAction';
import useDispatchAction from '../hooks/useDispatchAction';
import {setErrorMsg, setSuccessMsg} from '../redux/slices/authenticationSlice';

export default function ErrorToast() {
  const {errorMsg, successMsg} = useSelectorAction();
  useEffect(() => {
    setTimeout(() => {
      useDispatchAction(setErrorMsg(null));
      useDispatchAction(setSuccessMsg(null));
    }, 2000);
  }, []);

  return (
    <View
      style={{
        backgroundColor: errorMsg ? 'red' : 'green',
        position: 'absolute',
        top: 30,
        zIndex: 99999,
        width: '90%',
        alignSelf: 'center',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Text
        style={{
          color: 'white',
          fontFamily: Fonts.bold,
          width: '80%',
          fontSize: 13,
          marginBottom: 3,
        }}>
        {errorMsg || successMsg}
      </Text>
      <SvgXml
        xml={SVGCross}
        style={{marginRight: 20}}
        onPress={() => {
          useDispatchAction(setErrorMsg(null));
          useDispatchAction(setSuccessMsg(null));
        }}
      />
    </View>
  );
}
