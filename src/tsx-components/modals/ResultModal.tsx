import { useNavigation, useRoute } from "@react-navigation/native";
import GenericButton from "components/GenericButton";
import HeaderTitle from "components/HeaderTitle";
import ScreenContainer from "HOC/ScreenContainer";
import LottieView from "lottie-react-native";
import { LOTTIE_APP_LOADER, TRANSACTION_SUCCESS } from "lottie/lottie";
import moment from "moment";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React, { FC } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";

interface ResultModalProps {
  isPending?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  data: any;
  onClose?: () => void;
}

const keyLabels = {
  transaction_id: "Transaction Id",
  timestamp: "Transfer Date",
  sender_username: "Sender",
  recipient_username: "Receiver ID",
  amount: "Amount",
  status: "Status",
  final_amount: "Final Amount",
  Transaction_fee_persentage: "Transaction Fee",

  //   project_name: "Project Name",
  //   payment_method: "Transaction Type",
} as any;

const ResultModal: FC<ResultModalProps> = ({
  isPending,
  isError,
  isSuccess,
  data = {},
  onClose = () => {},
}) => {
  const route = useRoute();
  const navigation = useNavigation<any>();

  //   console.log("Result data =>", JSON.stringify(data, null, 2));
  const displayArray = Object.entries(keyLabels).map(([key, label]) => {
    let value = data[key];
    if (key === "timestamp" && value) {
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
    <SafeAreaView style={[{ flex: 1, backgroundColor: "white" }]}>
      <HeaderTitle leftIcon="sd" onPressLeft={onClose} />
      <View
        style={{
          width: "100%",
          //   backgroundColor: "red",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!isPending ? (
          <LottieView
            style={{ width: 250, height: 200 }}
            source={TRANSACTION_SUCCESS}
            autoPlay
            loop={false}
            // loop
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
        {isPending ? (
          <CustomText variant="h3">Transaction Pending</CustomText>
        ) : isError ? (
          <CustomText variant="h3">Transaction Failed</CustomText>
        ) : isSuccess ? (
          <CustomText variant="h3">Transaction Successful</CustomText>
        ) : (
          <CustomText variant="h3">Transaction Result</CustomText>
        )}
        <View style={{ width: "100%", marginVertical: 20 }}>
          <CustomText
            variant="subtitle2"
            style={{ textAlign: "center", marginBottom: 10 }}
          >
            {isPending
              ? "Your transaction is being processed. Please wait for confirmation."
              : isError
              ? "There was an error processing your transaction. Please try again."
              : "Thank you for using our service!"}
          </CustomText>
        </View>
        {isSuccess && (
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
        )}
        {isPending ||
          isError ||
          (isSuccess && (
            <View style={{ width: "100%" }}>
              <GenericButton
                title={"Done"}
                cStyle={{
                  marginVertical: 10,
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={onClose}
                showLoader={true}
                //   isLoading={isLoading}
              />
            </View>
          ))}
      </View>
    </SafeAreaView>
  );
};

export default ResultModal;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      //   paddingHorizontal: theme.spacing.spacing[5],

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
