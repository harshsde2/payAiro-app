import React, { FC, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Theme, useTheme } from "styles";
import CustomText from "./CustomText";
import PaymentRequestCard from "./PaymentRequestCard";
import { SCREENS } from "constants/SCREENS";
import { useCancelPaymentRequest } from "query/hooks";
import { showSuccess, showError } from "utils/toast";
import {
  IReceivedPendingRequest,
  IPendingPaymentRequestsResponse,
} from "query/hooks/types";

interface IPaymentRequestsListProps {
  data: IPendingPaymentRequestsResponse | undefined;
  isLoading: boolean;
  onPayRequest?: (requestId: string, request: IReceivedPendingRequest) => void;
  onCancelRequest?: (requestId: string, type: "received" | "sent") => void;
}

type TabType = "received" | "sent";

const PaymentRequestsList: FC<IPaymentRequestsListProps> = ({
  data,
  isLoading,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<TabType>("received");
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);

  const { mutate: cancelPaymentRequest, isPending: isCancelling } = useCancelPaymentRequest();

  const receivedRequests = data?.received_pending_requests ?? [];
  const sentRequests = data?.sent_pending_requests ?? [];

  const receivedCount = receivedRequests.length;
  const sentCount = sentRequests.length;
  const totalCount = receivedCount + sentCount;

  const handlePayRequest = (request: IReceivedPendingRequest) => {
    // Navigate to ScanPay screen with request details
    navigation.navigate(SCREENS.ScanPay as never, {
      type: "request",
      sender: request,
    } as never);
  };

  const handleCancelRequest = (requestId: string, type: "received" | "sent") => {
    const actionText = type === "received" ? "decline" : "cancel";
    const titleText = type === "received" ? "Decline Request" : "Cancel Request";

    Alert.alert(
      titleText,
      `Are you sure you want to ${actionText} this payment request?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            setCancellingRequestId(requestId);
            cancelPaymentRequest(requestId, {
              onSuccess: (response) => {
                if (response?.status) {
                  showSuccess(`Payment request ${actionText}ed successfully`);
                } else {
                  showError(response?.message || `Failed to ${actionText} payment request`);
                }
                setCancellingRequestId(null);
              },
              onError: (error) => {
                console.log("Cancel request error:", error);
                showError(`Failed to ${actionText} payment request`);
                setCancellingRequestId(null);
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.palette.green700} />
        <CustomText
          variant="body2"
          color={theme.colors.text.secondary}
          style={styles.loadingText}
        >
          Loading payment requests...
        </CustomText>
      </View>
    );
  }

  if (totalCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <CustomText variant="h1" style={styles.emptyIcon}>
            📋
          </CustomText>
        </View>
        <CustomText
          variant="subtitle1"
          fontWeight="semiBold"
          color={theme.colors.text.secondary}
          style={styles.emptyTitle}
        >
          No Payment Requests
        </CustomText>
        <CustomText
          variant="body2"
          color={theme.colors.text.tertiary}
          style={styles.emptySubtitle}
        >
          You don&apos;t have any pending payment requests
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "received" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("received")}
          activeOpacity={0.7}
        >
          <CustomText
            variant="caption"
            fontWeight={activeTab === "received" ? "bold" : "medium"}
            color={
              activeTab === "received"
                ? theme.colors.palette.white
                : theme.colors.text.secondary
            }
          >
            Received
          </CustomText>
          {receivedCount > 0 && (
            <View
              style={[
                styles.badge,
                activeTab === "received"
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <CustomText
                variant="caption"
                size={10}
                fontWeight="bold"
                color={
                  activeTab === "received"
                    ? theme.colors.palette.green700
                    : theme.colors.palette.white
                }
              >
                {receivedCount}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "sent" && styles.activeTabSent,
          ]}
          onPress={() => setActiveTab("sent")}
          activeOpacity={0.7}
        >
          <CustomText
            variant="caption"
            fontWeight={activeTab === "sent" ? "bold" : "medium"}
            color={
              activeTab === "sent"
                ? theme.colors.palette.white
                : theme.colors.text.secondary
            }
          >
            Sent
          </CustomText>
          {sentCount > 0 && (
            <View
              style={[
                styles.badge,
                activeTab === "sent"
                  ? styles.activeBadgeSent
                  : styles.inactiveBadge,
              ]}
            >
              <CustomText
                variant="caption"
                size={10}
                fontWeight="bold"
                color={
                  activeTab === "sent"
                    ? theme.colors.palette.orange500
                    : theme.colors.palette.white
                }
              >
                {sentCount}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Request Cards */}
      <View style={styles.cardsContainer}>
        {activeTab === "received" ? (
          receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <PaymentRequestCard
                key={request.request_details.request_id}
                type="received"
                userDetails={request.requester_details}
                requestDetails={request.request_details}
                onPay={() => handlePayRequest(request)}
                onCancel={() =>
                  handleCancelRequest(request.request_details.request_id, "received")
                }
                isCancelLoading={cancellingRequestId === request.request_details.request_id && isCancelling}
              />
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <CustomText
                variant="body2"
                color={theme.colors.text.tertiary}
              >
                No received payment requests
              </CustomText>
            </View>
          )
        ) : sentRequests.length > 0 ? (
          sentRequests.map((request) => (
            <PaymentRequestCard
              key={request.request_details.request_id}
              type="sent"
              userDetails={request.recipient_details}
              requestDetails={request.request_details}
              onCancel={() =>
                handleCancelRequest(request.request_details.request_id, "sent")
              }
              isCancelLoading={cancellingRequestId === request.request_details.request_id && isCancelling}
            />
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <CustomText
              variant="body2"
              color={theme.colors.text.tertiary}
            >
              No sent payment requests
            </CustomText>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: 8,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 12,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.palette.grey100,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyIcon: {
      fontSize: 36,
    },
    emptyTitle: {
      marginBottom: 4,
      textAlign: "center",
    },
    emptySubtitle: {
      textAlign: "center",
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.palette.grey100,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      gap: 6,
    },
    activeTab: {
      backgroundColor: theme.colors.palette.green700,
    },
    activeTabSent: {
      backgroundColor: theme.colors.palette.orange500,
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
    },
    activeBadge: {
      backgroundColor: theme.colors.palette.white,
    },
    activeBadgeSent: {
      backgroundColor: theme.colors.palette.white,
    },
    inactiveBadge: {
      backgroundColor: theme.colors.palette.grey400,
    },
    cardsContainer: {
      marginTop: 4,
    },
    noDataContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
    },
  });

export default PaymentRequestsList;

