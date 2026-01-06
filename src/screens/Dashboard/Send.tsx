import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useVerifyUserByIdentifier } from "query/hooks/useUser";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch } from "react-redux";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import GenericButton from "../../components/GenericButton";
import TextInputField from "../../components/TextInputField";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import useSelectorAction from "../../hooks/useSelectorAction";
import { setActiveTab } from "../../redux/slices/authenticationSlice";
import { detectBlockchainNameService } from "../../utils/blockchainNameService";
import { showError } from "../../utils/toast";
import {
  IBankBalance,
  IBankItem,
  ISendScreenRouteParams
} from "./types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SVGLeftArrow, SVGUSD, SVGScan } = require("../../constants/images");

interface ISendProps {
  route: RouteProp<{ Send: ISendScreenRouteParams }, "Send">;
}

const Send: React.FC<ISendProps> = ({ route }) => {
  const params = route?.params ?? {};
  const { requested, type, sender: senderFromParams } = params;
  const { theme } = useTheme();
  const styles = customStyles(theme);

  // console.log("params =>", JSON.stringify(params, null, 2));
  

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();
  const [sender, setSender] = useState<string>(senderFromParams ?? "");

  const selectorData = useSelectorAction() as unknown as {
    bankLists: IBankItem[];
    bankBalance: IBankBalance | null;
  };
  const { bankLists, bankBalance } = selectorData;
  
  // Filter to only show banks with account_type === "main"
  const mainBanks = bankLists?.filter(
    (bank) => bank.account_type === "main"
  ) ?? [];
  const selectedBank = mainBanks?.[0] ?? null;
  const {
    mutateAsync: verifyUserByIdentifier,
    isPending: userLoading,
  } = useVerifyUserByIdentifier();

  const [pendingVerification, setPendingVerification] = useState<boolean>(false);

  // Show validation error using toast
  const showValidationError = (message: string): void => {
    showError(message);
  };

  // Handle user verification (used for both normal and blockchain name service addresses)
  const handleUserVerification = async (): Promise<void> => {
    const trimmedSender = sender.trim();

    if (!trimmedSender) {
      showValidationError("Please enter a PayAiroTag, Phone, or Email");
      return;
    }

    console.log("trimmedSender =>", trimmedSender);
    setPendingVerification(true);
    try {
      const data = await verifyUserByIdentifier({ identifier: trimmedSender });
      // console.log(data, "verified user data");

      if (data && data.status) {
        navigation.navigate(SCREENS.ScanPay, {
          type: requested || type === "requested" ? "requested" : "receive",
          sender: trimmedSender,
          bank: selectedBank,
        });
      } else {
        showValidationError(data?.message || "Recipient not found");
      }
    } catch (e: any) {
      console.log("User verification failed:", JSON.stringify(e.response, null, 2));
      showValidationError(e?.response?.data?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setPendingVerification(false);
    }
  };


  // Handle next button press with validation
  const handleNextPress = async (): Promise<void> => {
    const trimmedSender = sender.trim();

    // Validation check
    if (!trimmedSender) {
      showValidationError("Please enter a PayAiroTag, Phone, or Email");
      return;
    }

    // Check if the identifier is a blockchain name service address
    const { isBlockchainNameService, type: serviceType } =
      detectBlockchainNameService(trimmedSender);

    if (isBlockchainNameService && serviceType) {
      // Clear any previous agreement flag before navigating
      navigation.setParams({ blockchainTermsAgreed: undefined } as any);
      // Navigate to terms screen for blockchain name service addresses
      navigation.navigate(NAVIGATION_SCREENS.BLOCKCHAIN_NAME_SERVICE_TERMS, {
        serviceType: serviceType,
        onAgreeCallback:  () => {
          console.log("onAgreeCallback =>", trimmedSender);
          setTimeout(() => {
          navigation.navigate(SCREENS.ScanPay, {
              type: requested || type === "requested" ? "requested" : "receive",
              sender: trimmedSender,
              bank: selectedBank,
            });
          }, 1000);
        },
      });
      return;
    }

    // Proceed with normal verification for PayAiroTag, Phone, Email
    await handleUserVerification();
  };

  // Get balance display value
  const getBalanceDisplay = (): string => {
    if (selectedBank?.balances?.available) {
      return String(selectedBank.balances.available);
    }

    if (selectedBank?.account_type === "rothIra") {
      return String(bankBalance?.roth_ira_account?.usd ?? "0.00");
    }

    if (selectedBank?.account_type === "traditionalIra") {
      return String(bankBalance?.traditional_ira_account?.usd ?? "0.00");
    }

    return String(bankBalance?.bank_account?.usd ?? "0.00");
  };

  const isEditable = senderFromParams === "" || senderFromParams === undefined;
  const isLoading = userLoading || pendingVerification;

  return (
    <ScreenContainer padding={0}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <HeaderTitle
          title={
            type === "requested"
              ? "Money Request"
              : "PayAiro to PayAiro Transfer"
          }
          titleStyle={styles.headerTitle}
          leftIcon={SVGLeftArrow}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentContainer}>
            <View>
              <TextInputField
                editable={isEditable}
                label={type === "requested" ? "From" : "To"}
                placeholder="PayAiroTag, Phone, Email"
                rightIcon={ type === "requested" ? '' : SVGScan}
                onRightIconClick={() => {
                  navigation.navigate(NAVIGATION_SCREENS.SCANS);
                  dispatch(setActiveTab("3"));
                }}
                value={sender}
                onChange={setSender}
              />
            </View>
            <View style={styles.mainContentContainer}>
              <View style={styles.flex1}>
                <Text style={styles.sendFromLabel}>
                  {type === "requested" ? "" : "Send From"}
                </Text>
                {type !== "requested" && selectedBank && (
                  <View>
                    <View style={styles.bankCard}>
                      <View style={styles.bankCardTouchable}>
                        <View style={styles.bankInfoRow}>
                          <SvgXml xml={SVGUSD} width={40} height={40} />
                          <View style={styles.bankDetailsContainer}>
                            <View style={styles.bankNameRow}>
                              <Text style={styles.bankNameText}>
                                {selectedBank?.bank_name ??
                                  selectedBank?.name ??
                                  "No Bank Selected"}{" "}
                              </Text>
                              <CustomText
                                variant="body2"
                                color={theme?.colors?.palette?.green700}
                                style={styles.accountTypeText}
                              >
                                {`(${selectedBank?.account_type ?? "N/A"})`}
                              </CustomText>
                            </View>
                            <Text style={styles.balanceText}>
                              ${getBalanceDisplay()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
              <GenericButton
                title="Next"
                cStyle={styles.nextButton}
                onPress={handleNextPress}
                disabled={isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </ScreenContainer>
  );
};

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    flex1: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 16,
    },
    scrollContent: {
      flexGrow: 1,
    },
    contentContainer: {
      flex: 1,
      backgroundColor: "#fff",
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: 20,
      marginTop: 20,
    },
    mainContentContainer: {
      flex: 1,
      justifyContent: "space-between",
    },
    sendFromLabel: {
      fontFamily: Fonts.semibold,
      color: "#000",
      fontSize: 14,
      textAlign: "left",
      padding: 15,
      marginTop: 30,
    },
    bankCard: {
      backgroundColor: "rgba(226, 241, 227, 0.8)",
      padding: 20,
      borderWidth: 1,
      borderColor: "rgba(44, 106, 63, 0.1)",
      borderRadius: 15,
    },
    bankCardTouchable: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flex: 1,
    },
    bankInfoRow: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    bankDetailsContainer: {
      marginHorizontal: 10,
      flex: 1,
    },
    bankNameRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    },
    bankNameText: {
      color: "black",
      fontSize: 16,
      fontFamily: Fonts.bold,
    },
    accountTypeText: {
      textTransform: "capitalize",
    },
    balanceText: {
      color: "rgba(106, 106, 106, 0.7)",
      fontFamily: Fonts.semibold,
      fontSize: 16,
    },
    nextButton: {
      marginTop: 10,
    },
  });

export default Send;

