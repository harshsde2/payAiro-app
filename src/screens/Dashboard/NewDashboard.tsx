import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../styles/ThemeContext";
import { useTheme as useNewUITheme } from "@new-ui/styles/ThemeContext";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import DashboardHeader from "@new-ui/components/common-components/DashboardHeader";
import DashboardCardWrapper from "new-ui/components/common-components/DashboardCardWrapper";
import CryptoAssetsList from "@new-ui/components/common-components/CryptoAssetsList";
import DashboardBalanceCard from "new-ui/components/common-components/DashboardBalanceCard";
import EmailVerificationBanner from "new-ui/components/common-components/EmailVerificationBanner/EmailVerificationBanner";
import {
  useCryptoAssetsListData,
  usePaymentTransactionHistory,
  useUserCryptoMarketList,
} from "query/hooks/useCrypto";
import { useStateStablecoin } from "hooks/useStateStablecoin";
import RecentActivityCard, {
  isTradeActivity,
} from "@new-ui/components/common-components/RecentActivityCard";
import DashboardSection from "tsx-components/DashboardSection";
import GlassyWrapper from "new-ui/components/common-components/GlassyWrapper";
import CustomText from "new-ui/components/common-components/CustomText";
import { AppIcon } from "new-ui/assets/svgs";
import IconWithNameContainer from "@new-ui/components/common-components/IconWithNameContainer";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { navigateFromRecentActivity } from "query/utils/navigateFromRecentActivity";
import { isCashOnRampActivity } from "new-ui/components/common-components/RecentActivityCard/types";
import {
  getUserContactAvatar,
  getUserContactDisplayName,
  getUserContactSendIdentifier,
  IUserContact,
  useUserContacts,
} from "query/hooks/useContact";

const DASHBOARD_AUTO_REFRESH_MIN_MS = 45_000;
const DASHBOARD_RECENT_CONTACTS_LIMIT = 4;

const getContactInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const NewDashboard = () => {
  const { theme } = useTheme();
  const { theme: newUITheme } = useNewUITheme();
  const navigation = useNavigation<any>();
  const { width: screenWidth } = useWindowDimensions();
  const CARD_GAP = 12;
  const CARD_WIDTH = screenWidth - 30;
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const lastAutoRefreshAtRef = useRef(0);
  const didSkipFirstFocusRef = useRef(false);

  const handleCardScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveCardIndex(Math.round(x / (CARD_WIDTH + CARD_GAP)));
  };

  const {
    data: balances = [],
    isMarketLoading: isLoading,
    isRefetchingCrypto,
    refetchMarket,
    refetchBalance,
  } = useCryptoAssetsListData("USD");

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    isRefetching: isHistoryRefetching,
    refetch: refetchHistory,
  } = usePaymentTransactionHistory({ scope: "all", limit: 20 });
  const { data: marketRows = [] } = useUserCryptoMarketList("USD");

  // Registered-state stablecoin (TX → DAI, others → USDC): the Dashboard's "Payairo Balance".
  const stateStablecoin = useStateStablecoin();
  const stablecoinBalance = useMemo(() => {
    const row = balances.find(
      (b) => String(b.asset ?? "").toUpperCase() === stateStablecoin
    );
    return Number(row?.usd_value_available ?? 0);
  }, [balances, stateStablecoin]);

  const {
    data: userContactsData,
    isLoading: isContactsLoading,
    isRefetching: isContactsRefetching,
    refetch: refetchUserContacts,
  } = useUserContacts();

  const refreshAll = useCallback(() => {
    return Promise.allSettled([
      refetchMarket(),
      refetchBalance(),
      refetchHistory(),
      refetchUserContacts(),
    ]);
  }, [refetchMarket, refetchBalance, refetchHistory, refetchUserContacts]);

  const throttledAutoRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastAutoRefreshAtRef.current < DASHBOARD_AUTO_REFRESH_MIN_MS) {
      return;
    }
    lastAutoRefreshAtRef.current = now;
    void refreshAll();
  }, [refreshAll]);

  useFocusEffect(
    useCallback(() => {
      if (!didSkipFirstFocusRef.current) {
        didSkipFirstFocusRef.current = true;
        return;
      }
      throttledAutoRefresh();
    }, [throttledAutoRefresh])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        throttledAutoRefresh();
      }
    });
    return () => sub.remove();
  }, [throttledAutoRefresh]);

  const listRefreshing =
    isRefetchingCrypto || isHistoryRefetching || isContactsRefetching;

  const priceByCurrency = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of marketRows) {
      const key = (row.asset ?? "").toUpperCase();
      const price = row.usd_price;
      if (key && typeof price === "number" && Number.isFinite(price)) {
        map.set(key, price);
      }
    }
    return map;
  }, [marketRows]);

  const recentActivityItems = historyResponse?.data?.items ?? [];
  const savedContacts = userContactsData?.contacts?.slice(0, DASHBOARD_RECENT_CONTACTS_LIMIT) ?? [];

  const handleRecentContactPress = useCallback(
    (contact: IUserContact) => {
      const sender = getUserContactSendIdentifier(contact);
      if (!sender) return;
      navigation.navigate(NAVIGATION_SCREENS.NEW_SEND as never, {
        requested: false,
        sender,
      });
    },
    [navigation]
  );

  const renderSavedContactIcon = useCallback(
    (contact: IUserContact) => {
      const avatar = getUserContactAvatar(contact);
      if (avatar) {
        return (
          <Image
            source={{ uri: avatar }}
            style={{ width: "100%", height: "100%", borderRadius: 100 }}
          />
        );
      }
      const displayName = getUserContactDisplayName(contact);
      return (
        <CustomText
          variant="body"
          fontWeight="semiBold"
          color={newUITheme.colors.white}
        >
          {getContactInitials(displayName)}
        </CustomText>
      );
    },
    [newUITheme.colors.white]
  );

  const CARD_DATA = [
    {
      title: 'Claim Your',
      subTitle: 'First-Time Offer!',
      description: 'Transfer money to abroad effortlessly & get rewards.',
      icon: <AppIcon.PayairoOffer />,
    },

    {
      title: 'Start with your',
      subTitle: 'First Transaction!',
      description: 'Add your Debit/Credit card and start transferring money to abroad effortlessly!',
      icon: <AppIcon.CreditOffer />,
    },
  ]

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["top"]}
      scrollable
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={listRefreshing}
            onRefresh={refreshAll}
            tintColor={newUITheme.colors.tertiary}
          />
        ),
      }}
      contentStyle={{ flexGrow: 1, paddingBottom: 80, alignItems: 'center' }}
      gradient="linear"
      gradientColors={[
        newUITheme.colors.greenLight2,
        newUITheme.colors.greenLight2,
        newUITheme.colors.white,
        newUITheme.colors.greenLight2,
        newUITheme.colors.greenLight1,
        newUITheme.colors.tertiary,
        newUITheme.colors.greenLight1,
        newUITheme.colors.greenLight2,
        newUITheme.colors.white,
      ]}
      gradientStart={{ x: 1, y: 1 }}
      gradientEnd={{ x: 0, y: 0 }}
    >
      <DashboardHeader
        style={{
          marginBottom: theme.spacing.spacing.md,
          marginHorizontal: 15,
        }}
      />

      <EmailVerificationBanner />

      {/* Keep commented dashboard widgets for future enablement */}
      {/* <NewDashboardCard /> */}
      <DashboardBalanceCard
        title="Payairo Balance"
        subtitle="This is your Stablecoin balance"
        balance={stablecoinBalance}
        isRefreshing={isRefetchingCrypto}
        onRefreshBalance={async () => {
          await Promise.all([refetchMarket(), refetchBalance()]);
        }}
      />
      {/* <MemoizedDashboardSection title="Your Accounts" /> */}

      <View style={{ marginVertical: 15, width: screenWidth }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          onScroll={handleCardScroll}
          scrollEventThrottle={16}
          style={{ height: 135 }}
          contentContainerStyle={{ paddingHorizontal: 15, gap: CARD_GAP }}
        >
          {CARD_DATA.map((item, index) => (
            <GlassyWrapper
              style={{ height: 130, width: CARD_WIDTH }}
              borderRadius={newUITheme.radius.xl}
              blurAmount={25}
              blurType='regular'
              overlayOpacity={0.12}
              borderWidth={1}
              borderColor={newUITheme.colors.white}
              key={index}
            >
              <View style={{ flex: 1, alignSelf: 'stretch' }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
                  <View style={{ width: 90, alignItems: 'center' }}>
                    {item.icon}
                  </View>
                  <View style={{ flex: 1, paddingLeft: 12 }}>
                    <CustomText variant="h5" size={16} fontWeight='semiBold'>{item.title}</CustomText>
                    <CustomText variant="h5" size={16} fontWeight='semiBold'>{item.subTitle}</CustomText>
                    <CustomText variant='caption' size={12} fontWeight='regular' color={newUITheme.colors.greyDark}>{item.description}</CustomText>
                  </View>
                </View>
                <CustomText
                  variant='caption'
                  size={11}
                  fontWeight='regular'
                  color={newUITheme.colors.greyDark}
                  style={{ position: 'absolute', bottom: 8, right: 14 }}
                >
                  {index + 1}/{CARD_DATA.length}
                </CustomText>
              </View>
            </GlassyWrapper>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8 }}>
          {CARD_DATA.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeCardIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === activeCardIndex ? newUITheme.colors.tertiary : 'rgba(0,0,0,0.15)',
              }}
            />
          ))}
        </View>
      </View>

      <DashboardCardWrapper style={{ marginTop: theme.spacing.spacing.md }}>
        <View style={{ width: "100%", padding: 5 }}>
          <DashboardSection
            title="Contacts"
            actionText="See all"
            onActionPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_CONTACTS_SCREEN as never)}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 16, paddingVertical: 4 }}>
              <IconWithNameContainer
                name="Add Contact"
                iconSize={56}
                icon={<AppIcon.Add width={56} height={56} />}
                onPress={() =>
                  navigation.navigate(NAVIGATION_SCREENS.NEW_ADD_CONTACT_SCREEN as never)
                }
              />
              {isContactsLoading ? (
                <View style={{ justifyContent: "center", paddingHorizontal: 12 }}>
                  <ActivityIndicator color={newUITheme.colors.tertiary} />
                </View>
              ) : (
                savedContacts.map((contact, index) => {
                  const contactKey = String(contact.id ?? contact.username ?? index);
                  const displayName = getUserContactDisplayName(contact);
                  return (
                    <IconWithNameContainer
                      key={contactKey}
                      name={displayName}
                      iconSize={56}
                      icon={renderSavedContactIcon(contact)}
                      onPress={() => handleRecentContactPress(contact)}
                    />
                  );
                })
              )}
            </ScrollView>
          </DashboardSection>
          { recentActivityItems.length > 0 && (
          <DashboardSection
            title="Recent Activities"
            actionText="See all"
            onActionPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_ACTIVITY_SCREEN as never)}
          >
            {isHistoryLoading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator color={newUITheme.colors.tertiary} />
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {recentActivityItems.slice(0, 4).map((item) => {
                  let usdForRow: number | undefined;
                  const activityType = String(item.activity ?? "").toUpperCase();
                  if (isTradeActivity(item)) {
                    const isSell =
                      item.activity === "TRADE_SELL" || item.tradeType === "sell";
                    if (isSell) {
                      const k = (item.cryptoCurrencyCode ?? "").toUpperCase();
                      usdForRow = k ? priceByCurrency.get(k) : undefined;
                    } else {
                      const spendCode = (item.amountCurrencyCode ?? "").toUpperCase();
                      const fiat = (item.fiatCurrencyCode ?? "USD").toUpperCase();
                      if (spendCode && spendCode !== fiat && spendCode !== "USD") {
                        usdForRow = priceByCurrency.get(spendCode);
                      }
                    }
                  } else if (!isCashOnRampActivity(item)) {
                    const isSendActivity = activityType === "SEND";
                    if (!isSendActivity) {
                      const assetKey = ((item as any).currency ?? item.chain ?? "")
                        .toString()
                        .toUpperCase();
                      usdForRow = assetKey ? priceByCurrency.get(assetKey) : undefined;
                    }
                  }
                  return (
                    <RecentActivityCard
                      key={item.id}
                      item={item}
                      usdPrice={usdForRow}
                      onPress={(selected) => {
                        navigateFromRecentActivity(selected, navigation);
                      }}
                    />
                  );
                })}
              </View>
            )}
          </DashboardSection>
          )}
          <DashboardSection title="Crypto">
            <CryptoAssetsList data={balances.slice(0, 5)} isLoading={isLoading} />
          </DashboardSection>
        </View>
      </DashboardCardWrapper>
    </ScreenWrapper>
  );
};

export default NewDashboard;
