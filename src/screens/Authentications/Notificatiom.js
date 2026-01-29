import { View, Text } from "react-native";
import React from "react";
import Fonts from "../../constants/Fonts";
import moment from "moment";
import { FasterImageView } from "@rraut/react-native-faster-image";
import { CustomText } from "tsx-components";

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
          {item?.image && (
            <FasterImageView
              source={{ uri: item?.image }}
              style={{ width: 50, height: 50 }}
              radius={25}
              resizeMode="cover"

            />
          )}
          <View style={{ marginLeft: 10, padding: 10, flex: 1 }}>
            <CustomText
              variant="h4"
              color="black"
              fontWeight="bold"
              size={16}
            >
              {item?.title}
            </CustomText>
            <View style={{ width: "100%", marginBottom:5 }} >
              <CustomText
                variant="body2"
                color="rgba(106, 106, 106, 1)"
                fontWeight="regular"
                size={14}
                style={{  width: "100%", flexShrink: 1 }}
              >
                {`$${item?.body}`}
              </CustomText>
            </View>
            <Text>{moment(item?.created_at).format("LT")}</Text>
          </View>
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
