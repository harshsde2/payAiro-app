import React, { useState, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "@navigations/navigationConstants";
import { useDispatch } from "react-redux";
import { setLogin } from "@redux/slices/authenticationSlice";
import { useTheme } from "@styles/ThemeContext";
import { kycStyles } from "@styles/screens/auth/kycStyles";
import CustomText from "@components/common-components/CustomText";
import { TextInput, Button } from "@components/common-components/layout";
import ScreenWrapper from "@components/common-components/ScreenWrapper";
import { useBottomSheet } from "@components/common-components/BottomSheet";
import CountryCodePicker, { ICountryCode } from "@components/general-components/CountryCodePicker";
import {
  KYCScreenNavigationProp,
  KYCScreenRouteProp,
} from "@screens/Auth/types";
import { AppIcon } from "@assets/svgs";

const KYCScreen: React.FC = () => {
  const navigation = useNavigation<KYCScreenNavigationProp>();
  const route = useRoute<KYCScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = kycStyles(theme);
  const { open, close } = useBottomSheet();
  
  const [fullName, setFullName] = useState(route.params?.fullName || "");
  const [selectedCountry, setSelectedCountry] = useState<ICountryCode>({
    name: 'United States',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
  });
  const [mobile, setMobile] = useState("");
  const [payAiroTag, setPayAiroTag] = useState("");

  const handleProceed = () => {
    dispatch(setLogin(true));
  };

  const handleSkipKYC = () => {
    dispatch(setLogin(true));
  };

  const handleCountrySelect = useCallback(
    (country: ICountryCode) => {
      setSelectedCountry(country);
      close();
    },
    [close]
  );

  const openCountryPicker = useCallback(() => {
    open(
      <CountryCodePicker
        onSelect={handleCountrySelect}
        selectedCode={selectedCountry.dialCode}
      />,
      {
        snapPoints: ['50%', '80%'],
        initialSnapIndex: 1,
        enableBackdropPress: true,
      }
    );
  }, [open, handleCountrySelect, selectedCountry.dialCode]);

  const renderCountryCodeSelector = () => {
    return (
      <TouchableOpacity
        style={styles.countryCodeContainer}
        onPress={openCountryPicker}
        activeOpacity={0.7}
      >
        <CustomText style={styles.countryFlag}>
          {selectedCountry.flag}
        </CustomText>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.text}
          style={styles.countryCodeText}
        >
          {selectedCountry.dialCode}
        </CustomText>
        <AppIcon.ChevronDown width={16} height={16} />
      </TouchableOpacity>
    );
  };

  const renderPayAiroSuffix = () => {
    return (
      <View style={styles.payAiroSuffix}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.text}
        >
          @payairo
        </CustomText>
      </View>
    );
  };

  return (
    <ScreenWrapper
      safeArea
      padding={16}
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.subtitleContainer}>
        <CustomText variant="h2" style={styles.subtitle} fontWeight="semiBold">
          Details
        </CustomText>
      </View>
      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          Complete your KYC for seamless payment or explore our app without KYC!
        </CustomText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Full Name"
          placeholder="e.g. John Carter"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Mobile"
          placeholder="e.g. 112 34567"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          leftIcon={renderCountryCodeSelector()}
          showLeftSeparator={true}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="PayAiro Tag"
          placeholder="e.g. john.c323"
          value={payAiroTag}
          onChangeText={setPayAiroTag}
          autoCapitalize="none"
          rightIcon={renderPayAiroSuffix()}
          showRightSeparator={true}
        />
      </View>
    <View style={styles.buttonContainer}>

      <TouchableOpacity
        style={styles.skipKYCContainer}
        onPress={handleSkipKYC}
        activeOpacity={0.7}
      >
        <CustomText
          variant="body"
          fontFamily="inter"
          fontWeight="medium"
          color={theme.colors.text}
          style={styles.skipKYCText}
        >
          Skip KYC
        </CustomText>
        <AppIcon.ArrowRight width={16} height={16} />
      </TouchableOpacity>

      <Button onPress={handleProceed} style={styles.proceedButton}>
        Proceed
      </Button>
    </View>

      <View style={styles.disclaimerContainer}>
        <CustomText
          variant="bodySmall"
          fontFamily="inter"
          size={12}
          color={theme.colors.textSecondary}
          style={styles.disclaimerText}
        >
          If you skip the KYC process, you will get Non-KYC mode (limited functions). Update KYC later in Settings to enjoy seamlessly.
        </CustomText>
      </View>
    </ScreenWrapper>
  );
};

export default KYCScreen;

