import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Components
import { ScreenContainer } from '../../HOC';
import HeaderTitle from '../../components/HeaderTitle';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import CustomText from '../../tsx-components/CustomText';

// Constants & Services
import { SVGLeftArrow } from '../../constants/images';
import { SCREENS } from '../../constants/SCREENS';
import { addContact } from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import useDispatchAction from '../../hooks/useDispatchAction';
import { setErrorMsg, setSuccessMsg } from '../../redux/slices/authenticationSlice';
import { useTheme } from '../../styles/ThemeContext';

export default function AddContact() {
  // Hooks
  const navigation = useNavigation();
  const { tokens } = useSelectorAction();
  const { theme } = useTheme();
  
  // State
  const [formData, setFormData] = useState({
    email: '',
    contactNumber: '',
    nickName: '',
    payAiroTag: '',
    walletAddress: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle back navigation
  const handleGoBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log('Cannot go back, no screens in history');
        BackHandler.exitApp();
      }
    } catch (err) {
      console.log('Navigation error:', err);
    }
  }, [navigation]);
  
  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleGoBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [handleGoBack]);

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    // Contact number validation (optional)
    if (formData.contactNumber && !/^\+\d{1,3}\s\d{6,14}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Enter a valid contact number (e.g., +1 123456789).';
    }
    
    // Nick name validation (required)
    if (!formData.nickName.trim()) {
      newErrors.nickName = 'Nickname is required.';
    }
    
    // PayAiro Tag validation (optional)
    // No specific validation pattern, just check if it exists if provided
    
    // Wallet address validation (optional but must be valid if provided)
    if (formData.walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Enter a valid wallet address.';
    }
    
    // At least one of email, payAiroTag, or walletAddress must be provided
    if (!formData.email && !formData.payAiroTag && !formData.walletAddress) {
      newErrors.general = 'At least one of Email, PayAiro Tag, or Wallet Address is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  // Handle form submission
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        nickname: formData.nickName,
        email: formData.email,
        mobileno: formData.contactNumber,
        username: formData.payAiroTag,
        wallet_address: formData.walletAddress,
      };
      
      const response = await addContact(payload, tokens?.access);
      
      if (response && response?.status) {
        useDispatchAction(setSuccessMsg('Contact added successfully'));
        navigation.navigate(SCREENS.Dashboard);
      } else {
        useDispatchAction(setErrorMsg('Wallet Address/PayAiro Tag/Email not found'));
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      useDispatchAction(setErrorMsg('Failed to add contact. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tokens, navigation, validateForm]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    // Nickname is required
    if (!formData.nickName.trim()) return false;
    
    // At least one of these must be provided
    if (!formData.email && !formData.payAiroTag && !formData.walletAddress) {
      return false;
    }
    
    // Check if there are any validation errors
    return Object.keys(errors).length === 0;
  }, [formData, errors]);

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle 
        title="Add Contact" 
        leftIcon={SVGLeftArrow} 
        isBack={true}
        onPressLeft={handleGoBack}
      />
      
      <View style={styles(theme).container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles(theme).scrollContent}>
          
          <TextInputField
            label="Email"
            placeholder="placeholder@gmail.com"
            value={formData.email}
            onChange={value => handleChange('email', value)}
            error={errors.email}
          />
          
          <TextInputField
            label="Contact Number"
            placeholder="+1 234567890"
            value={formData.contactNumber}
            onChange={value => handleChange('contactNumber', value)}
            error={errors.contactNumber}
          />
          
          <TextInputField
            label="Nick Name"
            placeholder="Jhonwick"
            value={formData.nickName}
            onChange={value => handleChange('nickName', value)}
            error={errors.nickName}
          />
          
          <TextInputField
            label="Pay Airo Tag"
            placeholder="Jhonwick3246"
            value={formData.payAiroTag}
            onChange={value => handleChange('payAiroTag', value)}
            error={errors.payAiroTag}
          />
          
          <TextInputField
            label="Wallet Address"
            placeholder="0x2467jk...lko90"
            value={formData.walletAddress}
            onChange={value => handleChange('walletAddress', value)}
            error={errors.walletAddress}
          />
          
          {errors.general ? (
            <View style={styles(theme).errorContainer}>
              <CustomText 
                variant="body2" 
                color={theme.colors.error}>
                {errors.general}
              </CustomText>
            </View>
          ) : null}
          
          <GenericButton
            title="Save Contact"
            cStyle={styles(theme).submitButton}
            onPress={handleSave}
            disabled={!isFormValid() || isSubmitting}
            loading={isSubmitting}
          />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.palette.white,
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: theme.spacing.layout.screenPadding,
    marginTop: theme.spacing.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.spacing.xl,
  },
  errorContainer: {
    marginTop: theme.spacing.spacing.md,
    marginBottom: theme.spacing.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.spacing.xl,
  },
});
