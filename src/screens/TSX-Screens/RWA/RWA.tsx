import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  Image,
  SectionList,
  ScrollView,
} from "react-native";
import React, { useCallback, useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Theme, useTheme } from "styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import { SVGCart, SVGFilter, SVGLeftArrow } from "constants/images";
import DashboardSection from "tsx-components/DashboardSection";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import RealStateComponent from "tsx-components/RealStateComponent";
import { CustomText } from "tsx-components";
import { ViewProps } from "react-native-svg/lib/typescript/fabric/utils";
import IconTextComponent from "tsx-components/IconTextComponent";
import { SvgXml } from "react-native-svg";
import { useCryptoPrices, useGetAllRWA } from "query/hooks";
import { defaultCrypto, defaultImage } from "utils/configs";
import GlobalLoader from "tsx-components/GlobalLoader";

interface ItemProps {
  growth: string;
  creator: string;
  price_per_share: string;
  company: string;
  logo_url: string;
}

interface prices {
  buy: number;
  sell: number;
}

export interface AssetData {
  id: number;
  name: string;
  symbol: string;
  amount: string | any;
  fortress_id: number | null;
  quantity: number;
  currency_type: string;
  price_per_token: string | any;
  status: string;
  asset_type: string;
  logo: string | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  video: string | null;
  description: string;
  created_at: string; // ISO date string
  images: (string | null)[] | any;
  usernames: string;
}

interface CryptoItemProps {
  network: string;
  currency: string;
  price: prices;
  logo: string;
}

interface RenderCryptoComponentProps extends ViewProps {
  containerStyles?: ViewStyle;
  textContainerStyles?: ViewStyle;
  item?: CryptoItemProps;
}

interface RenderStocksComponentProps extends ViewProps {
  containerStyles?: ViewStyle;
  textContainerStyles?: ViewStyle;
  item?: AssetData;
}

export const VIEW_TYPE = {
  owned: "owned",
  rwa: "rwa",
};

export const RenderStocks = ({ item }: RenderStocksComponentProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const filteredImages = item?.images.filter((image: any) => image != null);
  const isImageUri = filteredImages.length > 0;
  return (
    <TouchableOpacity
      style={customStyles(theme).contactItem}
      activeOpacity={0.8}
      onPress={() => {
        /* Handle invite action */
        navigation.navigate(NAVIGATION_SCREENS.STOCK_PROFILE, {
          data: item,
          images: testImages,
        });
      }}
    >
      <View style={customStyles(theme).contactLeftSection}>
        <View style={customStyles(theme).avatarContainer}>
          {isImageUri ? (
            <Image
              resizeMode={"cover"}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: theme.spacing.spacing[2],
              }}
              source={{ uri: filteredImages[0] }}
            />
          ) : (
            <Image
              resizeMode={"cover"}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: theme.spacing.spacing[2],
              }}
              source={defaultImage}
            />
          )}
        </View>
        <View style={customStyles(theme).contactInfo}>
          <CustomText variant="subtitle1" color={theme.colors.text.primary}>
            {item?.name}
          </CustomText>
          <CustomText
            variant={"caption"}
            size={14}
            color={theme.colors.text.secondary}
          >
            {item?.usernames}
          </CustomText>
        </View>
        <View style={[customStyles(theme).shareContainer]}>
          <CustomText variant={"subtitle1"} style={{}} size={14}>
            ${item?.price_per_token}
          </CustomText>
          <CustomText variant={"caption"} style={{ marginLeft: 3 }} size={12}>
            per share
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RenderCrypto = ({ item }: RenderCryptoComponentProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const isImageUri = item?.logo;
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(NAVIGATION_SCREENS.HOLDINGS_SCREEN, {
          item,
        })
      }
      style={[customStyles(theme).sectionListRenderContainer]}
    >
      <IconTextComponent
        label={item?.currency}
        iconContainerStyle={{
          width: 80,
          height: 80,
          borderRadius: 40,
        }}
      >
        {/* {isImageUri ? (
          <Image
            resizeMode={"cover"}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: theme.spacing.spacing[2],
            }}
            source={{ uri: isImageUri }}
          />
        ) : ( */}
        <Image
          resizeMode={"cover"}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: theme.spacing.spacing[20],
          }}
          source={defaultCrypto}
        />
        {/* )} */}
      </IconTextComponent>
    </TouchableOpacity>
  );
};

