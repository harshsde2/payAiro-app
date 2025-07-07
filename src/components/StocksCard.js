import React from "react";
import { Text, View } from "react-native";
import Fonts from "../constants/Fonts";

export default function StocksCard() {
  return (
    <View
      style={{
        width: "49%",
        backgroundColor: "rgba(217, 217, 217, 0.05)",
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(106, 106, 106, 0.03)",
        marginVertical: 8,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 14,
          color: "rgba(106, 106, 106, 1)",
          marginVertical: 9,
        }}
      >
        Happiest Minds Tech
      </Text>

      <Text
        style={{
          fontFamily: Fonts.semibold,
          fontSize: 14,
          color: "black",
        }}
      >
        $ 23,073.60
      </Text>

      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 10,
          color: "rgba(236, 105, 72, 1)",
        }}
      >
        -308.00 (1.32%){" "}
      </Text>
    </View>
  );
}
