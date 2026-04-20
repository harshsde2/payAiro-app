import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import Button from '@new-ui/components/common-components/layout/Button';
import {
  AvailableBalanceBlock,
  AddBalanceAmountField,
  AmountQuickSelectChips,
  DebitCardPaymentRow,
  AddNewCardPlaceholderModal,
  AddDebitCardModal,
} from '@new-ui/components/common-components/AddBalance';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import {
  sanitizeMoneyInput,
  parseMoneyAmount,
  selectedChipIndexForAmount,
} from './moneyInput';
import CustomText from '@new-ui/components/common-components/CustomText';
import DashboardSection from 'tsx-components/DashboardSection';
import type { AddedCardResult } from '@new-ui/components/common-components/AddBalance/AddDebitCardModal';
import { usePaymentMethodsList, type PaymentMethodItem } from 'query/hooks/usePaymentMethods';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

const NewAddBalanceScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);

  const bankBalance = useSelector((state: { authenticationSlice?: { bankBalance?: Record<string, unknown> } }) => {
    return state.authenticationSlice?.bankBalance;
  });

  const formattedAvailable = useMemo(() => {
    const bb = bankBalance as
      | {
        platform_available?: number;
        platform_balance?: number;
        bank_account?: { usd?: number };
      }
      | null
      | undefined;
    if (!bb || typeof bb !== 'object') {
      return '$0.00';
    }
    const n = Number(
      bb.platform_available ?? bb.platform_balance ?? bb.bank_account?.usd ?? 0
    );
    const safe = Number.isFinite(n) ? n : 0;
    return `$${safe.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [bankBalance]);

  const [amountText, setAmountText] = useState('');
  const [selectedChipIndex, setSelectedChipIndex] = useState<number | null>(null);
  const [debitInfoVisible, setDebitInfoVisible] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(
    null
  );

  const paymentMethodsQuery = usePaymentMethodsList(20);

  const handleAmountChange = useCallback((text: string) => {
    const next = sanitizeMoneyInput(text);
    setAmountText(next);
    setSelectedChipIndex(selectedChipIndexForAmount(next, QUICK_AMOUNTS));
  }, []);

  const handleChipSelect = useCallback((value: number, index: number) => {
    setAmountText(String(value));
    setSelectedChipIndex(index);
  }, []);

  const parsedAmount = parseMoneyAmount(amountText);
  const canProceed =
    amountText.length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleProceed = useCallback(() => {
    if (!canProceed) return;
    if (__DEV__) {
      console.log('Add balance proceed', { amountUsd: parsedAmount });
    }
  }, [canProceed, parsedAmount]);

  const paymentSubtitle = useMemo(() => {
    if (!selectedPaymentMethod) return 'Select a card';
    const provider = (selectedPaymentMethod.card_provider || 'Card').toUpperCase();
    const last4 = selectedPaymentMethod.card_last4 || '••••';
    return `${provider}  •••• ${last4}`;
  }, [selectedPaymentMethod]);

  const handleAddedCard = useCallback(
    async (result: AddedCardResult) => {
      setAddCardVisible(false);

      const res = await paymentMethodsQuery.refetch();
      const items = res.data?.data?.items ?? [];
      const wanted = result.payment_method_id;

      let selected: PaymentMethodItem | null = null;
      if (wanted.startsWith('last4:')) {
        const last4 = wanted.replace('last4:', '');
        selected =
          items.find((i) => String(i.card_last4 ?? '') === String(last4)) ?? null;
      } else {
        selected = items.find((i) => i.payment_method_id === wanted) ?? null;
      }

      setSelectedPaymentMethod(selected);
      setTimeout(() => setDebitInfoVisible(true), 350);
    },
    [paymentMethodsQuery]
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom', 'left', 'right']}
      scrollable
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.screenContent}>
        <AvailableBalanceBlock label="Available Balance" formattedAmount={formattedAvailable} />

        <View style={styles.sectionSpacer}>
          <AddBalanceAmountField label="Amount" value={amountText} onChangeText={handleAmountChange} />
          <AmountQuickSelectChips
            values={QUICK_AMOUNTS}
            selectedIndex={selectedChipIndex}
            onSelect={handleChipSelect}
          />
        </View>


        <DashboardSection title="Payment Method" titleStyle={{ fontSize: 16, }}>
          <DebitCardPaymentRow
            title="Debit Card"
            maskedDetail={paymentSubtitle}
            onPress={() => setDebitInfoVisible(true)}
          />
          {/* <AddNewCardLink label="Add new debit card" onPress={() => setNewCardModalVisible(true)} /> */}
        </DashboardSection>


        <View style={styles.proceedSpacer} />

        <Button disabled={!canProceed} onPress={handleProceed}>
          Proceed
        </Button>
      </View>

      <AddNewCardPlaceholderModal
        visible={debitInfoVisible}
        onClose={() => setDebitInfoVisible(false)}
        title="Select Payment Method"
        selectedPaymentMethodId={selectedPaymentMethod?.payment_method_id ?? null}
        onConfirmSelection={(item) => {
          setSelectedPaymentMethod(item);
        }}
        onRequestAddCard={() => setAddCardVisible(true)}
      />

      <AddDebitCardModal
        visible={addCardVisible}
        onClose={() => setAddCardVisible(false)}
        onAdded={handleAddedCard}
      />
    </ScreenWrapper>
  );
};

export default NewAddBalanceScreen;
