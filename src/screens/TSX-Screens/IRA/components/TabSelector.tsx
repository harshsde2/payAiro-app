import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { ITabItem } from "../types";

interface ITabSelectorProps {
  tabs: ITabItem[];
  selectedTab: ITabItem;
  onTabSelect: (tab: ITabItem) => void;
}

export const TabSelector: React.FC<ITabSelectorProps> = React.memo(({
  tabs,
  selectedTab,
  onTabSelect,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: theme.colors.palette.green150,
        flexDirection: "row",
        borderRadius: theme.spacing.spacing[5],
      }}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.id}
          style={{
            width: "50%",
            borderRadius: theme.spacing.spacing[5],
            paddingVertical: theme.spacing.spacing[2],
            backgroundColor:
              selectedTab.id === index
                ? theme.colors.palette.green700
                : theme.colors.palette.green150,
          }}
          onPress={() => onTabSelect(tab)}
          disabled={selectedTab.id === index}
        >
          <CustomText
            color={
              selectedTab.id === index
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
  );
});

TabSelector.displayName = "TabSelector";
