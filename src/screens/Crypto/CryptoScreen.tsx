import React, { useState, useCallback, useMemo } from "react";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import useSelectorAction from "../../hooks/useSelectorAction";
import { useGlobalStyles } from "styles/GlobalStyles";
import { Theme, useTheme } from "styles";
import { StyleSheet, TouchableOpacity, View, FlatList, Image } from "react-native";
import { SvgUri } from "react-native-svg";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import { CustomText } from "tsx-components";
import { useGetCrypto } from "query/hooks";
import { SvgIcons } from "constants/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useNavigation } from "@react-navigation/native";
import { ICryptoItem, ITab } from "./types";


const TABS: ITab[] = [
  {
    id: 0,
    title: "Buy",
  },
  {
    id: 1,
    title: "Sell",
  },
];

// Memoized crypto logo component
const CryptoLogo = React.memo<{ logo?: string }>(({ logo }) => {
  if (!logo) return null;
  
  if (logo.toLowerCase().endsWith(".svg")) {
    return <SvgUri uri={logo} width={30} height={30} />;
  }
  
  return (
    <Image
      source={{ uri: logo }}
      style={{ width: 30, height: 30 }}
      resizeMode="contain"
    />
  );
});

CryptoLogo.displayName = "CryptoLogo";

export default function CryptoScreen() {
  const { tokens } = useSelectorAction();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...custonStyles(theme) };
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState<ITab>(TABS[0]);

  const { data, isPending, isFetched, isSuccess, isError, isFetching } =
    useGetCrypto();

  // Memoized styles to prevent recreation on every render
  const tabContainerStyle = useMemo(
    () => ({
      width: "100%" as const,
      backgroundColor: theme.colors.palette.green150,
      flexDirection: "row" as const,
      borderRadius: theme.spacing.spacing[5],
    }),
    [theme.colors.palette.green150, theme.spacing.spacing]
  );

  const cryptoItemStyle = useMemo(
    () => ({
      width: "100%" as const,
      borderRadius: theme.spacing.spacing[3],
      backgroundColor: theme.colors.palette.grey150,
      padding: 10,
      flexDirection: "row" as const,
      marginVertical: 5,
      borderColor: theme.colors.palette.grey300,
      borderWidth: 1 / 2,
      alignItems: "center" as const,
    }),
    [theme.spacing.spacing, theme.colors.palette]
  );

  const contentContainerStyle = useMemo(
    () => ({
      flex: 1,
      paddingHorizontal: 10,
      justifyContent: "center" as const,
      flexDirection: "row" as const,
      alignItems: "center" as const,
    }),
    []
  );

  // Memoized tab press handler
  const handleTabPress = useCallback((tab: ITab) => {
    setSelectedTab(tab);
  }, []);

  // Memoized keyExtractor for better list performance
  const keyExtractor = useCallback((item: ICryptoItem) => item.symbol, []);

  // Memoized renderItem to prevent re-renders
  const renderCryptoItem = useCallback(
    ({ item }: { item: ICryptoItem }) => {
      const isBuyTab = selectedTab.id === 0;
      const price = isBuyTab ? item.buy_price : item.sell_price;
      const navigationScreen = isBuyTab
        ? NAVIGATION_SCREENS.CRYPTO_BUY
        : NAVIGATION_SCREENS.CRYPTO_SELL;

      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(navigationScreen, {
              details: item,
            });
          }}
          style={cryptoItemStyle}
        >
          <CryptoLogo logo={item?.logo} />
          <View style={contentContainerStyle}>
            <View style={{ flex: 1 }}>
              <CustomText variant={"subtitle2"}>{item?.symbol}</CustomText>
            </View>
            <View>
              <CustomText variant={"subtitle2"}>{`$${price}`}</CustomText>
            </View>
          </View>
          <SvgIcons.ChevronRight />
        </TouchableOpacity>
      );
    },
    [
      selectedTab.id,
      navigation,
      cryptoItemStyle,
      contentContainerStyle,
    ]
  );

  // Memoized loading view
  const loadingView = useMemo(
    () => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomText variant="body2">Please wait....</CustomText>
      </View>
    ),
    []
  );

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle leftIcon={"true"} title={"Crypto"} rightIcon={""} />
      {/* <View style={[styles.textInputAndFilterContainer]}>
        <View style={[styles.testInputContainer]}>
          <CustomSearchTextInput
            placeholder="Search Name or PayAiro tag..."
            placeholderTextColor={theme.colors.palette.green700}
            onChangeText={(e) => {
              setSearchText(e);
            }}
            value={searchText}
          />
        </View>
      </View> */}
      <View style={[styles.whiteSheetContainer]}>
        <View style={tabContainerStyle}>
          {TABS.map((tab, index) => {
            const isSelected = selectedTab.id === index;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  {
                    width: "50%",
                    borderRadius: theme.spacing.spacing[5],
                    paddingVertical: theme.spacing.spacing[2],
                    backgroundColor: isSelected
                      ? theme.colors.palette.green700
                      : theme.colors.palette.green150,
                  },
                ]}
                onPress={() => handleTabPress(tab)}
              >
                <CustomText
                  color={
                    isSelected
                      ? theme.colors.palette.white
                      : theme.colors.palette.green700
                  }
                  size={14}
                  style={{ textAlign: "center" }}
                  variant="subtitle1"
                >
                  {tab.title}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ flex: 1, marginTop: 10 }}>
          {isFetching && loadingView}
          {isSuccess && (
            <FlatList
              data={data?.data}
              keyExtractor={keyExtractor}
              renderItem={renderCryptoItem}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={5}
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const custonStyles = (theme: Theme) =>
  StyleSheet.create({
    textInputAndFilterContainer: {
      width: "100%",
      flex: 1,
      maxHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    testInputContainer: {
      flex: 1,
      marginRight: 10,
    },
  });

