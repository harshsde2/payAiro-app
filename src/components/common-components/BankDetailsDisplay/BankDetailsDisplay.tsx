import React, { useState, useContext, createContext, useMemo } from "react";
import { View, TouchableOpacity, Clipboard, Platform, ToastAndroid, Alert, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "styles/ThemeContext";
import { Theme } from "styles";
import { SvgIcons } from "constants/svgs";
import useSelectorAction from "hooks/useSelectorAction";
import { getPayAiroBankDetails } from "utils/helper";
import CustomText from "new-ui/components/common-components/CustomText";
import { useTheme as useNewTheme } from "new-ui/styles/ThemeContext";
import { ITheme } from "new-ui/styles";

// Context for capturing state
const CapturingContext = createContext<{ isCapturing: boolean; setIsCapturing: (value: boolean) => void } | null>(null);

export const CapturingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  return (
    <CapturingContext.Provider value={{ isCapturing, setIsCapturing }}>
      {children}
    </CapturingContext.Provider>
  );
};

export const useCapturing = () => {
  const context = useContext(CapturingContext);
  if (!context) {
    return { isCapturing: false, setIsCapturing: () => { } };
  }
  return context;
};

const BankDetailsDisplay: React.FC = () => {
  const { theme } = useTheme();
  const { theme: newTheme } = useNewTheme();
  /**
   * ReceiveQRCard renders this inside its fixed-white capture card on iOS, but outside it
   * on Android — where it sits on the themed page. So the ink has to follow the surface it
   * actually lands on. See ReceiveQRCard's iOS/Android bankDetails branches.
   */
  // Fixed, not themed on iOS: that branch renders on a hard-coded white card.
  const inkColor =
    Platform.OS === 'ios' ? newTheme.colors.black : newTheme.colors.text;
  const { walletData, bankLists } = useSelectorAction() as any;
  const route = useRoute<any>();
  const { isCapturing } = useCapturing();

  // const { bankList } = route?.params as any;

  const bankList = useMemo(() => {
    if (!bankLists || !Array.isArray(bankLists)) {
      return [];
    }
    return bankLists.map((item: any) => {
      const last4 = item.account_number;
      const maskedAccount = `${last4}`;
      const isExternalAccount =
        item?.account_type === "checking" || item?.account_type === "savings";
      const accountType = !isExternalAccount
        ? item?.account_type?.toUpperCase()
        : "external";

      return {
        label: `${item?.bank_name || ""} (${maskedAccount || ""}) ${accountType || ""
          }`,
        value: accountType?.toLowerCase() || "",
        bank_name: item?.bank_name || "",
        account_number: item?.account_number || "",
        account_type: accountType || "",
        guid: item?.guid || item?.account_guid || "",
      };
    });
  }, [bankLists]);

  // console.log("bankList ->", JSON.stringify(bankList, null, 2))
  const primaryBank = bankList && bankList.length > 0 ? bankList[0] : null;
  const rawBankData = bankLists && bankLists.length > 0 ? bankLists[bankLists.length - 1] : null;

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) {
      return;
    }
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else {
      Alert.alert(`${label} copied`);
    }
  };

  if (!primaryBank) {
    return null;
  }

  const styles = getStyles(newTheme);



  const payairoBank = getPayAiroBankDetails(bankLists) as any;


  // console.log("payairoBank ->", JSON.stringify(payairoBank, null, 2))
  return (
    <View style={styles.accountDetailsContainer}>
      <CustomText variant='h5' fontFamily='poppins' fontWeight='semiBold' >Bank Details</CustomText>

      <View style={styles.accountDetailsContent}>
        {/* Account Holder */}
        <View style={styles.accountDetailRow}>
          <CustomText variant="caption" style={styles.detailLabel}>
            A/C Holder
          </CustomText>
          <View style={styles.detailValueContainer}>
            <CustomText
              variant='caption'
              fontWeight="medium"
              style={[styles.detailValue, { color: inkColor }]}
            >
              {walletData?.name}
            </CustomText>
            {!isCapturing && (
              <TouchableOpacity
                onPress={() => copyToClipboard(walletData?.name, "Name")}
                style={styles.iconButton}
              >
                <SvgIcons.CopyOutlineBlack width={20} height={20} color={inkColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Number */}
        <View style={styles.accountDetailRow}>
          <CustomText variant="caption" style={styles.detailLabel}>
            A/C Number
          </CustomText>
          <View style={styles.detailValueContainer}>
            <CustomText
              variant='caption'
              fontWeight="medium"
              style={[styles.detailValue, { color: inkColor }]}
            >
              {payairoBank?.account_number || "N/A"}
            </CustomText>
            {!isCapturing && (
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(payairoBank?.account_number, "Account number")
                }
                style={styles.iconButton}
              >
                <SvgIcons.CopyOutlineBlack width={20} height={20} color={inkColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* IFSC Code / Routing Number */}
        <View style={styles.accountDetailRow}>
          <CustomText variant="caption" style={styles.detailLabel}>
            {payairoBank?.ref_code ? "R/C Number" : "IFSC Code"}
          </CustomText>
          <View style={styles.detailValueContainer}>
            <CustomText
              variant='caption'
              fontWeight="medium"
              style={[styles.detailValue, { color: inkColor }]}
            >
              {payairoBank?.ref_code || "N/A"}
            </CustomText>
            {!isCapturing && payairoBank?.ref_code && (
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(payairoBank?.ref_code, "Routing Number")
                }
                style={styles.iconButton}
              >
                <SvgIcons.CopyOutlineBlack width={20} height={20} color={inkColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

      </View>
    </View>
  );
};

const getStyles = (theme: ITheme) =>
  StyleSheet.create({
    accountDetailsContainer: {
      width: "100%",
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,

    },
    accountDetailsContent: {
      gap: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.greyLight2,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
    },
    accountDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 2,
    },
    detailLabel: {
      color: theme.colors.greyDark,
      flex: 1,
    },
    detailValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      flex: 2,
      justifyContent: "flex-end",
    },
    detailValue: {
      // Fixed, not themed: base value only — every call site overrides it with `inkColor`,
      // which picks the right ink for the surface this lands on. See the component body.
      color: theme.colors.black,
    },
    iconButton: {
      padding: theme.spacing.xs,
    },
  });

export default BankDetailsDisplay;
