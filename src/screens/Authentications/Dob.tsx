import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useState } from "react";
import CommonContainer from "../../HOC/CommonContainer";
import TextInputField from "../../components/TextInputField";
import GenericButton from "../../components/GenericButton";
import { SCREENS } from "../../constants/SCREENS";
import { useNavigation } from "@react-navigation/native";
import Fonts from "../../constants/Fonts";
import UploadFile from "../../components/UploadFile";
import SignaturePad from "../../components/SignaturePad";
import useSelectorAction from "../../hooks/useSelectorAction";
import { getWallet, patchKyc } from "../../services/Services";
import {
  setLogin,
  setUserData,
  setWalletData,
} from "../../redux/slices/authenticationSlice";
import { showError } from "../../utils/toast";
import DatePicker from "components/common-components/DatePicker";
import moment from "moment";
import {
  setKycStep,
  setToken,
  setUser,
  setWalletDataAuth,
} from "../../services/Auth";
import { useDispatch } from "react-redux";
import Loader from "../../components/Loader";
import { useStepCount } from "query/hooks/useAPIAuth";
import { ScreenContainer } from "HOC";
import { Theme, useTheme } from "styles";
import AuthHeader from "tsx-components/AuthHeader";
import { CustomText } from "tsx-components";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

export default function Dob(props: any) {
  const { payload } = props.route.params || {};

  const { theme } = useTheme();
  const styles = customStyles(theme);

  const navigation = useNavigation<any>();

  const [date, setdate] = useState("");
  const [open, setOpen] = useState(false);

  const handlePayTag = async () => {
    if (date.length === 0) {
      showError("Date of birth are Required!");
      return;
    }

    const formData4 = new FormData();
    formData4.append("dob", moment(date).format("YYYY-MM-DD"));
    navigation.navigate(NAVIGATION_SCREENS.SELFIE_SCREEN, {
      payload: { ...payload, dob: moment(date).format("YYYY-MM-DD") },
    });
    return;
  };

  return (
    <ScreenContainer avoidKeyboard padding={0}>
      <AuthHeader header={true} showAuthLogo={true} />
      <View style={[styles.conntentContainer]}>
        <View style={[styles.headerContainer]}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            What's your date of birth.
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            This should match the name on your government ID.
          </CustomText>
        </View>
        <View style={[styles.formContainer]}>
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{
              borderRadius: 30,
              borderWidth: 1,
              borderColor: "#6A6A6A33",
              padding: 15,
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

          <GenericButton
            title="Next"
            cStyle={{ marginTop: 25 }}
            onPress={() => handlePayTag()}
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
  });
