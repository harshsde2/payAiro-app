import React from "react";
import { View, Modal, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../styles/ThemeContext";
import { CustomText } from "../../tsx-components";
import { SvgIcons } from "../../constants/svgs";

interface ILocationUnavailableModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const LocationUnavailableModal: React.FC<ILocationUnavailableModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { theme } = useTheme();

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles(theme).modalOverlay}
        onPress={onClose}
      >
        <Pressable
          style={styles(theme).modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles(theme).contentContainer}>
            <Pressable onPress={onClose} style={styles(theme).closeButton}>
              <CustomText variant="body2" fontWeight="bold" style={{ color: theme.colors.palette.grey900 }}>
                X
              </CustomText>
            </Pressable>
            <View style={styles(theme).messageContainer}>
              <CustomText
                variant="h4"
                fontWeight="semiBold"
                style={styles(theme).titleText}
              >
                Service Unavailable
              </CustomText>
              <CustomText
                variant="body1"
                style={styles(theme).messageText}
              >
                This service is not available in your location.
              </CustomText>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: theme.spacing.spacing[4] || 16,
      width: "85%",
      maxWidth: 400,
      padding: theme.spacing.spacing[5] || 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    contentContainer: {
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: -10,
      right: -10,
      padding: theme.spacing.spacing[1] || 4,
      zIndex: 1,
    },
    messageContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.spacing[2] || 8,
    },
    titleText: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.spacing[3] || 12,
      textAlign: "center",
    },
    messageText: {
      color: theme.colors.text.secondary,
      textAlign: "center",
      lineHeight: 22,
    },
  });

export default LocationUnavailableModal;
