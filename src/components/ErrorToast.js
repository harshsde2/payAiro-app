import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {SVGCross} from '../constants/images';
import useSelectorAction from '../hooks/useSelectorAction';
import useDispatchAction from '../hooks/useDispatchAction';
import {setErrorMsg, setSuccessMsg} from '../redux/slices/authenticationSlice';
import { CustomText } from 'tsx-components';
import { themes, useTheme } from 'styles';

export default function ErrorToast() {
  const {errorMsg, successMsg} = useSelectorAction();
  useEffect(() => {
    setTimeout(() => {
      useDispatchAction(setErrorMsg(null));
      useDispatchAction(setSuccessMsg(null));
    }, 2000);
  }, []);
  const theme = useTheme()
  return (
    <View
      style={{
        backgroundColor: errorMsg ? 'red' : 'green',
        position: 'absolute',
        top: 30,
        zIndex: 99999,
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 5,
        paddingHorizontal:10,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <CustomText
        variant={'body1'}
        color={theme.theme.colors.palette.white}
        style={{
          color: 'white',
          // fontFamily: Fonts.bold,
          width: '80%',
          // fontSize: 13,
          // marginBottom: 3,
        }}
        >
        {errorMsg || successMsg}
      </CustomText>
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
