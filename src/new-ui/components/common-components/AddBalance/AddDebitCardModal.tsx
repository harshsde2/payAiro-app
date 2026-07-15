import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import type { ITheme } from '@new-ui/styles/themes/themeTypes';
import { AppIcon } from '@new-ui/assets/svgs';
import Button from '@new-ui/components/common-components/layout/Button';
import CardAddedSuccessModal from '@new-ui/components/common-components/AddBalance/CardAddedSuccessModal';
import {
  CoinmeCardNumberField,
  CoinmeCvcField,
  CoinmeExpiryField,
  CoinmeTextField,
  CoinmeVaultError,
  CoinmeVaultProvider,
  NotEmptyRule,
  submitPaymentMethod,
  useCoinmeVault,
  useVaultFieldState,
  VAULT_FIELD_NAMES,
  type CoinmeVaultEnvironment,
} from '@coinme-security/vault-sdk-react-native';
import {
  awaitCardlinkingPostSubmitDelay,
  debugLogCoinmeRiskEngine,
  logCoinmeRiskBeforeAddCardApiCall,
  prepareCardlinkingRiskSession,
  resetCardlinkingPhase3Prepare,
  resolveCardlinkingPhase,
  runAddCardCoinmeRiskFlow,
} from 'services/coinmeRiskLifecycle';
import { useCoinmeAccountId } from 'hooks/useCoinmeAccountId';
import { getDeviceFingerprint } from 'utils/getDeviceFingerprint';
import { fetchCoinmeCaasAuthToken } from 'services/coinmeCaasAuth';
import { useSavePaymentMethod } from 'query/hooks/usePaymentMethods';
import { EnvConfig } from 'config/env.config';

export type AddedCardResult = {
  payment_method_id: string;
};

type AddDebitCardModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdded: (result: AddedCardResult) => void;
};

const PROVIDER_ID = '828627387817136137';

// Card capture posts directly to Coinme's vault (secure.payments[-stage].coinme.com).
// Staging builds → sandbox vault; production → live vault.
const VAULT_ENVIRONMENT: CoinmeVaultEnvironment =
  EnvConfig.ENV_TYPE === 'production' ? 'live' : 'sandbox';

// Defined once so the secure fields don't re-register their validation on every render.
const address1Rules = [new NotEmptyRule('Street address is required')];
const cityRules = [new NotEmptyRule('City is required')];
const zipRules = [new NotEmptyRule('ZIP code is required')];

/**
 * Best-effort extraction of the created payment-method id from Coinme's vault response.
 * The raw PAN never reaches us, so when no id/last4 is present we return an empty id and
 * let the caller re-fetch the list to locate the new card.
 */
const extractAddedCardResult = (data: unknown): AddedCardResult => {
  const d = (data ?? {}) as Record<string, any>;
  const id =
    d.payment_method_id ||
    d.paymentMethodId ||
    d?.data?.payment_method_id ||
    d?.data?.paymentMethodId ||
    d.id ||
    null;
  if (typeof id === 'string' && id.length > 0) return { payment_method_id: id };

  const last4 = d.card_last4 || d.last4 || d?.data?.card_last4 || d?.data?.last4 || null;
  if (typeof last4 === 'string' && last4.length >= 4) {
    return { payment_method_id: `last4:${String(last4).slice(-4)}` };
  }
  return { payment_method_id: '' };
};

type CoinmePaymentMethod = {
  paymentMethodId?: string;
  // Coinme returns these as `stagingProviderId` / `stagingProviderName` in test.
  stagingProviderId?: string;
  stagingProviderName?: string;
  providerId?: string;
  providerName?: string;
  type?: string;
  cardProvider?: string;
  card?: { cardNumber?: string; last4?: string; month?: string; year?: string };
  billingAddress?: Record<string, unknown>;
  status?: string;
  buySupported?: boolean;
  sellSupported?: boolean;
};

