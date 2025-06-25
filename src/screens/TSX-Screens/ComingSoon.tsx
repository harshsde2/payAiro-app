import { View, Text } from "react-native";
import React, { FC } from "react";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { SVGLeftArrow } from "constants/images";
import { useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { CustomText } from "tsx-components";
import QRCode from "react-native-qrcode-svg";

interface ComingSoonProps {
  title: string;
}

const ComingSoon: FC<ComingSoonProps> = ({}) => {
  const route = useRoute<any>();
  const { title } = route.params;
  return (
    <ScreenContainer padding={0}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <HeaderTitle title={title} leftIcon={SVGLeftArrow} />
        <View style={{ width: "100%", height: 300 }}>
          <LottieView
            style={{ width: "100%", height: "100%" }}
            source={require("../../lottie/ComingSoon.json")}
            autoPlay
            loop
          />
        </View>
        <View
          style={{ width: "100%", paddingHorizontal: 20, alignItems: "center" }}
        >
          <CustomText variant="h2" style={{ marginTop: 20 }}>
            Coming Soon
          </CustomText>
          <CustomText
            variant="caption"
            fontWeight="semiBold"
            size={14}
            style={{ textAlign: "center", marginVertical: 10 }}
          >
            We're building something exciting for you!
          </CustomText>
          <CustomText
            variant="caption"
            fontWeight="semiBold"
            size={14}
            style={{ textAlign: "center" }}
          >
            This feature is currently under development and will be available
            soon. Thank you for your patience!
          </CustomText>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default ComingSoon;
