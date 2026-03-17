import React, { useState, useCallback, useRef } from "react";
import { View, TouchableOpacity, Pressable, Text as RNText } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useDispatch } from "react-redux";
import {
  setLogin,
  setShowLoader,
  setUserData,
  setWalletData,
} from "redux/slices/authenticationSlice";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { kycStyles } from "@new-ui/styles/screens/auth/kycStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { ICountryCode } from "@new-ui/components/general-components/CountryCodePicker";
import {
  KYCScreenNavigationProp,
  KYCScreenRouteProp,
} from "@new-ui/screens/Auth/types";
import { AppIcon } from "@new-ui/assets/svgs";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import CommonModal from "tsx-components/modals/CommonModal";
import { SvgIcons } from "constants/svgs";
import { usePatchUserDetails } from "query/hooks/useAPIAuth";
import { useWalletDetails } from "query/hooks";
import { validateEmail, validatePhoneNumber } from "utils/validation";
import { showError, showSuccess } from "utils/toast";
import { setItem, STORAGE_KEYS } from "storage/mmkv";
import { setWalletDataAuth } from "services/Auth";

const KYCScreen: React.FC = () => {
  const navigation = useNavigation<KYCScreenNavigationProp>();
  const route = useRoute<KYCScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = kycStyles(theme);
  const termsAndConditionRef = useRef<any>(null);

  const params = (route.params || {}) as {
    fullName?: string;
    email?: string;
    phone?: string;
    inputType?: "email" | "phone" | "invalid";
    isEmail?: boolean;
    data?: any;
  };

  const [fullName, setFullName] = useState(params.fullName || "");
  const [selectedCountry, setSelectedCountry] = useState<ICountryCode>({
    name: 'United States',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
  });
  const [mobile, setMobile] = useState("");
  const [payAiroTag, setPayAiroTag] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkedCybridUserAgreement, setCheckedCybridUserAgreement] =
    useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const isSignedUpWithEmail =
    params.inputType === "email" || !!params.email;

  const { mutate: patchUser } = usePatchUserDetails();
  const { refetch: refetchWalletDetails } = useWalletDetails(false);

  const handleProceed = () => {
    handleForm();
  };

  const handleSkipKYC = () => {
    // dispatch(setLogin(true));
    return;
  };

  const handlePDFViewCybridUserAgreement = () => {
    (navigation as any).navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: require("../../../../assets/pdf/Cybrid_User_Agreement.pdf"),
      isFileFromLocal: true,
      fileName: "Cybrid_User_Agreement.pdf",
    });
  };
  const handlePDFViewAMLPolicy = () => {
    (navigation as any).navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: require("../../../../assets/pdf/AML_Policy_PayAiro.pdf"),
      isFileFromLocal: true,
      fileName: "AML_Policy_PayAiro.pdf",
    });
  };

  const getWalletDetails = async () => {
    dispatch(setShowLoader(true));
    try {
      const res = await refetchWalletDetails();
      const payload = (res as any)?.data;

      if (payload?.data) {
        dispatch(setWalletData(payload.data));
        setWalletDataAuth(payload.data);
        setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(payload.data));
        dispatch(setLogin(true));
        showSuccess("Create Account Successfully");
      } else {
        showError("Failed to fetch wallet details");
      }
    } finally {
      dispatch(setShowLoader(false));
    }
  };

  const handleForm = () => {
    const trimmedFullName = fullName.trim();
    const trimmedTag = payAiroTag.trim();

    if (!trimmedFullName || !trimmedTag) {
      showError("Fields cannot be empty", "Please fill all required fields");
      return;
    }

    const [firstName, ...rest] = trimmedFullName.split(" ");
    const lastName = rest.join(" ").trim();

    if (!firstName || !lastName) {
      showError(
        "Name is incomplete",
        "Please enter both first name and last name"
      );
      return;
    }

    if (isSignedUpWithEmail) {
      const phoneValidation = validatePhoneNumber(mobile);
      if (!phoneValidation.isValid) {
        showError(
          phoneValidation.errorMessage || "Invalid phone number",
          phoneValidation.helperText || ""
        );
        return;
      }
    } else {
      const emailValidation = validateEmail(userEmail);
      if (!emailValidation.isValid) {
        showError(
          emailValidation.errorMessage || "Invalid email",
          emailValidation.helperText || ""
        );
        return;
      }
    }

    if (!checked) {
      showError(
        "Terms & Conditions are required",
        "Please accept the terms and conditions"
      );
      return;
    }

    if (!checkedCybridUserAgreement) {
      showError(
        "Cybrid User Agreement is required",
        "Please accept the Cybrid User Agreement"
      );
      return;
    }

    const payload: any = {
      name: firstName,
      usernames: trimmedTag,
      lastname: lastName,
      patriot_esign: checked,
    };

    if (isSignedUpWithEmail) {
      payload.mobile_number = mobile;
    } else {
      payload.email = userEmail.trim().toLowerCase();
    }

    setIsPending(true);

    patchUser(payload as any, {
      onSuccess: async (datas: any) => {
        setIsPending(false);
        dispatch(setUserData(datas?.data));

        if (datas && datas?.status) {
          showSuccess("Name & PayAiro Has Been Updated Successfully");

          if (datas?.fortress === true) {
            navigation.navigate(NAVIGATION_SCREENS.ADDRESS);
          } else {
            await getWalletDetails();
          }
        } else {
          showError("Username Already Exists");
        }
      },
      onError: (error: any) => {
        setIsPending(false);

        const mobileErrors = error?.response?.data?.errors?.mobile_number;
        const usernameErrors = error?.response?.data?.errors?.usernames;

        if (Array.isArray(mobileErrors) && mobileErrors.length > 0) {
          showError(mobileErrors[0]);
        } else if (Array.isArray(usernameErrors) && usernameErrors.length > 0) {
          showError(usernameErrors[0]);
        } else {
          showError("Failed to submit details");
        }
      },
    });
  };

  const renderCountryCodeSelector = () => {
    return (
      <TouchableOpacity
        style={styles.countryCodeContainer}
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
      <TouchableOpacity
        style={styles.payAiroSuffix}
        onPress={() => setShowInfo(true)}
        activeOpacity={0.7}
      >
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.text}
        >
          @payairo
        </CustomText>
      </TouchableOpacity>
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
      <TermAndConditionModal ref={termsAndConditionRef} />
      <CommonModal
        isVisible={showInfo}
        onClose={() => setShowInfo(false)}
        containerStyle={{ justifyContent: "center" }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 20,
              padding: 24,
              marginHorizontal: 20,
              maxWidth: "90%",
              alignSelf: "center",
            }}
          >
            <TouchableOpacity
              style={{ alignSelf: "flex-end", padding: 4, marginBottom: 8 }}
              onPress={() => setShowInfo(false)}
            >
              <SvgIcons.CrossIcon width={24} height={24} />
            </TouchableOpacity>
            <CustomText
              variant="h3"
              fontWeight="semiBold"
              style={{ textAlign: "center", marginBottom: 8 }}
            >
              PayAiro Tag
            </CustomText>
            <CustomText
              variant="body"
              style={{
                textAlign: "center",
                lineHeight: 20,
                color: theme.colors.textSecondary,
              }}
            >
              Your PayAiro tag is like a username for payments. Share it with
              others so they can send you money quickly and securely, without
              needing your account details.
            </CustomText>
          </View>
        </Pressable>
      </CommonModal>
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

      {isSignedUpWithEmail ? (
        <View style={styles.inputContainer}>
          <TextInput
            label="Mobile"
            placeholder="e.g. 112 34567"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={renderCountryCodeSelector()}
            showLeftSeparator={true}
          />
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            label="Email Address"
            placeholder="Enter your email address"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      )}

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

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setChecked((state) => !state);
          }}
          style={styles.checkbox}
        >
          <View style={styles.checkboxIcon}>
            {checked ? (
              <AppIcon.TickCheckedBox />
            ) : (
              <AppIcon.UntickCheckedBox />
            )}
          </View>
          <CustomText
            style={styles.checkboxText}
          >
            <CustomText variant="caption">
              By clicking the button you agree with the
            </CustomText>
            {" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={() => termsAndConditionRef.current?.showPatriotAct()}
            >
              Patriot Act
            </CustomText>{" "}
            and{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={() => termsAndConditionRef.current?.showESignDisclosure()}
            >
              e-Sign Disclosure
            </CustomText>
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setCheckedCybridUserAgreement(!checkedCybridUserAgreement);
          }}
          style={styles.checkbox}
        >
          <View style={styles.checkboxIcon}>
            {checkedCybridUserAgreement ? (
              <AppIcon.TickCheckedBox />
            ) : (
              <AppIcon.UntickCheckedBox />
            )}
          </View>
          <CustomText
            style={styles.checkboxText}
          >
            <CustomText variant="caption">
              By clicking the button you agree with the
            </CustomText>
            {" "}
            <CustomText
              onPress={handlePDFViewCybridUserAgreement}
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              {" "}
              Cybrid User Agreement{" "}
            </CustomText>
            {"and"}
            <CustomText
              onPress={handlePDFViewAMLPolicy}
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              {" "}
              AML Policy{" "}
            </CustomText>
          </CustomText>
        </TouchableOpacity>
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

        <Button
          onPress={handleProceed}
          style={styles.proceedButton}
          loading={isPending}
          disabled={isPending}
        >
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

