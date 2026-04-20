import React, { useState } from "react";
import { Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../styles/ThemeContext";
import { useTheme as useNewUITheme } from "@new-ui/styles/ThemeContext";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import DashboardHeader from "@new-ui/components/common-components/DashboardHeader";
import DashboardCardWrapper from "new-ui/components/common-components/DashboardCardWrapper";
import CryptoAssetsList from "@new-ui/components/common-components/CryptoAssetsList";
import DashboardBalanceCard from "new-ui/components/common-components/DashboardBalanceCard";
import { useCryptoAssetsListData } from "query/hooks/useCrypto";
import DashboardSection from "tsx-components/DashboardSection";
import GlassyWrapper from "new-ui/components/common-components/GlassyWrapper";
import CustomText from "new-ui/components/common-components/CustomText";
import { AppIcon } from "new-ui/assets/svgs";
import IconWithNameContainer from "@new-ui/components/common-components/IconWithNameContainer";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const NewDashboard = () => {
  const { theme } = useTheme();
  const { theme: newUITheme } = useNewUITheme();
  const navigation = useNavigation<any>();
  const { width: screenWidth } = useWindowDimensions();
  const CARD_GAP = 12;
  const CARD_WIDTH = screenWidth - 30;
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const handleCardScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveCardIndex(Math.round(x / (CARD_WIDTH + CARD_GAP)));
  };

  const { data: balances = [], isMarketLoading: isLoading } =
    useCryptoAssetsListData("USD");


  const CONTACTS_DATA = [
    { id: 'add', name: 'Add Contact', avatar: null },
    { id: '1', name: 'Kevin', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: '2', name: 'Lyda', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: '3', name: 'Marry', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
    { id: '4', name: 'Evelyn', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  ];

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

      {/* Keep commented dashboard widgets for future enablement */}
      {/* <NewDashboardCard /> */}
      <DashboardBalanceCard userId={"123"} bankBalance={{ platform_balance: 100, platform_available: 100, bank_account: { usd: 100 } }} aggregatedCryptoBalances={{ usd_value_available: 100 }} />
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
              {CONTACTS_DATA.map((contact) => (
                <IconWithNameContainer
                  key={contact.id}
                  name={contact.name}
                  iconSize={56}
                  icon={
                    contact.avatar === null
                      ? <AppIcon.Add width={56} height={56} />
                      : <Image source={{ uri: contact.avatar }} style={{ width: '100%', height: '100%', borderRadius: 100 }} />
                  }
                  onPress={() => { }}
                />
              ))}
            </ScrollView>
          </DashboardSection>
          <DashboardSection title="Crypto">
            <CryptoAssetsList data={balances.slice(0, 5)} isLoading={isLoading} />
          </DashboardSection>
        </View>
      </DashboardCardWrapper>
    </ScreenWrapper>
  );
};

export default NewDashboard;