const RWA = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = customStyles(theme);

  const {
    data: AllRWAData,
    isPending: isAllRWAPending,
    isError: isAllRWAError,
    isSuccess: isAllRWASuccess,
    isFetching: isAllIsFetching,
  } = useGetAllRWA();

  const {
    data: CryptoPricesData,
    isPending: isCryptoPricesPending,
    isError: isCryptoPricesError,
    isSuccess: isCryptoPricesSuccess,
  } = useCryptoPrices();

  // console.log("data =>", JSON.stringify(AllRWAData, null, 2));
  // console.log("isAllIsFetching =>", JSON.stringify(isAllIsFetching, null, 2));

  const [searchText, setSearchText] = useState("");

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      BackHandler.exitApp();
    }
  }, [navigation]);

  const formatDataInRows = (data: any) => {
    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
      rows.push(data.slice(i, i + 2));
    }
    return rows;
  };

  const filteredRealStates =
    AllRWAData?.data.filter(
      (item: AssetData) => item.asset_type == "Realestate"
    ) || [];

  const filteredStocks =
    AllRWAData?.data.filter((item: AssetData) => item.asset_type == "stock") ||
    [];

  const sectionsData = [
    {
      title: "Real Estate",
      type: "assets",
      data: formatDataInRows(filteredRealStates),
      renderComponent: RealStateComponent,
      onActionPress: () => {
        navigation.navigate(NAVIGATION_SCREENS.REAL_STATE, {
          data: filteredRealStates,
          dataType: "Realestate",
          type: VIEW_TYPE.rwa,
        });
      },
    },
    {
      title: "Crypto",
      data: [CryptoPricesData?.data],
      type: "crypto",
      renderComponent: RenderCrypto,
      onActionPress: () => {
        navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN, {});
      },
    },
    {
      title: "Stocks",
      data: filteredStocks,
      type: "stocks",
      renderComponent: RenderStocks,
      onActionPress: () => {
        navigation.navigate(NAVIGATION_SCREENS.STOCKS, {
          data: filteredStocks,
          dataType: "stocks",
          type: VIEW_TYPE.rwa,
        });
      },
    },
  ];
  if (isAllRWAPending) {
    return (
      <View
        style={{ justifyContent: "center", alignContent: "center", flex: 1 }}
      >
        <GlobalLoader />
      </View>
    );
  }
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle
        title="RWA"
        // leftIcon={SVGLeftArrow}
        leftIcon="true"
        isBack
        onPressLeft={handleGoBack}
        // rightIcon={SVGCart}
        onPressRight={() => {}}
      />
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
        <SvgXml
          xml={SVGFilter}
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginRight: 5,
          }}
          width={45}
          height={45}
          onPress={() => {}}
        />
      </View>
      <View style={styles.container}>
        <SectionList
          showsVerticalScrollIndicator={false}
          sections={sectionsData}
          keyExtractor={(item, index) => index.toString()}
          renderSectionHeader={({ section }) => (
            <DashboardSection
              title={section.title}
              actionText="see all"
              onActionPress={section.onActionPress}
              style={{ backgroundColor: "#fff" }}
            />
          )}
          renderItem={({ item: rowItems, section }) => {
            const Component = section.renderComponent;
            console.log("Section =>", section);
            if (section.type == "assets") {
              return (
                <View style={[styles.sectionListRenderContainer]}>
                  {Array.isArray(rowItems) &&
                    rowItems.map((item, index) => {
                      return (
                        <Component
                          key={index}
                          containerStyles={{ width: "48%" }}
                          item={item}
                          type={VIEW_TYPE.rwa}
                        />
                      );
                    })}
                </View>
              );
            }
            if (section.type == "crypto") {
              // console.log("crypto =>", JSON.stringify(rowItems, null, 2));
              return (
                <ScrollView
                  style={[]}
                  showsHorizontalScrollIndicator={false}
                  horizontal
                >
                  {Array.isArray(rowItems) &&
                    rowItems.map((item, index) => {
                      return (
                        <Component
                          key={index}
                          containerStyles={{}}
                          item={item}
                        />
                      );
                    })}
                </ScrollView>
              );
            }
            return (
              <View style={[styles.sectionListRenderContainer]}>
                <Component
                  key={rowItems.index}
                  containerStyles={{}}
                  item={rowItems}
                  type={VIEW_TYPE.rwa}
                />
              </View>
            );
          }}
        />
      </View>
    </ScreenContainer>
  );
};

export default RWA;

export const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
      marginTop: theme.spacing.spacing[0],
    },
    header: {
      marginTop: 20,
      marginBottom: 10,
    },
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
    contactItem: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      marginVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
      backgroundColor: theme.colors.palette.grey150,
    },
    contactLeftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.palette.green200,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 25,
    },
    initials: {
      color: theme.colors.palette.green700,
      // fontFamily: Fonts.semibold,
      // backgroundColor: "yellow",
      fontSize: 18,
    },
    contactInfo: {
      marginLeft: 10,
      // flex: 1,
      width: 180,
      // backgroundColor: "green",
    },
    unreadBadge: {
      backgroundColor: theme.colors.palette.green700,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 5,
    },
    addButton: {
      backgroundColor: theme.colors.palette.green700,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginLeft: 10,
    },
    shareContainer: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },
    sectionListRenderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      width: "100%",
      // backgroundColor: "red",
      flex: 1,
    },
  });

const testImages: { uri: string }[] = [
  {
    uri: "https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?auto=format&fit=crop&w=800&q=80",
  },
  {
    uri: "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?auto=format&fit=crop&w=800&q=80",
  },
  {
    uri: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    uri: "https://images.unsplash.com/photo-1600585154154-1c5253a338db?auto=format&fit=crop&w=800&q=80",
  },
];
