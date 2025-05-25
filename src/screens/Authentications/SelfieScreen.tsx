import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import CommonContainer from "../../HOC/CommonContainer";
import Fonts from "../../constants/Fonts";
import GenericButton from "../../components/GenericButton";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setErrorMsg,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";
import moment from "moment";
import { patchKyc } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import { SCREENS } from "../../constants/SCREENS";
import { useNavigation } from "@react-navigation/native";
import Loader from "../../components/Loader";
import {
  askCameraPremission,
  checkCameraPremission,
} from "../../helper/Permission";
import { SVGChecked, SVGUnChecked } from "constants/images";
import { SvgXml } from "react-native-svg";
import { CustomText } from "tsx-components";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import PDFViewer from "tsx-components/PDFViewer";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  useCreatePin,
  useStepCount,
  useSubmitKYC,
} from "query/hooks/useAPIAuth";
import { ScreenContainer } from "HOC";
import AuthHeader from "tsx-components/AuthHeader";
import { Theme, useTheme } from "styles";
import UploadFile from "components/UploadFile";
import PinScreen from "tsx-components/modals/PinScreen";
import { PinScreenRef } from "tsx-components/modals/modal.types";

export default function SelfieScreen(props: any) {
  const { payload } = props.route.params || {};

  const { theme } = useTheme();
  const styles = customStyles(theme);
  const pinScreenRef = useRef<PinScreenRef | any>();

  const { tokens, userData } = useSelectorAction();
  const [checked, setchecked] = useState(false);

  console.log("auth ->", JSON.stringify((tokens as any)?.access, null, 2));
  const termsAndConditionRef = useRef<any>(null);

  const [selfie, setselfie] = useState<any>(null);
  const navigation = useNavigation<any>();

  const { mutate: handlKYC, isPending, isSuccess } = useSubmitKYC();
  const {
    mutate: handlPinCreation,
    isPending: isPendingCreatePin,
    isSuccess: isSuccessCreatePin,
  } = useCreatePin();

  const handleImage = async () => {
    if (!selfie) {
      useDispatchAction(setErrorMsg("Selfie is Required!"));
      return;
    }
    if (!checked) {
      useDispatchAction(
        setErrorMsg(
          "Please agree with Consumer Disclosure and Fortress trust Account Agreement"
        )
      );
      return;
    }
    const formData = new FormData();
    // Append the selfie image
    formData.append("selfimage", {
      uri: selfie.uri,
      name: selfie.name || `selfie_${Date.now()}.jpg`,
      type: selfie.type || "image/jpeg",
    });

    formData.append("city", payload?.city);
    formData.append("state", payload?.state);
    formData.append("street_address", payload?.residentialAddress);
    formData.append("zip_code", payload?.postalCode);
    formData.append("country", "US");
    formData.append("poi_id", "32324234");
    formData.append("poi_doc", payload?.poi_doc);
    formData.append("step_count", 0);
    formData.append("address_pov", payload?.address_pov);
    formData.append("signature", payload?.signature);
    formData.append("ssn", payload?.ssm);
    formData.append("dob", payload?.dob);
    formData.append("consumer_disclosure_fortress_agreement", checked);

    handlKYC(payload as any, {
      onSuccess: (data) => {
        useDispatchAction(setSuccessMsg("KYC Updated Successfully"));
        handleCreatePin();
      },
      onError: (error: any) => {
        console.log("Error uploading selfie:", error.data.data.details.errors);
        useDispatchAction(
          setErrorMsg(Object.values(error?.data?.data?.details?.errors)[0]) ??
            "Something went wrong"
        );
      },
    });
  };

  const handleCreatePin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current.setUserPin();
    }
  };

  const handlePDFView = () => {
    navigation.navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: "https://vault.sandbox.fortressapi.com/nft-origin/4456f8df-5def-4c3b-97e3-75ca18476da6.pdf",
    });
  };

  const handleSetUserPin = (pin: any) => {
    if (pin.length < 4) {
      useDispatchAction(setErrorMsg("Pin should be 4 digit"));
      return;
    }
    const formData = new FormData();
    formData.append("tpin", pin);

    handlPinCreation(formData as any, {
      onSuccess: (data) => {
        if (data && data?.status) {
          useDispatchAction(
            setSuccessMsg("Transaction Pin created successfully")
          );
          navigation.navigate("SuccesScreen");
        } else {
          useDispatchAction(setErrorMsg("Something Went Wrong"));
        }
      },
      onError: (error) => {},
    });
  };

  return (
    <ScreenContainer scrollable padding={0}>
      <PinScreen
        ref={pinScreenRef}
        onAction={(pin) => {
          handleSetUserPin(pin);
        }}
      />
      <AuthHeader header={true} showAuthLogo={true} />
      <TermAndConditionModal
        onAgree={() => setchecked(true)}
        ref={termsAndConditionRef}
      />
      <View style={[styles.conntentContainer]}>
        <View style={[styles.headerContainer]}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Upload or Take Your Selfie
          </CustomText>
        </View>
        <View style={[styles.formContainer]}>
          <UploadFile
            label={"Upload your profile picture"}
            selectedFile={(result: any) => {
              setselfie(result[0]);
            }}
            value={selfie?.name}
            type="image"
          />

          {selfie && (
            <View style={[styles.signatureImageContainer]}>
              <CustomText variant={"body1"} style={[styles.signatureHeader]}>
                Your Profile:
              </CustomText>
              <Image
                source={{
                  uri: selfie?.uri,
                }}
                style={[styles.signatureImage]}
              />
            </View>
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
              // variant={'caption'}
              style={{
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              <CustomText variant={"caption"}>
                By clicking the button you agree with the
              </CustomText>

              <Text
                onPress={() =>
                  termsAndConditionRef.current?.showConsumerDisclosure()
                }
                style={{ fontWeight: "700" }}
              >
                {" "}
                Consumer Disclosure{" "}
              </Text>
              <CustomText variant={"caption"}>and</CustomText>
              <Text
                onPress={() => handlePDFView()}
                style={{ fontWeight: "700" }}
              >
                {" "}
                Fortress trust Account Agreement{" "}
              </Text>
            </CustomText>
          </TouchableOpacity>
        </View>
        <GenericButton
          title={"Next"}
          cStyle={{
            marginTop: 15,
          }}
          onPress={handleImage}
          showLoader={true}
          isLoading={isPending}
          disabled={isPending}
        />
        {/* <GenericButton
          title={"Create PIN"}
          cStyle={{
            marginTop: 15,
          }}
          onPress={handleCreatePin}
        /> */}
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
    headerContainer: { width: "100%", alignSelf: "center" },
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
    },
    formContainer: {
      marginVertical: 40,
      // flexDirection: "row",
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
    signatureImage: {
      width: 300,
      height: 150,
      resizeMode: "contain",
      borderWidth: 1,
      borderColor: "#ccc",
    },
    signatureImageText: { fontSize: 12, color: "#666", marginTop: 5 },
    signatureImageContainer: { marginTop: 20, alignItems: "center" },
    signatureHeader: { fontFamily: Fonts.semibold, marginBottom: 5 },
    orText: { width: "100%", textAlign: "center", marginTop: 20 },
  });
