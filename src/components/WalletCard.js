import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Fonts from "../constants/Fonts";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styles";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  SVG_Bank_tab,
  SVG_credit_tab,
  SVGBankLogo,
  SVGCreditCard,
  SVGStatements,
} from "constants/images";
import { CustomText } from "tsx-components";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { SvgIcons } from "constants/svgs";

const WalletCard = ({ data, bankbalance, index }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [isNumbersVisible, setIsNumbersVisible] = useState(false);
  
  // Redux store
  const { walletData } = useSelector((state) => state.authenticationSlice);

  console.log("data =>", JSON.stringify(data, null, 2));
  const styles = customStyles(theme);
  theme.colors.palette.green700;
  
  // Function to mask numbers - show only last 4 digits
  const maskNumber = (number) => {
    if (!number) return "";
    const numStr = String(number);
    if (numStr.length <= 4) return numStr;
    const lastFour = numStr.slice(-4);
    const masked = "*".repeat(numStr.length - 4);
    return masked + lastFour;
  };
  
  // Toggle visibility handler
  const toggleNumbersVisibility = () => {
    setIsNumbersVisible(!isNumbersVisible);
  };
  
  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          flex: 1,
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <SvgXml
              style={{ marginRight: 10 }}
              color={theme.colors.palette.white}
              xml={SVGBankLogo}
              width={20}
              height={20}
            />
            <CustomText
              variant={"h4"}
              color={theme.colors.palette.white}
              fontWeight={"bold"}
              style={{ flex: 1 }}
            >
              {data?.bank_name}
            </CustomText>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View
            style={{
              width: 100,
              paddingVertical: 5,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <CustomText
              size={9}
              variant={"subtitle2"}
              color={theme.colors.palette.white}
              style={{ textTransform: "uppercase" }}
            >
              {data?.account_type}
            </CustomText>
          </View>
          <TouchableOpacity
            onPress={toggleNumbersVisibility}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 10,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            {isNumbersVisible ? (
              <SvgIcons.EyeOnOutlineWhite width={20} height={20} />
            ) : (
              <SvgIcons.EyeOffOutlineWhite width={20} height={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, marginVertical: 5 }}>
        <View style={{ flex: 1, paddingVertical: 5 }}>
          <CustomText variant={"h2"} color={theme.colors.palette.white}>
            {`$${bankbalance || "0.00"}`}
          </CustomText>
        </View>
        <View style={{ flex: 1, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", flex: 1, marginVertical: 5 }}>
            <View style={{ flex: 1 }}>
              <CustomText
                variant={"subtitle2"}
                color={theme.colors.palette.grey300}
              >
                {`Account No: `}
              </CustomText>
              <CustomText
                variant={"body1"}
                color={theme.colors.palette.grey300}
              >
                {isNumbersVisible
                  ? `${data?.accountNumber || ""}`
                  : maskNumber(data?.accountNumber)}
              </CustomText>
            </View>
            <View
              style={{
                marginHorizontal: 10,
                height: "100%",
                width: 1,
                backgroundColor: theme.colors.palette.grey300,
              }}
            />
            <View style={{ flex: 1 }}>
              <CustomText
                variant={"subtitle2"}
                color={theme.colors.palette.grey300}
              >
                {`Routing No `}
              </CustomText>
              <CustomText
                variant={"body1"}
                color={theme.colors.palette.grey300}
              >
                {isNumbersVisible
                  ? `${data?.ref_code ?? ""}`
                  : maskNumber(data?.ref_code)}
              </CustomText>
            </View>
          </View>
          <CustomText variant={"caption"} color={theme.colors.palette.grey300}>
            {`${data?.bank_address ?? ""}`}
          </CustomText>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.STATEMENT)}
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginRight: 5,
          }}
        >
          <SvgXml
            style={{ marginRight: 10 }}
            color={theme.colors.palette.white}
            xml={SVGStatements}
            width={20}
            height={20}
          />
          <CustomText variant={"body1"} color={theme.colors.palette.white}>
            {`Statement`}
          </CustomText>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginRight: 5,
          }}
        >
          <SvgXml
            style={{ marginRight: 10 }}
            color={theme.colors.palette.white}
            xml={SVGCreditCard}
            width={20}
            height={20}
          />
          <CustomText variant={"body1"} color={theme.colors.palette.white}>
            {`Card`}
          </CustomText>
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <SvgXml
            style={{ marginRight: 10 }}
            color={theme.colors.palette.white}
            xml={SVGCreditCard}
            width={20}
            height={20}
          />
          <CustomText variant={"body1"} color={theme.colors.palette.white}>
            {`Services`}
          </CustomText>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const customStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.palette.green700, // Dark green
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 20,
      width: "90%",
      alignSelf: "center",
    },
    walletText: {
      color: "white",
      fontSize: 12,
      marginBottom: 5,
      fontFamily: Fonts.regular,
    },
    bankOverview: {
      color: "white",
      fontSize: 16,
      fontFamily: Fonts.semibold,
      alignSelf: "center",
      textAlign: "center",
    },
    balance: {
      color: "white",
      fontSize: 36,
      fontFamily: Fonts.bold,
      marginVertical: 10,
      textAlign: "center",
    },
    decimal: {
      fontSize: 20,
      fontFamily: Fonts.regular,
    },
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.3)",
      marginVertical: 10,
    },
    options: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    optionText: {
      color: "white",
      fontSize: 12,
      fontFamily: Fonts.semibold,
    },
  });

export default WalletCard;
