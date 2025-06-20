import { View, Text, Image } from "react-native";
import React from "react";
import { SvgXml } from "react-native-svg";
import { SVGProfile, SVGRightIcon } from "../../constants/images";
import Fonts from "../../constants/Fonts";
import moment from "moment";
import { defaultCrypto, defaultImage } from "utils/configs";
import UserAvatar from "tsx-components/UserAvatar";

export default function Notificatiom({ item }) {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {/* <SvgXml xml={SVGProfile} /> */}
          {/* <Image
            style={{ width: 50, height: 50, backgroundColor: "red" }}
            resizeMode="contain"
            borderRadius={50}
            src={defaultCrypto}
          /> */}
          <UserAvatar style={{ width: 50, height: 50 }} item={item} />
          <View style={{ width: "75%", marginLeft: 10 }}>
            <Text
              style={{ color: "black", fontFamily: Fonts.bold, fontSize: 16 }}
            >
              {item?.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(106, 106, 106, 1)",
                fontFamily: Fonts.regular,
                marginVertical: 2,
              }}
            >
              {item?.body}
            </Text>
            <Text>{moment(item?.created_at).format("LT")}</Text>
          </View>
        </View>
        <View style={{ width: "25%" }}>
          <SvgXml xml={SVGRightIcon} />
        </View>
      </View>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "rgba(234, 234, 234, 1)",
        }}
      />
    </>
  );
}
