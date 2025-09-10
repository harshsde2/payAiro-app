import React, { useState } from "react";

import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import useSelectorAction from "../../hooks/useSelectorAction";
import { useGlobalStyles } from "styles/GlobalStyles";
import { Theme, useTheme } from "styles";
import { StyleSheet, TouchableOpacity, View, FlatList } from "react-native";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import { CustomText } from "tsx-components";
import { useGetCrypto } from "query/hooks";
import { SvgIcons } from "constants/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useNavigation } from "@react-navigation/native";

const TABS = [
  {
    id: 0,
    title: "Buy",
  },
  {
    id: 1,
    title: "Sell",
  },
];

export default function CryptoScreen() {
  const { tokens } = useSelectorAction();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...custonStyles(theme) };
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState(TABS[0]);

  const { data, isPending, isFetched, isSuccess, isError, isFetching } =
    useGetCrypto();

  // console.log("data ===> ", JSON.stringify(data, null, 2));
  // console.log("data => ", JSON.stringify(isFetching, null, 2));
  return (
    <ScreenContainer padding={0}>
      <HeaderTitle leftIcon={"true"} title={"Crypto"} rightIcon={""} />
      <View style={[styles.textInputAndFilterContainer]}>
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
      </View>
      <View style={[styles.whiteSheetContainer]}>
        <View
          style={{
            width: "100%",
            backgroundColor: theme.colors.palette.green150,
            flexDirection: "row",
            borderRadius: theme.spacing.spacing[5],
          }}
        >
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                {
                  width: "50%",
                  borderRadius: theme.spacing.spacing[5],

                  paddingVertical: theme.spacing.spacing[2],
                  backgroundColor:
                    selectedTab.id == index
                      ? theme.colors.palette.green700
                      : theme.colors.palette.green150,
                },
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <CustomText
                color={
                  selectedTab.id == index
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
          ))}
        </View>
        <View style={[{ flex: 1, marginTop: 10 }]}>
          {isFetching && (
            <View
              style={[
                { flex: 1, justifyContent: "center", alignItems: "center" },
              ]}
            >
              <CustomText variant="body2">Please wait....</CustomText>
            </View>
          )}
          {/* s */}
          {isSuccess && selectedTab.id == 0 && (
            <FlatList
              data={data?.data}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(NAVIGATION_SCREENS.CRYPTO_BUY, {
                      details: item,
                    });
                  }}
                  style={[
                    {
                      width: "100%",
                      borderRadius: theme.spacing.spacing[3],
                      backgroundColor: theme.colors.palette.grey150,
                      padding: 10,
                      flexDirection: "row",
                      marginVertical: 5,
                      borderColor: theme.colors.palette.grey300,
                      borderWidth: 1 / 2,
                      alignItems: "center",
                    },
                  ]}
                >
                  <SvgIcons.Bitcoin />
                  <View
                    style={[
                      {
                        flex: 1,
                        paddingHorizontal: 10,
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <View style={[{ flex: 1 }]}>
                      <CustomText variant={"subtitle2"}>
                        {item?.symbol}
                      </CustomText>
                      <CustomText variant={"caption"}>
                        {item?.symbol.slice(0, 3)}
                      </CustomText>
                    </View>
                    <View style={[{}]}>
                      <CustomText variant={"subtitle2"}>
                        {`$${item?.buy_price}`}
                      </CustomText>
                    </View>
                  </View>
                  <SvgIcons.ChevronRight />
                </TouchableOpacity>
              )}
            />
          )}
          {isSuccess && selectedTab.id == 1 && (
            <FlatList
              data={data?.data}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SELL, {
                      details: item,
                    });
                  }}
                  style={[
                    {
                      width: "100%",
                      borderRadius: theme.spacing.spacing[3],
                      backgroundColor: theme.colors.palette.grey150,
                      padding: 10,
                      flexDirection: "row",
                      marginVertical: 5,
                      borderColor: theme.colors.palette.grey300,
                      borderWidth: 1 / 2,
                      alignItems: "center",
                    },
                  ]}
                >
                  <SvgIcons.Bitcoin />
                  <View
                    style={[
                      {
                        flex: 1,
                        // backgroundColor: "red",
                        paddingHorizontal: 10,
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <View style={[{ flex: 1 }]}>
                      <CustomText variant={"subtitle2"}>
                        {item?.symbol}
                      </CustomText>
                      <CustomText variant={"caption"}>
                        {item?.symbol.slice(0, 3)}
                      </CustomText>
                    </View>
                    <View style={[{}]}>
                      <CustomText variant={"subtitle2"}>
                        {`$${item?.sell_price}`}
                      </CustomText>
                    </View>
                  </View>
                  <SvgIcons.ChevronRight />
                </TouchableOpacity>
              )}
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

const DummyData = [
  {
    symbol: "BTC-USD",
    type: "trading",
    buy_price: 11945710,
    sell_price: 11945378,
    buy_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
    sell_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
  },
  {
    symbol: "ETH-USD",
    type: "trading",
    buy_price: 379000,
    sell_price: 378990,
    buy_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
    sell_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
  },
  {
    symbol: "SOL-USD",
    type: "trading",
    buy_price: 19087,
    sell_price: 19086,
    buy_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
    sell_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
  },
  {
    symbol: "BCH-USD",
    type: "trading",
    buy_price: 53311,
    sell_price: 53297,
    buy_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
    sell_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
  },
  {
    symbol: "LTC-USD",
    type: "trading",
    buy_price: 12014,
    sell_price: 12014,
    buy_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
    sell_price_last_updated_at: "2025-07-21T07:48:05.083000Z",
  },
  {
    symbol: "USDT_TRX-USD",
    type: "trading",
    buy_price: 101,
    sell_price: 99,
    buy_price_last_updated_at: "2025-07-21T07:47:57.585783Z",
    sell_price_last_updated_at: "2025-07-21T07:47:57.585783Z",
  },
  {
    symbol: "USDC-USD",
    type: "trading",
    buy_price: 100,
    sell_price: 100,
    buy_price_last_updated_at: "2025-07-21T07:47:57.681241Z",
    sell_price_last_updated_at: "2025-07-21T07:47:57.681241Z",
  },
  {
    symbol: "USDC_SOL-USD",
    type: "trading",
    buy_price: 100,
    sell_price: 100,
    buy_price_last_updated_at: "2025-07-21T07:47:57.682878Z",
    sell_price_last_updated_at: "2025-07-21T07:47:57.682878Z",
  },
  {
    symbol: "USDC_NPL-USD",
    type: "trading",
    buy_price: 100,
    sell_price: 100,
    buy_price_last_updated_at: "2025-07-21T07:47:57.685027Z",
    sell_price_last_updated_at: "2025-07-21T07:47:57.685027Z",
  },
  {
    symbol: "USDC_STE-USD",
    type: "trading",
    buy_price: 100,
    sell_price: 100,
    buy_price_last_updated_at: "2025-07-21T07:47:57.686143Z",
    sell_price_last_updated_at: "2025-07-21T07:47:57.686143Z",
  },
];
