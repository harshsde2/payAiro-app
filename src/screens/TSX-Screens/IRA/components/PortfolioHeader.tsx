import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import MyDropdown from "tsx-components/MyDropdown";
import { ITabItem, IBankBalance, IIRAPortfolioItem } from "../types";
import { customStyles } from "screens/TSX-Screens/IRA/styles";

interface IPortfolioHeaderProps {
  selectedTab: ITabItem;
  displayedBalance: number;
  dropdownLists: IIRAPortfolioItem[];
  selectedIRAValue: number;
  onDropdownChange: (value: number) => void;
}

export const PortfolioHeader: React.FC<IPortfolioHeaderProps> = React.memo(({
  selectedTab,
  displayedBalance,
  dropdownLists,
  selectedIRAValue,
  onDropdownChange,
}) => {
  const { theme } = useTheme();
  const styles = customStyles(theme);

  const TABS = [
    { id: 0, title: "All" },
    { id: 1, title: "IRA" },
  ];

  return (
    <View style={styles.card}>
      {selectedTab.title === TABS[0].title ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <Text style={styles.title}>Total Portfolio</Text>
        </View>
      ) : (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <MyDropdown
            style={{
              width: 200,
              borderWidth: 1 / 10,
              borderRadius: 10,
              paddingHorizontal: 5,
              paddingVertical: 3,
              backgroundColor: "white",
            }}
            containerStyles={{
              justifyContent: "center",
              width: "100%",
              alignItems: "center",
            }}
            placeholder="Select Bank Account"
            data={dropdownLists}
            value={dropdownLists[selectedIRAValue]?.value}
            search={false}
            itemTextStyle={{
              fontSize: 14,
              fontFamily: theme?.typography.fontFamily.montserrat,
            }}
            labelField="label"
            valueField="value"
            disable={false}
            onChange={(item: any) => {
              if (item === dropdownLists[0]?.value) {
                onDropdownChange(0);
              } else {
                onDropdownChange(1);
              }
            }}
          />
        </View>
      )}

      <Text style={styles.totalValue}>
        {displayedBalance
          ? `$${displayedBalance.toLocaleString("en-IN")}`
          : "$0"}
      </Text>
      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Invested Value</Text>
          <Text style={styles.infoValue}>$ 12,454.31</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Overall Return</Text>
          <Text
            style={[
              styles.infoValue,
              { color: theme.colors.palette.green700 },
            ]}
          >
            $ 1,000.0
          </Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Return %</Text>
          <Text
            style={[
              styles.infoValue,
              { color: theme.colors.palette.green700 },
            ]}
          >
            5.5%
          </Text>
        </View>
      </View>
    </View>
  );
});

PortfolioHeader.displayName = "PortfolioHeader";
