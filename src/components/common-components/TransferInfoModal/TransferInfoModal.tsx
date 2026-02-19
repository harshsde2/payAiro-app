import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import GenericButton from "components/GenericButton";
import { ITransferInfoModalProps } from "./types";

const TransferInfoModal: React.FC<ITransferInfoModalProps> = ({
  isVisible,
  appName,
  isBankApp = false,
  onContinue,
  onClose,
}) => {
  const { theme } = useTheme();
  const modalStyles = getStyles(theme);

  const descriptionText = isBankApp
    ? `You can add money to your PayAiro account from ${appName}. In ${appName}, use your PayAiro routing number and account number to send the wire transfer or ACH transfer. When you're ready, tap Continue to open ${appName}.`
    : `You can add money to your PayAiro account from ${appName}. In ${appName}, use your PayAiro routing number and account number to send the transfer. When you're ready, tap Continue to open ${appName}.`;

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.modalOverlay} onPress={onClose}>
        <Pressable
          style={modalStyles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <CustomText
            variant="h3"
            fontWeight="bold"
            color={theme.colors.text.primary}
            style={modalStyles.headerText}
          >
            Transfer to PayAiro
          </CustomText>
          <CustomText
            variant="body1"
            color={theme.colors.text.secondary}
            style={modalStyles.descriptionText}
          >
            {descriptionText}
          </CustomText>
          <GenericButton
            title="Continue"
            cStyle={modalStyles.primaryButton}
            onPress={onContinue}
          />
          <TouchableOpacity
            style={modalStyles.cancelButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <CustomText
              variant="button"
              fontWeight="medium"
              color={theme.colors.text.secondary}
            >
              Cancel
            </CustomText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.palette.white,
      width: "90%",
      maxWidth: 400,
      borderRadius: 24,
      padding: theme.spacing.spacing[6],
      elevation: 8,
      shadowColor: theme.colors.palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    headerText: {
      textAlign: "center",
      marginBottom: theme.spacing.spacing[3],
      marginTop: theme.spacing.spacing[2],
    },
    descriptionText: {
      textAlign: "center",
      lineHeight: 22,
      marginBottom: theme.spacing.spacing[5],
    },
    primaryButton: {
      marginBottom: theme.spacing.spacing[3],
      width: "100%",
    },
    cancelButton: {
      width: "100%",
      paddingVertical: theme.spacing.spacing[3],
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
  });

export default TransferInfoModal;
