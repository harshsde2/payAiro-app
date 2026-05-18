import React from "react";
import { Modal, Pressable } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { sellReadyCodeStyles } from "@new-ui/styles/screens/cashRamp/sellReadyCodeStyles";
import { SELL_I_UNDERSTAND, SELL_WAIT_MODAL_BODY, SELL_WAIT_MODAL_TITLE } from "./sellFlowCopy";

type Props = {
  visible: boolean;
  onAcknowledge: () => void;
};

const SellReadyCodeWaitModal: React.FC<Props> = ({ visible, onAcknowledge }) => {
  const { theme } = useTheme();
  const styles = sellReadyCodeStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAcknowledge}>
      <Pressable style={styles.darkModalOverlay} onPress={onAcknowledge}>
        <Pressable style={styles.darkModalCard} onPress={(e) => e.stopPropagation()}>
          <CustomText variant="h3" fontWeight="bold" style={styles.darkModalTitle}>
            {SELL_WAIT_MODAL_TITLE}
          </CustomText>
          <CustomText variant="body" style={styles.darkModalBody}>
            {SELL_WAIT_MODAL_BODY}
          </CustomText>
          <Button onPress={onAcknowledge} style={styles.darkModalButton}>
            {SELL_I_UNDERSTAND}
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SellReadyCodeWaitModal;
