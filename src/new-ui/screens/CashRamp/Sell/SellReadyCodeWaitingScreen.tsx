import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { sellReadyCodeStyles } from "@new-ui/styles/screens/cashRamp/sellReadyCodeStyles";
import { useCashOfframpPickupCodePoll } from "query/hooks/useCoinmeCashRamp";
import { invalidateTransactionDataWithSettle } from "query/invalidateTransactionData";
import { buildAddressLine } from "../LocationFinder/locationFinder.utils";
import SellCashPickupInstructionsModal from "./SellCashPickupInstructionsModal";
import SellReadyCodeHistoryModal from "./SellReadyCodeHistoryModal";
import SellReadyCodeWaitModal from "./SellReadyCodeWaitModal";
import {
  SELL_ATM_LOCATION_LABEL,
  SELL_CASH_PICKUP_INSTRUCTIONS,
  SELL_CLOSE,
  SELL_FRAUD_LEARN_MORE,
  SELL_READY_CARD_BODY,
  SELL_READY_CARD_TITLE,
  SELL_SOLD_PREFIX,
  SELL_WAIT_CARD_BODY,
  SELL_WAIT_CARD_TITLE,
  SELL_EXECUTE_FAILED,
  SELL_SUBMITTING_SALE,
  SELL_TRY_AGAIN,
} from "./sellFlowCopy";
import type { SellCashRampPostExecute, SellCashRampWaitingParams } from "./sellFlow.types";
import { formatReadyCodeDisplay, formatUsd } from "./sellFlow.utils";
import { useSellExecute } from "./useSellExecute";
import { exitSellCashRampFlow } from "./exitSellCashRampFlow";
import {
  hasSellReadyCodeCloseAck,
  hasSellReadyCodeWaitAck,
  setSellReadyCodeCloseAck,
  setSellReadyCodeWaitAck,
} from "./sellReadyCodeAck";

type ExecutePhase = "idle" | "loading" | "error" | "success";

const SellReadyCodeWaitingScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = sellReadyCodeStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, SellCashRampWaitingParams>, string>>();
  const { session, postExecute: postExecuteFromRoute } = route.params ?? {};

  const { executeSell } = useSellExecute();
  const [postExecute, setPostExecute] = useState<SellCashRampPostExecute | null>(
    postExecuteFromRoute ?? null
  );
  const [executePhase, setExecutePhase] = useState<ExecutePhase>(
    postExecuteFromRoute?.partnerTransactionId ? "success" : "idle"
  );
  const [executeError, setExecuteError] = useState<string | null>(null);
  const executeStartedRef = useRef(
    Boolean(postExecuteFromRoute?.partnerTransactionId)
  );

  const userId = useSelector(
    (s: {
      authenticationSlice?: {
        userData?: { id?: string | number } | null;
        usersMe?: { user?: { id?: string | number } } | null;
      };
    }) =>
      s.authenticationSlice?.userData?.id ??
      s.authenticationSlice?.usersMe?.user?.id ??
      null
  );

  const [waitModalOpen, setWaitModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [pickupInstructionsOpen, setPickupInstructionsOpen] = useState(false);
  const exitAfterHistoryAckRef = useRef(false);

  const partnerTransactionId = postExecute?.partnerTransactionId ?? "";
  const canPollPickup = executePhase === "success" && partnerTransactionId.length > 0;
  const { data: pickupData, isFetching: isPolling } = useCashOfframpPickupCodePoll(
    partnerTransactionId,
    canPollPickup
  );

  const pickupReady = pickupData?.data?.ready === true;
  const providerTransactionRef = pickupData?.data?.providerTransactionRef ?? "";
  const displayCode = formatReadyCodeDisplay(providerTransactionRef);

  const addressLine = useMemo(() => {
    if (!session?.location) return "";
    return buildAddressLine({
      address: session.location.address,
      city: session.location.city,
      state: session.location.state,
      zipCode: session.location.zipCode,
    });
  }, [session?.location]);

  const soldLabel = useMemo(() => {
    const usd = session?.amountUsd ?? 0;
    return `${SELL_SOLD_PREFIX} ${formatUsd(usd)}`;
  }, [session?.amountUsd]);

  const runExecute = useCallback(async () => {
    if (!session || executeStartedRef.current) return;
    executeStartedRef.current = true;
    setExecutePhase("loading");
    setExecuteError(null);
    try {
      const result = await executeSell(session);
      setPostExecute(result);
      setExecutePhase("success");
      navigation.setParams({ session, postExecute: result });
    } catch (e) {
      executeStartedRef.current = false;
      setExecutePhase("error");
      setExecuteError(e instanceof Error ? e.message : SELL_EXECUTE_FAILED);
    }
  }, [executeSell, navigation, session]);

  useEffect(() => {
    if (!session) return;
    const routeTxnId = postExecuteFromRoute?.partnerTransactionId;
    if (routeTxnId) {
      setPostExecute(postExecuteFromRoute ?? null);
      setExecutePhase("success");
      executeStartedRef.current = true;
      return;
    }
    if (executePhase === "idle" && !executeStartedRef.current) {
      void runExecute();
    }
  }, [executePhase, postExecuteFromRoute, runExecute, session]);

  useEffect(() => {
    if (!session || executePhase !== "success" || !postExecute?.partnerTransactionId) return;
    if (!hasSellReadyCodeWaitAck(userId)) {
      setWaitModalOpen(true);
      return;
    }
    if (!hasSellReadyCodeCloseAck(userId)) {
      setHistoryModalOpen(true);
    }
  }, [executePhase, postExecute?.partnerTransactionId, session, userId]);

  // Cash sell completes on this screen (not TransactionResult), so refresh
  // balances + history in the background once the sell succeeds. Fires once.
  const didInvalidateSellRef = useRef(false);
  useEffect(() => {
    if (executePhase === "success" && !didInvalidateSellRef.current) {
      didInvalidateSellRef.current = true;
      invalidateTransactionDataWithSettle();
    }
  }, [executePhase]);

  const exitSellFlow = useCallback(() => {
    exitSellCashRampFlow(navigation, session);
  }, [navigation, session]);

  const onWaitModalAck = useCallback(() => {
    setSellReadyCodeWaitAck(userId);
    setWaitModalOpen(false);
    if (!hasSellReadyCodeCloseAck(userId)) {
      setHistoryModalOpen(true);
    }
  }, [userId]);

  const onHistoryModalAck = useCallback(() => {
    setSellReadyCodeCloseAck(userId);
    setHistoryModalOpen(false);
    if (exitAfterHistoryAckRef.current) {
      exitAfterHistoryAckRef.current = false;
      exitSellFlow();
    }
  }, [exitSellFlow, userId]);

  const onClosePress = useCallback(() => {
    if (pickupReady) {
      exitSellFlow();
      return;
    }
    if (!hasSellReadyCodeCloseAck(userId)) {
      exitAfterHistoryAckRef.current = true;
      setHistoryModalOpen(true);
      return;
    }
    exitSellFlow();
  }, [exitSellFlow, pickupReady, userId]);

  const onPickupInstructions = useCallback(() => {
    setPickupInstructionsOpen(true);
  }, []);

  const onPickupInstructionsClose = useCallback(() => {
    setPickupInstructionsOpen(false);
  }, []);

  if (!session) {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.white} contentStyle={{ flex: 1, padding: 16 }}>
        <CustomText variant="body" color={theme.colors.text}>
          Missing sale details. Go back and try again.
        </CustomText>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.lg }}>
          Go back
        </Button>
      </ScreenWrapper>
    );
  }

  if (executePhase === "loading") {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.white} contentStyle={{ flex: 1, padding: 24 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText variant="body" color={theme.colors.text} style={{ marginTop: theme.spacing.lg }}>
            {SELL_SUBMITTING_SALE}
          </CustomText>
        </View>
      </ScreenWrapper>
    );
  }

  if (executePhase === "error") {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.white} contentStyle={{ flex: 1, padding: 24 }}>
        <CustomText variant="h3" fontWeight="bold" color={theme.colors.text}>
          Sale could not be completed
        </CustomText>
        <CustomText variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.md }}>
          {executeError ?? SELL_EXECUTE_FAILED}
        </CustomText>
        <Button onPress={() => void runExecute()} style={{ marginTop: theme.spacing.xl }}>
          {SELL_TRY_AGAIN}
        </Button>
        <Pressable onPress={exitSellFlow} style={{ marginTop: theme.spacing.lg, alignItems: "center" }}>
          <CustomText variant="body" fontWeight="medium" color={theme.colors.text}>
            {SELL_CLOSE}
          </CustomText>
        </Pressable>
      </ScreenWrapper>
    );
  }

  const gradientColors = [
    theme.colors.greenLight2,
    theme.colors.greenLight2,
    theme.colors.white,
    theme.colors.greenLight2,
    theme.colors.greenLight1,
    theme.colors.tertiary,
    theme.colors.greenLight1,
    theme.colors.greenLight2,
  ] as const;

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom", "left", "right", "top"]}
      scrollable
      contentStyle={{ flexGrow: 1 }}
      contentContainerStyle={styles.content}
      gradient="linear"
      gradientColors={[...gradientColors]}
      gradientStart={{ x: 0.5, y: 0 }}
      gradientEnd={{ x: 0.5, y: 1 }}
      statusBarStyle="dark-content"
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onClosePress} accessibilityLabel="Go back">
          <AppIcon.ArrowLeft width={25} height={25} />
        </TouchableOpacity>
        <CustomText variant="h4" fontWeight="semiBold" color={theme.colors.text}>
          {" "}
        </CustomText>
        <View style={{ width: 25 }} />
      </View>

      <View style={styles.soldBlock}>
        {session.logo ? (
          <Image source={{ uri: session.logo }} style={{ width: 48, height: 48, borderRadius: 24 }} />
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CustomText variant="caption" color={theme.colors.white} fontWeight="bold">
              {(session.cryptoCurrencyCode ?? "₿").slice(0, 3)}
            </CustomText>
          </View>
        )}
        <CustomText variant="h1" fontWeight="bold" style={styles.soldAmount}>
          {soldLabel}
        </CustomText>
      </View>

      <View style={styles.locationBlock}>
        <CustomText variant="caption" style={styles.locationLabel}>
          {SELL_ATM_LOCATION_LABEL}
        </CustomText>
        <CustomText variant="body" fontWeight="medium" style={styles.locationAddress}>
          {session.location.description || "ATM"}
          {addressLine ? `\n${addressLine}` : ""}
        </CustomText>
      </View>

      <View style={styles.statusCard}>
        {isPolling && !pickupReady ? (
          <ActivityIndicator color={theme.colors.white} style={{ marginBottom: theme.spacing.sm }} />
        ) : null}
        <CustomText variant="h4" fontWeight="semiBold" style={styles.statusCardTitle}>
          {pickupReady ? SELL_READY_CARD_TITLE : SELL_WAIT_CARD_TITLE}
        </CustomText>
        {pickupReady ? (
          <View style={{ gap: theme.spacing.sm ,width: '100%',justifyContent: 'center',alignItems: 'center'}}>
            <CustomText variant="h2" fontWeight="bold" style={styles.readyCodeValue} selectable>
              {displayCode}
            </CustomText>
            <CustomText variant="body" style={styles.statusCardBody}>
              {SELL_READY_CARD_BODY}
            </CustomText>
          </View>
        ) : (
          <CustomText variant="body" style={styles.statusCardBody}>
            {SELL_WAIT_CARD_BODY}
          </CustomText>
        )}
      </View>

      <Pressable onPress={() => Linking.openURL("https://www.payairo.com").catch(() => {})}>
        <CustomText variant="caption" style={styles.fraudLink} color={theme.colors.text}>
          {SELL_FRAUD_LEARN_MORE}
        </CustomText>
      </Pressable>

      <View style={styles.footer}>
        <Button onPress={onPickupInstructions}>{SELL_CASH_PICKUP_INSTRUCTIONS}</Button>
        <Pressable style={styles.closeTextBtn} onPress={onClosePress}>
          <CustomText variant="body" fontWeight="medium" color={theme.colors.text}>
            {SELL_CLOSE}
          </CustomText>
        </Pressable>
      </View>

      <SellReadyCodeWaitModal visible={waitModalOpen} onAcknowledge={onWaitModalAck} />
      <SellReadyCodeHistoryModal visible={historyModalOpen} onAcknowledge={onHistoryModalAck} />
      <SellCashPickupInstructionsModal
        visible={pickupInstructionsOpen}
        onClose={onPickupInstructionsClose}
      />
    </ScreenWrapper>
  );
};

export default SellReadyCodeWaitingScreen;
