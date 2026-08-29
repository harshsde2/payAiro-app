import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyPurchaseInstructionsModalStyles } from "@new-ui/styles/screens/cashRamp/cashBuyPurchaseInstructionsModalStyles";
import { SELL_CLOSE, SELL_PICKUP_MODAL } from "./sellFlowCopy";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const PICKUP_STEPS: readonly string[] = [...SELL_PICKUP_MODAL.steps];

const SellCashPickupInstructionsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const styles = cashBuyPurchaseInstructionsModalStyles(theme);

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
              {SELL_PICKUP_MODAL.title}
            </CustomText>
            <View style={styles.listBox}>
              {PICKUP_STEPS.map((line, i) => (
                <CustomText
                  key={i}
                  variant="body"
                  color={theme.colors.onPrimary}
                  style={styles.bullet}
                >
                  {`${i + 1}. ${line}`}
                </CustomText>
              ))}
            </View>
            <CustomText variant="caption" color={theme.colors.onPrimary} style={styles.footer}>
              {SELL_PICKUP_MODAL.footer}
            </CustomText>
          </ScrollView>
          <View style={styles.actions}>
            <Button onPress={onClose}>{SELL_CLOSE}</Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SellCashPickupInstructionsModal;