/** Pulls Coinme's created payment-method object out of the vault response (tolerates nesting). */
const extractCoinmePaymentMethod = (body: unknown): CoinmePaymentMethod => {
  const b = (body ?? {}) as Record<string, any>;
  return (b?.data?.paymentMethod ?? b?.data ?? b?.paymentMethod ?? b ?? {}) as CoinmePaymentMethod;
};

/** Last 4 from Coinme's masked card number (e.g. "400552******0251" → "0251"). */
const last4FromCard = (card?: CoinmePaymentMethod['card']): string => {
  if (card?.last4) return String(card.last4).slice(-4);
  const digits = String(card?.cardNumber ?? '').replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : '';
};

const AddDebitCardModal: React.FC<AddDebitCardModalProps> = ({ visible, onClose, onAdded }) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [pendingResult, setPendingResult] = useState<AddedCardResult | null>(null);

  useEffect(() => {
    if (!visible) {
      setPhase('form');
      setPendingResult(null);
      resetCardlinkingPhase3Prepare();
    }
  }, [visible]);

  const handleSuccessComplete = useCallback(() => {
    if (pendingResult) onAdded(pendingResult);
  }, [onAdded, pendingResult]);

  const handleCardSubmitted = useCallback((result: AddedCardResult) => {
    setPendingResult(result);
    setPhase('success');
  }, []);

  const handleBackdropPress = phase === 'form' ? onClose : undefined;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalKav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={[
            styles.modalBackdrop,
            { paddingTop: insets.top + theme.spacing.sm, paddingBottom: Math.max(insets.bottom, theme.spacing.md) },
          ]}
          onPress={handleBackdropPress}
        >
          {phase === 'success' ? (
            <CardAddedSuccessModal visible onComplete={handleSuccessComplete} />
          ) : visible ? (
            // Mount the vault only while the form is open so it is created fresh and disposed on close.
            <CoinmeVaultProvider
              environment={VAULT_ENVIRONMENT}
              onError={(e) => console.warn('[AddDebitCard] vault init error', e)}
            >
              <CardFormBody onClose={onClose} onSubmitted={handleCardSubmitted} />
            </CoinmeVaultProvider>
          ) : null}
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

type CardFormBodyProps = {
  onClose: () => void;
  onSubmitted: (result: AddedCardResult) => void;
};

