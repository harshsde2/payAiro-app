import React, { useMemo } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { formatDotDateTime } from "utils/dateUtils";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { Button } from "@new-ui/components/common-components/layout";
import CryptoRequestStatusBadge from "@new-ui/components/common-components/CryptoRequestStatusBadge";
import {
  formatRequestAmount,
  partyName,
} from "@new-ui/components/common-components/CryptoRequestCard";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import type { NewUIDashboardStackParamList } from "@new-ui/navigationTypes";
import {
  useCryptoRequestById,
  usePayCryptoRequest,
  useCancelCryptoRequest,
} from "query/hooks/useCryptoRequest";
import { useCryptoAssetsListData } from "query/hooks/useCrypto";
import { getCryptoRequestError } from "query/hooks/cryptoRequest.types";
import type { ICryptoRequest } from "query/hooks/cryptoRequest.types";
import { useAppLock } from "hooks/useAppLock";
import { showSuccess, showError } from "utils/toast";
import { useTransactionSubmit } from "hooks/useTransactionSubmit";
import {
  buildIntentSignature,
  isOutcomeUnknown,
  UNKNOWN_OUTCOME_MESSAGE,
} from "services/transactionGuard";
import { confirmDuplicateTransaction } from "utils/confirmDuplicateTransaction";

/** First initial for the avatar. */
function initialOf(name: string): string {
  return name?.trim()?.charAt(0)?.toUpperCase() || "?";
}

type DetailRoute = RouteProp<
  NewUIDashboardStackParamList,
  typeof NAVIGATION_SCREENS.NEW_CRYPTO_REQUEST_DETAIL
>;

const CryptoRequestDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<DetailRoute>();
  const { id, request: requestParam } = route.params ?? {};

  const { requestPaymentVerification } = useAppLock();
  const { mutateAsync: payRequest, isPending: isPaying } = usePayCryptoRequest();
  // One POST per transaction intent, regardless of taps, retries or re-renders.
  const { submit: submitTransaction, isSubmitting: isSubmittingTransaction } =
    useTransactionSubmit();
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelCryptoRequest();

  // Payer's crypto balances (same source EnterAmount trusts) for the pre-check.
  const allCryptoFromRedux = useSelector(
    (state: { authenticationSlice?: { allCryptoBalances?: unknown[] } }) =>
      state.authenticationSlice?.allCryptoBalances
  );
  const { data: cryptoAssetsList = [] } = useCryptoAssetsListData("USD");

  // Use the passed object when available; otherwise resolve by id (deep link /
  // notification entry).
  const {
    request: fetchedRequest,
    isLoading,
    refetch,
  } = useCryptoRequestById(requestParam ? undefined : id, {
    enabled: !requestParam && id != null,
  });

  const request: ICryptoRequest | undefined = requestParam ?? fetchedRequest;

  const isExpired = useMemo(() => {
    if (!request) return false;
    if (request.status === "EXPIRED") return true;
    return (
      !!request.expiresAt && new Date(request.expiresAt).getTime() < Date.now()
    );
  }, [request]);

  if (!requestParam && isLoading) {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.background}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!request) {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.background}>
        <View style={styles.center}>
          <CustomText style={styles.emptyText}>
            This request could not be found.
          </CustomText>
        </View>
      </ScreenWrapper>
    );
  }

  const isSent = request.direction === "sent";
  const isPending = request.status === "PENDING" && !isExpired;
  const canPay = !isSent && isPending;
  const canCancel = isPending;

  const requester = request.requestedBy;
  const payer = request.requestedFrom;

  const rows: { label: string; value: string }[] = [
    { label: "Amount", value: `${formatRequestAmount(request.amount)} ${request.currency}` },
    { label: "Network", value: request.chain },
    { label: "From (requester)", value: partyName(requester) },
    { label: "To (payer)", value: partyName(payer) },
  ];
  if (request.note) rows.push({ label: "Note", value: request.note });
  rows.push({
    label: "Created",
    value: formatDotDateTime(request.createdAt),
  });
  if (request.expiresAt) {
    rows.push({
      label: "Expires",
      value: formatDotDateTime(request.expiresAt),
    });
  }

  /**
   * Available balance the payer holds for this request's currency, or
   * `undefined` when it can't be determined (then we let the API decide).
   */
  const availableBalance = ((): number | undefined => {
    const lists = [
      Array.isArray(allCryptoFromRedux) ? allCryptoFromRedux : [],
      Array.isArray(cryptoAssetsList) ? cryptoAssetsList : [],
    ];
    const wanted = request.currency?.toUpperCase();
    for (const list of lists) {
      const match = (list as any[]).find(
        (item) => String(item?.asset ?? "").toUpperCase() === wanted
      );
      const raw = match?.platform_available;
      const n = typeof raw === "number" ? raw : Number(raw);
      if (match && Number.isFinite(n)) return n;
    }
    return undefined;
  })();

  const handlePay = () => {
    // Pre-check: block insufficient balance locally before hitting the API.
    const needed = Number(request.amount);
    if (
      availableBalance !== undefined &&
      Number.isFinite(needed) &&
      availableBalance < needed
    ) {
      showError(
        "Insufficient balance",
        `You need ${formatRequestAmount(request.amount)} ${request.currency} but have ${formatRequestAmount(
          String(availableBalance)
        )} ${request.currency}.`
      );
      return;
    }

    // Paying a request is money movement: one POST per intent, no matter how many
    // taps or retries happen around it.
    const signature = buildIntentSignature([
      "request-pay",
      request.id,
      request.currency,
      request.amount,
    ]);

    requestPaymentVerification(() => {
      void submitTransaction(
        signature,
        async (idempotencyKey) => {
          try {
            const data = await payRequest({ requestId: request.id, idempotencyKey });
            // Queries are already invalidated by the mutation; leave the pay screen.
            showSuccess(
              data?.message || "Request fulfilled successfully.",
              `You sent ${formatRequestAmount(request.amount)} ${request.currency} to ${partyName(requester)}.`
            );
            navigation.goBack();
          } catch (error: unknown) {
            // No response at all → we do NOT know whether the payment went through.
            if (isOutcomeUnknown(error)) {
              showError("Couldn't confirm", UNKNOWN_OUTCOME_MESSAGE);
            } else {
              const { message } = getCryptoRequestError(error, "Payment failed.");
              showError("Payment failed", message);
            }
            refetch();
            // Rethrow so the guard records the outcome and keeps the intent locked.
            throw error;
          }
        },
        {
          onDuplicate: (retry) => confirmDuplicateTransaction(retry),
          onUnknownOutcome: () => showError("Couldn't confirm", UNKNOWN_OUTCOME_MESSAGE),
        },
      );
    });
  };

  const handleCancel = () => {
    Alert.alert(
      isSent ? "Cancel request?" : "Decline request?",
      isSent
        ? "This will cancel the request you sent."
        : "This will decline the request. The requester will be notified.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () =>
            cancelRequest(request.id, {
              onSuccess: () => {
                showSuccess(
                  isSent ? "Request cancelled" : "Request declined",
                  isSent ? "Your request has been cancelled." : "The request has been declined."
                );
                navigation.goBack();
              },
              onError: (error: unknown) => {
                const { message } = getCryptoRequestError(
                  error,
                  "Could not cancel the request."
                );
                showError("Couldn't cancel request", message);
                refetch();
              },
            }),
        },
      ]
    );
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      scrollable
      padding={16}
      backgroundColor={theme.colors.background}
    >
      <View style={styles.amountBlock}>
        <View style={styles.avatar}>
          <CustomText variant="h2" fontWeight="bold" color={theme.colors.primary}>
            {initialOf(partyName(isSent ? payer : requester))}
          </CustomText>
        </View>
        <CustomText
          fontWeight="extraBold"
          color={theme.colors.text}
          align="center"
          style={styles.amountText}
        >
          {formatRequestAmount(request.amount)} {request.currency}
        </CustomText>
        <CryptoRequestStatusBadge status={request.status} style={styles.badge} />
        <CustomText
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          {isSent
            ? `Requested from ${partyName(payer)}`
            : `${partyName(requester)} requested from you`}
        </CustomText>
      </View>

      <View style={styles.card}>
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={[styles.row, i === rows.length - 1 && styles.rowLast]}
          >
            <CustomText
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.rowLabel}
            >
              {row.label}
            </CustomText>
            <CustomText
              variant="body"
              fontWeight="semiBold"
              color={theme.colors.text}
              style={styles.rowValue}
            >
              {row.value}
            </CustomText>
          </View>
        ))}
      </View>

      {isExpired && request.status === "PENDING" && (
        <CustomText
          variant="caption"
          color={theme.colors.error}
          style={styles.expiredNote}
        >
          This request has expired.
        </CustomText>
      )}

      <View style={styles.actions}>
        {canPay && (
          <Button
            onPress={handlePay}
            loading={isPaying || isSubmittingTransaction}
            disabled={isPaying || isSubmittingTransaction}
          >
            Pay {formatRequestAmount(request.amount)} {request.currency}
          </Button>
        )}
        {canCancel && (
          <Button
            color={theme.colors.onPrimary}
            style={styles.cancelButton}
            textStyle={{ color: theme.colors.error }}
            onPress={handleCancel}
            loading={isCancelling}
            disabled={isCancelling}
          >
            {isSent ? "Cancel request" : "Decline"}
          </Button>
        )}
      </View>
    </ScreenWrapper>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    amountBlock: {
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.greenLight2,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.xs,
    },
    amountText: {
      fontSize: 34,
      lineHeight: 42,
    },
    badge: {
      alignSelf: "center",
    },
    subtitle: {
      textAlign: "center",
    },
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.greyLight,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.base,
      marginTop: theme.spacing.md,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.greyLight,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    rowValue: {
      flex: 1.3,
      textAlign: "right",
    },
    expiredNote: {
      marginTop: theme.spacing.md,
      textAlign: "center",
    },
    actions: {
      marginTop: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    cancelButton: {
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
  });

export default CryptoRequestDetailScreen;
