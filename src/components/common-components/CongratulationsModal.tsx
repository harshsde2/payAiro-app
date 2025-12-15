import React from "react";
import { View, Modal, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../styles/ThemeContext";
import CustomText from "../../tsx-components/CustomText";
import { SvgIcons } from "../../constants/svgs";

interface ICongratulationsModalProps {
  isVisible: boolean;
  onClose: () => void;
  rewardAmount: number;
}

const CongratulationsModal: React.FC<ICongratulationsModalProps> = ({
  isVisible,
  onClose,
  rewardAmount,
}) => {
  const { theme } = useTheme();

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
            <View style={styles(theme).checkmarkContainer}>
              <SvgIcons.DoneIcon width={40} height={40} />
            </View>
            <CustomText
              variant="h3"
              fontWeight="bold"
              color={theme.colors.palette.green600}
              style={styles(theme).congratulationsText}
            >
              Congratulations!
            </CustomText>
            <View style={styles(theme).rewardBox}>
              <CustomText
                variant="subtitle1"
                color={theme.colors.palette.white}
                style={styles(theme).youWonText}
              >
                You Won
              </CustomText>
              <CustomText
                variant="h1"
                fontWeight="bold"
                color={theme.colors.palette.yellow500}
                style={styles(theme).rewardAmountText}
              >
                ${rewardAmount}
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
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "85%",
      backgroundColor: theme.colors.palette.white,
      borderRadius: 24,
      padding: theme.spacing.spacing[6],
      alignItems: "center",
    },
    contentContainer: {
      width: "100%",
      alignItems: "center",
    },
    checkmarkContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.palette.green600,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[4],
    },
    congratulationsText: {
      marginBottom: theme.spacing.spacing[5],
      fontSize: 24,
    },
    rewardBox: {
      width: "100%",
      backgroundColor: theme.colors.palette.green800,
      borderRadius: 16,
      padding: theme.spacing.spacing[6],
      alignItems: "center",
      justifyContent: "center",
    },
    youWonText: {
      fontSize: 18,
      marginBottom: theme.spacing.spacing[2],
    },
    rewardAmountText: {
      fontSize: 48,
    },
  });

export default CongratulationsModal;

