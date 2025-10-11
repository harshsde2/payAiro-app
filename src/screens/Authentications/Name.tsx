import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { SVGChecked, SVGUnChecked } from "constants/images";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { usePatchUserDetails, useStepCount } from "query/hooks/useAPIAuth";
import React, { useRef, useState } from "react";
import {
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
import GenericButton from "../../components/GenericButton";
import TextInputField from "../../components/TextInputField";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setErrorMsg,
  setSuccessMsg,
  setUserData,
} from "../../redux/slices/authenticationSlice";

export default function Name(props: any) {
  const { email, data } = props.route.params || {};
  const stepcount = "2";

  const globalStyles = useGlobalStyles();
  const navigation = useNavigation<any>();
  const termsAndConditionRef = useRef<any>(null);

  const { theme } = useTheme();
  const styles = customStyles(theme);

  const [name, setname] = useState("");
  const [uname, setuname] = useState("");
  const [phone, setphone] = useState("");
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

  // Handle From
  const handleForm = () => {
    if (fname.length === 0 || lname.length === 0 || uname.length === 0) {
      useDispatchAction(setErrorMsg("Fields cannot be empty"));
      return;
    }
    if (phone.length < 10) {
      useDispatchAction(setErrorMsg("Phone Number Must be 10 digit"));
      return;
    }
    if (!checked) {
      useDispatchAction(setErrorMsg("Terms & Conditions are required"));
      return;
    }

    if (!checkedCybridUserAgreement) {
      useDispatchAction(setErrorMsg("Cybrid User Agreement is required"));
      return;
    }

    console.log("handleForm called with:");
    const payload = new FormData();
    payload.append("name", fname);
    payload.append("mobile_number", "+1" + phone);
    payload.append("usernames", uname);
    payload.append("lastname", lname);
    payload.append("patriot_esign", checked);
    setIsPending(true);
    patchUser(payload as any, {
      onSuccess: (datas) => {
        setIsPending(false);
        getCurrentStep();
        useDispatchAction(setUserData(datas?.data?.data));
        // console.log("datas =>", JSON.stringify(datas, null, 2));
        if (datas && datas?.status) {
          useDispatchAction(
            setSuccessMsg("Name & PayAiro Has Been Updated Successfully")
          );

          if (datas?.data?.fortress == true) {
            (navigation as any).navigate(NAVIGATION_SCREENS.ADDRESS);
          } else if (datas?.data?.fortress === false) {
            (navigation as any).navigate(NAVIGATION_SCREENS.CYBRID_WEB_VIEW, {
              URL: datas?.data?.persona_verification_url,
            });
          }
        } else {
          useDispatchAction(setErrorMsg("Username Already Exists"));
        }
      },
      onError: (error: any) => {
        console.log("error =>", JSON.stringify(error.response, null, 2));
        setIsPending(false);

        if (error.response.data.data.errors.mobile_number) {
          useDispatchAction(
            setErrorMsg(error.response.data.data.errors.mobile_number[0])
          );
        } else if (error.response.data.data.errors.usernames) {
          useDispatchAction(
            setErrorMsg(error.response.data.data.errors.usernames[0])
          );
        } else {
          useDispatchAction(setErrorMsg("Failed to submit details"));
        }
        // useDispatchAction(setErrorMsg("Failed to submit details"));
      },
    });
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
            placeholder={"Create PayAiro Tag"}
            value={uname}
            onChange={setuname}
            cStyle={{}}
            info={true}
            onInfoPress={() => {
              setShowInfo(true);
            }}
          />
          <View style={[styles.textInputContainer]}>
            <TextInputField
              countryCode={countryCode}
              label="Country"
              placeholder="Country"
              value={countryCode.code}
              cStyle={{ width: 80, marginRight: 10 }}
              // onSelected={setCountryCode}
              isCountry={true}
              editable={true}
            />
            <TextInputField
              label="Phone Number"
              placeholder="Phone Number"
              value={phone}
              onChange={setphone}
              keyboardType="numeric"
              cStyle={{ flex: 1 }}
              maxLength={10}
            />
          </View>
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
  });
