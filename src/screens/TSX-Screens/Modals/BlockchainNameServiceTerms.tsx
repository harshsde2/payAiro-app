import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import { useTheme } from "../../../styles/ThemeContext";
import CustomText from "../../../tsx-components/CustomText";
import GenericButton from "../../../components/GenericButton";
import { NAVIGATION_SCREENS } from "../../../navigations/navigationConstants";

interface RouteParams {
  serviceType: "ens" | "sns";
  onAgreeCallback: () => void;
}

const BlockchainNameServiceTerms = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { serviceType, onAgreeCallback } = params || {};

  const [isAgreed, setIsAgreed] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const screenHeight = Dimensions.get("window").height;
  const maxModalHeight = screenHeight * 0.5;
  const headerHeight = 60;
  const padding = theme.spacing.spacing[5] * 2;
  const buttonHeight = 60;
  const scrollViewHeight =
    maxModalHeight - headerHeight - padding - buttonHeight - 20;

  const serviceName =
    serviceType === "ens"
      ? "Ethereum Name Service (ENS)"
      : "Solana Name Service (SNS)";
  const networkName = serviceType === "ens" ? "Ethereum" : "Solana";

  const termsContent = [
    {
      heading: `Important Notice: ${serviceName} Transfer`,
      text: `You are about to send funds to a ${serviceName} address. This address will be resolved to a ${networkName} blockchain wallet address.`,
    },
  ];

  const handleClose = () => {
    navigation.goBack();
  };

  const handleAgree = async () => {
    if (isProcessing) return;
    
    if (isAgreed && onAgreeCallback) {
      setIsProcessing(true);
      try {
        // Call the callback and wait for it to complete
        await onAgreeCallback();
        // Navigate back after callback completes
        navigation.goBack();
      } catch (error) {
        // Reset processing state on error so user can retry
        setIsProcessing(false);
      }
    } else if (!isAgreed) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles(theme).modalOverlay}>
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={handleClose}
      />
      <View
        style={[
          styles(theme, screenHeight).modalContainer,
          { maxHeight: maxModalHeight },
        ]}
      >
        <View style={styles(theme).headerContainer}>
          <CustomText
            variant="h3"
            fontWeight="bold"
            color={theme.colors.text.primary}
            style={styles(theme).title}
          >
            Terms and Conditions
          </CustomText>
        </View>

        <ScrollView
          style={[styles(theme).scrollView, { height: scrollViewHeight }]}
          showsVerticalScrollIndicator={false}
        >
          <CustomText
            variant="body1"
            color={theme.colors.palette.green700}
            style={styles(theme).serviceNameText}
          >
            {serviceName}
          </CustomText>

          {termsContent.map((item, index) => (
            <View key={index} style={styles(theme).termItem}>
              <CustomText
                variant="h4"
                fontWeight="semiBold"
                color={theme.colors.palette.grey900}
                style={styles(theme).termHeading}
              >
                {item.heading}
              </CustomText>
              <CustomText
                variant="body2"
                color={theme.colors.palette.grey700}
                style={styles(theme).termText}
              >
                {item.text}
              </CustomText>
            </View>
          ))}
        </ScrollView>

        <GenericButton
          title="I Agree"
          cStyle={[
            styles(theme).continueButton,
            (!isAgreed || isProcessing) && styles(theme).continueButtonDisabled,
          ]}
          onPress={handleAgree}
          disabled={!isAgreed || isProcessing}
        />
      </View>
    </View>
  );
};

const styles = (theme: any, screenHeight?: number) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "90%",
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      paddingHorizontal: theme.spacing.spacing[5],
      paddingBottom: theme.spacing.spacing[5],
      paddingTop: theme.spacing.spacing[2],
      justifyContent: "flex-start",
      flexDirection: "column",
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
    },
    scrollView: {
      width: "100%",
    },
    serviceNameText: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: theme.spacing.spacing[3],
      textAlign: "center",
    },
    termItem: {
      marginBottom: theme.spacing.spacing[4],
    },
    termHeading: {
      fontSize: 16,
      marginBottom: theme.spacing.spacing[2],
    },
    termText: {
      fontSize: 14,
      lineHeight: 20,
    },
    continueButton: {
      marginTop: theme.spacing.spacing[5],
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
  });

export default BlockchainNameServiceTerms;
