import React, { FC } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Linking, Alert, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import moment from "moment";
import { useTheme, Theme } from "styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import CustomText from "tsx-components/CustomText";
import { SvgIcons } from "constants/svgs";
import { useGlobalStyles } from "styles/GlobalStyles";
import { INewTransactionDetailsProps, ISentTransaction } from "./types";
import GenericButton from "components/GenericButton";

const NewTransactionDetails: FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();
  
  const { transactionData } = route.params as INewTransactionDetailsProps["route"]["params"];

  // Status logic
  const status = transactionData.status?.toLowerCase();
  const isSuccess = status === "success" || status === "complete";
  const isPending = status === "pending" || status === "new";
  const isFailed = status === "failed";

  let statusText = "Completed";
  let statusBg = theme.colors.palette.green700;

  if (isPending) {
    statusText = "Pending";
    statusBg = theme.colors.palette.orange500;
  } else if (isFailed) {
    statusText = "Failed";
    statusBg = theme.colors.palette.red500;
  }

  // Amount logic
  const amount = parseFloat(transactionData.amount.toString());
  // Format with commas and 2 decimal places
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const handleDownload = () => {
    Alert.alert("Download", "Download receipt feature coming soon.");
  };

  const handleShare = () => {
      // Logic for sharing
      const shareText = `Transaction Details\nID: ${transactionData.id}\nAmount: $${formattedAmount}`;
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
  }

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle 
        title="Transaction Details" 
        leftIcon="back"
        rightIcon={<CustomText variant="body1" fontWeight="semiBold">Share</CustomText>}
        onPressRight={handleShare}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header / Summary Block - Centered on Green Background */}
        <View style={styles(theme).headerSection}>
            <View style={styles(theme).avatarContainerBig}>
               {transactionData.recipient_profile_photo && transactionData.recipient_profile_photo !== "null" ? (
                <Image 
                  source={{ uri: transactionData.recipient_profile_photo }} 
                  style={styles(theme).avatarBig} 
                />
              ) : (
                <View style={styles(theme).avatarPlaceholderBig}>
                  <CustomText variant="h2" color={theme.colors.palette.white}>
                    {transactionData.recipient_username?.charAt(0).toUpperCase() || "?"}
                  </CustomText>
                </View>
              )}
            </View>

            <CustomText variant="body1" color={theme.colors.text.primary} style={{marginBottom: 4, fontSize: 16}}>
                To {transactionData.recipient_username || transactionData.recipient}
            </CustomText>

            <CustomText variant="h1" style={styles(theme).amountText}>
                ${formattedAmount}
            </CustomText>

            <View style={[styles(theme).statusBadge, { backgroundColor: statusBg }]}>
                <CustomText 
                variant="caption" 
                fontWeight="semiBold" 
                style={{ color: theme.colors.palette.white }}
                >
                {statusText}
                </CustomText>
            </View>
        </View>

        {/* White Card Section */}
        <View style={styles(theme).whiteCard}>
            
            <View style={styles(theme).detailRow}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Transfer Date</CustomText>
                <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                    {moment(transactionData.timestamp).format("DD MMM YYYY")}
                </CustomText>
            </View>

            <View style={styles(theme).detailRow}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Transfer Time</CustomText>
                <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                    {moment(transactionData.timestamp).format("h:mm a")}
                </CustomText>
            </View>

             <View style={styles(theme).detailRow}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Transaction ID</CustomText>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                        {transactionData.id}
                    </CustomText>
                    <SvgIcons.Copy width={16} height={16} color={theme.colors.text.primary} />
                </View>
            </View>

             <View style={styles(theme).detailRow}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Sender</CustomText>
                <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                    {transactionData.sender_username || "Dennis"}
                </CustomText>
            </View>

             <View style={styles(theme).detailRow}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Receiver</CustomText>
                <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                    {transactionData.recipient_username || transactionData.recipient}
                </CustomText>
            </View>

            <View style={styles(theme).detailRow}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Receiver ID</CustomText>
                <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                    {transactionData.recipient_username?.toLowerCase() || "frances_swann"}
                </CustomText>
            </View>

             <View style={styles(theme).detailRow}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Bank</CustomText>
                <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                    Chase Bank
                </CustomText>
            </View>

             <View style={[styles(theme).detailRow, {borderBottomWidth: 0}]}>
                <CustomText variant="body1" color={theme.colors.text.secondary}>Account Number</CustomText>
                <CustomText variant="body1" fontWeight="semiBold" color={theme.colors.text.primary}>
                    *****2231
                </CustomText>
            </View>

        </View>
        
        <View style={{paddingHorizontal: 20, marginBottom: 40}}>
            <GenericButton
              title="Download"
              onPress={handleDownload}
            />
        </View>
       
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = (theme: Theme) => StyleSheet.create({
  headerSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: theme.colors.palette.green50,
  },
  avatarContainerBig: {
    marginBottom: 12,
    // Removed shadow as it wasn't prominent in screenshot
    // shadowColor: theme.colors.palette.black,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5,
  },
  avatarBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholderBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.palette.grey400,
    justifyContent: "center",
    alignItems: "center",
  },
  amountText: {
    fontSize: 40,
    fontWeight: "800",
    color: theme.colors.palette.black, // Dark/Black text
    marginBottom: 8,
    marginTop: 4,
    fontFamily: 'System', // Ensure boldest weight
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  whiteCard: {
    backgroundColor: theme.colors.palette.white,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10, // Reduced padding inside card
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  downloadButton: {
      backgroundColor: theme.colors.palette.green800, // Darker green
      borderRadius: 30,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
  }
});

export default NewTransactionDetails;
