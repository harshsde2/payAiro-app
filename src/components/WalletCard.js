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

  const styles = customStyles(theme);
  
  // Function to mask numbers - show only last 4 digits
  const maskNumber = (number) => {
    if (!number) return "";
    const numStr = String(number);
    if (numStr.length <= 4) return numStr;
    const lastFour = numStr.slice(-4);
    const masked = "*".repeat(Math.max(0, numStr.length - 4));
    return masked + lastFour;
  };
  
  // Toggle visibility handler
  const toggleNumbersVisibility = () => {
    setIsNumbersVisible(!isNumbersVisible);
  };
  
  // Format balance for display
  const formatBalance = (balance) => {
    if (!balance) return "0.00";
    const num = parseFloat(balance);
    return num.toFixed(1);
  };
  
  const displayBalance = data?.account_type === 'external' 
    ? '' 
    : isNumbersVisible 
      ? `$${formatBalance(bankbalance)}` 
      : '$****';
  
  return (
    <View style={styles.card}>
      {/* Top Section: Bank Name, MAIN button, and Open status */}
      <View style={styles.headerSection}>
        <View style={styles.bankNameContainer}>
          <SvgIcons.BankIcon2 width={20} height={20} />
          <CustomText
            variant={"h4"}
            color={theme.colors.palette.white}
            fontWeight={"bold"}
            style={styles.bankName}
          >
            {data?.bank_name || "PayAiro Bank"}
          </CustomText>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.mainButton}>
            <CustomText
              variant={"caption"}
              color={theme.colors.palette.white}
              fontWeight={"bold"}
              style={styles.mainButtonText}
            >
              MAIN
            </CustomText>
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <CustomText
              variant={"caption"}
              color={theme.colors.palette.white}
              style={styles.statusText}
            >
              Open
            </CustomText>
          </View>
        </View>
      </View>

      {/* Middle Section: Balance with Eye Icon */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceContainer}>
          <CustomText variant={"h2"} color={theme.colors.palette.white} fontWeight={"bold"}>
            {displayBalance}
          </CustomText>
          <TouchableOpacity
            onPress={toggleNumbersVisibility}
            style={styles.eyeButton}
          >
            {isNumbersVisible ? (
              <SvgIcons.EyeOnOutlineWhite width={20} height={20} />
            ) : (
              <SvgIcons.EyeOffOutlineWhite width={20} height={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Details Section */}
      <View style={styles.accountDetailsSection}>
        <View style={styles.accountInfoRow}>
          <View style={styles.accountInfoItem}>
            <CustomText
              variant={"caption"}
              color={theme.colors.palette.white}
              style={styles.accountLabel}
            >
              Account No:
            </CustomText>
            <CustomText
              variant={"body1"}
              color={theme.colors.palette.white}
              fontWeight={"medium"}
            >
              {isNumbersVisible
                ? `${data?.accountNumber || ""}`
                : maskNumber(data?.accountNumber || "")}
            </CustomText>
          </View>
          <View style={styles.separator} />
          <View style={styles.accountInfoItem}>
            <CustomText
              variant={"caption"}
              color={theme.colors.palette.white}
              style={styles.accountLabel}
            >
              Routing No
            </CustomText>
            <CustomText
              variant={"body1"}
              color={theme.colors.palette.white}
              fontWeight={"medium"}
            >
              {isNumbersVisible
                ? `${data?.ref_code ?? ""}`
                : maskNumber(data?.ref_code || "")}
            </CustomText>
          </View>
        </View>
      </View>

      {/* Bottom Section: Statement */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.STATEMENT)}
          style={styles.statementButton}
        >
          <View style={styles.statementLeft}>
            <SvgIcons.WithdrawlIcon width={20} height={20} />
            <CustomText variant={"body1"} color={theme.colors.palette.green700} fontWeight={"medium"}>
              Statement
            </CustomText>
          </View>
          <SvgIcons.RightArrow width={20} height={20} />
        </TouchableOpacity>
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
      overflow: "hidden",
    },
    headerSection: {
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    bankNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    bankName: {
      marginLeft: 10,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    mainButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.palette.green800, // Slightly darker green
    },
    mainButtonText: {
      textTransform: "uppercase",
      fontSize: 10,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.palette.black,
    },
    statusText: {
      fontSize: 12,
    },
    balanceSection: {
      marginBottom: 20,
    },
    balanceContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    eyeButton: {
      padding: 4,
    },
    accountDetailsSection: {
      marginBottom: 16,
    },
    accountInfoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    accountInfoItem: {
      flex: 1,
    },
    accountLabel: {
      marginBottom: 4,
      opacity: 0.9,
    },
    separator: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.palette.white,
      marginHorizontal: 12,
      opacity: 0.3,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    bottomSection: {
      backgroundColor: theme.colors.palette.green200, // Lighter green
      marginHorizontal: -20,
      marginBottom: -20,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    statementButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statementLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    statementIcon: {
      marginRight: 10,
    },
  });

export default WalletCard;
