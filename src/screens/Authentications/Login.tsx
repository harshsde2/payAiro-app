import { useNavigation } from "@react-navigation/native";
import HeaderTitle from "components/HeaderTitle";
import { ScreenContainer } from "HOC";
import { useLogin } from "query/hooks/useAPIAuth";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import GenericButton from "../../components/GenericButton";
import PoliticalModal from "../../components/PolitaclModal";
import TextInputField from "../../components/TextInputField";
import { SCREENS } from "../../constants/SCREENS";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { showError, showSuccess } from "../../utils/toast";
import { validateEmailOrPhone } from "../../utils/validation";
import { getSmsHash } from "../../utils/smsHash";
import { appContent } from "utils/appContent";
import { ILoginPayload } from "./types";
import { isProduction } from "config/env.config";

export default function Login() {
  const navigation = useNavigation();

  const { theme } = useTheme();
  const styles = customStyles(theme);

  const termsAndConditionRef = useRef<any>(null);

  const [checked, setchecked] = useState(false);
  const [checked1, setchecked1] = useState(false);
  const [isvisible, setisvisible] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [smsHash, setSmsHash] = useState("");

  const isProductionEnv = isProduction();

  const { mutate: login, isPending } = useLogin();

  // Get SMS hash for Android OTP auto-read
  useEffect(() => {
    const fetchSmsHash = async () => {
      const hash = await getSmsHash();
      if (hash) {
        setSmsHash(hash);
      }
    };
    fetchSmsHash();
  }, []);

  const handleLogin = () => {
    // Validate email or phone using common utility
    const validationResult = validateEmailOrPhone(emailOrPhone);
    
    if (!validationResult.isValid) {
      showError(validationResult.errorMessage || "Invalid input", validationResult.helperText || "");
      return;
    }

    setButtonDisabled(true);

    // Build payload based on input type (email or phone)
    const payload: ILoginPayload = {
      location: isProductionEnv ? "United States" : "india",
    };

    if (validationResult.inputType === "email") {
      payload.email = validationResult.formattedValue;
    } else if (validationResult.inputType === "phone") {
      payload.phone = validationResult.formattedValue;
      // Include SMS hash for Android OTP auto-read
      if (smsHash) {
        payload.hash = smsHash;
      }
    }

    const isEmailInput = validationResult.inputType === "email";
    const successMessage = isEmailInput
      ? "OTP has been sent to your email"
      : "OTP has been sent to your phone number";
    const errorMessage = isEmailInput
      ? "Email address not found"
      : "Phone number not found";

    login(payload as any, {
      onSuccess: (data) => {
        setButtonDisabled(false);
        if (data?.status && data) {
          console.log("data =>", JSON.stringify(data, null, 2));
          showSuccess(successMessage);
          (navigation as any).navigate(SCREENS.OTP, {
            email: isEmailInput ? validationResult.formattedValue : undefined,
            phone: !isEmailInput ? validationResult.formattedValue : undefined,
            inputType: validationResult.inputType,
            isEmail: isEmailInput,
          });
        } else {
          showError(errorMessage, "Please check and try again");
        }
      },
      onError: (error: any) => {
        console.log("error =>", JSON.stringify(error.response, null, 2));
        const errorMsg = error?.response?.data?.message || "Something went wrong";
        showError(errorMsg, "Please try again");
        setButtonDisabled(false);
      },
    });
  };


  return (
    <ScreenContainer avoidKeyboard scrollable={true} padding={0}>
      <HeaderTitle title={appContent.login.headerTitle} leftIcon="true" />
      <View style={{ flex: 1 }}>
        <AuthHeader showAuthLogo={true} />
      </View>
      <TermAndConditionModal
        onAgree={() => {
          setchecked(true);
        }}
        ref={termsAndConditionRef}
      />
      <PoliticalModal
        isVisible={isvisible}
        onConfirm={(status: any) => {
          setchecked1(status);
          setisvisible(false);
        }}
        onClose={() => setisvisible(false)}
      />
      <View style={styles.contentContainer}>
        <View style={styles.signinHeaderContainer}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
           {appContent.login.title}
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            {appContent.login.description}
          </CustomText>
        </View>
        <View style={styles.fieldAndCheckboxContainer}>
          <TextInputField
            placeholder={"joe@gmail.com or 9876543210"}
            value={emailOrPhone}
            onChange={setEmailOrPhone}
            label={"Enter your email or phone number"}
            required={true}
          />
          <GenericButton
            title={appContent.login.nextButton}
            cStyle={{ marginTop: 20 }}
            onPress={handleLogin}
            isLoading={isPending}
            showLoader={true}
            disabled={buttonDisabled || !emailOrPhone.trim()}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.accountRecoveryLinkContainer}
            onPress={() => {
              (navigation as any).navigate(NAVIGATION_SCREENS.SUPPORT_SCREEN);
            }}
          >
            <CustomText
              variant={"caption"}
              style={styles.accountRecoveryLinkText}
              color={theme.colors.palette.green500}
            >
              Having trouble logging in? Recover your account
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    termsAndConditionContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      marginTop: theme?.spacing.spacing?.[4],
      width: "100%",
      gap: theme?.spacing.spacing?.[3],
    },
    contentContainer: {
      width: "100%",
      // minHeight: 300,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme?.spacing.spacing?.[8],
      borderTopStartRadius: theme?.spacing.spacing?.[8],
      paddingHorizontal: theme?.spacing.spacing?.[5],
      paddingVertical: theme?.spacing.spacing?.[5],
    },
    signinHeaderContainer: {
      width: "80%",
      alignSelf: "center",
    },
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
    },
    signHeaderCaptionTextStyles: {
      width: "100%",
      textAlign: "center",
      marginTop: 10,
    },
    fieldAndCheckboxContainer: {
      marginVertical: 30,
      flex: 1,
    },
    checkboxContainer: {
      paddingHorizontal: 10,
      marginVertical: 10,
    },
    accountRecoveryLinkContainer: {
      marginTop: theme.spacing.spacing?.[4],
      alignItems: "center",
      justifyContent: "center",
    },
    accountRecoveryLinkText: {
      textAlign: "center",
    },
  });

