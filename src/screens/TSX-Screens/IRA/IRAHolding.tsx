import React, { Fragment, useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  BackHandler,
  SectionList,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SvgXml } from "react-native-svg";
import { useTheme } from "styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";
import DashboardSection from "tsx-components/DashboardSection";
import GlobalLoader from "tsx-components/GlobalLoader";
import { CustomText } from "tsx-components";
import useSelectorAction from "hooks/useSelectorAction";
import {
  useCryptoPrices,
  useGetAllIRAHoldings,
} from "query/hooks";

// Local imports
import { ITabItem, IBankBalance } from "./types";
import { customStyles } from "screens/TSX-Screens/IRA/styles";
import { TabSelector } from "./components/TabSelector";
import { PortfolioHeader } from "./components/PortfolioHeader";
import { useIRAData } from "./hooks/useIRAData";
import { useDropdownData } from "./hooks/useDropdownData";

const TABS: ITabItem[] = [
  { id: 0, title: "All" },
  { id: 1, title: "IRA" },
];

const IRAHolding: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = customStyles(theme);

  // Redux state
  const selectorData = useSelectorAction() as any;
  const { bankBalance, bankLists } = selectorData;

  // Local state
  const [URLString, setURLString] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [displayedBalance, setDisplayedBalance] = useState(
    bankBalance?.bank_account?.usd || 0
  );
  const [selectedTab, setSelectedTab] = useState<ITabItem>(TABS[0]);
  const [selectedIRAValue, setSelectedIRAValue] = useState(0);

  // API hooks
  const {
    data: AllIRAHoldingsData,
    isPending: isAllRWAPending,
    isRefetching: isRefectingData,
    refetch: refetchIRAHoldings,
  } = useGetAllIRAHoldings(URLString);

  const { data: CryptoPricesData } = useCryptoPrices();

  // Custom hooks
  const { dropdownLists } = useDropdownData({ bankLists });
  const { sectionsData } = useIRAData({
    allIRAHoldingsData: AllIRAHoldingsData,
    cryptoPricesData: CryptoPricesData,
    bankBalance: bankBalance || {},
    selectedTab,
    selectedIRAValue,
    navigation,
  });

  // Memoized callbacks
  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      BackHandler.exitApp();
    }
  }, [navigation]);

  const handleTabSelect = useCallback((tab: ITabItem) => {
    setSelectedTab(tab);
    if (tab.title === "All") {
      setURLString("");
      setDisplayedBalance(bankBalance?.bank_account?.usd || 0);
      setSelectedIRAValue(0);
      
    } else {
      setURLString("?fund_source_type=rothira");
      setDisplayedBalance(bankBalance?.roth_ira_account?.usd || 0);
      setSelectedIRAValue(0);
    }
  }, [bankBalance]);

  const handleDropdownChange = useCallback((value: number) => {
    setSelectedIRAValue(value);
    if (value === 0) {
      setURLString("?fund_source_type=rothira");
      setDisplayedBalance(bankBalance?.roth_ira_account?.usd || 0);
    } else {
      setURLString("?fund_source_type=traditionalIra");
      setDisplayedBalance(bankBalance?.traditional_ira_account?.usd || 0);
    }
  }, [bankBalance]);

  // Effects
  useEffect(() => {
    if (URLString != null) {
      refetchIRAHoldings();
    }
  }, [URLString, refetchIRAHoldings]);

  // Memoized header component
  const ListHeaderComponent = useMemo(() => (
    <View style={{ width: "100%" }}>
      <PortfolioHeader
        selectedTab={selectedTab}
        displayedBalance={displayedBalance}
        dropdownLists={dropdownLists}
        selectedIRAValue={selectedIRAValue}
        onDropdownChange={handleDropdownChange}
      />
    </View>
  ), [selectedTab, displayedBalance, dropdownLists, selectedIRAValue, handleDropdownChange]);

  // Memoized render functions
  const renderSectionHeader = useCallback(({ section }: { section: any }) => (
    <Fragment>
      {section.data.length > 0 && (
        <DashboardSection
          title={section.title}
          actionText="see all"
          onActionPress={section.onActionPress}
          style={{ backgroundColor: "#fff" }}
        />
      )}
    </Fragment>
  ), []);

  const renderItem = useCallback(({ item: rowItems, section }: { item: any; section: any }) => {
    const Component = section.renderComponent;

    if (section.type === "assets") {
      return (
        <View style={styles.sectionListRenderContainer}>
          {Array.isArray(rowItems) &&
            rowItems.map((item, index) => (
              <Component
                key={`${item.id}-${index}`}
                containerStyles={{ width: "48%" }}
                item={item}
                type="rwa"
              />
            ))}
        </View>
      );
    }

    if (section.type === "crypto") {
      return (
        <ScrollView
          style={{height:150}}
          showsHorizontalScrollIndicator={false}
          horizontal
        >
          {Array.isArray(rowItems) &&
            rowItems.map((item, index) => (
              <Component
                key={`crypto-${index}`}
                containerStyles={{}}
                item={item}
              />
            ))}
        </ScrollView>
      );
    }

    return (
      <View style={styles.sectionListRenderContainer}>
        <Component
          key={`stock-${rowItems.id}`}
          containerStyles={{}}
          item={rowItems}
          type="rwa"
        />
      </View>
    );
  }, [styles.sectionListRenderContainer]);

  const keyExtractor = useCallback((item: any, index: number) => {
    if (Array.isArray(item)) {
      return `row-${index}`;
    }
    return `item-${item?.id || index}`;
  }, []);

  // Loading state
  if (isAllRWAPending) {
    return (
      <View style={{ justifyContent: "center", alignContent: "center", flex: 1 }}>
        <GlobalLoader />
      </View>
    );
  }

  console.log("bankBalance =>",JSON.stringify(bankBalance,null,2))
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle
        title="Holdings"
        leftIcon="true"
        isBack
        onPressLeft={handleGoBack}
        onPressRight={() => {}}
      />
      
      <View style={styles.textInputAndFilterContainer}>
        <View style={styles.testInputContainer}>
          <CustomSearchTextInput
            placeholder="Search Name or PayAiro tag..."
            placeholderTextColor={theme.colors.palette.green700}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>

      </View>

      <View style={styles.container}>
        <TabSelector
          tabs={TABS}
          selectedTab={selectedTab}
          onTabSelect={handleTabSelect}
        />

        {isRefectingData ? (
          <View style={{ justifyContent: "center", alignContent: "center", flex: 1 }}>
            <CustomText variant="caption" align="center">
              Fetching...
            </CustomText>
          </View>
        ) : (
          <SectionList
            sections={sectionsData}
            ListHeaderComponent={ListHeaderComponent}
            keyExtractor={keyExtractor}
            renderSectionHeader={renderSectionHeader}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            getItemLayout={undefined} // Let SectionList calculate automatically for variable heights
          />
        )}
      </View>
    </ScreenContainer>
  );
};

export default IRAHolding;