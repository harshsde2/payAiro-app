import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { SVGChecked, SVGUnChecked } from "constants/images";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useCreatePin, usePatchUserDetails, useStepCount } from "query/hooks/useAPIAuth";
import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SvgXml } from "react-native-svg";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import CommonModal from "tsx-components/modals/CommonModal";
import { SvgIcons } from "constants/svgs";
import GenericButton from "../../components/GenericButton";
import TextInputField from "../../components/TextInputField";
import {
  setLogin,
  setShowLoader,
  setUserData,
  setWalletData,
} from "../../redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../utils/toast";
import { toAlphanumericOnly, validateEmail, validatePayAiroTag, validatePhoneNumber } from "../../utils/validation";
import { setItem, STORAGE_KEYS } from "storage/mmkv";
import { useDispatch } from "react-redux";
import { useWalletDetails } from "query/hooks";
import { setWalletDataAuth } from "services/Auth";

export default function Name(props: any) {
  const { email: emailFromSignup, phone: phoneFromSignup, inputType, data } = props.route.params || {};
  
  // Determine if user signed up with email or phone
  const isSignedUpWithEmail = inputType === "email" || !!emailFromSignup;
  console.log("inputType =>", inputType, "isSignedUpWithEmail =>", isSignedUpWithEmail);
  
  const stepcount = "2";
  const dispatch = useDispatch();

  const globalStyles = useGlobalStyles();
  const navigation = useNavigation<any>();
  const termsAndConditionRef = useRef<any>(null);

  const { theme } = useTheme();
  const styles = customStyles(theme);

  const [name, setname] = useState("");
  const [uname, setuname] = useState("");
  const [phone, setphone] = useState("");
  const [userEmail, setUserEmail] = useState(""); // For phone signup users to enter email
  const [fname, setfname] = useState("");
  const [lname, setlname] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [checked, setchecked] = useState(false);
  const [checkedCybridUserAgreement, setcheckedCybridUserAgreement] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [countryCode, setCountryCode] = useState({
    country: "+1",
    code: "+1",
    flag_image_url: "https://flagcdn.com/w320/us.png",
  });

  const { mutate: patchUser } = usePatchUserDetails();
  const { mutate: stepCount } = useStepCount();


  const {
    mutate: handlPinCreation,
    isPending: isPendingCreatePin,
    isSuccess: isSuccessCreatePin,
  } = useCreatePin();

  const {
    refetch: refetchWalletDetails,
  } = useWalletDetails(false);

  const getCurrentStep = () => {
    stepCount({ stepcount: stepcount } as any, {
      onSuccess: (data) => {
        console.log(" getCurrentStep on Name", data);
      },
      onError: (error) => {
        console.log(
          "getCurrentStep on Name errror",
          JSON.stringify(error, null, 2)
        );
      },
    });
  };

  // Handle Form
  const handleForm = () => {
    // Validate required name fields
    if (fname.length === 0 || lname.length === 0 || uname.length === 0) {
      showError("Fields cannot be empty", "Please fill all required fields");
      return;
    }

    // Validate PayAiro Tag (alphanumeric only)
    const payAiroTagValidation = validatePayAiroTag(uname);
    if (!payAiroTagValidation.isValid) {
      showError(payAiroTagValidation.errorMessage || "Invalid PayAiro Tag", payAiroTagValidation.helperText || "");
      return;
    }

    // Validate based on signup type
    if (isSignedUpWithEmail) {
      // User signed up with email, validate phone number
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        showError(phoneValidation.errorMessage || "Invalid phone number", phoneValidation.helperText || "");
        return;
      }
    } else {
      // User signed up with phone, validate email
      const emailValidation = validateEmail(userEmail);
      if (!emailValidation.isValid) {
        showError(emailValidation.errorMessage || "Invalid email", emailValidation.helperText || "");
        return;
      }
    }

    if (!checked) {
      showError("Terms & Conditions are required", "Please accept the terms and conditions");
      return;
    }

    if (!checkedCybridUserAgreement) {
      showError("Cybrid User Agreement is required", "Please accept the Cybrid User Agreement");
      return;
    }

    console.log("handleForm called with:");
    // const payload = new FormData();
    // payload.append("name", fname);
    // payload.append("usernames", uname);
    // payload.append("lastname", lname);
    // payload.append("patriot_esign", checked);
    const payload = {
      name: fname,
      usernames: uname,
      lastname: lname,
      patriot_esign: checked,
    } as any;

    // Add phone or email based on signup type
    if (isSignedUpWithEmail) {
      payload.mobile_number = phone;
    } else {
      payload.email = userEmail.trim().toLowerCase();
    }
    setIsPending(true);

    console.log("payload =>", JSON.stringify(payload, null, 2));
    patchUser(payload as any, {
      onSuccess: (datas : any) => {
        setIsPending(false);
        // getCurrentStep();
        dispatch(setUserData(datas?.data));
        console.log("datas =>", JSON.stringify(datas, null, 2));
        if (datas && datas?.status) {
          showSuccess("Name & PayAiro Has Been Updated Successfully");

          if (datas?.fortress == true) {
            (navigation as any).navigate(NAVIGATION_SCREENS.ADDRESS);
          } else if (datas?.fortress === false) {
            // (navigation as any).navigate(NAVIGATION_SCREENS.CYBRID_WEB_VIEW, {
            //   URL: datas?.persona_verification_url,
            // });
            getWalletDetails();
          }
        } else {
          showError("Username Already Exists");
        }
      },
      onError: (error: any) => {
        let errorMessage = '';
        if(error?.response?.data?.errors?.mobile_number. length > 0) {
          errorMessage = error.response.data.errors.mobile_number[0];
        } else if (error?.response?.data?.errors?.usernames. length > 0) {
          errorMessage = error.response.data.errors.usernames[0];
        } else {
          errorMessage = "Failed to submit details";
        }
        showError(errorMessage);
        console.log("error =>", JSON.stringify(error.response, null, 2));
        setIsPending(false);
      },
    });
  };

  // console.log("isPendingWalletDetails =>", JSON.stringify(isPendingWalletDetails,null,2));
  // console.log("isSuccessWalletDetails =>", JSON.stringify(isSuccessWalletDetails,null,2));
  const getWalletDetails = async () => {
    dispatch(setShowLoader(true));
    try {
      const res = await refetchWalletDetails();
      const payload = (res as any)?.data;
      
        console.log("walletData =>", JSON.stringify(payload,null,2));

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


  const handlePDFViewCybridUserAgreement = () => {
    navigation.navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: require("../../assets/pdf/Cybrid_User_Agreement.pdf"),
      isFileFromLocal: true,
      fileName: "Cybrid_User_Agreement.pdf",
    });
  };

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <View style={{ flex: 1 / 2.5 }}>
        <AuthHeader showAuthLogo={true} />
      </View>
      <TermAndConditionModal ref={termsAndConditionRef} />
      <CommonModal
        isVisible={showInfo}
        onClose={() => setShowInfo(false)}
        containerStyle={{ justifyContent: "center" }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.infoModalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowInfo(false)}
            >
              <SvgIcons.CrossIcon width={55} height={55} />
            </TouchableOpacity>
            <CustomText
              variant="h2"
              fontFamily={theme.typography.fontFamily.montserratBold}
              style={styles.infoModalTitle}
            >
              PayAiro Tag
            </CustomText>
            <CustomText
              variant="body1"
              style={styles.infoModalText}
            >
              Your PayAiro tag is like a username for payments. Share it with others so they can send you money quickly and securely, without needing your account details.
            </CustomText>
          </View>
        </Pressable>
      </CommonModal>
      <View style={styles.conntentContainer}>
        <View style={[styles.headerContainer]}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Fill your details
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            Align horizontal select opacity plugin selection reesizing comment
            rectangle text.{" "}
          </CustomText>
        </View>
        <View style={[styles.fromContainer]}>
          <View style={[styles.textInputContainer]}>
            <TextInputField
              label="First Name"
              placeholder={"Your First Name"}
              value={fname}
              cStyle={{ width: "48%" }}
              onChange={setfname}
            />
            <TextInputField
              label="Last Name"
              placeholder={"Your Last Name"}
              value={lname}
              cStyle={{ width: "48%" }}
              onChange={setlname}
            />
          </View>
          <TextInputField
            label="PayAiro Tag"
            placeholder={"Create PayAiro Tag (e.g., john123)"}
            value={uname}
            onChange={(text) => {
              const filtered = toAlphanumericOnly(text);
              if (filtered !== text) {
                showError("Special characters not allowed", "PayAiro Tag can only contain letters and numbers (A-Z, a-z, 0-9)");
              }
              setuname(filtered);
            }}
            cStyle={{}}
            info={true}
            onInfoPress={() => {
              setShowInfo(true);
            }}
          />
          {/* Conditionally render Phone or Email based on signup type */}
          {isSignedUpWithEmail ? (
            // User signed up with email, show phone input
            <View style={[styles.textInputContainer]}>
              <TextInputField
                countryCode={countryCode}
                label="Country"
                placeholder="Country"
                value={countryCode.code}
                onChange={() => {}}
                cStyle={{ width: 80, marginRight: 10 }}
                isCountry={true}
                editable={true}
              />
              <TextInputField
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phone}
                onChange={setphone}
                keyboardType="numeric"
                cStyle={{ flex: 1 }}
                maxLength={10}
              />
            </View>
          ) : (
            // User signed up with phone, show email input
            <TextInputField
              label="Email Address"
              placeholder="Enter your email address"
              value={userEmail}
              onChange={setUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setchecked((state) => !state);
            }}
            style={styles.termsAndConditionContainer}
          >
            <SvgXml
              xml={checked ? SVGChecked : SVGUnChecked}
              // style={{ marginTop: 2, marginRight: 5, }}
              width={15}
              height={15}
            />
            <CustomText
              // variant={"caption"}
              style={{
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              <CustomText variant={"caption"}>
                By clicking the button you agree with the
              </CustomText>

              <Text
                onPress={() => termsAndConditionRef.current?.showPatriotAct()}
                style={{ fontWeight: "700" }}
              >
                {" "}
                Patriot Act{" "}
              </Text>
              <CustomText variant={"caption"}>and</CustomText>
              <Text
                onPress={() =>
                  termsAndConditionRef.current?.showESignDisclosure()
                }
                style={{ fontWeight: "700" }}
              >
                {" "}
                E-Sign Disclosure{" "}
              </Text>
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setcheckedCybridUserAgreement(!checkedCybridUserAgreement);
              // 
            }}
            style={styles.termsAndConditionContainer}
          >
            <SvgXml
              xml={checkedCybridUserAgreement ? SVGChecked : SVGUnChecked}
              // style={{ marginTop: 2, marginRight: 5, }}
              width={15}
              height={15}
            />
            <CustomText
              // variant={"caption"}
              style={{
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              <CustomText variant={"caption"}>
                By clicking the button you agree with the
              </CustomText>

              <Text
                onPress={() => handlePDFViewCybridUserAgreement()}
                style={{ fontWeight: "700" }}
              >
                {" "}
               Cybrid User Agreement{" "}
              </Text>
            </CustomText>
          </TouchableOpacity>
          <GenericButton
            title="Next"
            cStyle={{ marginTop: 45 }}
            // onPress={() => navigation.navigate(SCREENS.Address)}
            onPress={() => {
              handleForm();
            }}
            showLoader={true}
            isLoading={isPending}
            disabled={isPending}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    termsAndConditionContainer: {
      // backgroundColor: 'red',
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      marginTop: 15,
      paddingHorizontal: 10,
      width: "100%",
      // flex: 1,
      gap: 10,
    },
    conntentContainer: {
      flex: 1,
      backgroundColor: "#fff",
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: 20,
    },
    headerContainer: { width: "80%", alignSelf: "center" },
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
    },
    fromContainer: {
      marginVertical: 40,
    },
    signHeaderCaptionTextStyles: {
      width: "100%",
      textAlign: "center",
      marginTop: 10,
    },
    textInputContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    infoModalContainer: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 20,
      maxWidth: "90%",
      alignSelf: "center",
    },
    closeButton: {
      alignSelf: "flex-end",
      padding: 4,
      marginBottom: 8,
    },
    infoModalTitle: {
      marginBottom: 16,
      textAlign: "center",
      color: theme.colors.text.primary,
    },
    infoModalText: {
      textAlign: "center",
      color: theme.colors.text.secondary,
      lineHeight: 22,
    },
  });
