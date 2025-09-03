import { useNavigation, useRoute } from "@react-navigation/native";
import GenericButton from "components/GenericButton";
import HeaderTitle from "components/HeaderTitle";
import ScreenContainer from "HOC/ScreenContainer";
import LottieView from "lottie-react-native";
import { LOTTIE_APP_LOADER, TRANSACTION_SUCCESS } from "lottie/lottie";
import moment from "moment";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React, { FC } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";

interface ResultProps {
  isPending?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  data: any;
}

const keyLabels = {
  uuid: "Transaction Id",
  created_at: "Transfer Date",
  sender_wallet: "Sender",
  recipient_wallet: "Receiver ID",
  amount: "Requested Amount",
  status: "Status",
  project_name: "Project Name",
  payment_method: "Transaction Type",
} as any;

const Result: FC<ResultProps> = ({ isPending, isError, isSuccess }) => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { data } = (route as any).params || {};

  //   console.log("Result data =>", JSON.stringify(data, null, 2));
  const displayArray = Object.entries(keyLabels).map(([key, label]) => {
    let value = data[key];
    if (key === "created_at" && value) {
      value = moment(value).format("DD MMM YYYY  h:mm a");
    }
    return { label, value };
  });

  const { theme } = useTheme();
  const styles = { ...useGlobalStyles(), ...customStyles(theme) };

  const onDone = async () => {
    navigation.navigate(NAVIGATION_SCREENS.NEW_DASHBOARD);
  };

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle leftIcon="sd" />
      <View
        style={{
          width: "100%",
          //   backgroundColor: "red",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isPending ? (
          <LottieView
            style={{ width: 250, height: 200 }}
            source={TRANSACTION_SUCCESS}
            autoPlay
            loop
          />
        ) : (
          <LottieView
            style={{ width: 250, height: 200 }}
            source={LOTTIE_APP_LOADER}
            autoPlay
            loop
          />
        )}
      </View>
      <View style={[styles.whiteSheetContainer, styles.container]}>
        <CustomText variant="h3">Transaction Successful</CustomText>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginVertical: 20 }}
        >
          {displayArray.map((item: any, index) => (
            <View
              key={index}
              style={{
                marginVertical: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <CustomText size={14} variant="caption">
                {item.label}
              </CustomText>
              <CustomText
                ellipsizeMode="tail"
                style={{ maxWidth: "50%" }}
                numberOfLines={1}
                size={14}
                variant="subtitle2"
              >
                {item.value}
              </CustomText>
            </View>
          ))}
        </ScrollView>
        <GenericButton
          title={"Done"}
          cStyle={{ marginVertical: 10 }}
          onPress={onDone}
          showLoader={true}
          //   isLoading={isLoading}
        />
      </View>
    </ScreenContainer>
  );
};

export default Result;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.spacing[5],
      alignItems: "center",
      backgroundColor: theme.colors.palette.white,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
    },
    description: {
      fontSize: 16,
    },
  });
