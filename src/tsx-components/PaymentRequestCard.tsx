import React, { FC } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import moment from "moment";
import { Theme, useTheme } from "styles";
import CustomText from "./CustomText";
import { SvgIcons } from "constants/svgs";
import { IUserDetails, IRequestDetails } from "query/hooks/types";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useNavigation } from "@react-navigation/native";

interface IPaymentRequestCardProps {
  type: "received" | "sent";
  userDetails: IUserDetails;
  requestDetails: IRequestDetails;
  onPay?: () => void;
  onCancel?: () => void;
  isPayLoading?: boolean;
  isCancelLoading?: boolean;
}

const PaymentRequestCard: FC<IPaymentRequestCardProps> = ({
  type,
  userDetails,
  requestDetails,
  onPay,
  onCancel,
  isPayLoading = false,
  isCancelLoading = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const isReceived = type === "received";
  const formattedDate = moment(requestDetails.created_at).format("MMM DD, YYYY");
  const formattedTime = moment(requestDetails.created_at).format("hh:mm A");

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const profilePhoto = userDetails?.profile_photo ? `https://testingapp.payairo.com${userDetails?.profile_photo}` : null;
  
  console.log("userDetails profile_photo =>", JSON.stringify(profilePhoto, null, 2));
  return (
    <View style={styles.container}>
      {/* Header with type indicator */}
      <View style={[styles.typeIndicator, isReceived ? styles.receivedIndicator : styles.sentIndicator]}>
        <CustomText
          variant="caption"
          size={10}
          fontWeight="semiBold"
          color={isReceived ? theme.colors.palette.green700 : theme.colors.palette.orange500}
        >
          {isReceived ? "PAYMENT REQUEST" : "SENT REQUEST"}
        </CustomText>
      </View>

      {/* Main Content */}
      <View style={styles.contentRow}>
        {/* Avatar */}
        <TouchableOpacity onPress={() => navigation.navigate(NAVIGATION_SCREENS.USER_PROFILE, { userDetails })}      style={[styles.avatar, isReceived ? styles.receivedAvatar : styles.sentAvatar]}>
          {userDetails.profile_photo ? (
              <Image
                source={{ uri: `${userDetails.profile_photo}` }}
                style={styles.avatarImage}
              />
          ) : (

            <CustomText
              variant="subtitle1"
              fontWeight="bold"
              color={theme.colors.palette.white}
            >
              {getInitials(userDetails.name)}
            </CustomText>
          )}
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userInfo}>
          <CustomText
            variant="subtitle1"
            fontWeight="semiBold"
            numberOfLines={1}
            style={styles.userName}
          >
            {userDetails.name}
          </CustomText>
          <CustomText
            variant="caption"
            color={theme.colors.text.secondary}
            numberOfLines={1}
          >
            @{userDetails.username}
          </CustomText>
          <View style={styles.dateRow}>
            <SvgIcons.CalendarIcon width={12} height={12} />
            <CustomText
              variant="caption"
              size={11}
              color={theme.colors.text.tertiary}
              style={styles.dateText}
            >
              {formattedDate} • {formattedTime}
            </CustomText>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <CustomText
            variant="h4"
            fontWeight="bold"
            color={isReceived ? theme.colors.palette.green700 : theme.colors.palette.orange500}
          >
            ${requestDetails.amount.toLocaleString()}
          </CustomText>
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <CustomText
              variant="caption"
              size={9}
              fontWeight="semiBold"
              color={theme.colors.palette.warning}
            >
              PENDING
            </CustomText>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {isReceived ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isCancelLoading}
              activeOpacity={0.7}
            >
              <CustomText
                variant="caption"
                fontWeight="semiBold"
                color={theme.colors.palette.error}
                style={styles.buttonText}
              >
                {isCancelLoading ? "Canceling..." : "Decline"}
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
              onPress={onPay}
              disabled={isPayLoading}
              activeOpacity={0.7}
            >
              <SvgIcons.DoneIcon width={14} height={14} />
              <CustomText
                variant="caption"
                fontWeight="semiBold"
                color={theme.colors.palette.white}
                style={styles.buttonText}
              >
                {isPayLoading ? "Processing..." : "Pay Now"}
              </CustomText>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButtonFull]}
            onPress={onCancel}
            disabled={isCancelLoading}
            activeOpacity={0.7}
          >
            <SvgIcons.CrossIcon width={14} height={14} />
            <CustomText
              variant="caption"
              fontWeight="semiBold"
              color={theme.colors.palette.error}
              style={styles.buttonText}
            >
              {isCancelLoading ? "Canceling..." : "Cancel Request"}
            </CustomText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.colors.palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey100,
    },
    typeIndicator: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 12,
    },
    receivedIndicator: {
      backgroundColor: theme.colors.palette.green100,
    },
    sentIndicator: {
      backgroundColor: "#FFF3E0",
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    receivedAvatar: {
      backgroundColor: theme.colors.palette.green700,
    },
    sentAvatar: {
      backgroundColor: theme.colors.palette.orange500,
    },
    avatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      marginBottom: 2,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    dateText: {
      marginLeft: 4,
    },
    amountContainer: {
      alignItems: "flex-end",
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginTop: 4,
    },
    pendingBadge: {
      backgroundColor: "#FFF8E1",
    },
    actionRow: {
      flexDirection: "row",
      marginTop: 16,
      gap: 10,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 12,
      gap: 6,
    },
    cancelButton: {
      backgroundColor: theme.colors.palette.error + "15",
      borderWidth: 1,
      borderColor: theme.colors.palette.error + "30",
    },
    cancelButtonFull: {
      backgroundColor: theme.colors.palette.error + "15",
      borderWidth: 1,
      borderColor: theme.colors.palette.error + "30",
    },
    payButton: {
      backgroundColor: theme.colors.palette.green700,
    },
    buttonText: {
      marginLeft: 4,
    },
  });

export default PaymentRequestCard;

