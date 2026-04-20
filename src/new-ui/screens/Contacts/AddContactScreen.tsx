import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import { TextInput, Button } from '@new-ui/components/common-components/layout';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { useGorhomBottomSheet } from '@new-ui/components/common-components/GorhomBottomSheet';
import CountryCodePicker from '@new-ui/components/general-components/CountryCodePicker';
import { addContactScreenStyles } from '@new-ui/styles/screens/contacts/addContactScreenStyles';
import { ICountryCode } from '@new-ui/components/general-components/CountryCodePicker/types';

const AddContactScreen = () => {
  const { theme } = useTheme();
  const styles = addContactScreenStyles(theme);
  const { open, close } = useGorhomBottomSheet();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<ICountryCode>({
    name: 'United States',
    dialCode: '+1',
    code: 'US',
    flag: '🇺🇸',
  });
  const [payAiroTag, setPayAiroTag] = useState('');

  const handleCountrySelect = useCallback(
    (country: ICountryCode) => {
      setSelectedCountry(country);
      close();
    },
    [close]
  );

  const handleOpenCountryPicker = useCallback(() => {
    open(
      <CountryCodePicker
        onSelect={handleCountrySelect}
        selectedCode={selectedCountry.dialCode}
      />,
      { snapPoints: ['70%'], enableDrag: true, enableBackdropPress: true }
    );
  }, [open, handleCountrySelect, selectedCountry.dialCode]);

  const handleSave = () => {
    // placeholder — no API yet
  };

  const countryCodeLeft = (
    <View style={styles.countryCodeButton}>
      <CustomText style={styles.countryCodeText}>{selectedCountry.dialCode}</CustomText>
      <AppIcon.ChevronDown width={14} height={14} />
    </View>
  );

  const payAiroTagRight = (
    <View style={styles.payairoTagSuffix}>
      <CustomText variant="body" fontWeight="semiBold" color={theme.colors.textSecondary}>
        @payairo
      </CustomText>
    </View>
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.inputContainer}>
        <TextInput
          label="Full Name"
          placeholder="John Carter"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Mobile"
          placeholder="e.g. 112 34567"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          leftIcon={countryCodeLeft}
          onLeftIconPress={handleOpenCountryPicker}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="PayAiro Tag"
          placeholder="e.g. john.c323"
          value={payAiroTag}
          onChangeText={setPayAiroTag}
          autoCapitalize="none"
          rightIcon={payAiroTagRight}
          showRightSeparator={false}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} >
          Save
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default AddContactScreen;
