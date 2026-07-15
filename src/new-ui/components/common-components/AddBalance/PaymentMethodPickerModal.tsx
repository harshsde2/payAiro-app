import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import { AppIcon } from 'new-ui/assets/svgs';
import { Button } from '../layout';
import {
  useDeletePaymentMethod,
  usePaymentMethodsList,
  type PaymentMethodItem,
} from 'query/hooks/usePaymentMethods';
import { showError, showSuccess } from 'utils/toast';
import { useCoinmeAccountId } from 'hooks/useCoinmeAccountId';
import {
  prepareCardlinkingRiskSession,
  resolveCardlinkingPhase,
} from 'services/coinmeRiskLifecycle';

export const RETAIL_CASH_PAYMENT_METHOD_ID = '__retail_cash__';

const NEW_CARD_ID = 'new-card';

export type PaymentFlow = 'buy' | 'sell';

type PaymentMethodPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Drives card eligibility (buy_supported vs sell_supported). */
  flow: PaymentFlow;
  title?: string;
  message?: string;
  selectedPaymentMethodId?: string | null;
  onConfirmSelection?: (
    item: PaymentMethodItem | null,
    context?: { retailCash?: boolean }
  ) => void;
  onRequestAddCard?: () => void;
  onPaymentMethodDeleted?: (paymentMethodId: string) => void;
  /** When true, shows a selectable "cash at retail" row (e.g. EnterAmount trade flow). */
  includeRetailCashOption?: boolean;
};

export type CardEligibility = { ok: boolean; reason?: string };

// Coinme card statuses that mean the card is usable. (Lifecycle: CREATED → VERIFIED → DELETED;
// DELETED cards should already be filtered out server-side.)
const USABLE_CARD_STATUSES = new Set(['ACTIVE', 'VERIFIED']);

// Statuses that mean the card was accepted but the issuer/Coinme is still verifying it. These
// resolve to a usable status on their own, so we surface a "being verified" message rather than a
// hard "not active" — the card becomes selectable automatically once approved.
const PENDING_CARD_STATUSES = new Set([
  'CREATED',
  'PENDING',
  'PENDING_VERIFICATION',
  'UNVERIFIED',
  'PROCESSING',
  'NEW',
]);

/** A card is unusable if expired, not in a usable status, or it doesn't support the current ramp. */
export function getCardEligibility(item: PaymentMethodItem, flow: PaymentFlow): CardEligibility {
  if (isCardExpired(item.exp_month, item.exp_year)) {
    return { ok: false, reason: 'Expired' };
  }
  const status = (item.status ?? '').toUpperCase();
  if (status && !USABLE_CARD_STATUSES.has(status)) {
    return {
      ok: false,
      reason: PENDING_CARD_STATUSES.has(status)
        ? 'Verifying card — available once approved'
        : 'Not active',
    };
  }
  // Backend may omit the flag — only block on an explicit `false`.
  const supported = flow === 'buy' ? item.buy_supported : item.sell_supported;
  if (supported === false) {
    return {
      ok: false,
      reason: flow === 'buy' ? 'Not available for buy' : 'Not available for sell',
    };
  }
  return { ok: true };
}

/** Returns true only when month/year clearly parse to a past month. Bad/missing data → not expired. */
function isCardExpired(expMonth?: string, expYear?: string): boolean {
  const month = Number(expMonth);
  let year = Number(expYear);
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(year)) return false;
  if (year < 100) year += 2000; // normalize 2-digit year
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  if (year < curYear) return true;
  if (year === curYear && month < curMonth) return true;
  return false;
}

