import {
  View,
  Text,
  BackHandler,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Theme, themes, useTheme } from "styles";
import { customStyles, RenderStocks } from "./RWA";
import { ScreenContainer } from "HOC";
import { SvgXml } from "react-native-svg";
import { SVGCart, SVGFilter, SVGLeftArrow, SVGProfile } from "constants/images";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import HeaderTitle from "components/HeaderTitle";
import RealStateComponent from "tsx-components/RealStateComponent";
import DashboardSection from "tsx-components/DashboardSection";
import ImageCarousel from "../CommonComponents/ImageCarousel";
import { CustomText } from "tsx-components";
import GenericButton from "components/GenericButton";
import BuyNowModal from "../CommonComponents/BuyNowModal";

const TABS_ARRAY = [
  { name: "About", id: 0 },
  { name: "Details", id: 1 },
];

const StocksProfile = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = { ...customStyles(theme), ...myStyles(theme) };
  const route = useRoute<any>();

  const { data, images } = route.params;
  // console.log(" array =>", data);

  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState(TABS_ARRAY[1]);
  const [isModalVisible, setIsModalVissible] = useState(false);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      BackHandler.exitApp();
    }
  }, [navigation]);
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <BuyNowModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVissible(false);
        }}
      />
      <HeaderTitle
        title="Stocks"
        leftIcon={SVGLeftArrow}
        isBack
        onPressLeft={handleGoBack}
        rightIcon={SVGCart}
        onPressRight={() => {}}
      />

      <ScrollView style={styles.container}>
        <ImageCarousel images={testImages} />
        <View style={[]}>
          <CustomText
            variant={"h3"}
            // style={{ backgroundColor: "green" }}
            fontWeight={"semiBold"}
          >
            {data?.title}
          </CustomText>
          <View
            style={[
              {
                alignItems: "center",
                flexDirection: "row",
                marginTop: 10,
                // backgroundColor: "red",
              },
            ]}
          >
            <SvgXml xml={SVGProfile} width={20} height={20} />
            <CustomText
              variant={"caption"}
              style={{ marginLeft: 10 }}
              size={14}
            >
              {data?.author}
            </CustomText>
          </View>
        </View>
        <View style={[styles.mainSharesContainer]}>
          <View style={[styles.horizontalSaperator]} />
          <View style={[styles.sharesContainer]}>
            <View style={[styles.sharesSection]}>
              <CustomText variant={"caption"}>Share Price</CustomText>
              <CustomText
                fontWeight={"semiBold"}
                color={theme.colors.palette.green700}
                variant={"h3"}
              >
                $32
              </CustomText>
            </View>
            <View style={[styles.verticalSaperator]} />
            <View style={[styles.sharesSection]}>
              <CustomText variant={"caption"}>Share Price</CustomText>
              <CustomText
                fontWeight={"semiBold"}
                color={theme.colors.palette.green700}
                variant={"h3"}
              >
                $32
              </CustomText>
            </View>
            <View style={[styles.verticalSaperator]} />
            <View style={[styles.sharesSection]}>
              <CustomText variant={"caption"}>Share Price</CustomText>
              <CustomText
                fontWeight={"semiBold"}
                color={theme.colors.palette.green700}
                variant={"h3"}
              >
                $32
              </CustomText>
            </View>
          </View>
          <View style={[styles.horizontalSaperator]} />
        </View>
        <View style={{ paddingHorizontal: 10 }}>
          <CustomText style={{ textAlign: "justify" }} variant="caption">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since.. Read more
          </CustomText>
        </View>
        {/* <View
          style={[{ width: "100%", alignItems: "center", marginVertical: 30 }]}
        >
          <View
            style={{
              width: "100%",
              height: 50,
              backgroundColor: theme.colors.palette.green150,
              borderRadius: theme.spacing.spacing[3],
              padding: 10,
              flexDirection: "row",
            }}
          >
            {TABS_ARRAY.map((item, index) => (
              <TouchableOpacity
                style={[
                  {
                    width: "50%",
                    backgroundColor:
                      selectedTab.id == index
                        ? theme.colors.palette.green800
                        : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: theme.spacing.spacing[3],
                  },
                ]}
                onPress={() => {
                  setSelectedTab(item);
                }}
                key={index}
              >
                <CustomText
                  color={
                    selectedTab.id == index
                      ? theme.colors.palette.white
                      : theme.colors.palette.black
                  }
                  variant={"button"}
                >
                  {item.name}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
          {selectedTab.id == 0 && (
            <View>
              <Text>{0}</Text>
            </View>
          )}
          {selectedTab.id == 1 && (
            <View>
              <Text>{1}</Text>
            </View>
          )}
        </View> */}
        <View style={{ marginVertical: 20 }}>
          <GenericButton
            title="Buy Now"
            onPress={() => {
              setIsModalVissible(true);
            }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default StocksProfile;

const myStyles = (theme: Theme) =>
  StyleSheet.create({
    sharesContainer: {
      width: "100%",
      // backgroundColor: "red",
      flexDirection: "row",
    },
    sharesSection: {
      width: "33%",
      justifyContent: "center",
      alignItems: "center",
    },
    mainSharesContainer: {
      width: "100%",
      marginVertical: 10,
      alignItems: "center",
    },
    horizontalSaperator: {
      width: "100%",
      height: 1,
      backgroundColor: theme.colors.palette.grey200,
      marginVertical: 10,
    },
    verticalSaperator: {
      width: 1,
      height: "90%",
      backgroundColor: theme.colors.palette.grey200,
      marginVertical: 5,
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
