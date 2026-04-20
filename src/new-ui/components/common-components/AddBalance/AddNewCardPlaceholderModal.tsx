import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import { AppIcon } from 'new-ui/assets/svgs';
import { Button } from '../layout';
import { usePaymentMethodsList, type PaymentMethodItem } from 'query/hooks/usePaymentMethods';

type AddNewCardPlaceholderModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  selectedPaymentMethodId?: string | null;
  onConfirmSelection?: (item: PaymentMethodItem | null) => void;
  onRequestAddCard?: () => void;
};

const NEW_CARD_ID = 'new-card';

const AddNewCardPlaceholderModal: React.FC<AddNewCardPlaceholderModalProps> = ({
  visible,
  onClose,
  title = 'Select Payment Method',
  message,
  selectedPaymentMethodId,
  onConfirmSelection,
  onRequestAddCard,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const [debitExpanded, setDebitExpanded] = useState(true);
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(
    selectedPaymentMethodId ?? null
  );

  const { data, isLoading, isError, refetch, isFetching } = usePaymentMethodsList(20);

  useEffect(() => {
    if (!visible) return;
    setLocalSelectedId(selectedPaymentMethodId ?? null);
    setDebitExpanded(true);
  }, [selectedPaymentMethodId, visible]);

  const debitCards = useMemo(() => {
    const items = data?.data?.items ?? [];
    return items.filter((i) => (i.card_type ?? '').toUpperCase() === 'DEBIT');
  }, [data]);

  const currentSelectedId = localSelectedId ?? null;

  const renderRadio = (selected: boolean) => {
    return (
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 1.5,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.colors.primary,
            }}
          />
        ) : null}
      </View>
    );
  };

  const renderCardRow = useCallback(
    (item: PaymentMethodItem) => {
      const selected = currentSelectedId === item.payment_method_id;
      const provider = (item.card_provider || 'Card').toUpperCase();
      const last4 = item.card_last4 ? item.card_last4 : '••••';
      return (
        <Pressable
          key={item.payment_method_id}
          onPress={() => setLocalSelectedId(item.payment_method_id)}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              // borderWidth: 1,
              // borderColor: selected ? theme.colors.primary : theme.colors.border,
              // borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.white,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {renderRadio(selected)}
          <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
            <CustomText variant="body" fontWeight="semiBold">
              {provider}  •••• {last4}
            </CustomText>
          </View>
        </Pressable>
      );
    },
    [currentSelectedId, theme]
  );

  const renderNewCardRow = useCallback(() => {
    const selected = currentSelectedId === NEW_CARD_ID;
    return (
      <Pressable
        onPress={() => {
          setLocalSelectedId(NEW_CARD_ID);
          // Do not stack native Modals. Close this picker first, then open add-card modal.
          onClose();
          setTimeout(() => {
            onRequestAddCard?.();
          }, 350);
        }}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            // borderWidth: 1,
            // borderColor: selected ? theme.colors.primary : theme.colors.border,
            // borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.white,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        {renderRadio(selected)}
        <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
          <CustomText variant="body" fontWeight="semiBold">
            New Debit Card
          </CustomText>
        </View>
      </Pressable>
    );
  }, [currentSelectedId, onClose, onRequestAddCard, theme]);

  const handleConfirm = useCallback(() => {
    if (!onConfirmSelection) {
      onClose();
      return;
    }
    const selectedItem =
      currentSelectedId && currentSelectedId !== NEW_CARD_ID
        ? debitCards.find((c) => c.payment_method_id === currentSelectedId) ?? null
        : null;
    onConfirmSelection(selectedItem);
    onClose();
  }, [currentSelectedId, debitCards, onClose, onConfirmSelection]);

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

          <View style={{ marginTop: theme.spacing.xl }}>
            <Pressable
              onPress={() => setDebitExpanded((s) => !s)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.lg,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <AppIcon.DebitCard width={24} height={24} color={theme.colors.primary} />
              <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                <CustomText variant="h4" size={16} fontWeight="semiBold" fontFamily="poppins">
                  Debit Card
                </CustomText>
              </View>
              {debitExpanded ? (
                <AppIcon.ChevronDown width={24} height={24} color={theme.colors.primary} />
              ) : (
                <AppIcon.ChevronRight width={24} height={24} color={theme.colors.primary} />
              )}
            </Pressable>

            {debitExpanded ? (
              <View style={{ marginTop: theme.spacing.md }}>
                {isLoading || isFetching ? (
                  <View style={{ paddingVertical: theme.spacing.md }}>
                    <ActivityIndicator color={theme.colors.primary} />
                  </View>
                ) : null}

                {isError ? (
                  <Pressable
                    onPress={() => refetch()}
                    style={{
                      padding: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.lg,
                    }}
                  >
                    <CustomText variant="body" fontWeight="semiBold">
                      Failed to load cards. Tap to retry.
                    </CustomText>
                  </Pressable>
                ) : null}

                {!isLoading && !isError ? (
                  <View>
                    {debitCards.map(renderCardRow)}
                    <View style={{ height: theme.spacing.md }} />
                    {renderNewCardRow()}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            <Button onPress={handleConfirm}>Pay</Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AddNewCardPlaceholderModal;
