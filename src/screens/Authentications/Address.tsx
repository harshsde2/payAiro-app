import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import React, { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import GenericButton from "../../components/GenericButton";
import TextInputField from "../../components/TextInputField";
import { SCREENS } from "../../constants/SCREENS";
import { showError } from "../../utils/toast";

export default function Address() {
  const navigation = useNavigation<any>();

  const { theme } = useTheme();
  const styles = customStyles(theme);

  // States for input fields
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
  const handleInputChange = (setter: any) => (value: any) => {
    setter(value);
  };

  const handleNext = async () => {
    if (
      !city.trim() ||
      !state.trim() ||
      !residentialAddress.trim() ||
      !postalCode.trim() ||
      !locality.trim()
    ) {
      showError("Fields cannot be empty!");
      return;
    }
    if (postalCode?.length < 5) {
      showError("Postal Code cannot be less than 5 digit!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("city", city);
      formData.append("state", state);
      formData.append("street_address", residentialAddress);
      formData.append("zip_code", postalCode);
      formData.append("country", "US");
      formData.append("step_count", "1");
      formData.append("address2", locality);

      console.log(formData, "formData");
      console.log(formData);

      navigation.navigate(SCREENS.IDProof, {
        payload: {
          city,
          state,
          residentialAddress,
          postalCode,
          countryCode,
          locality,
        },
      });
      return;
    } catch (error) {
      console.log(error);
      showError("Something went wrong");
    }
  };

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <AuthHeader showAuthLogo={true} />
      <View style={styles.conntentContainer}>
        <View style={[styles.headerContainer]}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Address Details
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            Clip follower flows vector scale.
          </CustomText>
        </View>
        <View style={{ marginVertical: 40 }}>
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
          <GenericButton
            title="Next"
            cStyle={{ marginTop: 45 }}
            onPress={handleNext}
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
  });
