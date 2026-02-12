import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Theme, useTheme } from "styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { CustomText } from "tsx-components";
import DashboardSection from "tsx-components/DashboardSection";
import { SvgIcons } from "constants/svgs";
import { showError } from "utils/toast";
import { IPaymentApp } from "./types";

const PAYMENT_APPS: IPaymentApp[] = [
  {
    id: "paypal",
    name: "PayPal",
    deepLink: "paypal://",
  },
  {
    id: "venmo",
    name: "Venmo",
    deepLink: "venmo://",
  },
  {
    id: "bank_of_america",
    name: "Bank of America",
    deepLink: "bankofamerica://",
  },
];

const getPaymentAppIcon = (id: IPaymentApp["id"]) => {
  switch (id) {
    case "paypal":
      return <SvgIcons.PayPal width={24} height={24} />;
    case "venmo":
      return <SvgIcons.Venmo width={24} height={24} />;
    case "bank_of_america":
      return <SvgIcons.BankOfAmerica width={24} height={24} />;
    default:
      return <SvgIcons.DollarCircleIcon width={24} height={24} />;
  }
};

const PaymentAppList: React.FC = () => {
  const { theme } = useTheme();
  const styles = paymentAppListStyles(theme);

  const handleAppPress = async (app: IPaymentApp) => {
    try {
      const canOpen = await Linking.canOpenURL(app.deepLink);

      if (!canOpen) {
        showError(`${app.name} is not installed on this device.`);
        return;
      }

      Alert.alert(
        "Choose payment app",
        `You will be redirected to ${app.name} to continue this process.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: async () => {
              try {
                await Linking.openURL(app.deepLink);
              } catch {
                showError("Unable to open app. Please try again.");
              }
            },
          },
        ]
      );
    } catch {
      showError(`${app.name} is not installed on this device.`);
      return;
    }
  };

  return (
    <ScreenContainer scrollable={false} padding={0}>
      <HeaderTitle title="Choose payment app" leftIcon="true" />
      <View style={styles.whiteSheetContainer}>
        <DashboardSection title="Available payment apps">
          {PAYMENT_APPS.map((item) => (
            <View key={item.id} style={styles.listItemWrapper}>
              <TouchableOpacity
                style={styles.listItem}
                activeOpacity={0.8}
                onPress={() => handleAppPress(item)}
              >
                <View style={styles.iconContainer}>
                  {getPaymentAppIcon(item.id)}
                </View>
                <CustomText variant="subtitle1" style={styles.appName}>
                  {item.name}
                </CustomText>
                <SvgIcons.ChevronRight />
              </TouchableOpacity>
            </View>
          ))}
        </DashboardSection>
      </View>
    </ScreenContainer>
  );
};

const paymentAppListStyles = (theme: Theme) =>
  StyleSheet.create({
    whiteSheetContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[5],
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[3],
      paddingHorizontal: theme.spacing.spacing[2],
      borderRadius: theme.spacing.spacing[2],
      borderWidth: 0.5,
      borderColor: theme.colors.palette.grey300,
      backgroundColor: theme.colors.palette.grey250,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.palette.white,
    },
    appName: {
      flex: 1,
      marginLeft: theme.spacing.spacing[3],
    },
    listItemWrapper: {
      marginBottom: theme.spacing.spacing[2],
    },
    separator: {
      height: theme.spacing.spacing[2],
    },
  });

export default PaymentAppList;

