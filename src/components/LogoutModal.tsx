import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import GenericButton from "./GenericButton";

interface ILogoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<ILogoutModalProps> = ({
  isVisible,
  onClose,
  onCancel,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <Pressable onPress={onCancel} style={styles(theme).modalContainer}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={styles(theme).modalContent}
        >
          <CustomText variant="h3" style={styles(theme).headerText}>
            Logout
          </CustomText>
          <CustomText
            variant="subtitle1"
            style={styles(theme).descriptionText}
          >
            Sure you want to log out?
          </CustomText>
          <GenericButton
            title="Yes, Logout"
            cStyle={{
              marginTop: theme.spacing.spacing[6],
              paddingHorizontal: theme.spacing.spacing[4],
              minHeight: 48,
            }}
            tStyle={{
              flexShrink: 0,
            }}
            onPress={() => {
              onClose();
            }}
          />
          <GenericButton
            title="Cancel"
            cStyle={{
              backgroundColor: theme.colors.palette.black,
              marginVertical: theme.spacing.spacing[2],
            }}
            tStyle={{ color: theme.colors.palette.white }}
            onPress={onCancel}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LogoutModal;

const styles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: theme.colors.palette.white,
      width: "100%",
      borderTopEndRadius: theme.spacing.spacing[5],
      borderTopStartRadius: theme.spacing.spacing[5],
      padding: theme.spacing.spacing[5],
      elevation: 8,
    },
    headerText: {
      textAlign: "center",
      marginBottom: theme.spacing.spacing[2],
      color: theme.colors.palette.grey900,
    },
    descriptionText: {
      textAlign: "center",
      color: theme.colors.text.secondary || "grey",
    },
  });

