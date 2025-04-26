// FiatGraphSection.tsx
import React, { FC, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LineChartCustom from 'components/LineChartCustom';
import CustomPieChart from 'components/CustomPieChart';
import AssetsCards from 'components/AssetsCards';
import MemoizedDashboardSection from 'tsx-components/DashboardSection';
import { useTheme } from 'styles/ThemeContext';
import Fonts from 'constants/Fonts';
import { FiatGraphSectionProps } from './components.types';


const FiatGraphSection: FC<FiatGraphSectionProps> = ({
  selectedGraph,
  setselectedGraph,
  alloCationLists,
  memoizedAllocationLists,
}) => {
  const { theme } = useTheme();

  const renderButtonGraph = () => (
    <View style={{ flexDirection: 'row',padding:10 }}>
      <TouchableOpacity
        onPress={() => {
          console.log("Switching to PnL");
          setselectedGraph('pnl');
        }}

        style={{
          backgroundColor: selectedGraph === 'pnl' ? '#2C6A3F' : '#fff',
          padding: 10, borderRadius: 30,

        }}
      >
        <Text style={{ color: selectedGraph === 'pnl' ? '#fff' : '#2C6A3F', fontFamily: Fonts.bold }}>PnL(%)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setselectedGraph('Assets')}
        style={{
          backgroundColor: selectedGraph === 'Assets' ? '#2C6A3F' : '#000',
          padding: 10, borderRadius: 30, marginLeft: 10,
        }}
      >
        <Text style={{ color: '#fff', fontFamily: Fonts.bold }}>Assets</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <MemoizedDashboardSection title="PnL & Assets Allocation">
      {selectedGraph !== 'Assets' ? (
        <>
          {renderButtonGraph()}
          <LineChartCustom isNoBg={true} />
        </>
      ) : (
        <View style={{ backgroundColor: '#000', borderRadius: 20 }}>
          {renderButtonGraph()}
          <View
            style={{ padding: 10 }}
          >

            <CustomPieChart allocationLists={memoizedAllocationLists} />
            <Text style={{ color: 'white', fontFamily: Fonts.bold }}>Assets Allocation</Text>
            {alloCationLists?.map((item, key) => (
              <AssetsCards item={item} key={key} isSelected={false} onPress={() => { }} type="display" />
            ))}
          </View>
        </View>
      )}
    </MemoizedDashboardSection>
  );
};

export default FiatGraphSection;
