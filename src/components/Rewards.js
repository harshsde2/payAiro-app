import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import GenericButton from "./GenericButton";
import Fonts from "../constants/Fonts";
import { SvgXml } from "react-native-svg";
import { SVGReward } from "../constants/images";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../constants/SCREENS";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

export default function Rewards({ item }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(item?.route ?? NAVIGATION_SCREENS.SCRATCH)
      }
      activeOpacity={0.7}
      style={{
        borderRadius: 10,
        backgroundColor: item?.bgColor ?? "rgba(255, 234, 177, 0.7)",
        padding: 10,
        width: 110,
        marginRight: 5,
      }}
    >
      <View style={{ width: '100%',marginBottom: 10 }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 35,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: "#fff",
            alignSelf: "center",
          }}
        >
          {item?.icon}
        </View>

        <Text
          style={{
            textAlign: "center",
            fontFamily: Fonts.semibold,
            marginBottom: 10,
          }}
        >
          {item?.name ?? "Rewards"}
        </Text>
      </View>

      <GenericButton
        title={item?.buttonText ?? "View Rewards​"}
        tStyle={{ fontSize: 10 }}
        cStyle={{
          backgroundColor: "#000",
          padding: 3,
        }}
        // tStyle={{color: 'white', fontSize: 10}}
        disabled={true}
      />
    </TouchableOpacity>
  );
}
