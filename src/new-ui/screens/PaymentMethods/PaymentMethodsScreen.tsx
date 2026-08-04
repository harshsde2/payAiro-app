import React, { useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import DashboardSection from 'tsx-components/DashboardSection';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import AddDebitCardModal from '@new-ui/components/common-components/AddBalance/AddDebitCardModal';
import type { AddedCardResult } from '@new-ui/components/common-components/AddBalance/AddDebitCardModal';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { paymentMethodsStyles } from '@new-ui/styles/screens/paymentMethods/paymentMethodsStyles';
import {
  usePaymentMethodsList,
  useDeletePaymentMethod,
  type PaymentMethodItem,
} from 'query/hooks/usePaymentMethods';
import { showError, showSuccess } from 'utils/toast';
import { useDefaultPaymentMethodId } from '@new-ui/components/common-components/AddBalance';
import PaymentMethodCardRow from './PaymentMethodCardRow';
import {
  filterDebitCards,
  formatCardLabel,
  PAYMENT_METHODS_EMPTY_MESSAGE,
} from './paymentMethods.utils';

const PaymentMethodsScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = paymentMethodsStyles(theme);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isPending, isError, refetch } = usePaymentMethodsList(20);
  const deleteMutation = useDeletePaymentMethod();
  const { defaultId, setDefault, clearDefault } = useDefaultPaymentMethodId();

  const debitCards = useMemo(
    () => filterDebitCards(data?.data?.items),
    [data]
  );

  const openAddCard = useCallback(() => {
    setAddCardVisible(true);
  }, []);

  const performDelete = useCallback(
    async (item: PaymentMethodItem) => {
      setDeletingId(item.payment_method_id);
      try {
        const res = await deleteMutation.mutateAsync(item.payment_method_id);
        if (defaultId === item.payment_method_id) {
          clearDefault();
        }
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
    [deleteMutation]
  );

  const handleDeleteCard = useCallback(
    (item: PaymentMethodItem) => {
      if (deletingId !== null) return;
      Alert.alert(
        'Remove card?',
        `This will remove ${formatCardLabel(item)} from your saved payment methods.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => void performDelete(item),
          },
        ]
      );
    },
    [deletingId, performDelete]
  );

  const handleSetDefault = useCallback(
    (item: PaymentMethodItem) => {
      setDefault(item.payment_method_id);
      showSuccess('Default card set', `${formatCardLabel(item)} will be selected by default.`);
    },
    [setDefault]
  );

  const handleAddedCard = useCallback(
    async (_result: AddedCardResult) => {
      setAddCardVisible(false);
      await refetch();
      showSuccess('Card added', 'Your debit card is ready to use.');
    },
    [refetch]
  );

  const renderSectionContent = () => {
    if (isError) {
      return (
        <View style={styles.centerMessage}>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.errorText}
          >
            Unable to load payment methods. Please try again.
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void refetch()}
            activeOpacity={0.7}
          >
            <CustomText variant="body" fontWeight="semiBold" color={theme.colors.white}>
              Retry
            </CustomText>
          </TouchableOpacity>
        </View>
      );
    }

    if (debitCards.length === 0) {
      return (
        <CustomText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.emptyText}
        >
          {PAYMENT_METHODS_EMPTY_MESSAGE}
        </CustomText>
      );
    }

    return debitCards.map((item, index) => (
      <PaymentMethodCardRow
        key={item.payment_method_id}
        item={item}
        isDeleting={deletingId === item.payment_method_id}
        deleteDisabled={deletingId !== null}
        showDivider={index < debitCards.length - 1}
        isDefault={defaultId === item.payment_method_id}
        onSetDefault={handleSetDefault}
        onDelete={handleDeleteCard}
      />
    ));
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      loading={isPending}
      contentStyle={{ flexGrow: 1 }}
    >
      <View style={styles.content}>
        <DashboardSection
          title="Payment Methods"
          titleStyle={{ fontSize: 16 }}
          actionText={!isError ? 'Add card' : undefined}
          onActionPress={!isError ? openAddCard : undefined}
          contentContainerStyle={styles.sectionCard}
        >
          {renderSectionContent()}
        </DashboardSection>

        {!isError && debitCards.length === 0 && !isPending ? (
          <View style={styles.emptyCtaSpacer}>
            <Button onPress={openAddCard}>Add Debit Card</Button>
          </View>
        ) : null}
      </View>

      <AddDebitCardModal
        visible={addCardVisible}
        onClose={() => setAddCardVisible(false)}
        onAdded={handleAddedCard}
      />
    </ScreenWrapper>
  );
};

export default PaymentMethodsScreen;
