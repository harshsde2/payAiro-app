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
import {
  setErrorMsg,
  setShowLoader,
  setSuccessMsg,
} from "redux/slices/authenticationSlice";

const SupportScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [attachment, setAttachment] = useState([]);

  const {
    isError,
    isPaused,
    isPending,
    mutate: handleSubmitSupport,
  } = useSupport();

  const { walletData } = useSelectorAction();

  const handleSubmit = () => {
    if (subject.length == 0) {
      useDispatchAction(setErrorMsg("Subject is Empty"));
      return;
    }
    if (message.length == 0) {
      useDispatchAction(setErrorMsg("Message is Empty"));
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
        useDispatchAction(setSuccessMsg("Your Query Submit Successfully"));
        // handleAddBankAccounts();
      },
      onError: (error: any) => {
        useDispatchAction(setShowLoader(false));

        // console.log("Error uploading selfie:", errors);
        useDispatchAction(setErrorMsg("Something went wrong!"));
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
        <View style={{ width: "100%", flexDirection: "row", gap: 10 }}>
          <SvgIcons.InfoNote />
          <CustomText variant="caption">
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
            cStyle={{}}
            // editable={false}
            onChange={(e) => {
              setSubject(e);
            }}
          />
          {/* <TextInputField
            label="Email"
            placeholder={"Your Email"}
            value={walletData?.account_email ?? ""}
            cStyle={{}}
            editable={false}
            onChange={() => {}}
          />
          <TextInputField
            label="PayAiro Tag"
            placeholder={"Your PayAiro Tag"}
            value={walletData?.username ?? ""}
            cStyle={{}}
            editable={false}
            onChange={() => {}}
          /> */}
          <TextInputField
            required
            label="Message"
            placeholder={"Write your query"}
            value={message}
            // multiline={true}
            isMultiLine={true}
            iStyle={
              {
                //   height: 170,
              }
            }
            onChange={(m) => {
              setMessage(m);
            }}
          />
          <UploadFile
            label={"Upload Front"}
            selectedFile={(result: any) => {
              //   setidProof1(result);
              setAttachment(result[0]);
            }}
            value={attachment?.name}
            type={"image"}
            key={"asdasd"}
          />
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

const customStyles = (theme: Theme) => StyleSheet.create({});
