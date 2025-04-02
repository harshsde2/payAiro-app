import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import Fonts from '../../constants/Fonts';
import {useNavigation} from '@react-navigation/native';

export default function AddCreditCard() {
  const navigation = useNavigation();
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
          Add Amount{' '}
        </Text>
        <Text
          style={{
            color: '#000',
            marginLeft: 10,
            fontFamily: Fonts.regular,
            fontSize: 12,
            marginBottom: 25,
          }}>
          Italic boolean comment slice comment invite subtract. Scale thumbnail
          vector object figjam follower list.{' '}
        </Text>
        <TextInputField label={'Enter to Add'} placeholder={'$20.00'} />

        {/* <TextInputField
            label="CVV"
            placeholder={'282'}
            //   value={name}
            //   onChange={setname}
            cStyle={{width: '48%'}}
          /> */}

        <GenericButton
          title="Add Money "
          cStyle={{marginTop: 30}}
          // onPress={() => navigation.navigate(SCREENS.Legal)}
        />
        <TouchableOpacity onPress={() => navigation.navigate('AchScreen')}>
          <Text
            style={{
              fontFamily: Fonts.semibold,
              textAlign: 'center',
              color: 'rgba(44, 106, 63, 1)',
              textDecorationColor: 'red',
              textDecorationLine: 'underline',
              marginTop: 10,
            }}>
            + Add ACH Information
          </Text>
        </TouchableOpacity>
      </View>
    </CommonHeaderv2>
  );
}
