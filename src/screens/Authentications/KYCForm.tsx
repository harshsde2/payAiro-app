import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useRef, useState } from "react";
import { ScreenContainer } from "HOC";
import AuthHeader from "tsx-components/AuthHeader";
import HeaderTitle from "components/HeaderTitle";
import { useNavigation } from "@react-navigation/native";
import { Theme, useTheme } from "styles";
import TextInputField from "components/TextInputField";
import GenericButton from "components/GenericButton";
import { CustomText } from "tsx-components";
import UploadFile from "components/UploadFile";
import DocumentModal from "components/DocumentModal";
import Fonts from "constants/Fonts";
import DatePicker from "react-native-date-picker";
import moment from "moment";

const KYCForm = () => {
  const navigation = useNavigation<any>();

  const termsAndConditionRef = useRef<any>(null);


  const { theme } = useTheme();
  const styles = customStyles(theme);

  const [residentialAddress, setResidentialAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [locality, setLocality] = useState("");
  const [countryCode, setCountryCode] = useState({
    country: "",
    code: "",
    flag_image_url: "https://flagcdn.com/w320/us.png",
  });
  const [postalCode, setPostalCode] = useState("");

  const [ssm, setssm] = useState("");
  const [idProof1, setidProof1] = useState<any[]>([]);
  const [idProof2, setidProof2] = useState<any[]>([]);
  const [isVisible, setisVisible] = useState(false);
  const [dropdownPlaceholder, setDropdownPlaceholder] = useState(
    "Select ID Proof Type"
  );
  const [poi, setpov] = useState("");
  const [isVisible1, setisVisible1] = useState(false);
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<any>(null); // file object
  const [activeSignatureType, setActiveSignatureType] = useState<
    "drawn" | "uploaded" | null
  >(null);
  const [date, setdate] = useState("");
  const [open, setOpen] = useState(false);
  const [checked, setchecked] = useState(false);
  const [checked2, setchecked2] = useState(false);
  const [selfie, setselfie] = useState<any>(null);

  const handleInputChange = (setter: any) => (value: any) => {
    setter(value);
  };

  return (
    <ScreenContainer scrollable paddingVertical={0} paddingHorizontal={0}>
      <HeaderTitle title="KYC Form" leftIcon="true" />
      <View style={{ paddingHorizontal: 10 }}>
        <TextInputField
          label="Address 1"
          placeholder="Address 1"
          value={residentialAddress}
          onChange={handleInputChange(setResidentialAddress)}
        />
        <TextInputField
          label="Address 2"
          placeholder="Address 2"
          value={locality}
          onChange={handleInputChange(setLocality)}
        />
        <TextInputField
          label="City/Town"
          placeholder="City/Town"
          value={city}
          onChange={handleInputChange(setCity)}
        />
        <TextInputField
          label="State"
          placeholder="State"
          value={state}
          onChange={handleInputChange(setState)}
        />
        <View style={[styles.formContainer]}>
          <TextInputField
            countryCode={countryCode}
            label="Country"
            placeholder="Country"
            value={countryCode.country}
            onChange={handleInputChange(setCountryCode)}
            cStyle={{ width: 80, marginRight: 10 }}
            onSelected={setCountryCode}
            isCountry={true}
            editable={true}
          />
          <TextInputField
            label="Postal Code"
            keyboardType="numeric"
            placeholder="Postal Code"
            value={postalCode}
            onChange={handleInputChange(setPostalCode)}
            cStyle={{ flex: 1 }}
            maxLength={5}
          />
        </View>
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
            maxLength={9}
            keyboardType={"numeric"}
            onChange={setssm}
          />
        )}

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
      <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{
              borderRadius: 30,
              borderWidth: 1,
              borderColor: "#6A6A6A33",
              padding: 15,
              marginTop:20
            }}
          >
            <Text
              style={{
                paddingRight: 10,
                paddingLeft: 15,
                fontFamily: Fonts.semibold,
                width: "90%",
                color: "#6A6A6A",
              }}
            >
              {date === ""
                ? " MM/DD/YY"
                : moment(date ?? new Date()).format("MM/DD/YY")}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            mode="date"
            open={open}
            date={
              new Date(new Date().setFullYear(new Date().getFullYear() - 30))
            } // Default to 18 years ago
            maximumDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 30))
            } // Prevent dates under 18 years
            onConfirm={(date: any) => {
              setOpen(false);
              setdate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
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
                onPress={() => handlePDFViewFortressAccountAgreement()}
                style={{ fontWeight: "700" }}
              >
                {" "}
                Fortress trust Account Agreement{" "}
              </Text>
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setchecked2((state) => !state);
            }}
            style={styles.termsAndConditionContainer}
          >
            
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
                //  handlePDFViewAMLPolicy()
                {}
                }
                style={{ fontWeight: "700" }}
              >
                {" "}
                AML Policy{" "}
              </Text>
            </CustomText>
          </TouchableOpacity>

        <GenericButton
          title="Next"
          cStyle={{ marginTop: 45 }}
          onPress={() => {}}
        />
      </View>
    </ScreenContainer>
  );
};

export default KYCForm;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    termsAndConditionContainer: {
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
