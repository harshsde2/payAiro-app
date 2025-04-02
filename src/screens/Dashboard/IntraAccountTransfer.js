import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {SVGLeftArrow, SVGSearch} from '../../constants/images';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {selfTransfer} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setSuccessMsg,
} from '../../redux/slices/authenticationSlice';
import {useNavigation} from '@react-navigation/native';

export default function IntraAccountTransfer() {
  const {tokens} = useSelectorAction();
  const DROPDOWN_LISTS = [
    {
      label: 'Bank',
      value: 'bank',
    },
    {
      label: 'Roth Ira',
      value: 'rothIra',
    },
    {
      label: 'Traditional',
      value: 'traditionalIra',
    },
    {
      label: 'External',
      value: 'external',
    },
  ];
  const [isDropdowVisible, setisDropdowVisible] = useState(false);
  const [isDropdowVisible2, setisDropdowVisible2] = useState(false);
  const [souceAccount, setsouceAccount] = useState(null);
  const [destinationAccount, setdestinationAccount] = useState(null);
  const [amount, setamount] = useState('');
  const navigation = useNavigation();
  const handleSelfTransfer = async () => {
    try {
      if (amount === '' || destinationAccount === '' || souceAccount === '') {
        useDispatchAction(setErrorMsg('One or more field are empty'));
        return;
      }
      if (destinationAccount === souceAccount) {
        useDispatchAction(setErrorMsg('Cannot keep the same account type'));
        return;
      }
      const data = await selfTransfer(
        {
          amount: amount,
          source_account_type: souceAccount?.value,
          destination_account_type: destinationAccount?.value,
        },
        tokens?.access,
      );
      console.log(data, 'data');
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg(data?.data?.message));
        navigation.goBack();
      } else {
        useDispatchAction(
          setErrorMsg(data?.data?.error ?? 'Something went wrong'),
        );
      }
    } catch (error) {
      console.log(error);
      useDispatchAction(setErrorMsg(error?.message ?? 'Something went wrong'));
    }
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle2
        leftIcon={SVGLeftArrow}
        title={'Intra Account Transfer'}
        rightIcon={SVGSearch}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 15,
          marginTop: 20,
        }}>
        <TouchableOpacity onPress={() => setisDropdowVisible(state => !state)}>
          <TextInputField
            label={'Source Account Type'}
            placeholder={'Source Account Type'}
            editable={false}
            value={souceAccount?.label}
          />
          {isDropdowVisible &&
            DROPDOWN_LISTS.map((i, k) => (
              <GenericButton
                onPress={() => {
                  setsouceAccount(i);

                  setisDropdowVisible(false);
                  setisDropdowVisible2(false);
                }}
                cStyle={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  marginVertical: 10,
                  borderColor: 'grey',
                }}
                title={i?.label}
                tStyle={{color: 'black'}}
              />
            ))}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setisDropdowVisible2(state => !state)}>
          <TextInputField
            label={'Destination Account Type'}
            placeholder={'Destination Account Type'}
            editable={false}
            value={destinationAccount?.label}
          />
          {isDropdowVisible2 &&
            DROPDOWN_LISTS.map((i, k) => (
              <GenericButton
                onPress={() => {
                  setdestinationAccount(i);

                  setisDropdowVisible(false);
                  setisDropdowVisible2(false);
                }}
                cStyle={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  marginVertical: 10,
                  borderColor: 'grey',
                }}
                title={i?.label}
                tStyle={{color: 'black'}}
              />
            ))}
        </TouchableOpacity>
        <TextInputField value={amount} onChange={setamount} label={'Amount'} />
        <GenericButton
          onPress={handleSelfTransfer}
          title={'Transfer'}
          cStyle={{marginTop: 280}}
        />
      </View>
    </CommonHeaderv2>
  );
}
