import {View, Text} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import Fonts from '../../constants/Fonts';

export default function AddCard() {
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Add Card'} leftIcon={SVGLeftArrow} />
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
            marginBottom: 20,
          }}>
          Add Credit Card
        </Text>
        <TextInputField
          label={'Enter Card Number'}
          placeholder={'4242 4242 4242 4242'}
        />
        <TextInputField label={'Card Holder Name'} placeholder={'Deo'} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginVertical: 10,
          }}>
          <TextInputField
            label="MM/YY"
            placeholder={'12/28'}
            //   value={name}
            //   onChange={setname}
            cStyle={{width: '48%'}}
          />
          <TextInputField
            label="CVV"
            placeholder={'282'}
            //   value={name}
            //   onChange={setname}
            cStyle={{width: '48%'}}
          />
        </View>
        <GenericButton
          title="Save Card"
          cStyle={{marginTop: 230}}
          // onPress={() => navigation.navigate(SCREENS.Legal)}
        />
      </View>
    </CommonHeaderv2>
  );
}
