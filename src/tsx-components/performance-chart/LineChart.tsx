import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';

import { PaintStyle, Path, Skia } from '@shopify/react-native-skia';
import { axisOptions, padding, xKey, yKeys } from './config';
import { styles } from './styles';
import { ToolTip } from './Tooltip';
import { ChartDataPoint } from './types';
import { useTheme } from 'styles';
import CustomText from 'tsx-components/CustomText';
import { usePortfolioPerformance } from './usePortfolioPerformance';

const PERIODS = ['1D', '1W', '1M', 'YTD', '1Y', 'Max'];

const LineChart = () => {
  const { theme } = useTheme();
  const { performanceData, isLoading, error, fetchPerformanceData } = usePortfolioPerformance();

  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(5); // Default to 'Max'
  const [currentData, setCurrentData] = useState<ChartDataPoint[]>([]);

  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  const updateChartData = (index: number) => {
    if (!performanceData) return;

    const period = performanceData.periods[index];
    if (period && period.series) {
      // Define expected window sizes for each period
      const periodWindows: Record<string, number> = {
        '1D': 2,
        '1W': 7,
        '1M': 30,
        YTD: 365, // Will be adjusted based on actual year
        '1Y': 365,
        Max: 365, // Will be adjusted based on actual data range
      };

      const selectedPeriod = PERIODS[index];
      const expectedDays = periodWindows[selectedPeriod] || period.series.length;

      // For YTD and Max, calculate actual expected range
      let windowSize = expectedDays;
      if (selectedPeriod === 'YTD' || selectedPeriod === 'Max') {
        if (period.series.length > 0) {
          const firstDate = new Date(period.series[0].date);
          const lastDate = new Date(period.series[period.series.length - 1].date);
          const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          windowSize = daysDiff;
        }
      }

      const chartData = period.series.map((item, idx) => ({
        x: idx,
        y: item.current_value,
        date: item.date,
        return_percentage: item.return_percentage,
        maxX: windowSize - 1, // Store the expected window size
      }));

      setCurrentData(chartData);
    }
  };

  const handleTimelineChange = (newIndex: number) => {
    if (newIndex !== selectedTimelineIndex) {
      setSelectedTimelineIndex(newIndex);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatReturnPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getReturnColor = (value: number) => {
    return value >= 0 ? theme.colors.palette.accent : theme.colors.palette.accent;
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  useEffect(() => {
    if (performanceData) {
      updateChartData(selectedTimelineIndex);
    }
  }, [performanceData, selectedTimelineIndex]);

  if (isLoading) {
    return (
      <View style={[styles.chartContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.palette.accent} />
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

  // Get the max X value from the first data point (all have the same maxX)
  const maxXValue = currentData[0]?.maxX || currentData.length - 1;

  const getEmptyStateMessage = () => {
    const period = selectedPeriodLabel;

    if (dataPointsCount === 0) {
      if (period === '1D' || period === 'Max') {
        return 'No valuations yet.';
      }
      return 'No valuations yet. Come back after your first daily valuation.';
    }

    if (dataPointsCount === 1) {
      if (period === '1D') {
        return "Today's valuation isn't available yet";
      }
      if (period === 'Max') {
        return "We'll chart after the next valuation";
      }
      return "Not enough data yet. We'll chart this period after the next daily valuation.";
    }

    return '';
  };

  return (
    <View style={[styles.chartContainer]}>
      <View>
        <CustomText
          color={theme.colors.text.tertiary}
          style={[{ marginBottom: 5 }]}
          size={14}
          fontWeight="semiBold"
          variant="subtitle1">
          Total Portfolio Value
        </CustomText>
        <CustomText color={theme.colors.text.primary} size={33} fontWeight="bold" variant="h1">
          {formatCurrency(performanceData.current.current_value)}
        </CustomText>
        {/* Show sub-row for all periods when not actively tapping */}
        {!isActive && (
          <View style={{ flexDirection: 'row', marginVertical: 5 }}>
            <CustomText
              size={12}
              style={{ marginRight: 5 }}
              color={getReturnColor(performanceData.current.return_percentage)}>
              {formatReturnPercentage(performanceData.current.return_percentage)}
            </CustomText>
            <CustomText size={12} color={theme.colors.text.tertiary}>
              last updated {formatLastUpdated(performanceData.current.last_updated)}
            </CustomText>
          </View>
        )}
      </View>

      {dataPointsCount >= 2 ? (
        <View style={[styles.cartisianContainer]}>
          <CartesianChart
            data={currentData}
            xKey={xKey}
            yKeys={yKeys as any}
            padding={padding}
            axisOptions={axisOptions}
            chartPressState={state as any}
            domain={{ x: [0, maxXValue], y: [-1, Math.max(...currentData.map(d => d.y)) * 1.2] }}>
            {({ points, chartBounds }) => {
              const lastIndex = currentData.length - 1;
              const maxX = currentData[0]?.maxX ?? 0;

              const lastPoint = points.y[lastIndex];
              if (!lastPoint) return null;

              // ensure numeric coordinates
              const startX = lastPoint.x ?? 0;
              const startY = lastPoint.y ?? 0;

              // compute end point (full domain end)
              const endX = chartBounds.right;
              const endY = startY;

              // Create a dashed path between them
              const dashedPath = Skia.Path.Make();
              dashedPath.moveTo(startX, startY);
              dashedPath.lineTo(endX, endY);

              const paint = Skia.Paint();
              paint.setColor(Skia.Color(theme.colors.palette.accent));
              paint.setStyle(PaintStyle.Stroke);
              paint.setStrokeWidth(1.5);
              paint.setPathEffect(Skia.PathEffect.MakeDash([8, 4], 0)); // dashed pattern

              return (
                <>
                  {/* Solid main line */}
                  <Line
                    points={points.y}
                    color={theme.colors.palette.accent}
                    strokeWidth={1.5}
                    curveType="linear"
                  />

                  {/* Dashed extension (only if not full data and not YTD/Max) */}
                  {lastIndex < maxX - 1 && selectedPeriodLabel !== 'YTD' && selectedPeriodLabel !== 'Max' && (
                    <Path path={dashedPath} paint={paint} />
                  )}

                  {/* Tooltip */}
                  {isActive && (
                    <ToolTip
                      state={state}
                      x={state.x.position}
                      y={state.y.y.position}
                      chartBounds={chartBounds}
                      currentData={currentData}
                      selectedPeriodLabel={selectedPeriodLabel}
                    />
                  )}
                </>
              );
            }}
          </CartesianChart>
        </View>
      ) : (
        <View
          style={[
            styles.cartisianContainer,
            { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
          ]}>
          <CustomText color={theme.colors.text.tertiary} size={12} style={{ textAlign: 'center' }}>
            {getEmptyStateMessage()}
          </CustomText>
        </View>
      )}

      <View style={[styles.timelineSelector]}>
        {PERIODS.map((period, index) => {
          return (
            <TouchableOpacity
              key={period}
              onPress={() => handleTimelineChange(index)}
              style={[
                styles.timelineSelectorItem,
                {
                  backgroundColor:
                    selectedTimelineIndex === index ? theme.colors.palette.grey500 : theme.colors.palette.white,
                },
              ]}
              activeOpacity={0.8}>
              <CustomText
                style={{
                  color: selectedTimelineIndex === index ? theme.colors.palette.white : theme.colors.text.primary,
                  fontSize: 12,
                  letterSpacing: period === 'Max' ? 0 : 3,
                  fontWeight: selectedTimelineIndex === index ? '600' : '400',
                }}>
                {period}
              </CustomText>
              <View
                style={{
                  display: selectedTimelineIndex === index ? 'flex' : 'none',
                  width: 4,
                  height: 4,
                  marginTop: 3,
                  borderRadius: 100,
                  backgroundColor: theme.colors.palette.white,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default LineChart;
