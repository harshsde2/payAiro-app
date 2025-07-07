import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Fonts from "../constants/Fonts";

export default function CrryptoCard({ item, type }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        if (type === "withdraw") {
          navigation.navigate("WithdrawScreen", { item });
        }
      }}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 25,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Image
          source={{
            uri: item?.iconUrl,
          }}
          style={{ width: 30, height: 30, marginRight: 6 }}
        />
        <View>
          <Text
            style={{
              color: "black",
              fontFamily: Fonts.semibold,
              fontSize: 15,
            }}
          >
            {item?.assetType?.toUpperCase()}
          </Text>
          <Text
            style={{
              color: "black",
              fontFamily: Fonts.semibold,
              fontSize: 9,
            }}
          >
            {item?.disbursable}
          </Text>
        </View>
      </View>
      <View>
        <Text
          style={{
            color: "rgba(236, 105, 72, 1)",
            fontFamily: Fonts.semibold,
            fontSize: 14,
            textAlign: "right",
          }}
        >
          ${item?.usd}
        </Text>
        <Text
          style={{
            color: "black",
            fontFamily: Fonts.regular,
            fontSize: 9,
            textAlign: "right",
          }}
        >
          {item?.disbursable} {item?.assetType?.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
