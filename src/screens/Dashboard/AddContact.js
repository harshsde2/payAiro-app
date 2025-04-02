import {View, Text, StyleSheet, Alert, ToastAndroid} from 'react-native';
import React, {useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import {addContact} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import {
  setErrorMsg,
  setSuccessMsg,
} from '../../redux/slices/authenticationSlice';
import useDispatchAction from '../../hooks/useDispatchAction';

export default function AddContact() {
  const {tokens} = useSelectorAction();
  const [formData, setFormData] = useState({
    email: '',
    contactNumber: '',
    nickName: '',
    payAiroTag: '',
    walletAddress: '',
  });

  const [errors, setErrors] = useState({});
  const navigation = useNavigation();
  const validate = () => {
    const newErrors = {};
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (
      !formData.contactNumber ||
      !/^\+\d{1,3}\s\d{6,14}$/.test(formData.contactNumber)
    ) {
      newErrors.contactNumber =
        'Enter a valid contact number (e.g., +1 123456789).';
    }
    if (!formData.nickName) {
      newErrors.nickName = 'Nickname cannot be empty.';
    }
    if (!formData.payAiroTag) {
      newErrors.payAiroTag = 'Pay Airo Tag cannot be empty.';
    }
    if (
      !formData.walletAddress ||
      !/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)
    ) {
      newErrors.walletAddress = 'Enter a valid wallet address.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
  };

  const handleSave = async () => {
    const payload = {
      nickname: formData.nickName,
      email: formData.email,
      mobileno: formData.contactNumber,
      username: formData.payAiroTag,
      wallet_address: formData.walletAddress,
    };

    if (!formData.nickName.trim()) {
      useDispatchAction(setErrorMsg('Nickname is required'));
      return;
    }

    if (
      formData.email.trim() ||
      formData.walletAddress.trim() ||
      formData.payAiroTag.trim()
    ) {
      const data = await addContact(payload, tokens?.access);
      console.log(data, 'contactsss');
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg('Contact Added Successfully'));
        navigation.navigate(SCREENS.Dashboard);
      } else {
        useDispatchAction(
          setErrorMsg('Wallet Address/PayairoTag/email not exists'),
        );
      }
    } else {
      useDispatchAction(
        setErrorMsg(
          'Atleast one fields is required among Email/PayAiro Tag/Wallet Address',
        ),
      );
    }
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Add Contact'} leftIcon={SVGLeftArrow} />
      <View style={styles.container}>
        <TextInputField
          label={'Email'}
          placeholder={'placeholder@gmail.com'}
          value={formData.email}
          onChange={value => handleChange('email', value)}
          error={errors.email}
        />
        <TextInputField
          label={'Contact Number'}
          placeholder={'+1 234567890'}
          value={formData.contactNumber}
          onChange={value => handleChange('contactNumber', value)}
          error={errors.contactNumber}
        />
        <TextInputField
          label={'Nick Name'}
          placeholder={'Jhonwick'}
          value={formData.nickName}
          onChange={value => handleChange('nickName', value)}
          error={errors.nickName}
        />
        <TextInputField
          label={'Pay Airo Tag'}
          placeholder={'Jhonwick3246'}
          value={formData.payAiroTag}
          onChange={value => handleChange('payAiroTag', value)}
          error={errors.payAiroTag}
        />
        <TextInputField
          label={'Wallet Address'}
          placeholder={'0x2467jk...lko90'}
          value={formData.walletAddress}
          onChange={value => handleChange('walletAddress', value)}
          error={errors.walletAddress}
        />
        <GenericButton
          title={'Save Changes'}
          cStyle={{marginTop: 70}}
          onPress={handleSave}
          disabled={Object.keys(errors).length > 0}
        />
      </View>
    </CommonHeaderv2>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: 20,
    marginTop: 20,
  },
});