const CardFormBody: React.FC<CardFormBodyProps> = ({ onClose, onSubmitted }) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const fieldStyles = useMemo(() => makeFieldStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // Bottom-anchored card: cap height so the close button stays below the notch and the card
  // bottom stays above the home indicator. Reserve ~96px for the close row + breathing room.
  const maxCardHeight = Math.max(360, windowHeight - insets.top - insets.bottom - 96);

  const vault = useCoinmeVault();
  const coinmeAccountId = useCoinmeAccountId();
  const savePaymentMethod = useSavePaymentMethod();

  // Gate on the REQUIRED vault fields explicitly. The aggregate useVaultFormValidity() also waits
  // on the optional `address2` field, which never reports valid until touched — that left Proceed
  // permanently disabled. address2 is excluded here on purpose.
  const panState = useVaultFieldState(VAULT_FIELD_NAMES.pan);
  const expiryState = useVaultFieldState(VAULT_FIELD_NAMES.expiry);
  const cvcState = useVaultFieldState(VAULT_FIELD_NAMES.cvc);
  const address1State = useVaultFieldState(VAULT_FIELD_NAMES.address1);
  const cityState = useVaultFieldState(VAULT_FIELD_NAMES.city);
  const zipState = useVaultFieldState(VAULT_FIELD_NAMES.zipcode);
  const vaultValid =
    !!panState?.isValid &&
    !!expiryState?.isValid &&
    !!cvcState?.isValid &&
    !!address1State?.isValid &&
    !!cityState?.isValid &&
    !!zipState?.isValid;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase-3 risk warm-up: start the Risk SDK update()/submit() early once the modal settles,
  // so the webSessionId is ready by the time the user taps Proceed. Ported from the prior flow.
  useEffect(() => {
    const cardlinkingPhase = resolveCardlinkingPhase();
    if (cardlinkingPhase !== 3 || !coinmeAccountId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      const deferMs = Platform.OS === 'ios' ? 900 : 350;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        prepareCardlinkingRiskSession(coinmeAccountId).catch((e) =>
          console.warn('[AddDebitCard] Phase 3 early prepare failed', e)
        );
      }, deferMs);
    });
    return () => {
      cancelled = true;
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [coinmeAccountId]);

  const plainValid =
    firstName.trim().length > 0 && lastName.trim().length > 0 && state.trim().length >= 2;
  const canSubmit = vaultValid && plainValid && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!vaultValid) {
      setError('Please complete your card and billing details.');
      return;
    }
    if (!plainValid) {
      setError('Enter the cardholder name and billing state.');
      return;
    }
    if (!coinmeAccountId) {
      setError('Your Coinme account is not ready yet. Please complete onboarding and try again.');
      return;
    }

    // Kept in outer scope so the catch's risk-engine logging can reference it.
    let webSessionId: string | undefined;
    setIsSubmitting(true);
    try {
      // iOS: let the modal interactions settle before driving the native Risk SDK.
      if (Platform.OS === 'ios') {
        await new Promise<void>((resolve) =>
          InteractionManager.runAfterInteractions(() => resolve())
        );
      }

      webSessionId = await runAddCardCoinmeRiskFlow(coinmeAccountId);
      await awaitCardlinkingPostSubmitDelay();
      await logCoinmeRiskBeforeAddCardApiCall({
        accountId: coinmeAccountId,
        webSessionId,
        providerId: PROVIDER_ID,
        paymentProcessAssociation: 'BUY',
        riskFlow: 'cardlinking',
      });

      const fingerprint = await getDeviceFingerprint();

      // Auth: Coinme's vault route does NOT inject auth — the client must send the partner
      // Bearer JWT. We mint a fresh one from Coinme CaaS (Basic partnerId:clientSecret →
      // /services/authorize, ~30-min token) right before each submit. See services/coinmeCaasAuth.
      const caasToken = await fetchCoinmeCaasAuthToken();

      const result = await submitPaymentMethod(vault, {
        customerId: coinmeAccountId,
        paymentProcessAssociation: 'BUY',
        paymentProviderId: PROVIDER_ID,
        webSessionId,
        billingAddress: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          state: state.trim().toUpperCase(),
          country: 'US',
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${caasToken}`,
          'X-Device-Fingerprint': fingerprint,
        },
      });

      // Inspect the exact response shape on a real success (Coinme's created payment method).
      console.log('[AddDebitCard] vault submit result =>', JSON.stringify(result));

      // The card was created DIRECTLY at Coinme — tell our backend so its records stay in sync.
      // Best-effort: if this fails the card is still linked at Coinme, so we don't block success.
      const pm = extractCoinmePaymentMethod(result.data);
      const billing = (pm.billingAddress ?? {}) as Record<string, any>;
      try {
        await savePaymentMethod.mutateAsync({
          payment_method_id: String(pm.paymentMethodId ?? ''),
          provider_id: String(pm.stagingProviderId ?? pm.providerId ?? PROVIDER_ID),
          provider_name: String(pm.stagingProviderName ?? pm.providerName ?? 'Coinme'),
          card_type: String(pm.type ?? 'DEBIT'),
          card_provider: String(pm.cardProvider ?? ''),
          card_last4: last4FromCard(pm.card),
          exp_month: String(pm.card?.month ?? ''),
          exp_year: String(pm.card?.year ?? ''),
          billing_first_name: String(billing.firstName ?? firstName.trim()),
          billing_last_name: String(billing.lastName ?? lastName.trim()),
          billing_country: String(billing.country ?? 'US'),
          billing_address_line1: String(billing.addressLine1 ?? ''),
          billing_address_line2: String(billing.addressLine2 ?? ''),
          billing_zip_code: String(billing.zipCode ?? ''),
          billing_city: String(billing.city ?? ''),
          billing_state: String(billing.state ?? state.trim().toUpperCase()),
          web_session_id: String(webSessionId ?? ''),
          buy_supported: pm.buySupported ?? true,
          sell_supported: pm.sellSupported ?? false,
        });
      } catch (saveErr) {
        console.warn('[AddDebitCard] backend save failed (card is linked at Coinme)', saveErr);
      }

      onSubmitted({
        payment_method_id:
          String(pm.paymentMethodId ?? '') || extractAddedCardResult(result.data).payment_method_id,
      });
    } catch (e: unknown) {
      await debugLogCoinmeRiskEngine('AddDebitCard:afterVaultSubmitFailure', {
        expectedWebSessionId: webSessionId,
        accountId: coinmeAccountId ?? undefined,
      });
      setError(messageForVaultError(e));
      console.warn('[AddDebitCard] vault submit failed', e);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    coinmeAccountId,
    firstName,
    vaultValid,
    lastName,
    onSubmitted,
    plainValid,
    savePaymentMethod,
    state,
    vault,
  ]);

  return (
    <>
      <View style={styles.modalCloseRow}>
        <Pressable onPress={onClose} style={styles.modalCloseButton}>
          <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.modalCard, { height: undefined, maxHeight: maxCardHeight }]}
        onPress={(e) => e.stopPropagation()}
      >
        <CustomText variant="h5" fontWeight="bold" align="center">
          Debit Card
        </CustomText>
        <CustomText
          variant="body"
          color={theme.colors.textSecondary}
          align="center"
          style={{ marginTop: theme.spacing.sm }}
        >
          Enter your debit card details to add money to your payairo account.
        </CustomText>

        <ScrollView
          style={fieldStyles.scroll}
          contentContainerStyle={fieldStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={fieldStyles.row}>
            <View style={fieldStyles.halfCol}>
              <FieldLabel text="First name" theme={theme} />
              <RNTextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Jane"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
                style={fieldStyles.plainInput}
              />
            </View>
            <View style={fieldStyles.halfCol}>
              <FieldLabel text="Last name" theme={theme} />
              <RNTextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
                style={fieldStyles.plainInput}
              />
            </View>
          </View>

          <FieldLabel text="Debit card number" theme={theme} />
          <CoinmeCardNumberField
            fieldName={VAULT_FIELD_NAMES.pan}
            placeholder="0000 0000 0000 0000"
            containerStyle={fieldStyles.secureContainer}
            textStyle={fieldStyles.secureText}
          />

          <View style={fieldStyles.row}>
            <View style={fieldStyles.halfCol}>
              <FieldLabel text="Valid upto" theme={theme} />
              <CoinmeExpiryField
                fieldName={VAULT_FIELD_NAMES.expiry}
                placeholder="MM/YY"
                containerStyle={fieldStyles.secureContainer}
                textStyle={fieldStyles.secureText}
              />
            </View>
            <View style={fieldStyles.halfCol}>
              <FieldLabel text="CVV" theme={theme} />
              <CoinmeCvcField
                fieldName={VAULT_FIELD_NAMES.cvc}
                placeholder="123"
                containerStyle={fieldStyles.secureContainer}
                textStyle={fieldStyles.secureText}
              />
            </View>
          </View>

          <FieldLabel text="Billing street address" theme={theme} />
          <CoinmeTextField
            fieldName={VAULT_FIELD_NAMES.address1}
            placeholder="123 Main St"
            validationRules={address1Rules}
            containerStyle={fieldStyles.secureContainer}
            textStyle={fieldStyles.secureText}
          />

          <View style={fieldStyles.row}>
            <View style={fieldStyles.halfCol}>
              <FieldLabel text="City" theme={theme} />
              <CoinmeTextField
                fieldName={VAULT_FIELD_NAMES.city}
                placeholder="Seattle"
                validationRules={cityRules}
                containerStyle={fieldStyles.secureContainer}
                textStyle={fieldStyles.secureText}
              />
            </View>
            <View style={fieldStyles.halfCol}>
              <FieldLabel text="State" theme={theme} />
              <RNTextInput
                value={state}
                onChangeText={setState}
                placeholder="WA"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="characters"
                maxLength={2}
                style={fieldStyles.plainInput}
              />
            </View>
          </View>

          <FieldLabel text="ZIP code" theme={theme} />
          <CoinmeTextField
            fieldName={VAULT_FIELD_NAMES.zipcode}
            placeholder="98101"
            validationRules={zipRules}
            containerStyle={fieldStyles.secureContainer}
            textStyle={fieldStyles.secureText}
          />

          <CustomText
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: theme.spacing.sm }}
          >
            Secured with 256-bit encryption — card details go directly to Coinme's PCI vault.
          </CustomText>
        </ScrollView>

        {/* Error is OUTSIDE the scroll so it's always visible without scrolling. */}
        {error ? (
          <View style={fieldStyles.errorBanner}>
            <CustomText variant="bodySmall" color={theme.colors.error}>
              {error}
            </CustomText>
          </View>
        ) : null}

        <View style={{ marginTop: theme.spacing.md }}>
          <Button disabled={!canSubmit} onPress={handleSubmit}>
            {isSubmitting ? <ActivityIndicator color={theme.colors.white} /> : 'Proceed'}
          </Button>
        </View>
      </Pressable>
    </>
  );
};

const FieldLabel: React.FC<{ text: string; theme: ITheme }> = ({ text, theme }) => (
  <CustomText
    variant="caption"
    color={theme.colors.textSecondary}
    style={{ marginBottom: theme.spacing.xs, marginTop: theme.spacing.sm }}
  >
    {text}
  </CustomText>
);

/** Maps a Coinme vault error to a user-facing message; falls back to a generic retry copy. */
const messageForVaultError = (e: unknown): string => {
  if (e instanceof CoinmeVaultError) {
    switch (e.kind) {
      case 'validation':
        return 'Some card details are invalid. Please check and try again.';
      case 'network':
        return 'Network error. Check your connection and try again.';
      case 'server':
        return `Card could not be added (error ${e.status ?? ''}). Please try again.`;
      case 'caas': {
        // Coinme's envelope: { message?, errorData?: [{ errorCode, message }] }. Prefer the
        // specific field-level messages so the user sees the real reason.
        const env = e.errorResponse as
          | { message?: string; errorData?: Array<{ message?: string }> }
          | undefined;
        const details = (env?.errorData ?? [])
          .map((d) => d?.message)
          .filter((m): m is string => !!m)
          .join('\n');
        return details || env?.message || e.message || 'Card was declined. Please try a different card.';
      }
      default:
        return 'Failed to add card. Please try again.';
    }
  }
  const err = e as { message?: string };
  return err?.message || 'Failed to add card. Please try again.';
};

const makeFieldStyles = (theme: ITheme) =>
  StyleSheet.create({
    // flexShrink lets the scroll area shrink to fit inside the maxHeight-capped card and scroll;
    // no flexGrow, so the card stays compact when the content is short.
    scroll: {
      marginTop: theme.spacing.md,
      flexShrink: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.md,
    },
    errorBanner: {
      marginTop: theme.spacing.sm,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    halfCol: {
      flex: 1,
      minWidth: 0,
    },
    plainInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.base,
      minHeight: 52,
      fontSize: 16,
      color: theme.colors.text,
    },
    secureContainer: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.base,
      minHeight: 52,
      justifyContent: 'center',
      backgroundColor: theme.colors.white,
    },
    secureText: {
      fontSize: 16,
      color: theme.colors.text,
    },
  });

export default AddDebitCardModal;
