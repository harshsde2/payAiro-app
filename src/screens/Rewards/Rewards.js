import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import Container from "../../HOC/Container";
import HeaderTitle from "../../components/HeaderTitle";
import Rewards2 from "../../components/Rewards2";
import BottomNavigation from "../../components/BottomNavigation";
import { useIsFocused } from "@react-navigation/native";
import useDispatchAction from "../../hooks/useDispatchAction";
import { setActiveTab } from "../../redux/slices/authenticationSlice";
import Fonts from "../../constants/Fonts";
import { ScreenContainer } from "HOC";
import { REWARDS } from "constants/constant";
import ReferralCard from "tsx-components/ReferralCard";

export default function Rewards() {
  const isFoucused = useIsFocused();
  const [activeTab, setactiveTab] = useState("1");

  useEffect(() => {
    if (isFoucused) {
      useDispatchAction(setActiveTab("4"));
    }
  }, [isFoucused]);
  return (
    <ScreenContainer padding={0}>
      <BottomNavigation />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <HeaderTitle title={"Offer & Rewards"} leftIcon={"true"} />
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
              paddingBottom: 100,
            }}
          >
              <>
                {REWARDS.map((item, index) => (
                  <Rewards2 key={index} item={item} />
                ))}
              </>

          <ReferralCard />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
