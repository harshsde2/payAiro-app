import { View, Text } from "react-native";
import React from "react";
import { ScreenContainer } from "HOC";
import { SvgXml } from "react-native-svg";
import { SVGSucc } from "constants/images";
import { useNavigation, useRoute } from "@react-navigation/native";
import GenericButton from "components/GenericButton";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import Fonts from "constants/Fonts";
import { useTheme } from "styles";
import { customStyles } from "./MyRWAAssets";
import { CustomText } from "tsx-components";

const TransactionSuccessScreen = () => {
  const route = useRoute();

  const { theme } = useTheme();
  const styles = customStyles(theme);
  const { transactionDetails } = route?.params as any;

  const navigation = useNavigation<any>();

  const formattedTransactionHistory =
    transactionDetails && typeof transactionDetails === "object"
      ? Object.entries(transactionDetails).map(([key, value]) => ({
          label: key,
          value: value !== null && value !== undefined ? String(value) : "--",
        }))
      : [];

  const showAmountsWithDollar = ["amount", "payable_amount", "token_price"];

  return (
    <ScreenContainer scrollable padding={0}>
      <SvgXml
        xml={SVGSucc}
        style={{ alignSelf: "center", marginVertical: 20 }}
      />
      <View style={[styles.container]}>
        <View style={[styles.headerContainer, { marginVertical: 10 }]}>
          <CustomText
            variant={"h3"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Transacion Successfull
          </CustomText>
        </View>
        <View>
          {formattedTransactionHistory.length > 0 ? (
            formattedTransactionHistory.map(({ label, value }, index) => (
              <View key={index} style={[styles.rowWithSpaceBetween]}>
                <CustomText
                  variant={"caption"}
                  size={14}
                  color={theme.colors.palette.black}
                  fontWeight={"semiBold"}
                >
                  {label.replace(/_/g, " ")}
                </CustomText>
                <CustomText
                  variant={"caption"}
                  size={14}
                  color={theme.colors.palette.black}
                  // fontWeight={"semiBold"}
                  style={{
                    marginVertical: 15,
                    width: "60%",
                    textAlign: "right",
                  }}
                  numberOfLines={1}
                >
                  {value}
                  {showAmountsWithDollar.includes(label) ? " $" : ""}
                </CustomText>
              </View>
            ))
          ) : (
            <CustomText
              variant={"caption"}
              size={16}
              color={theme.colors.palette.black}
              fontWeight={"semiBold"}
            >
              No transaction details available.
            </CustomText>
          )}

          <GenericButton
            title={"Done"}
            cStyle={{ marginTop: 40 }}
            onPress={() => navigation.pop(2)}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default TransactionSuccessScreen;
