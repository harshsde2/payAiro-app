import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { useStepCount } from "query/hooks/useAPIAuth";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch } from "react-redux";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import DocumentModal from "../../components/DocumentModal";
import GenericButton from "../../components/GenericButton";
import TextInputField from "../../components/TextInputField";
import UploadFile from "../../components/UploadFile";
import { SCREENS } from "../../constants/SCREENS";
import { SVGDropDown } from "../../constants/images";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import { setErrorMsg } from "../../redux/slices/authenticationSlice";
import { setKycStep } from "../../services/Auth";

export default function IDProof(props: any) {
  const { payload } = props.route.params || {};
  const [ssm, setssm] = useState("");

  const { theme } = useTheme();
  const styles = customStyles(theme);

  const navigation = useNavigation<any>();

  const [idProof1, setidProof1] = useState<any[]>([]);
  const [idProof2, setidProof2] = useState<any[]>([]);
  const [isVisible, setisVisible] = useState(false);
  const [dropdownPlaceholder, setDropdownPlaceholder] = useState(
    "Select ID Proof Type"
  );
  const [poi, setpov] = useState("");

  const handleIdProof = async () => {
    await setKycStep("2");

    try {
      const formData2 = new FormData();
      formData2.append("poi_doc", idProof1[0]);
      formData2.append("address_pov", idProof2[0]);
      formData2.append("step_count", "2");
      formData2.append("poi", poi);
      formData2.append("ssm", ssm);

      if (idProof1.length == 0) {
        useDispatchAction(setErrorMsg("Please select front image"));
        return;
      }

      if (idProof2.length == 0) {
        useDispatchAction(setErrorMsg("Please select back image"));
        return;
      }

      if (!/^\d{9}$/.test(ssm) || new Set(ssm).size !== 9) {
        useDispatchAction(
          setErrorMsg("Please enter a 9-digit number with unique digits")
        );
        return;
      }

      navigation.navigate(SCREENS.Signature, {
        payload: {
          ...payload,
          poi_doc: idProof1[0],
          address_pov: idProof2[0],
          poi,
          ssm,
        },
      });

      return;
    } catch (error) {
      console.log(error, "error");
      useDispatchAction(
        setErrorMsg("Invalid Document , Try To Upload Correct Document")
      );
    } finally {
    }
  };

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <AuthHeader header={true} showAuthLogo={true} />
      <DocumentModal
        isVisible={isVisible}
        onClose={() => {
          setisVisible(false);
        }}
        onSelect={(e: any) => {
          setpov(e);
          setidProof1([]);
          setidProof2([]);
          setDropdownPlaceholder(e);
          setisVisible(false);
        }}
      />
      <View style={[styles.conntentContainer]}>
        <View style={[styles.headerContainer]}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Upload your ID Proof
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            Align horizontal select opacity plugin selection reesizing comment
            rectangle text.{" "}
          </CustomText>
        </View>

        <View style={{ marginVertical: 40 }}>
          <TouchableOpacity
            style={[styles.dropdownContainer]}
            onPress={() => {
              setisVisible(true);
            }}
          >
            <CustomText
              style={{
                textAlign: "left",
                textAlignVertical: "center",
                flex: 1,
                // backgroundColor: "green",
                lineHeight: 50,
              }}
            >
              {dropdownPlaceholder}
            </CustomText>
            <SvgXml xml={SVGDropDown} width={15} height={15} />
          </TouchableOpacity>
          {poi !== "" && (
            <UploadFile
              label={"Upload Front"}
              selectedFile={(result: any) => {
                setidProof1(result);
              }}
              value={idProof1[0]?.name}
              type={"image"}
              key={"asdasd"}
            />
          )}
          {poi !== "" && (
            <UploadFile
              label={"Upload Back"}
              selectedFile={(result: any) => {
                setidProof2(result);
              }}
              value={idProof2[0]?.name}
              type={"image"}
              key={"asdaser"}
            />
          )}
          {poi !== "" && (
            <TextInputField
              label="SSN"
              placeholder="Enter SSN"
              value={ssm}
              keyboardType={"numeric"}
              onChange={setssm}
            />
          )}
          <GenericButton
            title="Next"
            cStyle={{ marginTop: 45 }}
            onPress={handleIdProof}
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
    formContainer: {
      marginVertical: 5,
      flexDirection: "row",
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
    dropdownContainer: {
      width: "100%",
      borderRadius: theme.spacing.spacing[8],
      borderWidth: 0.5,
      borderColor: theme.colors.palette.grey300,
      minHeight: 50,
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: theme.spacing.spacing[4],
      marginTop: theme.spacing.spacing[5],
    },
  });
