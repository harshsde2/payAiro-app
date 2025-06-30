import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import RNFS from "react-native-fs";
import GenericButton from "../../components/GenericButton";
import SignaturePad from "../../components/SignaturePad";
import UploadFile from "../../components/UploadFile";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import { patchKyc } from "../../services/Services";

import { ScreenContainer } from "HOC";
import { useDispatch } from "react-redux";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import {
  setErrorMsg,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";

export default function Signature(props: any) {
  const { payload } = props.route.params || {};

  const navigation = useNavigation<any>();

  const { theme } = useTheme();
  const styles = customStyles(theme);

  const { tokens } = useSelectorAction();

  const [isVisible, setisVisible] = useState(false);
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<any>(null); // file object
  const [activeSignatureType, setActiveSignatureType] = useState<
    "drawn" | "uploaded" | null
  >(null);

  const handleSignatureSelect = (signature: any) => {
    setDrawnSignature(signature);
    setUploadedSignature(null); // Clear uploaded if drawn again
    setActiveSignatureType("drawn");
  };

  const handleSignatureType = async (base64String: any) => {
    try {
      let base64 = base64String.replace("data:image/png;base64,", "");
      const fileName = `${Date.now()}.png`;

      // creates a file in temporary directory to delete later
      const path = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, base64, "base64");

      const image = {
        uri: Platform.OS == "ios" ? path : "file://" + path,
        name: fileName,
        type: "image/png",
      };
    } catch (error) {
      console.log(error);
    }
  };

  const [idProof1, setidProof1] = useState<any>([]);

  const handleSignature = async () => {
    if (!uploadedSignature && !drawnSignature) {
      useDispatchAction(setErrorMsg("Signature is required!"));
      return;
    }
    try {
      const formData3 = new FormData();
      formData3.append(
        "signature",
        uploadedSignature ?? {
          uri: drawnSignature,
          name: `${Date.now()}.png`,
          type: "image/png",
        }
      );

      navigation.navigate(SCREENS.Dob, {
        payload: {
          ...payload,
          signature: uploadedSignature ?? {
            uri: drawnSignature,
            name: `${Date.now()}.png`,
            type: "image/png",
          },
        },
      });
    } catch (error) {
      useDispatchAction(
        setErrorMsg("Entity Too Large , Try To Upload Small File")
      );
    }
  };

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <AuthHeader header={true} showAuthLogo={true} />
      <SignaturePad
        onSelected={(e: any) => {
          handleSignatureType(e);
          handleSignatureSelect(e);
        }}
        isVisible={isVisible}
        onClose={() => setisVisible(false)}
      />
      <View style={[styles.conntentContainer]}>
        <View style={[styles.headerContainer]}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Draw your signature
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            Align horizontal select opacity plugin selection reesizing comment
            rectangle text.
          </CustomText>
        </View>
        <View style={[styles.formContainer]}>
          <UploadFile
            label={"Upload your signature"}
            selectedFile={(result: any) => {
              setidProof1(result);
              setUploadedSignature(result[0]);
              setDrawnSignature(null); // Clear drawn if upload happens
              setActiveSignatureType("uploaded");
            }}
            value={uploadedSignature?.name}
            type="image"
          />
          <CustomText style={[styles.orText]}>OR</CustomText>
          <TouchableOpacity
            style={[styles.dropdownContainer]}
            onPress={() => {
              setisVisible(true);
            }}
          >
            <CustomText
              variant={"body2"}
              style={{
                textAlign: "left",
                textAlignVertical: "center",
                lineHeight: 50,
              }}
            >
              Click to draw your signature
            </CustomText>
          </TouchableOpacity>
          {activeSignatureType && (
            <View style={[styles.signatureImageContainer]}>
              <CustomText variant={"body1"} style={[styles.signatureHeader]}>
                Your Signature:
              </CustomText>
              <Image
                source={{
                  uri:
                    activeSignatureType === "uploaded"
                      ? uploadedSignature?.uri
                      : drawnSignature,
                }}
                style={[styles.signatureImage]}
              />
              <CustomText variant={"body2"} style={[{ marginTop: 20 }]}>
                {activeSignatureType === "uploaded"
                  ? "Uploaded Signature"
                  : "Drawn Signature"}
              </CustomText>
            </View>
          )}
          <GenericButton
            title="Next"
            cStyle={{ marginTop: 20 }}
            onPress={() => handleSignature()}
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
    headerContainer: { width: "100%", alignSelf: "center" },
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
      // backgroundColor: "red",
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
