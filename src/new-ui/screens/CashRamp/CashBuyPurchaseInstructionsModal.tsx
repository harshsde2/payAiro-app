import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyPurchaseInstructionsModalStyles } from "@new-ui/styles/screens/cashRamp/cashBuyPurchaseInstructionsModalStyles";
import {
  useWalletLoadInstructionsConsentMutation,
  useWalletLoadInstructionsQuery,
  type WalletLoadInstructionsResponse,
} from "query/hooks/useWalletLoadInstructions";
import { setCashBuyLoadInstructionsAck } from "./cashBuyLoadInstructionsAck";

type Props = {
  visible: boolean;
  userId: string | number | null | undefined;
  onClose: () => void;
  /** Called after consent API succeeds and ack is persisted. Parent should navigate to barcode. */
  onConsented: () => void;
  /** When consent API fails; parent should navigate to CommonErrorScreen after closing modal. */
  onConsentApiFailure: (title: string, description: string) => void;
};

const DEFAULT_TITLE = "How to load funds into your wallet";
const FALLBACK_STEPS = [
  "Tell the cashier you want to load cash into your account, then show them your barcode to scan.",
  "Tell the cashier how much you want to load.",
  "Pay the total amount and wait for confirmation via app notification and email.",
];

function stepsFromData(d: WalletLoadInstructionsResponse | undefined): string[] {
  const inner = d?.data;
  if (!inner) return FALLBACK_STEPS;
  const out = [inner.step_1, inner.step_2, inner.step_3].filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0
  );
  return out.length > 0 ? out : FALLBACK_STEPS;
}

const CashBuyPurchaseInstructionsModal: React.FC<Props> = ({
  visible,
  userId,
  onClose,
  onConsented,
  onConsentApiFailure,
}) => {
  const { theme } = useTheme();
  const styles = cashBuyPurchaseInstructionsModalStyles(theme);
  const { data, isPending, isError, refetch, isFetching } = useWalletLoadInstructionsQuery(visible);
  const consentMut = useWalletLoadInstructionsConsentMutation();

  const title = data?.data?.title?.trim() || DEFAULT_TITLE;
  const steps = useMemo(() => stepsFromData(data), [data]);
  const feeNote = data?.data?.service_fee_note?.trim() || "";
  const footerNote = data?.data?.footer_note?.trim() || "";

  const loadingInstructions = visible && (isPending || isFetching) && !data;

  const instructionsRejected = data != null && data.status === false;
  const showFetchError = isError || instructionsRejected;
  const onUnderstand = useCallback(async () => {
    try {
      const res = await consentMut.mutateAsync();
      if (res?.status !== true) {
        onClose();
        onConsentApiFailure(
          "Unable to continue",
          typeof res?.message === "string"
            ? res.message
            : "We could not record your consent. Please try again."
        );
        return;
      }
      setCashBuyLoadInstructionsAck(userId);
      onConsented();
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: string }).message)
          : "Something went wrong. Please try again.";
      onClose();
      onConsentApiFailure("Something went wrong", msg);
    }
  }, [consentMut, onClose, onConsentApiFailure, onConsented, userId]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.dragHint} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <CustomText variant="h3" fontWeight="bold" color={theme.colors.onPrimary} style={styles.title}>
              {title}
            </CustomText>

            {loadingInstructions ? (
              <View style={styles.loading}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
              </View>
            ) : showFetchError ? (
              <View>
                <CustomText variant="body" color={theme.colors.onPrimary} style={styles.errorText}>
                  {instructionsRejected && typeof data?.message === "string" && data.message.trim()
                    ? data.message.trim()
                    : "We could not load instructions. Please check your connection and try again."}
                </CustomText>
                <Button onPress={() => refetch()} disabled={isFetching}>
                  Retry
                </Button>
              </View>
            ) : (
              <>
                <View style={styles.listBox}>
                  {steps.map((line, i) => (
                    <CustomText
                      key={i}
                      variant="body"
                      color={theme.colors.onPrimary}
                      style={styles.bullet}
                    >
                      {`\u2022 ${line}`}
                    </CustomText>
                  ))}
                </View>
                {feeNote ? (
                  <View style={styles.feeBox}>
                    <CustomText variant="body" color={theme.colors.onPrimary} style={{ textAlign: "center" }}>
                      {feeNote}
                    </CustomText>
                  </View>
                ) : null}
                {footerNote ? (
                  <CustomText variant="caption" color={theme.colors.onPrimary} style={styles.footer}>
                    {footerNote}
                  </CustomText>
                ) : null}
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {!loadingInstructions && !showFetchError ? (
              <Button
                onPress={onUnderstand}
                loading={consentMut.isPending}
                disabled={consentMut.isPending}
              >
                I Understand
              </Button>
            ) : null}
            <Button
              color={theme.colors.greyDark}
              onPress={onClose}
              disabled={consentMut.isPending}
            >
              Cancel
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CashBuyPurchaseInstructionsModal;
