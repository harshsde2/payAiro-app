// FiatGraphSection.tsx
import React, { FC } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LineChartCustom from "components/LineChartCustom";
import CustomPieChart from "components/CustomPieChart";
import MemoizedDashboardSection from "tsx-components/DashboardSection";
import { useTheme } from "styles/ThemeContext";
import Fonts from "constants/Fonts";
import { FiatGraphSectionProps } from "./components.types";
import CustomText from "./CustomText";

const FiatGraphSection: FC<FiatGraphSectionProps> = ({
  selectedGraph,
  setselectedGraph,
  alloCationLists,
  memoizedAllocationLists,
}) => {
  const { theme } = useTheme();

  const renderButtonGraph = () => (
    <View style={{ flexDirection: "row", padding: 10 }}>
      <TouchableOpacity
        onPress={() => {
          console.log("Switching to PnL");
          setselectedGraph("pnl");
        }}
        style={{
          backgroundColor: selectedGraph === "pnl" ? "#2C6A3F" : "#fff",
          padding: 10,
          borderRadius: 30,
        }}
      >
        <Text
          style={{
            color: selectedGraph === "pnl" ? "#fff" : "#2C6A3F",
            fontFamily: Fonts.bold,
          }}
        >
          PnL(%)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setselectedGraph("Assets")}
        style={{
          backgroundColor: selectedGraph === "Assets" ? "#2C6A3F" : "#000",
          padding: 10,
          borderRadius: 30,
          marginLeft: 10,
        }}
      >
        <Text style={{ color: "#fff", fontFamily: Fonts.bold }}>Assets</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <MemoizedDashboardSection title="PnL & Assets Allocation">
      {selectedGraph !== "Assets" ? (
        <>
          {renderButtonGraph()}
          <LineChartCustom isNoBg={true} />
        </>
      ) : (
        <View style={{ backgroundColor: "#000", borderRadius: 20 }}>
          {renderButtonGraph()}
          <View style={{ padding: 10 }}>
            <CustomPieChart alloCationLists={memoizedAllocationLists} />
            {alloCationLists?.length > 0 && (
              <View style={styles.allocationList}>
                <CustomText
                  color={theme.colors.palette.white}
                  fontWeight={"semiBold"}
                  variant={"body2"}
                >
                  Assets Allocation
                </CustomText>
                {alloCationLists?.map((item, key) => (
                  <View key={key} style={styles.allocationRow}>
                    <View
                      style={[
                        styles.colorBox,
                        { backgroundColor: (item as { color?: string }).color ?? theme.colors.palette.grey400 },
                      ]}
                    />
                    <CustomText
                      color={theme.colors.palette.white}
                      variant={"body2"}
                    >
                      {(item as { assetType?: string }).assetType?.toUpperCase() ?? "—"} (
                      {((item as { percentage?: number }).percentage ?? 0).toFixed(1)}%)
                    </CustomText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </MemoizedDashboardSection>
  );
};

const styles = StyleSheet.create({
  allocationList: {
    marginTop: 20,
  },
  allocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  colorBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 8,
  },
});

export default FiatGraphSection;
