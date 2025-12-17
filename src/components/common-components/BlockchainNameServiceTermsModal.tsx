import React, { useState } from "react";
import { View, Modal, Pressable, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../styles/ThemeContext";
import CustomText from "../../tsx-components/CustomText";
import { SvgIcons } from "../../constants/svgs";
import GenericButton from "../GenericButton";
import Fonts from "../../constants/Fonts";

interface IBlockchainNameServiceTermsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAgree: () => void;
  serviceType: 'ens' | 'sns';
}

const BlockchainNameServiceTermsModal: React.FC<IBlockchainNameServiceTermsModalProps> = ({
  isVisible,
  onClose,
  onAgree,
  serviceType,
}) => {
  const { theme } = useTheme();
  const [isAgreed, setIsAgreed] = useState(true);

  const serviceName = serviceType === 'ens' ? 'Ethereum Name Service (ENS)' : 'Solana Name Service (SNS)';
  const networkName = serviceType === 'ens' ? 'Ethereum' : 'Solana';

  const termsContent = [
    {
      heading: `Important Notice: ${serviceName} Transfer`,
      text: `You are about to send funds to a ${serviceName} address. This address will be resolved to a ${networkName} blockchain wallet address.`,
    },
    // {
    //   heading: "Understanding Blockchain Name Services",
    //   text: `• ${serviceName} addresses are human-readable names that resolve to blockchain wallet addresses.\n• The recipient will receive funds on the ${networkName} network.\n• Ensure the recipient has access to the ${networkName} wallet associated with this ${serviceType.toUpperCase()} address.`,
    // },
    // {
    //   heading: "Transaction Risks",
    //   text: `• Once sent, transactions on the ${networkName} blockchain are irreversible.\n• Verify the ${serviceType.toUpperCase()} address belongs to the intended recipient.\n• Double-check the address before confirming the transaction.\n• PayAiro is not responsible for funds sent to incorrect addresses.`,
    // },
    // {
    //   heading: "Network Fees",
    //   text: `• Transactions on the ${networkName} network may incur gas/transaction fees.\n• These fees are separate from any PayAiro transaction fees.\n• Fees will be deducted from your account balance.`,
    // },
    // {
    //   heading: "Your Responsibility",
    //   text: `By proceeding, you acknowledge that:\n• You understand the risks associated with blockchain transactions.\n• You have verified the ${serviceType.toUpperCase()} address belongs to the intended recipient.\n• You accept that transactions cannot be reversed once confirmed on the blockchain.\n• You are responsible for any losses due to incorrect addresses.`,
    // },
  ];

  const handleAgree = () => {
    if (isAgreed) {
      onAgree();
      setIsAgreed(false); // Reset for next time
    }
  };

  const handleClose = (e: any) => {
    
    // e.preventDefault();
    setIsAgreed(false);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles(theme).modalOverlay}
        onPress={(e) => handleClose(e)}
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
              Terms and Conditions
            </CustomText>
            {/* <Pressable onPress={handleClose} style={styles(theme).closeButton}>
              <SvgIcons.CrossIcon width={44} height={44} />
            </Pressable> */}
          </View>

          <ScrollView
            style={styles(theme).scrollView}
            showsVerticalScrollIndicator={false}
          >
            <CustomText
              variant="body1"
              style={styles(theme).serviceNameText}
            >
              {serviceName}
            </CustomText>

            {termsContent.map((item, index) => (
              <View key={index} style={styles(theme).termItem}>
                <CustomText
                  variant="h4"
                  fontWeight="semiBold"
                  style={styles(theme).termHeading}
                >
                  {item.heading}
                </CustomText>
                <CustomText
                  variant="body2"
                  style={styles(theme).termText}
                >
                  {item.text}
                </CustomText>
              </View>
            ))}
          </ScrollView>

          {/* <View style={styles(theme).checkboxContainer}>
            <TouchableOpacity
              style={styles(theme).checkboxRow}
              onPress={() => setIsAgreed(!isAgreed)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles(theme).checkbox,
                  isAgreed && styles(theme).checkboxChecked,
                ]}
              >
                {isAgreed && (
                  <SvgIcons.DoneIcon width={16} height={16} />
                )}
              </View>
              <CustomText
                variant="body2"
                style={styles(theme).checkboxLabel}
              >
                I have read and agree to the terms and conditions
              </CustomText>
            </TouchableOpacity>
          </View> */}

          <GenericButton
            title="I Agree"
            cStyle={[
              styles(theme).continueButton,
              !isAgreed && styles(theme).continueButtonDisabled,
            ]}
            onPress={handleAgree}
            disabled={!isAgreed}
          />
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
      flex: 1,
      width: "90%",
      maxHeight: "35%",
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      paddingHorizontal: theme.spacing.spacing[5],
      paddingBottom: theme.spacing.spacing[5],
      paddingTop: theme.spacing.spacing[2],
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: 'center',
      alignItems: "center",
      // backgroundColor: "red",
    },
    title: {
      // flex: 1,
      fontSize: 20,
    },
    closeButton: {
      // padding: theme.spacing.spacing[1],
    },
    scrollView: {
      flex: 1,
      // maxHeight: 400,
    },
    // scrollContent: {
    //   flexGrow: 1,
    //   paddingBottom: theme.spacing.spacing[2],
    // },
    serviceNameText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.palette.green700,
      marginBottom: theme.spacing.spacing[3],
      textAlign: "center",
    },
    termItem: {
      marginBottom: theme.spacing.spacing[4],
    },
    termHeading: {
      fontSize: 16,
      marginBottom: theme.spacing.spacing[2],
      color: theme.colors.palette.grey900,
    },
    termText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.palette.grey700,
    },
    checkboxContainer: {
      marginTop: theme.spacing.spacing[4],
      marginBottom: theme.spacing.spacing[3],
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: theme.colors.palette.grey400,
      borderRadius: 4,
      marginRight: theme.spacing.spacing[2],
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: theme.colors.palette.green700,
      borderColor: theme.colors.palette.green700,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.palette.grey900,
    },
    continueButton: {
      marginTop: theme.spacing.spacing[5],
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
  });

export default BlockchainNameServiceTermsModal;

