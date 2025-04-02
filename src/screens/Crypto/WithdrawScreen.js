import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {
  SVGDownArrow,
  SVGDownArrow2,
  SVGLeftArrow,
  SVGLocation,
  SVGSearch,
} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import TextInputField from '../../components/TextInputField';
import SelectionModal from '../../components/SelectionModal';
import {getBlockchain} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useNavigation} from '@react-navigation/native';
import GenericButton from '../../components/GenericButton';

export default function WithdrawScreen(props) {
  const {item} = props.route.params;
  const [amount, setamount] = useState('');
  const [address, setaddress] = useState('');
  const [network, setnetwork] = useState('');
  const [isVisible, setisVisible] = useState(false);
  const {tokens} = useSelectorAction();
  const navigation = useNavigation();
  const [alloCationLists, setalloCationLists] = useState([]);
  useEffect(() => {
    handleBalance();
  }, []);

  const handleBalance = async () => {
    const data = await getBlockchain(tokens?.access);
    console.log(data?.data?.blockchains, 'data?.data?.blockchains');
    if (data?.data?.blockchains) {
      setalloCationLists(
        data?.data?.blockchains.filter(asset => asset.assetType !== 'usd'),
      );
    }
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle2
        leftIcon={SVGLeftArrow}
        title={'Withdraw Token'}
        rightIcon={SVGSearch}
      />
      <SelectionModal
        isVisible={isVisible}
        onClose={() => setisVisible(false)}
        onSelected={i => {
          setnetwork(i);
          setisVisible(false);
        }}
        type="select"
        data={alloCationLists}
      />
      <Text
        style={{
          textAlign: 'center',
          color: '#000',
          fontSize: 14,
          fontFamily: Fonts.regular,
          marginTop: 60,
        }}>
        Available Token{' '}
      </Text>
      <Text
        style={{
          textAlign: 'center',
          color: '#000',
          fontSize: 42,
          fontFamily: Fonts.bold,
        }}>
        {Number(item?.disbursable).toFixed(5)} {item?.assetType?.toUpperCase()}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(44, 106, 63, 1)',
          paddingHorizontal: 5,
          paddingTop: 5,
          paddingBottom: 8,
          width: '30%',
          borderRadius: 40,
          alignSelf: 'center',
          marginVertical: 8,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#fff',
            fontFamily: Fonts.semibold,
          }}>
          $ {Number(item?.usd).toFixed(5)}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}>
        <View
          style={{
            padding: 20,
            borderRadius: 30,
            backgroundColor: 'rgba(106, 106, 106, 0.12)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'rgba(106, 106, 106, 0.12)',
          }}>
          <TextInput
            placeholder={'Enter Amount'}
            placeholderTextColor={'grey'}
            keyboardType="numeric"
            style={{borderWidth: 0}}
            value={amount}
            onChangeText={setamount}
          />
          <TouchableOpacity
            // onPress={() => setselectionModalVisible(true)}
            style={{
              backgroundColor: 'rgba(44, 106, 63, 1)',
              paddingHorizontal: 5,
              paddingTop: 7,
              paddingBottom: 10,
              width: '30%',
              borderRadius: 40,
              alignSelf: 'center',
              marginVertical: 8,
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#fff',
                fontFamily: Fonts.semibold,
                fontSize: 12,
              }}>
              {item?.assetType?.toUpperCase()} <SvgXml xml={SVGDownArrow2} />
            </Text>
          </TouchableOpacity>
        </View>
        <TextInputField
          label={'Address'}
          placeholder={'Address'}
          isIcon={SVGLocation}
          icon={SVGLocation}
          iStyle={{
            backgroundColor: 'rgba(106, 106, 106, 0.12)',
            paddingLeft: 10,
          }}
          cStyle={{marginTop: 13}}
          value={address}
          onChange={setaddress}
        />

        <TouchableOpacity onPress={() => setisVisible(true)}>
          <TextInputField
            editable={false}
            label={'Select Network'}
            placeholder={'Select Network'}
            isIcon={SVGDownArrow}
            icon={SVGDownArrow}
            iStyle={{
              backgroundColor: 'rgba(106, 106, 106, 0.12)',
              paddingLeft: 10,
            }}
            cStyle={{marginTop: 13}}
            value={network}
            onChange={setnetwork}
          />
        </TouchableOpacity>

        <GenericButton title={'Withdraw'} cStyle={{marginTop: 80}} />
      </View>
    </CommonHeaderv2>
  );
}
