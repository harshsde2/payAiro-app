import React from "react";
import { View, Modal, Pressable, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../styles/ThemeContext";
import CustomText from "../../tsx-components/CustomText";
import { SvgIcons } from "../../constants/svgs";

interface IHowToEarnPointsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const pointsInstructions = [
  "Earn 2 points for every $1 on crypto buy and sell transactions.",
  "Points are earned on all eligible crypto buy and sell transactions.",
  "Use your points to unlock scratch vouchers.",
  "Scratch each voucher to reveal a reward.",
  "Rewards are added directly to your PayAiro account.",
  "Rewards can be used for eligible crypto buy and sell transactions.",
  "Users can earn up to $100 in total rewards.",
  "Points have no cash value until redeemed.",
  "Terms of Service apply.",
];

const HowToEarnPointsModal: React.FC<IHowToEarnPointsModalProps> = ({
  isVisible,
  onClose,
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
          <View style={styles(theme).headerContainer}>
            <CustomText
              variant="h3"
              fontWeight="bold"
              style={styles(theme).title}
            >
              How to Earn points:
            </CustomText>
            <Pressable onPress={onClose} style={styles(theme).closeButton}>
              <SvgIcons.CrossIcon width={54} height={54} />
            </Pressable>
          </View>
          <ScrollView
            style={styles(theme).scrollView}
            contentContainerStyle={styles(theme).scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {pointsInstructions.map((instruction, index) => (
              <View key={index} style={styles(theme).listItem}>
                <CustomText
                  variant="body1"
                  fontWeight="semiBold"
                  style={styles(theme).numberText}
                >
                  {index + 1}.
                </CustomText>
                <CustomText
                  variant="body1"
                  style={styles(theme).instructionText}
                >
                  {instruction}
                </CustomText>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "90%",
      maxHeight: "80%",
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      padding: theme.spacing.spacing[5],
      justifyContent: "flex-start",
      flexDirection: "column",
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[4],
    },
    title: {
      flex: 1,
      fontSize: 20,
    },
    closeButton: {
      padding: theme.spacing.spacing[1],
    },
    scrollView: {
      flexGrow: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.spacing[2],
    },
    listItem: {
      flexDirection: "row",
      marginBottom: theme.spacing.spacing[3],
      alignItems: "flex-start",
    },
    numberText: {
      marginRight: theme.spacing.spacing[2],
      minWidth: 24,
      fontSize: 14,
    },
    instructionText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 24,
    },
  });

export default HowToEarnPointsModal;

