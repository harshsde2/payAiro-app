import {
  View,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import HeaderTitle from "../../components/HeaderTitle";
import { SvgXml } from "react-native-svg";
import moment from "moment";
import ViewShot from "react-native-view-shot";
// @ts-ignore - Missing type definitions
import RNHTMLtoPDF from "react-native-html-to-pdf";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import { ScreenContainer } from "HOC";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import { useGlobalStyles } from "styles/GlobalStyles";
import { useRoute, useNavigation } from "@react-navigation/native";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import { IStatementDetailsRouteParams, ITransactionItem } from "./types";
import { showSuccess, showError } from "utils/toast";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { SvgIcons } from "constants/svgs";

export default function StatementDetails() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = customStyles(theme);
  const viewShotRef = useRef<ViewShot>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const { data } = (route.params as IStatementDetailsRouteParams) || {
    data: [],
  };

  const filteredData = data.filter((item) => {
    if (!searchText.trim()) return true;
    const searchLower = searchText.toLowerCase();
    return (
      item.sender?.toLowerCase().includes(searchLower) ||
      item.amount?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower) ||
      item.transaction_id?.toLowerCase().includes(searchLower)
    );
  });

  const generatePDF = async (isShare: boolean) => {
    try {
      if (isShare) {
        setIsSharing(true);
      } else {
        setIsDownloading(true);
      }
      setIsGeneratingPDF(true);

      // Create HTML table
      const htmlContent = `
        <html>
          <head>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                text-align: left;
                padding: 8px;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h2>Transaction Report</h2>
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th>Sender</th>
                  <th>Transaction Type</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData
                  .map(
                    (item) => `
                      <tr>
                        <td>${item.amount}</td>
                        <td>${item.datetime}</td>
                        <td>${item.sender}</td>
                        <td>${item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "N/A"}</td>
                        <td>${item.status}</td>
                        <td>${item.transaction_id || item.option || ""}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Generate PDF
      const pdfOptions = {
        html: htmlContent,
        fileName: "Transaction_Report",
        directory: "Documents",
      };
      const pdf = await RNHTMLtoPDF.convert(pdfOptions);

      if (!isShare) {
        // Move PDF to Download Directory for Access
        const downloadDir =
          Platform.OS === "android"
            ? `${RNFS.DownloadDirectoryPath}/Transaction_Report.pdf`
            : `${RNFS.DocumentDirectoryPath}/Transaction_Report.pdf`;

        await RNFS.moveFile(pdf.filePath, downloadDir);
        showSuccess(
          "PDF Downloaded Successfully",
          `Your PDF has been saved to: ${downloadDir}`
        );
      } else {
        // Share PDF
        const shareOptions = {
          url: `file://${pdf.filePath}`,
          type: "application/pdf",
        };
        await Share.open(shareOptions);
        showSuccess(
          "PDF Ready to Share",
          "The PDF has been prepared for sharing"
        );
      }
    } catch (error: any) {
      console.log("PDF Generation Error:", error);
      const errorMessage =
        error?.message || "Failed to generate PDF. Please try again.";
      showError("PDF Generation Failed", errorMessage);
    } finally {
      setIsGeneratingPDF(false);
      setIsDownloading(false);
      setIsSharing(false);
    }
  };

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title={"Statement"} leftIcon={"true"} />
      <ScrollView>
        <View style={[globalStyles.whiteSheetContainer]}>
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
            <View style={styles.searchContainer}>
              <CustomSearchTextInput
                placeholder="Search Transaction..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={theme.colors.text.tertiary}
              />
            </View>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item, key) => (
                <View key={key} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <CustomText
                      variant="body1"
                      fontWeight="bold"
                      color={theme.colors.text.primary}
                      style={styles.senderName}
                    >
                      {item?.sender}
                    </CustomText>
                    <CustomText
                      variant="caption"
                      color={theme.colors.text.tertiary}
                      style={styles.transactionDate}
                    >
                      {moment(item?.datetime).format("YYYY-MMM-DD , LT")}
                    </CustomText>
                  </View>
                  <View style={styles.transactionRight}>
                    <CustomText
                      variant="caption"
                      color={
                        item?.status === "cancelled"
                          ? theme.colors.palette.red500
                          : theme.colors.palette.green700
                      }
                      style={styles.statusText}
                    >
                      {item?.status.toUpperCase()}
                    </CustomText>
                    <View style={styles.amountContainer}>
                      {item.type === "credit" ? (
                        <SvgIcons.TransactionSentIcon width={16} height={16} />
                      ) : (
                        <SvgIcons.TransactionReciveIcon width={16} height={16} />
                      )}
                      <CustomText
                        variant="body1"
                        fontWeight="semiBold"
                        color={theme.colors.text.primary}
                        style={styles.amountText}
                      >
                        ${item?.amount}
                      </CustomText>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <CustomText
                  variant="body2"
                  color={theme.colors.text.tertiary}
                  style={styles.emptyText}
                >
                  {searchText.trim()
                    ? "No transactions found"
                    : "No transactions available"}
                </CustomText>
              </View>
            )}
          </ViewShot>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.SUPPORT_SCREEN)}
        >
          <View style={styles.actionButtonIcon}>
            <SvgIcons.ToastCircleAlert
              width={15}
              height={15}
              color={theme.colors.palette.green700}
            />
          </View>
          <CustomText variant="body2"  color={theme.colors.text.primary}>Support</CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => generatePDF(false)}
          disabled={isGeneratingPDF || filteredData.length === 0}
        >
          <View style={styles.actionButtonIcon}>
            <SvgIcons.DownloadIcon
              width={15}
              height={15}
              color={theme.colors.palette.green700}
            />
          </View>
          <CustomText variant="body2"  color={theme.colors.text.primary}>Download</CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => generatePDF(true)}
          disabled={isGeneratingPDF || filteredData.length === 0}
        >
          <View style={styles.actionButtonIcon}>
            <SvgIcons.ShareWhiteIcon
              width={15}
              height={15}
              stroke={theme.colors.palette.white}
              strokeWidth={1.5}
            />
          </View>
          <CustomText variant="body2"  color={theme.colors.text.primary}>Share</CustomText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    searchContainer: {
      marginBottom: theme.spacing.spacing[4],
    },
    transactionItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[2],
      marginTop: theme.spacing.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    transactionLeft: {
      flex: 1,
    },
    senderName: {
      fontSize: 16,
      marginBottom: theme.spacing.spacing[1],
    },
    transactionDate: {
      fontSize: 12,
      marginTop: theme.spacing.spacing[1],
    },
    transactionRight: {
      flexDirection: "column",
      alignItems: "flex-end",
    },
    statusText: {
      fontSize: 12,
      textAlign: "right",
      marginBottom: theme.spacing.spacing[1],
    },
    amountContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.spacing[1],
    },
    amountText: {
      fontSize: 16,
      textAlign: "right",
    },
    emptyContainer: {
      paddingVertical: theme.spacing.spacing[8],
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      textAlign: "center",
    },
    actionBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      margin: theme.spacing.spacing[2],
      padding: theme.spacing.spacing[1],
      paddingHorizontal: theme.spacing.spacing[5],
    //   backgroundColor: theme.colors.palette.white,
      borderRadius: 32,
    },
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: theme.spacing.spacing[2],
      opacity: 1,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: 32,
      padding: theme.spacing.spacing[2],
    },
    actionButtonIcon: {
      padding: theme.spacing.spacing[2],
      backgroundColor: theme.colors.palette.green700,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
    },
  });
