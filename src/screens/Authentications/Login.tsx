import { useNavigation } from "@react-navigation/native";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import { ScreenContainer } from "HOC";
import { useLogin, useStepCount } from "query/hooks/useAPIAuth";
import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import GenericButton from "../../components/GenericButton";
import PoliticalModal from "../../components/PolitaclModal";
import TextInputField from "../../components/TextInputField";
import { SCREENS } from "../../constants/SCREENS";
import { showError, showSuccess } from "../../utils/toast";
import { clearAll } from "storage/mmkv";
import { appContent } from "utils/appContent";

export default function Login() {
  const navigation = useNavigation();

  const locations = LOCATIONS.map((location) => ({
    label: location.charAt(0).toUpperCase() + location.slice(1),
    value: location.toLowerCase(),
  }));

  const { theme } = useTheme();
  const styles = customStyles(theme);

  const termsAndConditionRef = useRef<any>(null);

  const [checked, setchecked] = useState(false);
  const [checked1, setchecked1] = useState(false);
  const [isvisible, setisvisible] = useState(false);
  const [email, setemail] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");

  const { mutate: login, isPending, error } = useLogin();
  const { mutate: stepCount } = useStepCount();

  const handleLogin = () => {
    if (!email.trim()) {
      showError("E-Mail Fields cannot be empty");
      return;
    }
    // if (!selectedMethod.trim()) {
    //   showError("Location Fields cannot be empty");
    //   return;
    // }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      showError("Please enter valid email address");
      return;
    }
    setButtonDisabled(true);

    login({ email: email.trim().toLowerCase() } as any, {
      onSuccess: (data) => {
        setButtonDisabled(false);
        if (data?.status && data) {
          console.log("data =>", JSON.stringify(data, null, 2));
          showSuccess("OTP has been sent to email");
          (navigation as any).navigate(SCREENS.OTP, {
            email,
          });
        } else {
          showError("Email Address Already Exists");
        }
      },
      onError: (error: any) => {
        console.log("error =>", JSON.stringify(error.response,null,2));
        const errorMessage = error?.response?.data?.message || "Something went wrong";
        showError(errorMessage);
        console.log("error?.response =>", JSON.stringify(error?.response,null,2));
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
            placeholder={appContent.login.emailPlaceholder}
            value={email}
            onChange={setemail}
            label={appContent.login.emailLabel}
            required={true}
          />
          <GenericButton
            title={appContent.login.nextButton}
            cStyle={{ marginTop: 20 }}
            onPress={handleLogin}
            isLoading={isPending}
            showLoader={true}
            disabled={buttonDisabled || !email.trim()}
          />
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
  });

const LOCATIONS = [
  "puerto rico",
  "hawaii",
  "alaska",
  "district of columbia",
  "washington dc",
  "american samoa",
  "guam",
  "u.s. virgin islands",
  "us virgin islands",
  "northern mariana islands",
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new hampshire",
  "new jersey",
  "new mexico",
  "new york",
  "north carolina",
  "north dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "rhode island",
  "south carolina",
  "south dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west virginia",
  "wisconsin",
  "wyoming",
];
