import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { SVGChecked, SVGUnChecked } from "constants/images";
import { usePatchUserDetails, useStepCount } from "query/hooks/useAPIAuth";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import GenericButton from "../../components/GenericButton";
import TextInputField from "../../components/TextInputField";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setErrorMsg,
  setSuccessMsg,
  setUserData,
} from "../../redux/slices/authenticationSlice";
import { patchUser } from "../../services/Services";

export default function Name(props: any) {
  const { email, data } = props.route.params;
  const stepcount = "2";

  const navigation = useNavigation();
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
  const [countryCode, setCountryCode] = useState({
    country: "United States",
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
        if (datas && datas?.status) {
          useDispatchAction(
            setSuccessMsg("Name & Payairo Has Been Updated Successfully")
          );
          (navigation as any).navigate(SCREENS.Address);
        } else {
          useDispatchAction(setErrorMsg("Username Already Exists"));
        }
      },
      onError: (error: any) => {
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
      },
    });
  };

  return (
    <ScreenContainer scrollable padding={0}>
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
            label="Payairo Tag"
            placeholder={"Create Payairo Tag"}
            value={uname}
            onChange={setuname}
          />
          <View style={[styles.textInputContainer]}>
            <TextInputField
              countryCode={countryCode}
              label="Country"
              placeholder="Country"
              value={countryCode.country}
              cStyle={{ width: "38%" }}
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
              cStyle={{ width: "60%" }}
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
