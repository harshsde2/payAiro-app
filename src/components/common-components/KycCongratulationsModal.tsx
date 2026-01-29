import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { useTheme } from "styles/ThemeContext";
import GenericButton from "components/GenericButton";
import Fonts from "constants/Fonts";
import { SvgIcons } from "constants/svgs";

interface IKycCongratulationsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const KycCongratulationsModal: React.FC<IKycCongratulationsModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <SvgIcons.DoneIcon width={48} height={48} />
          </View>
          <Text style={styles.headerText}>Congratulations!</Text>
          <Text style={styles.descriptionText}>
            Your KYC verification has been approved. You now have full access to all features of the PayAiro app.
          </Text>
          <GenericButton
            title="Continue"
            cStyle={styles.buttonStyle}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: theme.colors.palette.white,
      width: "90%",
      borderRadius: 30,
      padding: 24,
      elevation: 8,
      alignItems: "center",
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.palette.green700 || "#E8F5E9",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      marginTop: 10,
    },
    headerText: {
      fontSize: 24,
      fontFamily: Fonts.bold,
      color: theme.colors.palette.grey900 || "rgba(29, 29, 29, 1)",
      textAlign: "center",
      marginBottom: 16,
    },
    descriptionText: {
      fontSize: 14,
      fontFamily: Fonts.regular,
      color: theme.colors.palette.grey600 || "grey",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    buttonStyle: {
      marginTop: 8,
      width: "100%",
    },
  });

export default KycCongratulationsModal;
