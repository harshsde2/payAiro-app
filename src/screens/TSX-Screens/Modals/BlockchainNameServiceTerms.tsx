import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import { useTheme } from "@new-ui/styles/ThemeContext";
import CustomText from "../../../tsx-components/CustomText";
import GenericButton from "../../../components/GenericButton";
import { NAVIGATION_SCREENS } from "../../../navigations/navigationConstants";
import { useContentData } from "../../../query/hooks/useAPIAuth";

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
  const [openingLinkIndex, setOpeningLinkIndex] = useState<number | null>(null);
  const { data: contentDataResponse, isLoading, isError,error } = useContentData();
  
  console.log("contentDataResponse =>", JSON.stringify(error, null, 2));
  const screenHeight = Dimensions.get("window").height;
  const maxModalHeight = 340;
  const headerHeight = 60;
  const padding = theme.spacing.lg * 2;
  const buttonHeight = 60;
  const scrollViewHeight =
    maxModalHeight - headerHeight - padding - buttonHeight - 20;

  const serviceName =
    serviceType === "ens"
      ? "Ethereum Name Service (ENS)"
      : "Solana Name Service (SNS)";
  const networkName = serviceType === "ens" ? "Ethereum" : "Solana";

  const termsContent = useMemo(() => {
    if (contentDataResponse?.data?.data && contentDataResponse.data.data.length > 0) {
      return contentDataResponse.data.data.map((item) => ({
        heading: item.heading1,
        text: item.description,
        link: item.link,
      }));
    }
    // Fallback to default content if API data is not available
    return [
      {
        heading: `Important Notice: ${serviceName} Transfer`,
        text: `You are about to send funds to a ${serviceName} address. This address will be resolved to a ${networkName} blockchain wallet address.`,
        link: undefined,
      },
    ];
  }, [contentDataResponse, serviceName, networkName]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleAgree =  () => {
    if (isProcessing) return;
    
    if (isAgreed && onAgreeCallback) {
      setIsProcessing(true);
      try {
        // Call the callback and wait for it to complete
       onAgreeCallback();
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

  const handleOpenLink = async (link: string, index: number) => {
    if (!link) return;
    
    try {
      setOpeningLinkIndex(index);
      const canOpen = await Linking.canOpenURL(link);
      
      if (canOpen) {
        await Linking.openURL(link);
      } else {
        Alert.alert("Error", "Unable to open this link. Please check the URL.");
      }
    } catch (error) {
      console.error("Error opening link:", error);
      Alert.alert("Error", "Failed to open link. Please try again.");
    } finally {
      // Small delay to show loading indicator
      setTimeout(() => {
        setOpeningLinkIndex(null);
      }, 500);
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
        <ScrollView
          style={[styles(theme).scrollView, { height: scrollViewHeight }]}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles(theme).loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : isError ? (
            <View style={styles(theme).errorContainer}>
              <CustomText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles(theme).termText}
              >
                Failed to load content. Please try again.
              </CustomText>
            </View>
          ) : (
            termsContent.map((item, index) => (
              <View key={index} style={styles(theme).termItem}>
                <CustomText
                  variant="h3"
                  fontWeight="semiBold"
                  color={theme.colors.text}
                  style={styles(theme).termHeading}
                >
                  {item.heading}
                </CustomText>
                <View style={styles(theme).textContainer}>
                  <CustomText
                    variant="body2"
                    color={theme.colors.textSecondary}
                    style={styles(theme).termText}
                  >
                    {item.text}
                  </CustomText>
                  {item.link && (
                    <TouchableOpacity
                      onPress={() => handleOpenLink(item.link, index)}
                      disabled={openingLinkIndex === index}
                      activeOpacity={0.7}
                      style={styles(theme).linkTouchable}
                    >
                      {openingLinkIndex === index ? (
                        <View style={styles(theme).linkLoadingContainer}>
                          <ActivityIndicator
                            size="small"
                            color={theme.colors.primary}
                          />
                          <CustomText
                            variant="body2"
                            color={theme.colors.primary}
                            fontWeight="medium"
                            style={styles(theme).linkText}
                          >
                            {" "}Opening...
                          </CustomText>
                        </View>
                      ) : (
                        <CustomText
                          variant="body2"
                          color={theme.colors.primary}
                          fontWeight="medium"
                          style={styles(theme).linkText}
                        >
                          {" "}Learn more
                        </CustomText>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
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
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 16,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
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
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    termItem: {
      marginBottom: theme.spacing.base,
      justifyContent:'center',
      alignItems: "center",
    },
    termHeading: {
      fontSize: 16,
      marginBottom: theme.spacing.sm,
    },
    textContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
    },
    termText: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
    },
    continueButton: {
      marginTop: theme.spacing.lg,
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
    },
    errorContainer: {
      paddingVertical: theme.spacing.lg,
    },
    linkTouchable: {
      marginLeft: 4,
    },
    linkText: {
      fontSize: 14,
      textDecorationLine: "underline",
    },
    linkLoadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default BlockchainNameServiceTerms;
