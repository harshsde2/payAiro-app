import {View, Text} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import Fonts from '../../constants/Fonts';

export default function AchScreen() {
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Information'} leftIcon={SVGLeftArrow} />
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
            color: '#000',
            marginLeft: 10,
            fontFamily: Fonts.bold,
            fontSize: 20,
            marginBottom: 5,
          }}>
          Add ACH Information
        </Text>
        <Text
          style={{
            color: '#000',
            marginLeft: 10,
            fontFamily: Fonts.regular,
            fontSize: 12,
            marginBottom: 25,
          }}>
          Scale thumbnail vector object figjam follower list.
        </Text>
        <TextInputField
          label={'Enter Name on Account'}
          placeholder={'Joe Dohn'}
        />
        <TextInputField
          label={'Enter Routing/ABA Number'}
          placeholder={'12345'}
        />

        <TextInputField
          label="Enter Account Number"
          placeholder={'433435435544354548'}
        />
        {/* <TextInputField
            label="CVV"
            placeholder={'282'}
            //   value={name}
            //   onChange={setname}
            cStyle={{width: '48%'}}
          /> */}

        <GenericButton
          title="Save "
          cStyle={{marginTop: 30}}
          // onPress={() => navigation.navigate(SCREENS.Legal)}
        />
      </View>
    </CommonHeaderv2>
  );
}
