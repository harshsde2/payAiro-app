import { SvgIcons } from "constants/svgs";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import useDispatchAction from "../hooks/useDispatchAction";
import useSelectorAction from "../hooks/useSelectorAction";
import {
  setErrorMsg,
  setSuccessMsg,
} from "../redux/slices/authenticationSlice";

export default function ErrorToast() {
  const { errorMsg, successMsg } = useSelectorAction();
  useEffect(() => {
    setTimeout(() => {
      useDispatchAction(setErrorMsg(null));
      useDispatchAction(setSuccessMsg(null));
    }, 2000);
  }, []);
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: errorMsg ? "red" : "green",
        position: "absolute",
        top: 30,
        zIndex: 99999,
        width: "90%",
        alignSelf: "center",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <CustomText
        variant={"body1"}
        color={theme.theme.colors.palette.white}
        style={{
          color: "white",
          // fontFamily: Fonts.bold,
          width: "80%",
          // fontSize: 13,
          // marginBottom: 3,
        }}
      >
        {errorMsg || successMsg}
      </CustomText>
      <SvgIcons.CrossIcon
        style={{ marginRight: 20 }}
        onPress={() => {
          useDispatchAction(setErrorMsg(null));
          useDispatchAction(setSuccessMsg(null));
        }}
      />
    </View>
  );
}
