import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenContainer from "HOC/ScreenContainer";
import HeaderTitle from "components/HeaderTitle";
import { useTheme } from "styles";
import CustomText from "tsx-components/CustomText";
import { SvgIcons } from "constants/svgs";
import CryptoChart from "./CryptoChart";
import { ICryptoBalance, IRecentActivity, ICryptoDetails } from "./types";
import DashboardSection from "tsx-components/DashboardSection";
import {
  getCoinGeckoId,
  formatLargeNumber,
  formatSupply,
} from "services/coingecko/mapping";
import { CryptoRouteParams } from "services/coingecko/types";
import { useCryptoMarketData } from "query/hooks";
import UnifiedTransactionCard from "../UnifiedTransactions/UnifiedTransactionCard";
import { SvgUri } from "react-native-svg";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const CyrptoDetails: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [cryptoData, setCryptoData] = useState<ICryptoDetails | null>(null);
  const [chartData, setChartData] = useState<
    Array<{ x: number; y: number; date?: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0); // Key to force re-fetch
  const navigation = useNavigation<any>();

  const routeParams = route.params as { item: CryptoRouteParams } | undefined;
  const cryptoItem = routeParams?.item;
    // console.log("cryptoItem =>", JSON.stringify(cryptoItem, null, 2));

  // Get CoinGecko ID from asset
  const coinGeckoId = cryptoItem ? getCoinGeckoId(cryptoItem.asset) : null;
//   console.log("coinGeckoId =>", coinGeckoId);
  // Fetch market data using the hook - only when coinGeckoId is available
  const {
    data: cryptoMarketData,
    isLoading: isMarketDataLoading,
    error: marketDataError,
  } = useCryptoMarketData("usd", coinGeckoId || "bitcoin");