const PaymentMethodPickerModal: React.FC<PaymentMethodPickerModalProps> = ({
  visible,
  onClose,
  flow,
  title = 'Select Payment Method',
  message,
  selectedPaymentMethodId,
  onConfirmSelection,
  onRequestAddCard,
  onPaymentMethodDeleted,
  includeRetailCashOption = false,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const [debitExpanded, setDebitExpanded] = useState(true);
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(
    selectedPaymentMethodId ?? null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = usePaymentMethodsList(20);
  const deleteMutation = useDeletePaymentMethod();
  const coinmeAccountId = useCoinmeAccountId();

  const debitCards = useMemo(() => {
    const items = data?.data?.items ?? [];
    return items.filter((i) => (i.card_type ?? '').toUpperCase() === 'DEBIT');
  }, [data]);

  const { eligibleCards, ineligibleCards, eligibleIds } = useMemo(() => {
    const eligible: PaymentMethodItem[] = [];
    const ineligible: Array<{ item: PaymentMethodItem; reason?: string }> = [];
    debitCards.forEach((item) => {
      const elig = getCardEligibility(item, flow);
      if (elig.ok) eligible.push(item);
      else ineligible.push({ item, reason: elig.reason });
    });
    return {
      eligibleCards: eligible,
      ineligibleCards: ineligible,
      eligibleIds: new Set(eligible.map((c) => c.payment_method_id)),
    };
  }, [debitCards, flow]);

  // Show the first-load spinner only when there's no cached data yet — never blank an
  // already-rendered list during a background refetch (e.g. right after a delete).
  const showInitialLoading = isLoading && !data;

  // When the modal (re)opens, sync the incoming selection and drop it if it's no longer a
  // valid/eligible choice, so Confirm can't return a stale card.
  useEffect(() => {
    if (!visible) return;
    const incoming = selectedPaymentMethodId ?? null;
    const isSpecial =
      incoming === RETAIL_CASH_PAYMENT_METHOD_ID || incoming === NEW_CARD_ID;
    setLocalSelectedId(incoming && (isSpecial || eligibleIds.has(incoming)) ? incoming : null);
    setDebitExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentMethodId, visible]);

  // If the list changes while open (delete / refetch) and the selection became ineligible, clear it.
  useEffect(() => {
    if (!visible) return;
    if (
      localSelectedId &&
      localSelectedId !== RETAIL_CASH_PAYMENT_METHOD_ID &&
      localSelectedId !== NEW_CARD_ID &&
      !eligibleIds.has(localSelectedId)
    ) {
      setLocalSelectedId(null);
    }
  }, [eligibleIds, localSelectedId, visible]);

  // Coinme-approved warm-up: the moment the picker opens, start the cardlinking Risk session
  // early (update + submit) so Coinme/Sardine receive the device data well before the user
  // adds a card — this is the only point at which Coinme gets that device data. The Proceed
  // step in AddDebitCardModal then only mints the webSessionId (no re-submit).
  //
  // Phase 3 only; prepareCardlinkingRiskSession self-guards (idempotent per account) and no-ops
  // for other phases. The guard is cleared when AddDebitCardModal closes
  // (resetCardlinkingPhase3Prepare), so a fresh add-card journey warms up again.
  useEffect(() => {
    if (!visible) return;
    if (resolveCardlinkingPhase() !== 3) return;
    if (!coinmeAccountId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    // Defer past the modal animation — running native SDK calls mid-animation can SIGABRT on iOS.
    InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      const deferMs = Platform.OS === 'ios' ? 900 : 350;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        prepareCardlinkingRiskSession(coinmeAccountId).catch((e) =>
          console.warn('[PaymentMethodPicker] cardlinking warm-up failed', e)
        );
      }, deferMs);
    });
    return () => {
      cancelled = true;
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [visible, coinmeAccountId]);

  const currentSelectedId = localSelectedId ?? null;

  const performDelete = useCallback(
    async (item: PaymentMethodItem) => {
      setDeletingId(item.payment_method_id);
      try {
        const res = await deleteMutation.mutateAsync(item.payment_method_id);
        if (localSelectedId === item.payment_method_id) {
          setLocalSelectedId(null);
        }
        onPaymentMethodDeleted?.(item.payment_method_id);
        showSuccess('Card removed', res?.message || 'Your card has been removed.');
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          'Failed to remove card. Please try again.';
        showError("Couldn't remove card", String(msg));
      } finally {
        setDeletingId(null);
      }
    },
    [deleteMutation, localSelectedId, onPaymentMethodDeleted]
  );

  const handleDeleteCard = useCallback(
    (item: PaymentMethodItem) => {
      if (deletingId !== null) return;
      const provider = (item.card_provider || 'Card').toUpperCase();
      const last4 = item.card_last4 || '••••';
      const label = `${provider} •••• ${last4}`;
      Alert.alert(
        'Remove card?',
        `This will remove ${label} from your saved payment methods.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => performDelete(item),
          },
        ]
      );
    },
    [deletingId, performDelete]
  );

  const renderRadio = useCallback(
    (selected: boolean) => (
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    ),
    [styles]
  );

  const renderCardRow = useCallback(
    (item: PaymentMethodItem) => {
      const selected = currentSelectedId === item.payment_method_id;
      const provider = (item.card_provider || 'Card').toUpperCase();
      const last4 = item.card_last4 ? item.card_last4 : '••••';
      const isDeleting = deletingId === item.payment_method_id;
      const deleteDisabled = deletingId !== null;
      return (
        <View key={item.payment_method_id} style={styles.cardRow}>
          <Pressable
            onPress={() => setLocalSelectedId(item.payment_method_id)}
            style={({ pressed }) => [styles.cardRowSelect, { opacity: pressed ? 0.9 : 1 }]}
          >
            {renderRadio(selected)}
            <View style={styles.rowItemTextBlock}>
              <CustomText variant="body" fontWeight="semiBold">
                {provider}  •••• {last4}
              </CustomText>
            </View>
          </Pressable>
          <Pressable
            onPress={() => handleDeleteCard(item)}
            disabled={deleteDisabled}
            style={[
              styles.cardRowDelete,
              deleteDisabled && !isDeleting ? styles.cardRowDisabled : null,
            ]}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <CustomText
                variant="bodySmall"
                fontWeight="semiBold"
                style={styles.cardRowDeleteText}
              >
                Delete
              </CustomText>
            )}
          </Pressable>
        </View>
      );
    },
    [currentSelectedId, deletingId, handleDeleteCard, renderRadio, styles, theme]
  );

  const renderIneligibleCardRow = useCallback(
    ({ item, reason }: { item: PaymentMethodItem; reason?: string }) => {
      const provider = (item.card_provider || 'Card').toUpperCase();
      const last4 = item.card_last4 ? item.card_last4 : '••••';
      const isDeleting = deletingId === item.payment_method_id;
      const deleteDisabled = deletingId !== null;
      return (
        <View key={item.payment_method_id} style={[styles.cardRow, styles.cardRowDisabled]}>
          <View style={styles.cardRowSelect}>
            {renderRadio(false)}
            <View style={styles.rowItemTextBlock}>
              <CustomText variant="body" fontWeight="semiBold">
                {provider}  •••• {last4}
              </CustomText>
              {reason ? (
                <CustomText variant="caption" style={styles.cardRowReasonText}>
                  {reason}
                </CustomText>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={() => handleDeleteCard(item)}
            disabled={deleteDisabled}
            style={styles.cardRowDelete}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <CustomText
                variant="bodySmall"
                fontWeight="semiBold"
                style={styles.cardRowDeleteText}
              >
                Delete
              </CustomText>
            )}
          </Pressable>
        </View>
      );
    },
    [deletingId, handleDeleteCard, renderRadio, styles, theme]
  );

  const handleSelectNewCard = useCallback(() => {
    setLocalSelectedId(NEW_CARD_ID);
    // Do not stack native Modals: close this picker first, then open the add-card modal
    // once the close animation/interactions settle.
    onClose();
    InteractionManager.runAfterInteractions(() => {
      onRequestAddCard?.();
    });
  }, [onClose, onRequestAddCard]);

  const renderNewCardRow = useCallback(() => {
    const selected = currentSelectedId === NEW_CARD_ID;
    return (
      <Pressable
        onPress={handleSelectNewCard}
        style={({ pressed }) => [styles.newCardRow, { opacity: pressed ? 0.9 : 1 }]}
      >
        {renderRadio(selected)}
        <View style={styles.rowItemTextBlock}>
          <CustomText variant="body" fontWeight="semiBold">
            New Debit Card
          </CustomText>
        </View>
      </Pressable>
    );
  }, [currentSelectedId, handleSelectNewCard, renderRadio, styles]);

  const renderRetailCashRow = useCallback(() => {
    const selected = currentSelectedId === RETAIL_CASH_PAYMENT_METHOD_ID;
    return (
      <Pressable
        onPress={() => setLocalSelectedId(RETAIL_CASH_PAYMENT_METHOD_ID)}
        style={({ pressed }) => [styles.methodRow, { opacity: pressed ? 0.9 : 1 }]}
      >
        {renderRadio(selected)}
        <View style={[styles.methodBadgeCircle, { marginLeft: theme.spacing.md }]}>
          <CustomText variant="caption" fontWeight="semiBold">
            $
          </CustomText>
        </View>
        <View style={styles.methodTextBlock}>
          <CustomText variant="h4" size={16} fontWeight="semiBold" fontFamily="poppins">
            Cash
          </CustomText>
          <CustomText
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 2 }}
          >
            Pay with cash at a retail location
          </CustomText>
        </View>
      </Pressable>
    );
  }, [currentSelectedId, renderRadio, styles, theme]);

  const renderStaticMethodRow = useCallback(
    (label: string, badgeText: string, icon?: React.ReactNode) => (
      <View style={styles.methodRow}>
        {icon ? (
          <View style={styles.methodIconWrap}>{icon}</View>
        ) : (
          <View style={styles.methodBadgeCircle}>
            <CustomText variant="caption" fontWeight="semiBold">
              {badgeText}
            </CustomText>
          </View>
        )}
        <View style={styles.methodTextBlock}>
          <CustomText variant="h4" size={16} fontWeight="semiBold" fontFamily="poppins">
            {label}
          </CustomText>
          <CustomText
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 2 }}
          >
            Coming soon
          </CustomText>
        </View>
      </View>
    ),
    [styles, theme]
  );

  const canConfirm =
    currentSelectedId === RETAIL_CASH_PAYMENT_METHOD_ID ||
    (!!currentSelectedId &&
      currentSelectedId !== NEW_CARD_ID &&
      eligibleIds.has(currentSelectedId));

  const handleConfirm = useCallback(() => {
    if (!onConfirmSelection) {
      onClose();
      return;
    }
    if (includeRetailCashOption && currentSelectedId === RETAIL_CASH_PAYMENT_METHOD_ID) {
      onConfirmSelection(null, { retailCash: true });
      onClose();
      return;
    }
    const selectedItem =
      currentSelectedId &&
      currentSelectedId !== NEW_CARD_ID &&
      currentSelectedId !== RETAIL_CASH_PAYMENT_METHOD_ID &&
      eligibleIds.has(currentSelectedId)
        ? eligibleCards.find((c) => c.payment_method_id === currentSelectedId) ?? null
        : null;
    onConfirmSelection(selectedItem);
    onClose();
  }, [
    currentSelectedId,
    eligibleCards,
    eligibleIds,
    includeRetailCashOption,
    onClose,
    onConfirmSelection,
  ]);

  const hasNoCards = !showInitialLoading && !isError && debitCards.length === 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCloseRow}>
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
          </Pressable>
        </View>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <CustomText variant="h5" fontWeight="bold" align="center">
            {title}
          </CustomText>
          {message ? (
            <CustomText
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
              style={{ marginTop: theme.spacing.sm }}
            >
              {message}
            </CustomText>
          ) : null}

          <ScrollView
            style={styles.methodsScroll}
            contentContainerStyle={styles.methodsContainer}
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={() => setDebitExpanded((s) => !s)}
              style={({ pressed }) => [styles.sectionHeaderRow, { opacity: pressed ? 0.9 : 1 }]}
            >
              <AppIcon.DebitCard width={24} height={24} color={theme.colors.primary} />
              <View style={styles.sectionHeaderText}>
                <CustomText variant="h4" size={16} fontWeight="semiBold" fontFamily="poppins">
                  Debit Card
                </CustomText>
              </View>
              {!showInitialLoading && isFetching ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginRight: theme.spacing.sm }}
                />
              ) : null}
              {debitExpanded ? (
                <AppIcon.ChevronDown width={24} height={24} color={theme.colors.primary} />
              ) : (
                <AppIcon.ChevronRight width={24} height={24} color={theme.colors.primary} />
              )}
            </Pressable>

            {debitExpanded ? (
              <View style={styles.expandBody}>
                {showInitialLoading ? (
                  <View style={styles.listLoadingBox}>
                    <ActivityIndicator color={theme.colors.primary} />
                  </View>
                ) : null}

                {isError && !data ? (
                  <Pressable onPress={() => refetch()} style={styles.listStateBox}>
                    <CustomText variant="body" fontWeight="semiBold">
                      Failed to load cards. Tap to retry.
                    </CustomText>
                  </Pressable>
                ) : null}

                {!showInitialLoading && !(isError && !data) ? (
                  <View>
                    {hasNoCards ? (
                      <View style={styles.listStateBox}>
                        <CustomText variant="body" color={theme.colors.textSecondary}>
                          No saved cards yet.
                        </CustomText>
                      </View>
                    ) : (
                      <>
                        {eligibleCards.map(renderCardRow)}
                        {ineligibleCards.map(renderIneligibleCardRow)}
                      </>
                    )}
                    <View style={styles.listSpacer} />
                    {renderNewCardRow()}
                  </View>
                ) : null}
              </View>
            ) : null}

            {renderStaticMethodRow('Google Pay', 'G')}
            {renderStaticMethodRow(
              'Apple Pay',
              'A',
              <AppIcon.ApplePay width={24} height={24} />
            )}
            {includeRetailCashOption ? renderRetailCashRow() : null}
          </ScrollView>

          <View style={styles.confirmContainer}>
            <Button onPress={handleConfirm} disabled={!canConfirm}>
              Select
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PaymentMethodPickerModal;
