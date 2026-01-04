import { useFont } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import DonutChart from './components/DonutChart';
import RenderItem from './components/RenderItem';
import { styles } from './styles';
import { Data, DonutChartContainerProps } from './types';
import { GAP, MIN_SEGMENT_SIZE, OUTER_STROKE_WIDTH, RADIUS, STROKE_WIDTH } from './utils/contants';
import { generateColorPairs } from './utils/generateColorPair';
import { useTheme } from 'styles';
import CustomText from 'tsx-components/CustomText';

export const DonutChartContainer = ({ n, index, portfolioBreakdownData }: DonutChartContainerProps) => {
  const { theme } = useTheme();
  const [data, setData] = useState<Data[]>([]);
  const totalValue = useSharedValue(0);
  const decimals = useSharedValue<number[]>([]);
  const activeIndex = useSharedValue<number | null>(null);
  const segmentValues = useSharedValue<number[]>([]);
  const segmentLabels = useSharedValue<string[]>([]);

  const actualN = portfolioBreakdownData?.data?.asset_classes?.length || n;
  const { colors, lightColors } = generateColorPairs(actualN);

  const hasData = portfolioBreakdownData?.data?.asset_classes && portfolioBreakdownData.data.asset_classes.length > 0;

  // Calculate adaptive gap based on number of segments (adaptive to prevent overlap)
  const baseGap = 0.070; // 0.5% base gap
  const dynamicGap = actualN > 4 ? baseGap : Math.max(baseGap, 0.01 / actualN);

  console.log('portfolioBreakdownData in DonutChartContainer', JSON.stringify(portfolioBreakdownData, null, 2));
  const adjustDecimalsForVisibility = (decimals: number[]): number[] => {
    const minDecimal = MIN_SEGMENT_SIZE; // 3% minimum
    const adjustedDecimals = [...decimals];

    const smallSegments = decimals.map((decimal, index) => ({
      index,
      decimal,
      isSmall: decimal < minDecimal,
    }));

    const smallCount = smallSegments.filter(s => s.isSmall).length;
    if (smallCount === 0) return adjustedDecimals;

    const totalDeficit = smallSegments.filter(s => s.isSmall).reduce((sum, s) => sum + (minDecimal - s.decimal), 0);

    const largeSegments = smallSegments.filter(s => !s.isSmall && s.decimal > minDecimal * 2);

    if (largeSegments.length === 0) {
      const nonSmallSegments = smallSegments.filter(s => !s.isSmall);
      const redistributeFromEach = totalDeficit / (nonSmallSegments.length || 1);

      smallSegments.forEach(s => {
        if (s.isSmall) {
          adjustedDecimals[s.index] = minDecimal;
        } else {
          adjustedDecimals[s.index] = Math.max(minDecimal, s.decimal - redistributeFromEach);
        }
      });
    } else {
      const redistributeFromEach = totalDeficit / largeSegments.length;

      smallSegments.forEach(s => {
        if (s.isSmall) {
          adjustedDecimals[s.index] = minDecimal;
        }
      });

      largeSegments.forEach(s => {
        adjustedDecimals[s.index] = Math.max(minDecimal, s.decimal - redistributeFromEach);
      });
    }

    const sum = adjustedDecimals.reduce((acc, curr) => acc + curr, 0);
    return adjustedDecimals.map(decimal => decimal / sum);
  };

  const generateData = () => {
    if (portfolioBreakdownData?.data?.asset_classes && portfolioBreakdownData.data.asset_classes.length > 0) {
      const assetClasses = portfolioBreakdownData.data.asset_classes;
      const total_portfolio_value = portfolioBreakdownData?.data?.total_portfolio_value;

      let percentages = assetClasses.map((ac: any) => parseFloat(ac.percentage) || 0);
      
      // Normalize percentages to sum to 100%
      const totalPercentage = percentages.reduce((sum: number, pct: number) => sum + pct, 0);
      if (totalPercentage > 0) {
        percentages = percentages.map((pct: number) => (pct / totalPercentage) * 100);
      }

      const values = percentages.map((pct: number) => (pct / 100) * total_portfolio_value);

      totalValue.value = withTiming(total_portfolio_value, {
        duration: 1000,
      });

      // Convert percentages to decimals (0-1 range)
      const initialDecimals = percentages.map((pct: number) => pct / 100);
      
      // Scale decimals to account for gaps between segments
      // The gap is added before each segment, so: sum(decimals) + (n * gap) = 1
      // Therefore: sum(decimals) = 1 - (n * gap)
      const totalDecimal = initialDecimals.reduce((sum: number, dec: number) => sum + dec, 0);
      const totalGapSpace = actualN * dynamicGap;
      const availableSpace = Math.max(0.5, 1 - totalGapSpace); // Ensure at least 50% space for segments
      
      // Scale decimals proportionally to fit in available space
      const scaledDecimals = totalDecimal > 0 && availableSpace > 0
        ? initialDecimals.map((dec: number) => (dec / totalDecimal) * availableSpace)
        : initialDecimals;
      
      decimals.value = [...scaledDecimals];

      segmentValues.value = values;
      segmentLabels.value = assetClasses.map((ac: any) => ac.label || ac.asset_class);

      const arrayOfObjects = assetClasses.map((ac: any, index: number) => ({
        value: values[index],
        percentage: percentages[index],
        color: colors[index],
        lightColor: lightColors[index],
        label: ac.label || ac.asset_class,
      }));

      setData(arrayOfObjects);
    }
  };

  const font = useFont(require('../../../assets/fonts/Montserrat-Regular.ttf'), 15);
  const smallFont = useFont(require('../../../assets/fonts/Montserrat-Regular.ttf'), 15);
  const smallFont12 = useFont(require('../../../assets/fonts/Montserrat-Regular.ttf'), 12);
  const smallFont10 = useFont(require('../../../assets/fonts/Montserrat-Regular.ttf'), 10);
  const smallFont8 = useFont(require('../../../assets/fonts/Montserrat-Regular.ttf'), 8);

  useEffect(() => {
    if (portfolioBreakdownData?.data?.asset_classes && portfolioBreakdownData.data.asset_classes.length > 0) {
      console.log('generateData');
      generateData();
    }
  }, [index, portfolioBreakdownData]);

  if (!font || !smallFont || !smallFont12 || !smallFont10 || !smallFont8) {
    return <View />;
  }

  if (!hasData) {
    return (
      <View style={styles.container}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, height: 300 }}>
          <CustomText size={16} color={theme.colors.text.secondary}>
            No data found
          </CustomText>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        activeIndex.value = null;
      }}
      style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ alignItems: 'center' }} 
        horizontal 
        showsVerticalScrollIndicator={false}>
        <View style={styles.chartComponentContainer}>
          <DonutChart
            radius={RADIUS}
            gap={dynamicGap}
            strokeWidth={STROKE_WIDTH}
            outerStrokeWidth={OUTER_STROKE_WIDTH}
            font={font}
            smallFont={smallFont}
            smallFont12={smallFont12}
            smallFont10={smallFont10}
            smallFont8={smallFont8}
            totalValue={totalValue}
            n={actualN}
            decimals={decimals}
            colors={colors}
            activeIndex={activeIndex}
            segmentValues={segmentValues}
            segmentLabels={segmentLabels}
            textColor={theme.colors.text.primary}
            outerStrokeColor={theme.colors.border.default}
          />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', marginLeft: 10, minWidth: 140 }}>
          {data.map((item, index) => {
            return <RenderItem item={item} key={index} index={index} activeIndex={activeIndex} />;
          })}
        </View>
      </ScrollView>
    </Pressable>
  );
};

export default DonutChartContainer;


