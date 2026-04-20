import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import { AppIcon } from '@new-ui/assets/svgs';
import Button from '@new-ui/components/common-components/layout/Button';
import TextInput from '@new-ui/components/common-components/layout/TextInput';
import { useAddPaymentMethod } from 'query/hooks/usePaymentMethods';

export type AddedCardResult = {
  payment_method_id: string;
};

type AddDebitCardModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdded: (result: AddedCardResult) => void;
};

const PROVIDER_ID = '828627387817136137';

const digitsOnly = (s: string) => s.replace(/\D/g, '');

const normalizeYear = (y: string): string => {
  const d = digitsOnly(y);
  if (d.length === 2) return `20${d}`;
  return d.slice(0, 4);
};

const normalizeMonth = (m: string): string => digitsOnly(m).slice(0, 2);

const AddDebitCardModal: React.FC<AddDebitCardModalProps> = ({
  visible,
  onClose,
  onAdded,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const addMutation = useAddPaymentMethod();

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cleanedCardNumber = useMemo(() => digitsOnly(cardNumber).slice(0, 19), [cardNumber]);
  const cleanedMonth = useMemo(() => normalizeMonth(month), [month]);
  const cleanedYear = useMemo(() => normalizeYear(year), [year]);
  const cleanedCvv = useMemo(() => digitsOnly(cvv).slice(0, 4), [cvv]);

  const validation = useMemo(() => {
    const monthNum = Number(cleanedMonth);
    const yearNum = Number(cleanedYear);
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;

    if (cleanedCardNumber.length < 12) return { ok: false, msg: 'Enter a valid card number.' };
    if (cleanedMonth.length !== 2 || monthNum < 1 || monthNum > 12) return { ok: false, msg: 'Enter a valid expiry month.' };
    if (cleanedYear.length !== 4 || yearNum < thisYear) return { ok: false, msg: 'Enter a valid expiry year.' };
    if (yearNum === thisYear && monthNum < thisMonth) return { ok: false, msg: 'Card is expired.' };
    if (cleanedCvv.length < 3) return { ok: false, msg: 'Enter a valid CVV.' };
    return { ok: true, msg: null as string | null };
  }, [cleanedCardNumber, cleanedCvv.length, cleanedMonth, cleanedYear]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!validation.ok) {
      setError(validation.msg);
      return;
    }
    try {
      const res = await addMutation.mutateAsync({
        providerId: PROVIDER_ID,
        card: {
          cardNumber: cleanedCardNumber,
          month: cleanedMonth,
          year: cleanedYear,
          cvv: cleanedCvv,
        },
        paymentProcessAssociation: 'BUY',
      });

      // Best-effort: refetch list will find this card; we need a selected id.
      // If backend returns an id inside data, prefer it; else caller will reselect after refetch by last4.
      const idFromResponse =
        (res as any)?.data?.payment_method_id ||
        (res as any)?.data?.paymentMethodId ||
        null;

      if (typeof idFromResponse === 'string' && idFromResponse.length > 0) {
        onAdded({ payment_method_id: idFromResponse });
      } else {
        // Fallback: use a temporary marker; picker will refetch and we’ll select the newest matching last4.
        onAdded({ payment_method_id: `last4:${cleanedCardNumber.slice(-4)}` });
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        'Failed to add card. Please try again.';
      setError(String(msg));
    }
  }, [addMutation, cleanedCardNumber, cleanedCvv, cleanedMonth, cleanedYear, onAdded, validation]);

  const isSubmitting = addMutation.isPending;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.modalBackdrop]} onPress={onClose}>
        <View style={styles.modalCloseRow}>
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
          </Pressable>
        </View>

        <Pressable style={[styles.modalCard,{height: error ? 660 : 600}]} onPress={(e) => e.stopPropagation()}>

          <CustomText variant="h5" fontWeight="bold" align="center">
            Debit Card
          </CustomText>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={{ marginTop: theme.spacing.sm }}
          >
            Enter your Debit card details to add money to payairo account.
          </CustomText>

          <View style={{ marginTop: theme.spacing.xl }}>
            <TextInput
              label="Cardholder Name"
              placeholder="e.g. John Carter"
              value={cardholderName}
              onChangeText={setCardholderName}
              autoCapitalize="words"
              borderColor={theme.colors.border}
            />
            <View style={{ height: theme.spacing.md }} />
            <TextInput
              label="Debit card number"
              placeholder="e.g. 0981 0997 7765 1254"
              value={cardNumber}
              maxLength={16}
              onChangeText={(t) => setCardNumber(t)}
              keyboardType="number-pad"
              borderColor={theme.colors.border}
            />
            <View style={{ height: theme.spacing.md }} />
            <TextInput
              label="Valid upto"
              placeholder="MM/YY"
              value={month.length > 0 || year.length > 0 ? `${month}${year ? `/${year}` : ''}` : ''}
              onChangeText={(t) => {
                const d = digitsOnly(t);
                setMonth(d.slice(0, 2));
                setYear(d.slice(2, 6));
              }}
              keyboardType="number-pad"
              borderColor={theme.colors.border}
            />
            <View style={{ height: theme.spacing.md }} />
            <TextInput
              label="CVV"
              placeholder="3-Digit CVV"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="number-pad"
              secureTextEntry
              borderColor={theme.colors.border}
            />

            <CustomText
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ marginTop: theme.spacing.sm }}
            >
              Secured with 256-bit encryption
            </CustomText>

            {error ? (
              <CustomText
                variant="bodySmall"
                color={theme.colors.error}
                style={{ marginTop: theme.spacing.sm }}
              >
                {error}
              </CustomText>
            ) : null}
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            <Button disabled={!validation.ok || isSubmitting} onPress={handleSubmit}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                'Proceed'
              )}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AddDebitCardModal;

