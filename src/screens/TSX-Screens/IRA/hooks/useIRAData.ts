import { useMemo } from "react";
import { IAssetData, IAllIRAHoldingsResponse, ICryptoPricesResponse, ISectionData, IBankBalance, ITabItem } from "../types";
import { VIEW_TYPE } from "../types";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import RealStateComponent from "tsx-components/RealStateComponent";
import { StocksItem } from "../components/StocksItem";
import { CryptoItem } from "../components/CryptoItem";
import { useCryptoFiltering } from "./useCryptoFiltering";

interface UseIRADataProps {
  allIRAHoldingsData: IAllIRAHoldingsResponse | undefined;
  cryptoPricesData: ICryptoPricesResponse | undefined;
  bankBalance: IBankBalance;
  selectedTab: ITabItem;
  selectedIRAValue: number;
  navigation: any;
}

export const useIRAData = ({
  allIRAHoldingsData,
  cryptoPricesData,
  bankBalance,
  selectedTab,
  selectedIRAValue,
  navigation,
}: UseIRADataProps) => {
  // Use crypto filtering hook
  const { transformedCryptoData, hasCryptoData } = useCryptoFiltering({
    bankBalance,
    selectedTab,
    selectedIRAValue,
    cryptoPricesData,
  });

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    const holdings = allIRAHoldingsData?.data?.holdings || [];
    
    const realStates = holdings.filter(
      (item: IAssetData) => item.asset_type === "Realestate"
    );
    
    const stocks = holdings.filter(
      (item: IAssetData) => item.asset_type === "stock"
    );

    return { realStates, stocks };
  }, [allIRAHoldingsData]);

  // Memoize data formatting function
  const formatDataInRows = useMemo(() => {
    return (data: any[]) => {
      const rows = [];
      for (let i = 0; i < data.length; i += 2) {
        rows.push(data.slice(i, i + 2));
      }
      return rows;
    };
  }, []);

  // Memoize sections data
  const sectionsData: ISectionData[] = useMemo(() => {
    return [
      {
        title: "Real Estate",
        type: "assets",
        data: formatDataInRows(filteredData.realStates),
        renderComponent: RealStateComponent,
        onActionPress: () => {
          navigation.navigate(NAVIGATION_SCREENS.REAL_STATE, {
            data: filteredData.realStates,
            dataType: "Realestate",
            type: VIEW_TYPE.rwa,
          });
        },
      },
      {
        title: "Crypto",
        data: hasCryptoData ? [transformedCryptoData] : [],
        type: "crypto",
        renderComponent: CryptoItem,
        onActionPress: () => {
          navigation.navigate(NAVIGATION_SCREENS.CRYPTO_SCREEN, {});
        },
      },
      {
        title: "Stocks",
        data: filteredData.stocks,
        type: "stocks",
        renderComponent: StocksItem,
        onActionPress: () => {
          navigation.navigate(NAVIGATION_SCREENS.STOCKS, {
            data: filteredData.stocks,
            dataType: "stocks",
            type: VIEW_TYPE.rwa,
          });
        },
      },
    ];
  }, [filteredData, transformedCryptoData, hasCryptoData, navigation, formatDataInRows]);

  console.log("📊 useIRAData - sectionsData:", sectionsData.map(section => ({
    title: section.title,
    dataLength: section.data.length,
    hasData: section.data.length > 0
  })));

  return {
    filteredRealStates: filteredData.realStates,
    filteredStocks: filteredData.stocks,
    sectionsData,
    formatDataInRows,
  };
};
