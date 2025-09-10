import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

// Components
import { ScreenContainer } from "../../HOC";
import HeaderTitle from "../../components/HeaderTitle";
import WalletCard from "../../components/WalletCard";
import CustomText from "../../tsx-components/CustomText";

// Constants & Styles
import { FINANCE_LISTS } from "../../constants/constant";
import { useTheme } from "../../styles/ThemeContext";
import { Theme } from "styles";

const BankDetails = (props: any) => {
  const { width } = Dimensions.get("window");

  const { item: BankDetailsArray, bankbalance, index } = props.route.params;
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / Dimensions.get("window").width);
    setCurrentIndex(index);
  };

  console.log("item =>", JSON.stringify(BankDetailsArray, null, 2));

  // Handle back navigation
  const handleGoBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log("Cannot go back, no screens in history");
        BackHandler.exitApp();
      }
    } catch (err) {
      console.log("Navigation error:", err);
    }
  }, [navigation]);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [handleGoBack]);

  // Handle finance item press
  const handleFinanceItemPress = useCallback(
    (route: any, params = {}) => {
      if (route) {
        navigation.navigate(route, {
          requested: false,
          ...params,
        });
      }
    },
    [navigation]
  );

  const data = [...BankDetailsArray];

  const flatListRef = useRef<any>(null);

  useEffect(() => {
    if (flatListRef.current && index < data.length) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({ index: index, animated: true });
      }, 0); // wait until FlatList has rendered
    }
  }, [index]);

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <KeyboardAvoidingView
        style={styles(theme).container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles(theme).scrollContent]}
        >
          <HeaderTitle
            title="Finance"
            leftIcon={"true"}
            isBack={true}
            onPressLeft={handleGoBack}
          />
          <View>
            <FlatList
              ref={flatListRef}
              horizontal
              pagingEnabled
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    width: Dimensions.get("window").width,
                    alignItems: "center",
                  }}
                >
                  <WalletCard
                    data={item}
                    index={index}
                    bankbalance={item?.balance}
                  />
                </View>
              )}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
            />

            {/* Dot indicator BELOW FlatList */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginVertical: 10,
              }}
            >
              {data.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: currentIndex === index ? 24 : 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor:
                      currentIndex === index ? "grey" : "#e5e5e5",
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles(theme).financeContainer}>
            <ScrollView>
              <View style={styles(theme).financeItemsContainer}>
                {FINANCE_LISTS.map((financeItem, index) => (
                  <TouchableOpacity
                    key={`finance-item-${index}`}
                    onPress={() =>
                      handleFinanceItemPress(financeItem.route, {
                        title: financeItem.name,
                      })
                    }
                    style={styles(theme).financeItemWrapper}
                  >
                    <View style={styles(theme).financeIconContainer}>
                      {financeItem?.icon}
                    </View>
                    <CustomText
                      variant="body2"
                      color={theme.colors.text.secondary}
                      style={styles(theme).financeItemText}
                    >
                      {financeItem.name}
                    </CustomText>
                  </TouchableOpacity>
                ))}
                {/* Add invisible placeholders to maintain grid in last row */}
                {FINANCE_LISTS.length % 3 === 1 && (
                  <>
                    <View
                      style={[
                        styles(theme).financeItemWrapper,
                        styles(theme).emptyItem,
                      ]}
                    />
                    <View
                      style={[
                        styles(theme).financeItemWrapper,
                        styles(theme).emptyItem,
                      ]}
                    />
                  </>
                )}
                {FINANCE_LISTS.length % 3 === 2 && (
                  <View
                    style={[
                      styles(theme).financeItemWrapper,
                      styles(theme).emptyItem,
                    ]}
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    sliderIcon: {
      alignSelf: "center",
      margin: theme.spacing.spacing.md,
    },
    financeContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
      height: 400,
    },
    financeItemsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    financeItemWrapper: {
      width: "31%",
      marginBottom: theme.spacing.spacing.md,
    },
    financeIconContainer: {
      backgroundColor: theme.colors.palette.green100 + "33", // 20% opacity
      borderRadius: 20,
      padding: theme.spacing.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.palette.green100,
      justifyContent: "center",
      alignItems: "center",
    },
    financeIcon: {
      alignSelf: "center",
    },
    financeItemText: {
      textAlign: "center",
      marginTop: theme.spacing.spacing.xs,
    },
    emptyItem: {
      opacity: 0,
      height: 0,
    },
  });

export default BankDetails;
