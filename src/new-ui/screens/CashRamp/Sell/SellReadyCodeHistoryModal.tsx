import React from "react";
import { Modal, Pressable } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { sellReadyCodeStyles } from "@new-ui/styles/screens/cashRamp/sellReadyCodeStyles";
import { SELL_HISTORY_MODAL, SELL_I_UNDERSTAND } from "./sellFlowCopy";

type Props = {
  visible: boolean;
  onAcknowledge: () => void;
};

const HISTORY_PARAGRAPHS_FALLBACK = [
  "Click on the link sent to you by email in order to access your ReadyCode at any time.",
  "Simply tap on your most recent sell for cash transaction in your transaction history to display your most recent ReadyCode.",
] as const;

const HISTORY_PARAGRAPHS: readonly string[] =
  SELL_HISTORY_MODAL?.paragraphs?.length
    ? [...SELL_HISTORY_MODAL.paragraphs]
    : [...HISTORY_PARAGRAPHS_FALLBACK];

const HISTORY_TITLE =
  SELL_HISTORY_MODAL?.title ?? "Find your ReadyCode in your transaction history";

const SellReadyCodeHistoryModal: React.FC<Props> = ({ visible, onAcknowledge }) => {
  const { theme } = useTheme();
  const styles = sellReadyCodeStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAcknowledge}>
      <Pressable style={styles.darkModalOverlay}>
        <Pressable style={styles.darkModalCard} onPress={(e) => e.stopPropagation()}>
          <CustomText variant="h3" fontWeight="bold" style={styles.darkModalTitle}>
            {HISTORY_TITLE}
          </CustomText>
          {HISTORY_PARAGRAPHS.map((paragraph, index) => {
            const isLast = index === HISTORY_PARAGRAPHS.length - 1;
            return (
              <CustomText
                key={index}
                variant="body"
                style={[
                  styles.darkModalBody,
                  index > 0 ? { marginTop: theme.spacing.md } : null,
                  isLast ? styles.darkModalBodyLast : null,
                ]}
              >
                {paragraph}
              </CustomText>
            );
          })}
          <Button onPress={onAcknowledge} style={styles.darkModalButton}>
            {SELL_I_UNDERSTAND}
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SellReadyCodeHistoryModal;