//   console.log("cryptoMarketData =>", JSON.stringify(cryptoMarketData, null, 2));
  // Transform market data when it's available
  useEffect(() => {
    if (!cryptoItem) {
      setError("No crypto data provided");
      setIsLoading(false);
      return;
    }

    if (isMarketDataLoading) {
      setIsLoading(true);
      return;
    }

    // Handle response format - API returns direct array, not wrapped in { data: [...] }
    let marketDataArray: any[] = [];

    if (Array.isArray(cryptoMarketData)) {
      // Direct array response (what we're getting)
      marketDataArray = cryptoMarketData;
    } else if (cryptoMarketData?.data && Array.isArray(cryptoMarketData.data)) {
      // Wrapped in ApiResponse format (fallback)
      marketDataArray = cryptoMarketData.data;
    }

    if (marketDataError || !marketDataArray || marketDataArray.length === 0) {
      setError("Failed to fetch market data");
      setIsLoading(false);
      return;
    }

    try {
      const marketData = marketDataArray[0]; // Get first item from array

      // Transform market data to ICryptoDetails format
      const transformedData: ICryptoDetails = {
        name: marketData.name,
        symbol: marketData.symbol.toUpperCase(),
        currentPrice: marketData.current_price,
        priceChange: marketData.price_change_percentage_24h || 0,
        about: `${
          marketData.name
        } (${marketData.symbol.toUpperCase()}) is a cryptocurrency with a current market cap of ${formatLargeNumber(
          marketData.market_cap
        )}. The price has changed ${
          marketData.price_change_percentage_24h >= 0 ? "+" : ""
        }${marketData.price_change_percentage_24h.toFixed(
          2
        )}% in the last 24 hours.`,
        balances: [
          {
            id: "1",
            name: marketData.name,
            symbol: marketData.symbol.toUpperCase(),
            availableBalance: cryptoItem.platform_available,
            pendingBalance:
              cryptoItem?.platform_balance - cryptoItem?.platform_available,
            quantity: cryptoItem?.rounded_balance.toFixed(8),
            value: `$${marketData.current_price.toFixed(2)}`,
            changePercentage: marketData.price_change_percentage_24h || 0,
          },
        ],
        info: {
          marketCap: formatLargeNumber(marketData.market_cap),
          marketVol: formatLargeNumber(marketData.total_volume),
          totalVol: formatLargeNumber(marketData.total_volume),
          circulatingSupply: formatSupply(marketData.circulating_supply),
          allTimeHigh: `$${marketData.ath.toFixed(2)}`,
          allTimeLow: `$${marketData.atl.toFixed(2)}`,
          fullyDiluted: formatLargeNumber(marketData.fully_diluted_valuation),
          tokenDecimal: "8", // Default, can be updated if available
        },
        recentActivity: [], // Empty for now, can be populated from another source
      };

      setCryptoData(transformedData);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error transforming crypto data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process crypto data"
      );
      setIsLoading(false);
    }
  }, [
    cryptoMarketData,
    isMarketDataLoading,
    marketDataError,
    cryptoItem,
    retryKey,
  ]);

  const styles = createStyles(theme);

  if (isLoading || isMarketDataLoading) {
    return (
      <ScreenContainer
        style={{
          paddingHorizontal: 0,
        }}
      >
        <HeaderTitle title="Loading..." leftIcon={"left-arrow"} isBack={true} />
        <ActivityIndicator size="large" color={theme.colors.palette.blue500} />
      </ScreenContainer>
    );
  }

  if (error || !cryptoData) {
    return (
      <ScreenContainer
        style={{
          paddingHorizontal: 0,
        }}
      >
        <HeaderTitle title="Error" leftIcon={"left-arrow"} />
        <View
          style={{
            paddingHorizontal: theme.spacing.spacing[4],
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
            {error || "Failed to load crypto data"}
          </CustomText>
          {error && error.includes("timeout") && (
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setIsLoading(true);
                // Retry by incrementing retryKey to trigger useEffect
                setRetryKey((prev: number) => prev + 1);
              }}
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
          )}
        </View>
      </ScreenContainer>
    );
  }

  const renderBalanceItem = ({ item }: { item: ICryptoBalance }) => (
    <View
      style={[
        styles.balanceCard,
        item.changePercentage > 0
          ? styles.balanceCardGreen
          : styles.balanceCardGrey,
      ]}
    >
      <View style={styles.balanceCardContent}>
        <View style={styles.balanceIconContainer}>
        {cryptoItem?.logo?.toLowerCase?.().endsWith(".svg") ? (
              <SvgUri uri={cryptoItem?.logo} width={30} height={30} />
            ) : (
              <Image
                source={{ uri: cryptoItem?.logo }}
                style={{ width: 30, height: 30 }}
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
            {item.availableBalance} Available | {item.pendingBalance} Pending
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
          <CustomText
            size={14}
            color={
              item.changePercentage > 0
                ? theme.colors.palette.green600
                : theme.colors.palette.red500
            }
          >
            {item.changePercentage > 0 ? "+" : ""}
            {item.changePercentage.toFixed(2)}%
          </CustomText>
        </View>
      </View>
    </View>
  );

  const renderInfoItem = (item: any) => {
    const Icon = item?.icon;
    const label = item?.label;
    const value = item?.value;
    const index = item?.index;
    return (
      <View key={index} style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
          <Icon width={40} height={40} />
        </View>
        <View style={{ gap: theme.spacing.spacing[1], flex: 1 }}>
          <CustomText
            fontWeight="bold"
            size={16}
            color={theme.colors.text.primary}
          >
            {value}
          </CustomText>
          <CustomText size={12} color={"#838383"}>
            {label}
          </CustomText>
        </View>
      </View>
    );
  };

  const renderActivityItem = ({
    item,
    index,
  }: {
    item: IRecentActivity;
    index: number;
  }) => <UnifiedTransactionCard transaction={item as any} key={index} />;

  const actionButtons = [
    { label: "Buy", icon: SvgIcons.NewDollarIcon ,route: NAVIGATION_SCREENS.CRYPTO_BUY },
    { label: "Receive", icon: SvgIcons.NewReceiveIcon ,route: NAVIGATION_SCREENS.CRYPTO_RECEIVE },
    { label: "Send", icon: SvgIcons.NewSendIcon ,route: NAVIGATION_SCREENS.CRYPTO_SEND },
    { label: "Sell", icon: SvgIcons.NewSellIcon ,route: NAVIGATION_SCREENS.CRYPTO_SELL },
  ];

  const infoItems = [
    {
      label: "Market Cap",
      value: cryptoData.info.marketCap,
      icon: SvgIcons.MarketCap,
      index: 0,
    },
    {
      label: "Market Vol",
      value: cryptoData.info.marketVol,
      icon: SvgIcons.MarketValue,
      index: 1,
    },
    {
      label: "All Time High",
      value: cryptoData.info.allTimeHigh,
      icon: SvgIcons.AllTimeHigh,
      index: 2,
    },
    {
      label: "Fully Diluted",
      value: cryptoData.info.fullyDiluted,
      icon: SvgIcons.FullyDiluted,
      index: 3,
    },
    {
      label: "Total Vol.",
      value: cryptoData.info.totalVol,
      icon: SvgIcons.MarketValue,
      index: 4,
    },
    {
      label: "Circulating Supply",
      value: cryptoData.info.circulatingSupply,
      icon: SvgIcons.CirculatingSupply,
      index: 5,
    },
    {
      label: "All Time Low",
      value: cryptoData.info.allTimeLow,
      icon: SvgIcons.AllTimeLow,
      index: 6,
    },
    {
      label: "Token Decimal",
      value: cryptoData.info.tokenDecimal,
      icon: SvgIcons.TokenDecimal,
      index: 7,
    },
  ];

  const aboutText = showFullAbout
    ? cryptoData.about
    : `${cryptoData.about.substring(0, 150)}...`;

  return (
    <ScreenContainer
      style={{
        paddingHorizontal: 0,
        paddingTop: 0,
      }}
    >
      <HeaderTitle title={cryptoData.name} leftIcon={"left-arrow"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Price Section */}
        <View
          style={{
            // backgroundColor: "red",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
            {cryptoItem?.logo?.toLowerCase?.().endsWith(".svg") ? (
              <SvgUri uri={cryptoItem?.logo} width={30} height={30} />
            ) : (
              <Image
                source={{ uri: cryptoItem?.logo }}
                style={{ width: 30, height: 30 }}
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
                ${cryptoData.currentPrice.toFixed(2).split(".")[0]}
              </CustomText>
              <CustomText
                fontWeight="bold"
                size={24}
                color={theme.colors.text.tertiary}
              >
                .{cryptoData.currentPrice.toFixed(2).split(".")[1]}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Chart Section
        {chartData.length > 0 && (
          <View style={styles.chartSection}>
            <CryptoChart
              priceData={chartData}
              currentPrice={cryptoData.currentPrice}
              priceChange={cryptoData.priceChange}
              lineColor={
                cryptoData.priceChange >= 0
                  ? theme.colors.palette.green600
                  : theme.colors.palette.red500
              }
              fillArea={true}
            />
          </View>
        )} */}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {actionButtons.map((button, index) => {
            const Icon = button?.icon;
            return (
              <TouchableOpacity onPress={() => {
                navigation.navigate(button?.route, {
                    details: {symbol: cryptoItem?.asset, logo: cryptoItem?.logo, buy_price: cryptoData?.currentPrice, sell_price: cryptoData?.currentPrice},
                });
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
            data={cryptoData.balances}
            renderItem={renderBalanceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </DashboardSection>
        {/* Info Section */}
        <DashboardSection title="Info">
          <View style={styles.infoGrid}>
            {infoItems.map((item, index) => renderInfoItem(item))}
          </View>
        </DashboardSection>

        {/* About Section */}
        <DashboardSection title="About">
          <CustomText
            size={14}
            color={theme.colors.text.secondary}
            style={styles.aboutText}
          >
            {aboutText}
          </CustomText>
          <TouchableOpacity onPress={() => setShowFullAbout(!showFullAbout)}>
            <CustomText
              size={14}
              color={theme.colors.palette.blue500}
              style={styles.showMoreLink}
            >
              {showFullAbout ? "Show less" : "Show more"}
            </CustomText>
          </TouchableOpacity>
        </DashboardSection>

        {/* Recent Activity Section */}
        {cryptoData?.recentActivity?.length > 0 && (   
        <DashboardSection
          title="Recent Activity"
          actionText="see all"
          onActionPress={() => {}}
        >
          <FlatList
            data={cryptoData?.recentActivity}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </DashboardSection>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
    },
    scrollContent: {
      paddingBottom: theme.spacing.spacing[8],
      paddingHorizontal: theme.spacing.spacing[4],
      //   backgroundColor:'red',
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
    section: {
      paddingHorizontal: theme.spacing.spacing[4],
      marginBottom: theme.spacing.spacing[6],
    },
    sectionTitle: {
      marginBottom: theme.spacing.spacing[3],
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[3],
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
    cryptoIconPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.palette.blue500,
    },
    balanceInfo: {
      flex: 1,
    },
    balanceValue: {
      alignItems: "flex-end",
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: "#EFEFEF",
      borderRadius: 16,
      padding: theme.spacing.spacing[4],
    },
    infoItem: {
      width: "48%",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      padding: theme.spacing.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: "#F3FBF4",
      //   marginBottom: theme.spacing.spacing[2],
      gap: theme.spacing.spacing[2],
    },
    infoIconContainer: {
      marginBottom: theme.spacing.spacing[1],
    },
    infoIconPlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.palette.green400,
    },
    aboutText: {
      lineHeight: 20,
      marginBottom: theme.spacing.spacing[1],
    },
    showMoreLink: {
      marginTop: theme.spacing.spacing[1],
    },
    activityCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.palette.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      padding: theme.spacing.spacing[3],
      marginBottom: theme.spacing.spacing[2],
    },
    activityIconContainer: {
      marginRight: theme.spacing.spacing[3],
    },
    activityIconPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.palette.grey300,
    },
    activityInfo: {
      flex: 1,
    },
  });

export default CyrptoDetails;
