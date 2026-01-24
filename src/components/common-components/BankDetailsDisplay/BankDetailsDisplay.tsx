import React, { useState, useContext, createContext, useMemo } from "react";
import { View, TouchableOpacity, Clipboard, Platform, ToastAndroid, Alert, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "styles/ThemeContext";
import { Theme } from "styles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";
import useSelectorAction from "hooks/useSelectorAction";

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
    return { isCapturing: false, setIsCapturing: () => {} };
  }
  return context;
};

const BankDetailsDisplay: React.FC = () => {
  const { theme } = useTheme();
  const { walletData, bankLists } = useSelectorAction() as any;
  const route = useRoute<any>();
  const { isCapturing } = useCapturing();
  
  // const { bankList } = route?.params as any;

  const bankList = useMemo(() => {
    return bankLists.map((item: any) => {
      const last4 = item.account_number?.slice(-4);
      const maskedAccount = `•••• ${last4}`;
      const isExternalAccount =
        item?.account_type === "checking" || item?.account_type === "savings";
      const accountType = !isExternalAccount
        ? item?.account_type?.toUpperCase()
        : "external";

      return {
        label: `${item?.bank_name || ""} (${maskedAccount || ""}) ${
          accountType || ""
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

  const copyToClipboard = (text: string, label: string) => {
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

  const styles = getStyles(theme);

  return (
    <View style={styles.accountDetailsContainer}>
      {/* Account Holder */}
      <View style={styles.accountDetailRow}>
        <CustomText variant="caption" style={styles.detailLabel}>
          Account Holder
        </CustomText>
        <View style={styles.detailValueContainer}>
          <CustomText
            variant="body2"
            fontWeight="medium"
            style={styles.detailValue}
          >
            {walletData?.name}
          </CustomText>
          {!isCapturing && (
            <TouchableOpacity
              onPress={() => copyToClipboard(primaryBank.guid, "CRN")}
              style={styles.iconButton}
            >
              <SvgIcons.CopyOutlineBlack width={20} height={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Account Number */}
      <View style={styles.accountDetailRow}>
        <CustomText variant="caption" style={styles.detailLabel}>
          Account number
        </CustomText>
        <View style={styles.detailValueContainer}>
          <CustomText
            variant="body2"
            fontWeight="medium"
            style={styles.detailValue}
          >
            {primaryBank.account_number || "N/A"}
          </CustomText>
          {!isCapturing && (
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(primaryBank.account_number, "Account number")
              }
              style={styles.iconButton}
            >
              <SvgIcons.CopyOutlineBlack width={20} height={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* IFSC Code / Routing Number */}
      <View style={styles.accountDetailRow}>
        <CustomText variant="caption" style={styles.detailLabel}>
          {rawBankData?.ref_code ? "Routing Number" : "IFSC Code"}
        </CustomText>
        <View style={styles.detailValueContainer}>
          <CustomText
            variant="body2"
            fontWeight="medium"
            style={styles.detailValue}
          >
            {rawBankData?.ref_code || "N/A"}
          </CustomText>
          {!isCapturing && rawBankData?.ref_code && (
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(rawBankData.ref_code, "Routing Number")
              }
              style={styles.iconButton}
            >
              <SvgIcons.CopyOutlineBlack width={20} height={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    accountDetailsContainer: {
      width: "100%",
      gap: theme.spacing.spacing[4] || 16,
    },
    accountDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 2,
    },
    detailLabel: {
      color: theme.colors.palette.grey600 || "#4B5563",
      flex: 1,
    },
    detailValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.spacing[2] || 8,
      flex: 2,
      justifyContent: "flex-end",
    },
    detailValue: {
      color: theme.colors.palette.grey900 || "#111827",
    },
    iconButton: {
      padding: theme.spacing.spacing[1] || 4,
    },
  });

export default BankDetailsDisplay;
