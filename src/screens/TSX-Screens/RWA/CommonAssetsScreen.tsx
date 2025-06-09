import { View, Text, BackHandler, FlatList } from "react-native";
import React, { useCallback, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "styles";
import { customStyles, VIEW_TYPE } from "./RWA";
import { ScreenContainer } from "HOC";
import { SvgXml } from "react-native-svg";
import { SVGCart, SVGFilter, SVGLeftArrow } from "constants/images";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import HeaderTitle from "components/HeaderTitle";
import RealStateComponent from "tsx-components/RealStateComponent";
import { useGetRWAList } from "query/hooks";

const CommonAssetsScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const route = useRoute<any>();
  const { data, type, dataType } = route.params;

  const {
    data: AllRWAData,
    isPending: isAllRWAPending,
    isError: isAllRWAError,
    isSuccess: isAllRWASuccess,
  } = useGetRWAList(dataType);

  console.log("Type =>", dataType);
  // console.log(" AllRWAData =>", JSON.stringify(AllRWAData, null, 2));

  const [searchText, setSearchText] = useState("");

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
        title={dataType}
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
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <RealStateComponent
              containerStyles={{ width: "48%" }}
              item={item}
              type={VIEW_TYPE.owned == type ? VIEW_TYPE.owned : VIEW_TYPE.rwa}
            />
          )}
        />
      </View>
    </ScreenContainer>
  );
};

export default CommonAssetsScreen;
