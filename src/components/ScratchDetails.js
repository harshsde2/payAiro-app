import { SvgIcons } from "constants/svgs";
import React from "react";
import { Text, View } from "react-native";
import Fonts from "../constants/Fonts";
import CommonHeaderv2 from "../HOC/CommonHeaderv2";
import GenericButton from "./GenericButton";
import HeaderTitle from "./HeaderTitle";

export default function ScratchDetails() {
  return (
    <CommonHeaderv2>
      <HeaderTitle rightIcon={<SvgIcons.CrossIcon />} isBack={true} />

      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 100,
          //   height: 400,
        }}
      >
        <Text
          style={{
            color: "rgba(106, 106, 106, 1)",
            fontFamily: Fonts.regular,
            fontSize: 20,
            marginVertical: 10,
          }}
        >
          Congrats! you have $5.25 off your Ola outstation rides
        </Text>
        <GenericButton
          title={"Copy and redeem Now"}
          cStyle={{ marginVertical: 20 }}
        />
      </View>
    </CommonHeaderv2>
  );
}
