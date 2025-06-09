import { View, Text, BackHandler, FlatList } from "react-native";
import React, { useCallback, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "styles";
import { customStyles, RenderStocks } from "./RWA";
import { ScreenContainer } from "HOC";
import { SvgXml } from "react-native-svg";
import { SVGCart, SVGFilter, SVGLeftArrow } from "constants/images";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import HeaderTitle from "components/HeaderTitle";
import RealStateComponent from "tsx-components/RealStateComponent";
import DashboardSection from "tsx-components/DashboardSection";
import { useGetRWAList } from "query/hooks";

const Stocks = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const route = useRoute<any>();
  const { data, dataType } = route.params;

  const [searchText, setSearchText] = useState("");

  const {
    data: AllRWAData,
    isPending: isAllRWAPending,
    isError: isAllRWAError,
    isSuccess: isAllRWASuccess,
  } = useGetRWAList(dataType);

  // console.log(" AllRWAData =>", AllRWAData);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      BackHandler.exitApp();
    }
  }, [navigation]);
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle
        title="Stocks"
        leftIcon={SVGLeftArrow}
        isBack
        onPressLeft={handleGoBack}
        rightIcon={SVGCart}
        onPressRight={() => {}}
      />
      <View style={[styles.textInputAndFilterContainer]}>
        <View style={[styles.testInputContainer]}>
          <CustomSearchTextInput
            placeholder="Search Name or Payairo tag..."
            placeholderTextColor={theme.colors.palette.green700}
            onChangeText={() => {}}
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
        <FlatList
          data={AllRWAData?.data || []}
          // numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <RenderStocks containerStyles={{ width: "48%" }} item={item} />
          )}
        />
      </View>
    </ScreenContainer>
  );
};

export default Stocks;
