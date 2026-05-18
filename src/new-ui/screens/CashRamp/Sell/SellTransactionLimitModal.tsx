import React from "react";
import { Modal, Pressable, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { sellCashRampStyles } from "@new-ui/styles/screens/cashRamp/sellCashRampStyles";
import {
  SELL_TX_LIMIT_BODY,
  SELL_TX_LIMIT_BUTTON,
  SELL_TX_LIMIT_TITLE,
} from "./sellFlowCopy";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

const SellTransactionLimitModal: React.FC<Props> = ({ visible, onDismiss }) => {
  const { theme } = useTheme();
  const styles = sellCashRampStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.modalOverlay} onPress={onDismiss}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <CustomText variant="h3" fontWeight="bold" color={theme.colors.text} style={styles.modalTitle}>
            {SELL_TX_LIMIT_TITLE}
          </CustomText>
          <CustomText variant="body" color={theme.colors.text} style={styles.modalBody}>
            {SELL_TX_LIMIT_BODY}
          </CustomText>
          <Button onPress={onDismiss}>{SELL_TX_LIMIT_BUTTON}</Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SellTransactionLimitModal;
