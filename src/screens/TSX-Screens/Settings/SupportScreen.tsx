import { View, Text, StyleSheet, TextInputComponent } from "react-native";
import React, { useState } from "react";
import { Theme, useTheme } from "styles";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { useCommonAddBalanceStyles } from "../AddBalance/Styles";
import { SvgIcons } from "constants/svgs";
import { CustomText } from "tsx-components";
import TextInputField from "components/TextInputField";
import UploadFile from "components/UploadFile";
import useSelectorAction from "hooks/useSelectorAction";
import GenericButton from "components/GenericButton";
import { useSupport } from "query/hooks";
import useDispatchAction from "hooks/useDispatchAction";
import { setShowLoader } from "redux/slices/authenticationSlice";
import { showError, showSuccess } from "utils/toast";

const SupportScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [attachment, setAttachment] = useState<any>(null);

  const {
    isError,
    isPaused,
    isPending,
    mutate: handleSubmitSupport,
  } = useSupport();

  const { walletData } = useSelectorAction();

  const handleSubmit = () => {
    if (subject.length == 0) {
      showError("Subject is Empty");
      return;
    }
    if (message.length == 0) {
      showError("Message is Empty");
      return;
    }

    const formData = new FormData();

    // Append the selfie image
    formData.append("selfimage", {
      uri: attachment.uri,
      name: attachment.name || `attachment${Date.now()}.jpg`,
      type: attachment.type || "image/jpeg",
    });

    formData.append("message", message);
    formData.append("subject", subject);
    useDispatchAction(setShowLoader(true));

    handleSubmitSupport(formData as any, {
      onSuccess: (data) => {
        // console.log("data => ✅", JSON.stringify(data, null, 2));
        showSuccess("Your Query Submit Successfully");
        // handleAddBankAccounts();
        navigation.goBack();
      },
      onError: (error: any) => {
        useDispatchAction(setShowLoader(false));

        // console.log("Error uploading selfie:", errors);
        showError("Something went wrong!");
      },
      onSettled: () => {
        useDispatchAction(setShowLoader(false));
      },
    });
  };

  //   const han;

  console.log("wallet data. =>", JSON.stringify(walletData, null, 2));

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <HeaderTitle title="Support" leftIcon="true" />
      <View style={[styles.whiteSheetContainer]}>
        <View style={customStyle.infoContainer}>
          <SvgIcons.InfoNote />
          <CustomText
            variant="caption"
            style={{ flex: 1, color: theme.colors.palette.grey600 }}
          >
            Submit the support form below and our team will get in touch within
            48 hours.
          </CustomText>
        </View>
        <View style={{ marginVertical: 20 }}>
          <TextInputField
            required
            label="Subject"
            placeholder={"Your Subject"}
            value={subject}
            cStyle={{ marginBottom: 15 }}
            onChange={(e) => {
              setSubject(e);
            }}
          />

          <TextInputField
            required
            label="Message"
            placeholder={"Write your query"}
            value={message}
            isMultiLine={true}
            iStyle={{
              height: 120,
              textAlignVertical: "top",
              paddingVertical: 10,
            }}
            cStyle={{ marginBottom: 15 }}
            onChange={(m) => {
              setMessage(m);
            }}
          />
          <UploadFile
            label={"Upload file"}
            selectedFile={(result: any) => {
              //   setidProof1(result);
              setAttachment(result[0]);
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
                    marginBottom: 10,
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
                  Accepted formats: PNG, JPG • Max size: 5MB
                </CustomText>
              </View>
            )}
          </UploadFile>
        </View>
        <GenericButton
          title="Submit"
          onPress={() => {
            handleSubmit();
          }}
        />
      </View>
    </ScreenContainer>
  );
};

export default SupportScreen;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
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
      height: 200,
      borderStyle: "dashed",
      borderColor: theme.colors.palette.grey400,
      backgroundColor: theme.colors.palette.grey50,
      justifyContent: "center",
      alignItems: "center",
    },
  });
