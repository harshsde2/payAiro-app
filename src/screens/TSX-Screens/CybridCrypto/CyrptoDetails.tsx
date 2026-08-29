import React, { useLayoutEffect, useMemo, useState } from "react";
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
import { useTheme } from "@new-ui/styles/ThemeContext";
import CustomText from "tsx-components/CustomText";
import { SvgIcons } from "constants/svgs";
import CryptoChart from "./CryptoChart";
import DashboardSection from "tsx-components/DashboardSection";
import { CryptoRouteParams } from "services/coingecko/types";
import {
  CHART_PERIOD_ORDER,
  useUserCryptoChart,
  useWalletAddresses,
  type ChartPeriodTab,
} from "query/hooks/useCrypto";
import { findWalletRowForSymbol } from "utils/findWalletRowForSymbol";
import { SvgUri } from "react-native-svg";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { getCryptoDisplayTitle } from "utils/cryptoDisplayName";
import {
  navigateToSellCashRampFlow,
  type SellCashRampEntryParams,
} from "@new-ui/screens/CashRamp/Sell";
import { SellTradeMethodPickerModal } from "@new-ui/components/common-components/AddBalance";

const CyrptoDetails: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const [sellMethodPickerVisible, setSellMethodPickerVisible] = useState(false);

  const routeParams = route.params as { item: CryptoRouteParams } | undefined;
  const cryptoItem = routeParams?.item as any;
  const currency = String(cryptoItem?.asset || "").toUpperCase();

  // View-only tokens (e.g. SOL/XRP before first buy): the market API marks them
  // `tradable: false` and supplies a user-facing explanation. Shown until the user's
  // first buy flips it tradable (API-driven — no client state).
  const isViewOnly = cryptoItem?.tradable === false;
  const viewOnlyMessage = String(cryptoItem?.view_only_description ?? "").trim();

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

  const { data: walletResponse } = useWalletAddresses();
  const matchedWallet = useMemo(
    () =>
      findWalletRowForSymbol(
        walletResponse?.walletAddresses,
        cryptoItem?.asset
      ),
    [walletResponse?.walletAddresses, cryptoItem?.asset]
  );

  const chartData = chartResponse?.chartData ?? [];
  const currentPrice = chartResponse?.latestPrice ?? Number(cryptoItem?.usd_price ?? 0);
  const priceChange =
    chartData.length > 1 && chartData[0]?.y
      ? ((chartData[chartData.length - 1].y - chartData[0].y) / chartData[0].y) *
        100
      : 0;

  const fromWalletList = String(matchedWallet?.walletAddress ?? "").trim();
  const fromRouteItem = String((cryptoItem as any)?.sourceWalletAddress ?? "").trim();
  const resolvedSourceWallet = (fromWalletList || fromRouteItem) || undefined;

  const sellEntryParams = useMemo<SellCashRampEntryParams>(
    () => ({
      cryptoCurrencyCode: String(cryptoItem?.asset || "").toUpperCase(),
      chain: String((cryptoItem as any)?.chain || matchedWallet?.chain || "ETH").toUpperCase(),
      fiatCurrencyCode: "USD",
      sourceWalletAddress: resolvedSourceWallet,
      platformAvailableCrypto: Number(cryptoItem?.platform_available ?? 0),
      usdUnitPrice: Number(currentPrice || 0),
      cryptoDisplayName: getCryptoDisplayTitle(
        cryptoItem?.asset,
        cryptoItem?.name ?? cryptoItem?.currency_name
      ),
      logo: cryptoItem?.logo ?? null,
    }),
    [cryptoItem, matchedWallet?.chain, currentPrice, resolvedSourceWallet]
  );

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <ScreenWrapper
        safeArea
        safeAreaEdges={["bottom"]}
        padding={16}
        backgroundColor={theme.colors.background}
      >
        <ActivityIndicator size="large" color={"#3499E0" /* Coinme brand blue, not themed */} />
      </ScreenWrapper>
    );
  }

  if (!cryptoItem) {
    return (
      <ScreenWrapper
        safeArea
        safeAreaEdges={["bottom"]}
        padding={16}
        backgroundColor={theme.colors.background}
      >
        <View
          style={{
            alignItems: "center",
          }}
        >
          <CustomText
            size={16}
            color={theme.colors.text}
            style={{
              textAlign: "center",
              marginBottom: theme.spacing.base,
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
        backgroundColor={theme.colors.background}
      >
        <View
          style={{
            alignItems: "center",
          }}
        >
          <CustomText
            size={16}
            color={theme.colors.text}
            style={{
              textAlign: "center",
              marginBottom: theme.spacing.base,
            }}
          >
            Failed to load crypto chart data
          </CustomText>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              backgroundColor: "#3499E0" /* Coinme brand blue, not themed */,
              paddingHorizontal: theme.spacing.base,
              paddingVertical: theme.spacing.sm,
              borderRadius: 8,
            }}
          >
            <CustomText size={14} color={theme.colors.onPrimary}>
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
            color={theme.colors.text}
          >
            {item.name}
          </CustomText>
          <CustomText size={14} color={theme.colors.textSecondary}>
            {item?.balance}
          </CustomText>
        </View>
        <View style={styles.balanceValue}>
          <CustomText
            fontWeight="bold"
            size={16}
            color={theme.colors.text}
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
    chain: String(
      (cryptoItem as any)?.chain || matchedWallet?.chain || "ETH"
    ).toUpperCase(),
    logo: cryptoItem?.logo,
    fiatCurrency: "USD",
    currentPrice: Number(currentPrice || 0),
    platformAvailable: Number(cryptoItem?.platform_available ?? 0),
    sourceWalletAddress: resolvedSourceWallet,
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
      route: NAVIGATION_SCREENS.NEW_SEND,
      params: {
        preselectedAsset: cryptoAsset,
      },
    },
    {
      label: "Sell",
      icon: SvgIcons.NewSellIcon,
      route: "",
      params: {},
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
      backgroundColor={theme.colors.background}
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
                color={theme.colors.text}
              >
                ${Number(currentPrice || 0).toFixed(2)}
              </CustomText>
            </View>
          </View>
        </View>

        {/* View-only notice (tradable === false) */}
        {isViewOnly && viewOnlyMessage ? (
          <View style={styles.viewOnlyCard}>
            <CustomText
              fontWeight="bold"
              size={14}
              color={theme.colors.primary}
              style={styles.viewOnlyTitle}
            >
              Available for viewing only
            </CustomText>
            <CustomText
              size={13}
              color={theme.colors.textSecondary}
              style={styles.viewOnlyText}
            >
              {viewOnlyMessage}
            </CustomText>
          </View>
        ) : null}

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <CryptoChart
            priceData={chartData}
            currentPrice={currentPrice}
            priceChange={priceChange}
            lineColor={
              priceChange >= 0
                ? theme.colors.primary
                : theme.colors.error
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
              <TouchableOpacity
                onPress={() => {
                  if (button.label === "Sell") {
                    setSellMethodPickerVisible(true);
                    return;
                  }
                  navigation.navigate(button?.route, button?.params as any);
                }}
                key={index}
                style={styles.actionButton}
              >
                {button?.label != "Sell" ? (
                  <Icon />
                ) : (
                  <View style={styles.actionButtonIcon}>
                    <Icon width={24} height={24} />
                  </View>
                )}
                <CustomText
                  size={12}
                  color={theme.colors.text}
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

        <SellTradeMethodPickerModal
          visible={sellMethodPickerVisible}
          onClose={() => setSellMethodPickerVisible(false)}
          onSelectCash={() => {
            void navigateToSellCashRampFlow(navigation, sellEntryParams);
          }}
          onSelectDebit={() => {
            navigation.navigate(NAVIGATION_SCREENS.ENTER_AMOUNT, {
              tradeMode: "sell",
              cryptoAsset,
            });
          }}
        />
    </ScreenWrapper>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    wrapperScrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing['2xl'],
    },
    priceSection: {
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
      paddingBottom: theme.spacing.sm,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: theme.spacing.xs,
    },
    chartSection: {
      minHeight: 280,
      paddingHorizontal: theme.spacing.base,
      marginVertical: theme.spacing.base,
    },
    viewOnlyCard: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primaryLight,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    viewOnlyTitle: {
      marginBottom: theme.spacing.xs,
    },
    viewOnlyText: {
      lineHeight: 19,
    },
    actionButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: theme.colors.primaryLight,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: 16,
      marginBottom: theme.spacing.base,
    },
    actionButton: {
      alignItems: "center",
      flex: 1,
    },
    actionButtonIcon: {
      width: 50,
      height: 50,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    actionButtonLabel: {
      marginTop: theme.spacing.xs,
    },
    balanceCard: {
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    balanceCardGreen: {
      borderColor: theme.colors.primaryLight,
      backgroundColor: theme.colors.surfaceElevated,
    },
    balanceCardGrey: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
    },
    balanceCardContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    balanceIconContainer: {
      marginRight: theme.spacing.md,
    },
    balanceInfo: {
      flex: 1,
    },
    balanceValue: {
      alignItems: "flex-end",
    },
  });

export default CyrptoDetails;
