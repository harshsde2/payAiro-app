import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { PaintStyle, Path, Skia, vec } from '@shopify/react-native-skia';
import { axisOptions, padding, xKey, yKeys } from 'tsx-components/performance-chart/config';
import { styles } from 'tsx-components/performance-chart/styles';
import { ChartDataPoint } from 'tsx-components/performance-chart/types';
import { useTheme } from 'styles';
import CustomText from 'tsx-components/CustomText';
import { useCryptoPerformance } from './useCryptoPerformance';
import { CryptoTooltip } from './CryptoTooltip';

const PERIODS = ['1D', '1W', '1M', '1Y', 'All'];

interface CryptoChartProps {
  priceData: Array<{ x: number; y: number; date?: string }>;
  currentPrice: number;
  priceChange: number;
  showHeader?: boolean;
  lineColor?: string;
  fillArea?: boolean;
  /** Controlled period tab (0 = 1D … 4 = All). Parent refetches chart data on change. */
  selectedPeriodIndex?: number;
  onPeriodChange?: (index: number) => void;
  /** True while React Query is refetching chart for a new period. */
  chartFetching?: boolean;
}

const CryptoChart: React.FC<CryptoChartProps> = ({
  priceData,
  currentPrice,
  priceChange,
  showHeader = false,
  lineColor,
  fillArea = true,
  selectedPeriodIndex,
  onPeriodChange,
  chartFetching = false,
}) => {
  const { theme } = useTheme();
  const { performanceData, isLoading, error } = useCryptoPerformance({
    priceData,
    currentPrice,
    priceChange,
  });

  const [internalPeriodIndex, setInternalPeriodIndex] = useState(0);
  const selectedTimelineIndex =
    selectedPeriodIndex !== undefined ? selectedPeriodIndex : internalPeriodIndex;
  const [currentData, setCurrentData] = useState<ChartDataPoint[]>([]);

  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  const chartColor = lineColor || theme.colors.palette.red500;

  const updateChartData = () => {
    if (!performanceData) return;

    const period = performanceData.periods[0];
    if (period && period.series && period.series.length > 0) {
      const chartData = period.series.map((item, idx) => ({
        x: idx,
        y: item.current_value,
        date: item.date,
        return_percentage: item.return_percentage,
        maxX: period.series.length - 1,
      }));

      setCurrentData(chartData);
    }
  };

  const handleTimelineChange = (newIndex: number) => {
    if (newIndex === selectedTimelineIndex) return;
    if (onPeriodChange) {
      onPeriodChange(newIndex);
    } else {
      setInternalPeriodIndex(newIndex);
    }
  };


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    if (performanceData) {
      updateChartData();
    }
  }, [performanceData]);

  // Helper function to render a chart
  const renderChart = (data: ChartDataPoint[], chartState: any) => {
    if (data.length < 2) return null;
    
    const maxXValue = data[0]?.maxX || data.length - 1;
    const minY = Math.min(...data.map(d => d.y));
    const maxY = Math.max(...data.map(d => d.y));

    return (
      <CartesianChart
      
        data={data}
        xKey={xKey}
        yKeys={yKeys as any}
        padding={padding}
        axisOptions={{
          ...axisOptions,
          formatYLabel: (value: any) => `$${value.toFixed(0)}`,
        }}
        chartPressState={chartState as any}
        domain={{
          x: [0, maxXValue],
          y: [minY * 0.98, maxY * 1.02],
        }}>
        {({ points, chartBounds }) => {
          const lastPoint = points.y[points.y.length - 1];
          if (!lastPoint) return null;

          // Create filled area path
          let areaPath: any = null;
          let areaPaint: any = null;
          if (fillArea && points.y.length > 0) {
            areaPath = Skia.Path.Make();
            const firstPoint = points.y[0];
            areaPath.moveTo(firstPoint.x ?? 0, chartBounds.bottom);
            points.y.forEach(point => {
              areaPath.lineTo(point.x ?? 0, point.y ?? 0);
            });
            const lastPointX = points.y[points.y.length - 1]?.x ?? 0;
            areaPath.lineTo(lastPointX, chartBounds.bottom);
            areaPath.close();

            // Create gradient
            const red500Hex = chartColor || '#FF3A20';
            const hex = red500Hex.replace('#', '');
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);

            const darkRed = Skia.Color(`rgba(${r}, ${g}, ${b}, 0.5)`);
            const mediumDarkRed = Skia.Color(`rgba(${r}, ${g}, ${b}, 0.35)`);
            const mediumRed = Skia.Color(`rgba(${r}, ${g}, ${b}, 0.2)`);
            const lightRed = Skia.Color(`rgba(${r}, ${g}, ${b}, 0.1)`);
            const transparentRed = Skia.Color(`rgba(${r}, ${g}, ${b}, 0.02)`);

            const minYPoint = Math.min(...points.y.map(p => p.y ?? chartBounds.top));
            const gradient = Skia.Shader.MakeLinearGradient(
              vec(0, minYPoint),
              vec(0, chartBounds.bottom),
              [darkRed, mediumDarkRed, mediumRed, lightRed, transparentRed],
              null,
              1
            );

            areaPaint = Skia.Paint();
            areaPaint.setStyle(PaintStyle.Fill);
            areaPaint.setShader(gradient);
          }

          return (
            <>
              {fillArea && areaPath && areaPaint && <Path path={areaPath} paint={areaPaint}  />}
              <Line points={points.y} color={chartColor} strokeWidth={2} curveType={'linear'} />
              {isActive && (
                <CryptoTooltip
                  x={state.x.position}
                  y={state.y.y.position}
                  chartBounds={chartBounds}
                  state={state}
                  currentData={data}
                  tooltipColor={chartColor}
                />
              )}
            </>
          );
        }}
      </CartesianChart>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.chartContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={chartColor} />
      </View>
    );
  }

  if (error || !performanceData || !performanceData.current || !performanceData.periods) {
    return (
      <View style={[styles.chartContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <CustomText color={theme.colors.text.tertiary} size={14}>
          {error || 'No data available'}
        </CustomText>
      </View>
    );
  }

  const selectedPeriodLabel = PERIODS[selectedTimelineIndex];
  const dataPointsCount = currentData.length;
  const maxXValue = currentData[0]?.maxX || currentData.length - 1;

  // Generate date labels for x-axis
  const getDateLabels = () => {
    if (currentData.length < 5) return [];
    const labels = [];
    const step = Math.floor(currentData.length / 5);
    for (let i = 0; i < currentData.length; i += step) {
      if (labels.length >= 5) break;
      const date = currentData[i]?.date ? new Date(currentData[i].date as string) : new Date();
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      labels.push(`${day} ${month}`);
    }
    return labels;
  };

  const dateLabels = getDateLabels();

  return (
    <View style={[styles.chartContainer]}>
      {showHeader && (
        <View>
          <CustomText
            color={theme.colors.text.tertiary}
            style={[{ marginBottom: 5 }]}
            size={14}
            fontWeight="semiBold"
            variant="subtitle1">
            Current Price
          </CustomText>
          <CustomText color={theme.colors.text.primary} size={33} fontWeight="bold" variant="h1">
            {formatCurrency(performanceData.current.current_value)}
          </CustomText>
        </View>
      )}

      {dataPointsCount >= 2 ? (
        <View style={[styles.cartisianContainer, { position: 'relative' }]}>
          {chartFetching && (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.65)',
                zIndex: 10,
              }}>
              <ActivityIndicator size="large" color={chartColor} />
            </View>
          )}
          {renderChart(currentData, state)}
        </View>
      ) : (
        <View
          style={[
            styles.cartisianContainer,
            { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
          ]}>
          <CustomText color={theme.colors.text.tertiary} size={12} style={{ textAlign: 'center' }}>
            Not enough data to display chart
          </CustomText>
        </View>
      )}

      {/* Date labels */}
      {dateLabels.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            marginTop: 8,
          }}>
          {dateLabels.map((label, index) => (
            <CustomText key={index} size={12} color={theme.colors.text.tertiary}>
              {label}
            </CustomText>
          ))}
        </View>
      )}

      <View style={[styles.timelineSelector, { marginTop: 12 }]}>
        {PERIODS.map((period, index) => {
          return (
            <TouchableOpacity
              key={period}
              disabled={chartFetching}
              onPress={() => handleTimelineChange(index)}
              style={[
                styles.timelineSelectorItem,
                {
                  backgroundColor:
                    selectedTimelineIndex === index
                      ? theme.colors.palette.black
                      : theme.colors.palette.white,
                  borderWidth: selectedTimelineIndex === index ? 0 : 1,
                  borderColor: theme.colors.border.default,
                  opacity: chartFetching ? 0.6 : 1,
                },
              ]}
              activeOpacity={0.8}>
              <CustomText
                style={{
                  color:
                    selectedTimelineIndex === index
                      ? theme.colors.palette.white
                      : theme.colors.text.primary,
                  fontSize: 12,
                  letterSpacing: period === 'All' ? 0 : 3,
                  fontWeight: selectedTimelineIndex === index ? '600' : '400',
                }}>
                {period}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CryptoChart;
