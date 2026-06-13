import { View, StyleSheet } from "react-native";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Theme, useTheme } from "styles";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { useCommonAddBalanceStyles } from "../AddBalance/Styles";
import { SvgIcons } from "constants/svgs";
import { CustomText } from "tsx-components";
import TextInputField from "components/TextInputField";
// import UploadFile from "components/UploadFile"; // Image upload temporarily disabled for account recovery
import useSelectorAction from "hooks/useSelectorAction";
import GenericButton from "components/GenericButton";
import { showError } from "utils/toast";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { validateEmailOrPhone } from "utils/validation";

const SupportScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registeredContact, setRegisteredContact] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  // const [attachment, setAttachment] = useState<any>(null); // Image upload is disabled for now

  const { walletData } = useSelectorAction();

  const handleSubmit = async () => {
    try {
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedRegisteredContact = registeredContact.trim();

      if (!trimmedFirstName) {
        showError("First name is required", "Please enter your first name.");
        return;
      }

      if (!trimmedLastName) {
        showError("Last name is required", "Please enter your last name.");
        return;
      }

      if (!trimmedRegisteredContact) {
        showError(
          "Registered email is required",
          "Please enter the email address linked to your account."
        );
        return;
      }

      const validationResult = validateEmailOrPhone(trimmedRegisteredContact);

      if (!validationResult.isValid) {
        showError(validationResult.errorMessage || "Invalid contact", validationResult.helperText || "Enter a valid email or phone number linked to your account.");
        return;
      }

      // Contact form requires an email; ensure we have one
      if (validationResult.inputType !== "email") {
        showError(
          "Email address required",
          "Please enter the email address linked to your account so we can reach you."
        );
        return;
      }

      if (subject.length === 0) {
        showError("Reason for recovery is empty", "Please tell us why you need to recover your account.");
        return;
      }
      if (message.length === 0) {
        showError("Details are empty", "Please describe your issue so we can help you recover your account.");
        return;
      }

      // Account-recovery submission is temporarily disabled pending migration to userApiClient + a new endpoint.
      showError(
        "Temporarily unavailable",
        "Account recovery requests are currently unavailable. Please try again later."
      );
    } catch (error: any) {
      const errorMessage =
        error?.message || "An unexpected error occurred. Please try again.";
      showError(errorMessage);
      console.error("Support form submission error:", error);
    }
  };

  //   const han;

  // console.log("wallet data. =>", JSON.stringify(walletData, null, 2));

  return (
    <ScreenContainer scrollable={false} padding={0}>
      <HeaderTitle
        title="Account Recovery"
        leftIcon="true"
        rightIcon={<SvgIcons.ChatWithAi width={30} height={30} />}
        onPressRight={() => {
          navigation.navigate(NAVIGATION_SCREENS.FRESHCHAT_SCREEN);
        }}
      />
      <KeyboardAwareScrollView
        style={customStyle.keyboardScrollView}
        contentContainerStyle={customStyle.keyboardScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={24}
        enableAutomaticScroll
      >
      <View style={[styles.whiteSheetContainer]}>
        <View style={customStyle.infoContainer}>
          {/* <SvgIcons.InfoNote /> */}
          <CustomText
            variant="caption"
            style={{ flex: 1, color: theme.colors.palette.grey600 }}
          >
            Tell us about your account and how you lost access. Our team will help you recover it within 48 hours.
          </CustomText>
        </View>
        <View style={{ marginVertical: 20 }}>
          <TextInputField
            required
            label="First name"
            placeholder={"Enter your first name"}
            value={firstName}
            cStyle={{ marginBottom: 15 }}
            onChange={(e) => {
              setFirstName(e);
            }}
          />
          <TextInputField
            required
            label="Last name"
            placeholder={"Enter your last name"}
            value={lastName}
            cStyle={{ marginBottom: 15 }}
            onChange={(e) => {
              setLastName(e);
            }}
          />
          <TextInputField
            required
            label="Registered email"
            placeholder={"Enter the email address linked to your account"}
            value={registeredContact}
            cStyle={{ marginBottom: 15 }}
            onChange={(e) => {
              setRegisteredContact(e);
            }}
          />

          <TextInputField
            required
            label="Reason for recovery"
            placeholder={"e.g. Lost access to phone, forgot password, suspicious activity"}
            value={subject}
            isMultiLine={true}
            iStyle={{
              height: 120,
              textAlignVertical: "top",
              paddingVertical: 10,
            }}
            cStyle={{ marginBottom: 15 }}
            onChange={(m) => {
              setSubject(m);
            }}
          />

          <TextInputField
            required
            label="Describe your issue"
            placeholder={
              "Include any details that can help us verify your identity (last successful login, device, approximate balance, etc.)"
            }
            value={message}
            isMultiLine={true}
            iStyle={{
              height: 160,
              textAlignVertical: "top",
              paddingVertical: 10,
            }}
            cStyle={{ marginBottom: 15 }}
            onChange={(m) => {
              setMessage(m);
            }}
          />
          {/* Image upload disabled for now
          <UploadFile
            label={"Add an attachment (optional)"}
            selectedFile={(result: any) => {
              if (result && result.length > 0 && result[0]) {
                setAttachment(result[0]);
              } else {
                setAttachment(null);
              }
            }}
            value={attachment?.name}
            type={"image"}
            key={"asdasd"}
            boxStyle={customStyle.uploadBox}
          >
            {attachment?.name ? (
              <View style={{ alignItems: "center", padding: 10 }}>
                <SvgIcons.UploadIcon width={40} height={40} />
                <CustomText variant="body2" style={{ marginTop: 10 }}>
                  {attachment.name}
                </CustomText>
              </View>
            ) : (
              <View style={{ alignItems: "center", padding: 10 }}>
                <View
                  style={{
                    padding: 10,
                    backgroundColor: theme.colors.palette.grey120,
                    borderRadius: 50,
                  }}
                >
                  <SvgIcons.UploadIcon width={30} height={30} />
                </View>
                <CustomText variant="body2" style={{ textAlign: "center" }}>
                  <CustomText
                    variant="body2"
                    color={theme.colors.palette.green500}
                  >
                    Tap to upload
                  </CustomText>{" "}
                  or drag and drop
                </CustomText>
                <CustomText
                  variant="caption"
                  color={theme.colors.palette.grey500}
                  style={{ marginTop: 5 }}
                >
                  PNG or JPG files
                </CustomText>
                <CustomText
                  variant="caption"
                  color={theme.colors.palette.grey400}
                  style={{ marginTop: 15 }}
                >
                  You can upload a photo ID or a screenshot related to your account.
                </CustomText>
              </View>
            )}
          </UploadFile>
          */}
        </View>
        <View style={{ gap: 10 }}>
          <GenericButton
            title="Submit recovery request"
            onPress={() => {
              handleSubmit();
            }}
          />
        </View>
      </View>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default SupportScreen;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    keyboardScrollView: {
      flex: 1,
    },
    keyboardScrollContent: {
      flexGrow: 1,
    },
    infoContainer: {
      width: "100%",
      flexDirection: "row",
      gap: 10,
      backgroundColor: theme.colors.palette.green50,
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.palette.green500,
      alignItems: "center",
    },
    uploadBox: {
      height: 150,
      borderStyle: "dashed",
      borderColor: theme.colors.palette.grey400,
      backgroundColor: theme.colors.palette.grey50,
      justifyContent: "center",
      alignItems: "center",
    },
  });
