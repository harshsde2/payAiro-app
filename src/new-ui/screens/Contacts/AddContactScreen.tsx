import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import { TextInput, Button } from '@new-ui/components/common-components/layout';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { useGorhomBottomSheet } from '@new-ui/components/common-components/GorhomBottomSheet';
import CountryCodePicker from '@new-ui/components/general-components/CountryCodePicker';
import { addContactScreenStyles } from '@new-ui/styles/screens/contacts/addContactScreenStyles';
import { ICountryCode } from '@new-ui/components/general-components/CountryCodePicker/types';
import {
  buildContactPhone,
  normalizePayAiroTag,
  splitFullName,
  useAddUserContact,
} from 'query/hooks/useContact';
import { showError, showSuccess } from 'utils/toast';

const NAME_PATTERN = /^[a-zA-Z\s'-]+$/;
const TAG_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;

type FormErrors = {
  fullName?: string;
  mobile?: string;
  payAiroTag?: string;
  general?: string;
};

const AddContactScreen = () => {
  const { theme } = useTheme();
  const styles = addContactScreenStyles(theme);
  const navigation = useNavigation<any>();
  const { open, close } = useGorhomBottomSheet();
  const { mutate: addUserContact, isPending } = useAddUserContact();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<ICountryCode>({
    name: 'United States',
    dialCode: '+1',
    code: 'US',
    flag: '🇺🇸',
  });
  const [payAiroTag, setPayAiroTag] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

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

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateForm = useCallback((): FormErrors => {
    const nextErrors: FormErrors = {};
    const trimmedName = fullName.trim();
    const trimmedMobile = mobile.trim();
    const cleanTag = normalizePayAiroTag(payAiroTag);
    const mobileDigits = trimmedMobile.replace(/\D/g, '');

    if (!trimmedName) {
      nextErrors.fullName = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    } else if (!NAME_PATTERN.test(trimmedName)) {
      nextErrors.fullName =
        'Full name can only contain letters, spaces, hyphens, and apostrophes.';
    }

    if (trimmedMobile) {
      if (mobileDigits.length < 6 || mobileDigits.length > 14) {
        nextErrors.mobile = 'Enter a valid mobile number (6–14 digits).';
      }
    }

    if (cleanTag) {
      if (!TAG_PATTERN.test(cleanTag)) {
        nextErrors.payAiroTag =
          'PayAiro Tag must be 3–30 characters and use letters, numbers, dots, underscores, or hyphens.';
      }
    }

    if (!cleanTag && !trimmedMobile) {
      nextErrors.general = 'Provide at least a PayAiro Tag or mobile number.';
    }

    return nextErrors;
  }, [fullName, mobile, payAiroTag]);

  const handleSave = useCallback(() => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError =
        validationErrors.fullName ||
        validationErrors.mobile ||
        validationErrors.payAiroTag ||
        validationErrors.general ||
        'Please fix the highlighted fields.';
      showError('Please check the form', firstError);
      return;
    }

    const { first_name, last_name } = splitFullName(fullName);
    const cleanTag = normalizePayAiroTag(payAiroTag);
    const mobileDigits = mobile.replace(/\D/g, '');

    addUserContact(
      {
        username: cleanTag,
        payairo_id: '',
        email: '',
        phone: '',
        first_name,
        last_name,
        contact_phone: mobileDigits
          ? buildContactPhone(selectedCountry.dialCode, mobileDigits)
          : '',
      },
      {
        onSuccess: (response) => {
          if (response?.ok === false) {
            showError("Couldn't add contact", response?.message || 'Please try again.');
            return;
          }
          showSuccess('Contact added', response?.message || 'Your contact has been saved.');
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        },
        onError: (error) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to add contact. Please try again.';
          showError("Couldn't add contact", message);
        },
      }
    );
  }, [
    addUserContact,
    fullName,
    mobile,
    navigation,
    payAiroTag,
    selectedCountry.dialCode,
    validateForm,
  ]);

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
          onChangeText={(value) => {
            setFullName(value);
            clearFieldError('fullName');
            clearFieldError('general');
          }}
          autoCapitalize="words"
        />
        {errors.fullName ? (
          <CustomText variant="caption" color={theme.colors.error} style={styles.fieldError}>
            {errors.fullName}
          </CustomText>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Mobile"
          placeholder="e.g. 1234567890"
          value={mobile}
          onChangeText={(value) => {
            setMobile(value);
            clearFieldError('mobile');
            clearFieldError('general');
          }}
          keyboardType="phone-pad"
          leftIcon={countryCodeLeft}
          onLeftIconPress={handleOpenCountryPicker}
        />
        {errors.mobile ? (
          <CustomText variant="caption" color={theme.colors.error} style={styles.fieldError}>
            {errors.mobile}
          </CustomText>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="PayAiro Tag"
          placeholder="e.g. john.c323"
          value={payAiroTag}
          onChangeText={(value) => {
            setPayAiroTag(value);
            clearFieldError('payAiroTag');
            clearFieldError('general');
          }}
          autoCapitalize="none"
          // rightIcon={payAiroTagRight}
          showRightSeparator={false}
        />
        {errors.payAiroTag ? (
          <CustomText variant="caption" color={theme.colors.error} style={styles.fieldError}>
            {errors.payAiroTag}
          </CustomText>
        ) : null}
      </View>

      {errors.general ? (
        <CustomText variant="caption" color={theme.colors.error} style={styles.fieldError}>
          {errors.general}
        </CustomText>
      ) : null}

      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} loading={isPending} disabled={isPending}>
          Save
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default AddContactScreen;
