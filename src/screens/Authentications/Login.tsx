import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import React, { useRef, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import GenericButton from "../../components/GenericButton";
import PoliticalModal from "../../components/PolitaclModal";
import TextInputField from "../../components/TextInputField";
import { SVGChecked, SVGUnChecked } from "../../constants/images";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setErrorMsg,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";
import { sendOTP } from "../../services/Services";
import { useLogin, useStepCount } from "query/hooks/useAPIAuth";
import MyDropdown from "tsx-components/MyDropdown";
import HeaderTitle from "components/HeaderTitle";

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
      useDispatchAction(setErrorMsg("E-Mail Fields cannot be empty"));
      return;
    }
    // if (!selectedMethod.trim()) {
    //   useDispatchAction(setErrorMsg("Location Fields cannot be empty"));
    //   return;
    // }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      useDispatchAction(setErrorMsg("Please enter valid email address"));
      return;
    }
    if (!checked) {
      useDispatchAction(setErrorMsg("Terms & Conditions are required"));
      return;
    }

    if (checked1) {
      useDispatchAction(
        setErrorMsg(
          "If you are politically exposed then you cant able to create account"
        )
      );
      return;
    }

    setButtonDisabled(true);

    login({ email: email.trim().toLowerCase() } as any, {
      onSuccess: (data) => {
        setButtonDisabled(false);
        if (data?.status && data) {
          useDispatchAction(setSuccessMsg("OTP has been sent to email"));
          (navigation as any).navigate(SCREENS.OTP, {
            email,
          });
        } else {
          useDispatchAction(setErrorMsg("Email Address Already Exists"));
        }
      },
      onError: (error) => {
        console.log(error);
        setButtonDisabled(false);
      },
  });
  };

  return (
    <ScreenContainer avoidKeyboard scrollable={true} padding={0}>
      <HeaderTitle title="Sign In" leftIcon="true" />
      <View style={{ flex: 1 }}>
        <AuthHeader showAuthLogo={true} />
      </View>
      {/* <Button title="Press me" onPress={testStep} /> */}
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
            Sign In
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            Securely access your crypto portfolio with ease. Simplify login now!
          </CustomText>
        </View>
        <View style={styles.fieldAndCheckboxContainer}>
          {/* <MyDropdown
            required={true}
            label={"Select Your Location"}
            placeholder={"Select Your Location"}
            data={locations}
            value={selectedMethod}
            search={true}
            itemTextStyle={{
              fontSize: 14,
              fontFamily: theme?.typography.fontFamily.montserrat,
            }}
            onChange={(item) => setSelectedMethod(item)}
            maxHeight={150}
          /> */}
          <TextInputField
            placeholder={"joe@gmail.com"}
            value={email}
            onChange={setemail}
            label="Enter your email"
            required={true}
          />
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setisvisible(true)}
              style={styles.termsAndConditionContainer}
            >
              <SvgXml
                xml={checked1 ? SVGChecked : SVGUnChecked}
                width={15}
                height={15}
              />
              <CustomText variant={"caption"}>
                Are you politically exposed person?
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setchecked((state) => !state)}
              style={styles.termsAndConditionContainer}
            >
              <SvgXml
                xml={checked ? SVGChecked : SVGUnChecked}
                width={15}
                height={15}
              />
              <CustomText>
                <CustomText variant={"caption"}>
                  By clicking the button you agree with the
                </CustomText>
                <Text
                  onPress={() =>
                    termsAndConditionRef.current.showTermsAndConditions()
                  }
                  style={{ fontWeight: "700" }}
                >
                  {" "}
                  Terms & Conditions
                </Text>
              </CustomText>
            </TouchableOpacity>
          </View>
          <GenericButton
            title="Next"
            cStyle={{ marginTop: 20 }}
            onPress={handleLogin}
            isLoading={isPending}
            showLoader={true}
            disabled={buttonDisabled}
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
      height: 500,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme?.spacing.spacing?.[8],
      borderTopStartRadius: theme?.spacing.spacing?.[8],
      padding: theme?.spacing.spacing?.[5],
      paddingVertical: theme?.spacing.spacing?.[10],
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
