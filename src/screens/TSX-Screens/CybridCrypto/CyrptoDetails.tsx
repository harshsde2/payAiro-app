import React, { useLayoutEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { useTheme } from "styles";
import CustomText from "tsx-components/CustomText";
import { SvgIcons } from "constants/svgs";
import CryptoChart from "./CryptoChart";
import DashboardSection from "tsx-components/DashboardSection";
import { CryptoRouteParams } from "services/coingecko/types";
import {
  CHART_PERIOD_ORDER,
  useUserCryptoChart,
  type ChartPeriodTab,
} from "query/hooks/useCrypto";
import { SvgUri } from "react-native-svg";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { getCryptoDisplayTitle } from "utils/cryptoDisplayName";

const CyrptoDetails: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<any>();

  const routeParams = route.params as { item: CryptoRouteParams } | undefined;
  const cryptoItem = routeParams?.item as any;
  const currency = String(cryptoItem?.asset || "").toUpperCase();

  useLayoutEffect(() => {
    if (!cryptoItem?.asset) {
      navigation.setOptions({ headerTitle: "Crypto" });
      return;
    }
    navigation.setOptions({
      headerTitle: getCryptoDisplayTitle(
        cryptoItem.asset,
        cryptoItem?.name ?? cryptoItem?.currency_name
      ),
    });
  }, [navigation, cryptoItem]);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodTab>("1D");
  const {
    data: chartResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUserCryptoChart(currency, "USD", chartPeriod);

  const chartData = chartResponse?.chartData ?? [];
  const currentPrice = chartResponse?.latestPrice ?? Number(cryptoItem?.usd_price ?? 0);
  const priceChange =
    chartData.length > 1 && chartData[0]?.y
      ? ((chartData[chartData.length - 1].y - chartData[0].y) / chartData[0].y) *
        100
      : 0;

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <ScreenWrapper
        safeArea
        safeAreaEdges={["bottom"]}
        padding={16}
        backgroundColor={theme.colors.palette.white}
      >
        <ActivityIndicator size="large" color={theme.colors.palette.blue500} />
      </ScreenWrapper>
    );
  }

  if (!cryptoItem) {
    return (
      <ScreenWrapper
        safeArea
        safeAreaEdges={["bottom"]}
        padding={16}
        backgroundColor={theme.colors.palette.white}
      >
        <View
          style={{
            alignItems: "center",
          }}
        >
          <CustomText
            size={16}
            color={theme.colors.text.primary}
            style={{
              textAlign: "center",
              marginBottom: theme.spacing.spacing[4],
            }}
          >
            No crypto data provided
          </CustomText>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper
        safeArea
        safeAreaEdges={["bottom"]}
        padding={16}
        backgroundColor={theme.colors.palette.white}
      >
        <View
          style={{
            alignItems: "center",
          }}
        >
          <CustomText
            size={16}
            color={theme.colors.text.primary}
            style={{
              textAlign: "center",
              marginBottom: theme.spacing.spacing[4],
            }}
          >
            Failed to load crypto chart data
          </CustomText>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              backgroundColor: theme.colors.palette.blue500,
              paddingHorizontal: theme.spacing.spacing[4],
              paddingVertical: theme.spacing.spacing[2],
              borderRadius: 8,
            }}
          >
            <CustomText size={14} color={theme.colors.palette.white}>
              Retry
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const renderBalanceItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.balanceCard,
        item?.changePercentage && item?.changePercentage > 0
          ? styles.balanceCardGreen
          : styles.balanceCardGrey,
      ]}
    >
      <View style={styles.balanceCardContent}>
        <View style={styles.balanceIconContainer}>
        {cryptoItem?.logo?.toLowerCase?.().endsWith(".svg") ? (
              <SvgUri uri={cryptoItem?.logo} width={45} height={45} />
            ) : (
              <Image
                source={{ uri: cryptoItem?.logo }}
                style={{ width: 45, height: 45 }}
                resizeMode="contain"
              />
            )}
        </View>
        <View style={styles.balanceInfo}>
          <CustomText
            fontWeight="bold"
            size={16}
            color={theme.colors.text.primary}
          >
            {item.name}
          </CustomText>
          <CustomText size={14} color={theme.colors.text.tertiary}>
            {item?.balance}
          </CustomText>
        </View>
        <View style={styles.balanceValue}>
          <CustomText
            fontWeight="bold"
            size={16}
            color={theme.colors.text.primary}
          >
            {item.value}
          </CustomText>
        </View>
      </View>
    </View>
  );

  // Buy / Sell flow through `EnterAmount` (Confirm → PIN → Result). Trade uses
  // Coinme execute after PIN only (no OTP). Send / Receive use legacy screens.
  const cryptoAsset = {
    asset: String(cryptoItem?.asset || "").toUpperCase(),
    chain: String((cryptoItem as any)?.chain || "ETH").toUpperCase(),
    logo: cryptoItem?.logo,
    fiatCurrency: "USD",
    currentPrice: Number(currentPrice || 0),
    sourceWalletAddress: (cryptoItem as any)?.sourceWalletAddress,
  };

  const actionButtons = [
    {
      label: "Buy",
      icon: SvgIcons.NewDollarIcon,
      route: NAVIGATION_SCREENS.ENTER_AMOUNT,
      params: { tradeMode: "buy" as const, cryptoAsset },
    },
    {
      label: "Receive",
      icon: SvgIcons.NewReceiveIcon,
      route: NAVIGATION_SCREENS.CRYPTO_RECEIVE,
      params: {
        details: {
          symbol: cryptoItem?.asset,
          logo: cryptoItem?.logo,
          buy_price: currentPrice,
          sell_price: currentPrice,
        },
      },
    },
    {
      label: "Send",
      icon: SvgIcons.NewSendIcon,
      route: NAVIGATION_SCREENS.CRYPTO_SEND,
      params: {
        details: {
          symbol: cryptoItem?.asset,
          logo: cryptoItem?.logo,
          buy_price: currentPrice,
          sell_price: currentPrice,
        },
      },
    },
    {
      label: "Sell",
      icon: SvgIcons.NewSellIcon,
      route: NAVIGATION_SCREENS.ENTER_AMOUNT,
      params: { tradeMode: "sell" as const, cryptoAsset },
    },
  ];


    const balanceData = [
        {
          id: "1",
          name: getCryptoDisplayTitle(
            cryptoItem?.asset,
            cryptoItem?.name ?? cryptoItem?.currency_name
          ),
          symbol: cryptoItem?.asset,
          balance: `${cryptoItem?.platform_available} Available`,
          value: `$${currentPrice}`
        },
    ];
  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      padding={16}
      scrollable
      contentStyle={styles.wrapperScrollContent}
      backgroundColor={theme.colors.palette.white}
    >
        {/* Price Section */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
            {cryptoItem?.logo?.toLowerCase?.().endsWith(".svg") ? (
              <SvgUri uri={cryptoItem?.logo} width={45} height={45} />
            ) : (
              <Image
                source={{ uri: cryptoItem?.logo }}
                style={{ width: 45, height: 45 }}
                resizeMode="contain"
              />
            )}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <CustomText
                fontWeight="bold"
                size={36}
                color={theme.colors.text.primary}
              >
                ${Number(currentPrice || 0).toFixed(2)}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <CryptoChart
            priceData={chartData}
            currentPrice={currentPrice}
            priceChange={priceChange}
            lineColor={
              priceChange >= 0
                ? theme.colors.palette.green600
                : theme.colors.palette.red500
            }
            fillArea={true}
            selectedPeriodIndex={CHART_PERIOD_ORDER.indexOf(chartPeriod)}
            onPeriodChange={(index) => {
              const next = CHART_PERIOD_ORDER[index];
              if (next) setChartPeriod(next);
            }}
            chartFetching={isFetching && !isLoading}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {actionButtons.map((button, index) => {
            const Icon = button?.icon;
            return (
              <TouchableOpacity onPress={() => {
                navigation.navigate(button?.route, button?.params as any);
              }} key={index} style={styles.actionButton}>
                {button?.label != "Sell" ? (
                  <Icon />
                ) : (
                  <View style={styles.actionButtonIcon}>
                    <Icon width={24} height={24} />
                  </View>
                )}
                <CustomText
                  size={12}
                  color={theme.colors.text.primary}
                  style={styles.actionButtonLabel}
                >
                  {button.label}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Your Balance Section */}
        <DashboardSection title="Your Balance">
          <FlatList
            data={balanceData}
            renderItem={renderBalanceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </DashboardSection>
    </ScreenWrapper>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    wrapperScrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.spacing[8],
    },
    priceSection: {
      paddingHorizontal: theme.spacing.spacing[4],
      paddingTop: theme.spacing.spacing[4],
      paddingBottom: theme.spacing.spacing[2],
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: theme.spacing.spacing[1],
    },
    chartSection: {
      minHeight: 280,
      paddingHorizontal: theme.spacing.spacing[4],
      marginVertical: theme.spacing.spacing[4],
    },
    actionButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: theme.colors.palette.green100,
      paddingVertical: theme.spacing.spacing[4],
      paddingHorizontal: theme.spacing.spacing[2],
      borderRadius: 16,
      marginBottom: theme.spacing.spacing[4],
    },
    actionButton: {
      alignItems: "center",
      flex: 1,
    },
    actionButtonIcon: {
      width: 50,
      height: 50,
      borderRadius: 28,
      backgroundColor: theme.colors.palette.green650,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[1],
    },
    actionButtonLabel: {
      marginTop: theme.spacing.spacing[1],
    },
    balanceCard: {
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: theme.spacing.spacing[2],
      padding: theme.spacing.spacing[3],
    },
    balanceCardGreen: {
      borderColor: theme.colors.palette.green200,
      backgroundColor: theme.colors.palette.white,
    },
    balanceCardGrey: {
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.palette.white,
    },
    balanceCardContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    balanceIconContainer: {
      marginRight: theme.spacing.spacing[3],
    },
    balanceInfo: {
      flex: 1,
    },
    balanceValue: {
      alignItems: "flex-end",
    },
  });

export default CyrptoDetails;
